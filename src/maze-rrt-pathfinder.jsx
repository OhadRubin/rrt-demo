import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// RRT Node Class
class RRTNode {
  constructor(x, y, parent = null, cost = 0) {
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.cost = cost;
    this.id = Math.random(); // Unique identifier
  }

  distanceTo(otherNode) {
    const dx = this.x - otherNode.x;
    const dy = this.y - otherNode.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getPathToRoot() {
    const path = [];
    let current = this;
    while (current !== null) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }
}

// Collision Checker Class
class MazeCollisionChecker {
  constructor(mazeGrid, width, height) {
    this.grid = mazeGrid;
    this.width = width;
    this.height = height;
  }

  isPointInObstacle(x, y) {
    const gridX = Math.floor(x);
    const gridY = Math.floor(y);
    if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
      return true;
    }
    return this.grid[gridY * this.width + gridX] === 1;
  }

  isPathCollisionFree(startNode, endNode, stepSize = 0.5) {
    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / stepSize);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = startNode.x + dx * t;
      const y = startNode.y + dy * t;
      if (this.isPointInObstacle(x, y)) {
        return false;
      }
    }
    return true;
  }

  getRandomFreePoint(maxAttempts = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      if (!this.isPointInObstacle(x, y)) {
        return { x, y };
      }
    }
    return null;
  }

  isWithinBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
}

// RRT Planner Class
class RRTPlanner {
  constructor(mazeGrid, start, goal, options = {}) {
    this.collisionChecker = new MazeCollisionChecker(
      mazeGrid, 
      options.width || 91, 
      options.height || 91
    );
    this.start = new RRTNode(start.x, start.y);
    this.goal = goal;
    this.nodes = [this.start];
    
    // Configuration
    this.maxNodes = options.maxNodes || 3000;
    this.stepSize = options.stepSize || 2.5;
    this.goalRadius = options.goalRadius || 3;
    this.goalBias = options.goalBias || 0.1;
    this.rewireRadius = options.rewireRadius || 5;
    this.useRRTStar = options.useRRTStar !== false;
    
    this.goalNode = null;
    this.iterations = 0;
  }

  async buildRRT(onProgress, delay = 5) {
    this.iterations = 0;
    
    while (this.nodes.length < this.maxNodes && !this.goalNode) {
      this.iterations++;
      
      // Goal biasing
      let targetPoint;
      if (Math.random() < this.goalBias) {
        targetPoint = this.goal;
      } else {
        const randomPoint = this.collisionChecker.getRandomFreePoint();
        if (!randomPoint) continue;
        targetPoint = randomPoint;
      }
      
      // Extend tree
      const extended = this.extend(targetPoint);
      
      if (extended && onProgress) {
        onProgress(this.nodes, this.goalNode);
        // Add delay for animation
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Check if goal reached
      if (extended && this.isGoalReached(extended)) {
        this.goalNode = extended;
        break;
      }
    }
    
    return this.goalNode !== null;
  }

  findNearestNode(targetPoint) {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const node of this.nodes) {
      const distance = Math.sqrt(
        Math.pow(node.x - targetPoint.x, 2) + 
        Math.pow(node.y - targetPoint.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    }
    
    return nearest;
  }

  steer(fromNode, toPoint) {
    const dx = toPoint.x - fromNode.x;
    const dy = toPoint.y - fromNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= this.stepSize) {
      return { x: toPoint.x, y: toPoint.y };
    }
    
    const ratio = this.stepSize / distance;
    return {
      x: fromNode.x + dx * ratio,
      y: fromNode.y + dy * ratio
    };
  }

  extend(targetPoint) {
    const nearest = this.findNearestNode(targetPoint);
    const newPoint = this.steer(nearest, targetPoint);
    
    const newNode = new RRTNode(newPoint.x, newPoint.y);
    
    if (!this.collisionChecker.isPathCollisionFree(nearest, newNode)) {
      return null;
    }
    
    if (this.useRRTStar) {
      // RRT* - choose best parent and rewire
      const nearbyNodes = this.findNearbyNodes(newNode, this.rewireRadius);
      const bestParent = this.chooseParent(newNode, nearbyNodes, nearest);
      newNode.parent = bestParent;
      newNode.cost = bestParent.cost + newNode.distanceTo(bestParent);
      
      this.nodes.push(newNode);
      this.rewire(newNode, nearbyNodes);
    } else {
      // Standard RRT
      newNode.parent = nearest;
      newNode.cost = nearest.cost + newNode.distanceTo(nearest);
      this.nodes.push(newNode);
    }
    
    return newNode;
  }

  findNearbyNodes(node, radius) {
    return this.nodes.filter(n => 
      n !== node && node.distanceTo(n) <= radius
    );
  }

  chooseParent(newNode, nearbyNodes, defaultParent) {
    let bestParent = defaultParent;
    let bestCost = defaultParent.cost + newNode.distanceTo(defaultParent);
    
    for (const node of nearbyNodes) {
      if (this.collisionChecker.isPathCollisionFree(node, newNode)) {
        const cost = node.cost + newNode.distanceTo(node);
        if (cost < bestCost) {
          bestCost = cost;
          bestParent = node;
        }
      }
    }
    
    return bestParent;
  }

  rewire(newNode, nearbyNodes) {
    for (const node of nearbyNodes) {
      const potentialCost = newNode.cost + newNode.distanceTo(node);
      if (potentialCost < node.cost && 
          this.collisionChecker.isPathCollisionFree(newNode, node)) {
        node.parent = newNode;
        node.cost = potentialCost;
      }
    }
  }

  isGoalReached(node) {
    return node.distanceTo({ x: this.goal.x, y: this.goal.y }) <= this.goalRadius;
  }

  extractPath() {
    if (!this.goalNode) return null;
    return this.goalNode.getPathToRoot();
  }

  smoothPath(path, iterations = 3) {
    if (!path || path.length < 3) return path;
    
    let smoothed = [...path];
    
    for (let iter = 0; iter < iterations; iter++) {
      let i = 0;
      while (i < smoothed.length - 2) {
        const start = smoothed[i];
        const end = smoothed[i + 2];
        
        if (this.collisionChecker.isPathCollisionFree(
          { x: start.x, y: start.y },
          { x: end.x, y: end.y }
        )) {
          smoothed.splice(i + 1, 1);
        } else {
          i++;
        }
      }
    }
    
    return smoothed;
  }
}

// Frontier Detection Functions (based on WFD algorithm from paper)
const detectFrontiers = (knownMap, width, height) => {
  if (!knownMap) return [];
  
  const frontierPoints = [];
  const visited = new Set();
  
  // Find all frontier points (unknown cells adjacent to known open cells)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Check if this cell is unknown (value 2)
      if (knownMap[idx] === 2) {
        // Check if it has at least one known open neighbor
        const neighbors = [
          knownMap[(y-1) * width + x],     // top
          knownMap[(y+1) * width + x],     // bottom
          knownMap[y * width + (x-1)],     // left
          knownMap[y * width + (x+1)]      // right
        ];
        
        if (neighbors.some(neighbor => neighbor === 0)) {
          frontierPoints.push({ x: x + 0.5, y: y + 0.5 });
        }
      }
    }
  }
  
  return frontierPoints;
};

const createInitialKnownMap = (fullMaze, robotX, robotY, sensorRange, width, height) => {
  // Initialize known map: 0 = open, 1 = wall, 2 = unknown
  const knownMap = new Uint8Array(width * height);
  knownMap.fill(2); // Start with everything unknown
  
  // Reveal area around robot position
  const robotGridX = Math.floor(robotX);
  const robotGridY = Math.floor(robotY);
  
  for (let y = Math.max(0, robotGridY - sensorRange); y <= Math.min(height - 1, robotGridY + sensorRange); y++) {
    for (let x = Math.max(0, robotGridX - sensorRange); x <= Math.min(width - 1, robotGridX + sensorRange); x++) {
      const distance = Math.sqrt((x - robotGridX) ** 2 + (y - robotGridY) ** 2);
      if (distance <= sensorRange) {
        knownMap[y * width + x] = fullMaze[y * width + x];
      }
    }
  }
  
  return knownMap;
};

const updateKnownMap = (knownMap, fullMaze, robotX, robotY, sensorRange, width, height) => {
  const newKnownMap = new Uint8Array(knownMap);
  const robotGridX = Math.floor(robotX);
  const robotGridY = Math.floor(robotY);
  
  // Reveal new area around current robot position
  for (let y = Math.max(0, robotGridY - sensorRange); y <= Math.min(height - 1, robotGridY + sensorRange); y++) {
    for (let x = Math.max(0, robotGridX - sensorRange); x <= Math.min(width - 1, robotGridX + sensorRange); x++) {
      const distance = Math.sqrt((x - robotGridX) ** 2 + (y - robotGridY) ** 2);
      if (distance <= sensorRange) {
        newKnownMap[y * width + x] = fullMaze[y * width + x];
      }
    }
  }
  
  return newKnownMap;
};

const calculateCoverage = (knownMap, fullMaze) => {
  let knownCells = 0;
  let totalCells = 0;
  
  for (let i = 0; i < fullMaze.length; i++) {
    if (fullMaze[i] === 0) { // Only count open cells
      totalCells++;
      if (knownMap[i] === 0) {
        knownCells++;
      }
    }
  }
  
  return totalCells > 0 ? (knownCells / totalCells) * 100 : 0;
};

// Simple Algorithm Interface
const createRRTAlgorithm = (useRRTStar = false) => ({
  name: useRRTStar ? 'RRT*' : 'RRT',
  type: 'pathfinding',
  async execute(maze, startPoint, goalPoint, options, onProgress) {
    const planner = new RRTPlanner(maze, startPoint, goalPoint, {
      ...options,
      useRRTStar
    });
    
    const success = await planner.buildRRT(onProgress, options.delay);
    
    if (success) {
      const rawPath = planner.extractPath();
      const smoothedPath = planner.smoothPath(rawPath);
      return {
        success: true,
        path: smoothedPath,
        tree: planner.nodes,
        metrics: {
          nodesExplored: planner.nodes.length,
          iterations: planner.iterations
        }
      };
    }
    
    return {
      success: false,
      path: null,
      tree: planner.nodes,
      metrics: {
        nodesExplored: planner.nodes.length,
        iterations: planner.iterations
      }
    };
  }
});

// A* Algorithm Implementation
const createAStarAlgorithm = () => ({
  name: 'A*',
  type: 'pathfinding',
  async execute(maze, startPoint, goalPoint, options, onProgress) {
    const { width, height, delay = 20 } = options;
    
    // Convert floating point coordinates to grid coordinates
    const start = { x: Math.floor(startPoint.x), y: Math.floor(startPoint.y) };
    const goal = { x: Math.floor(goalPoint.x), y: Math.floor(goalPoint.y) };
    
    // Check if start and goal are valid
    if (maze[start.y * width + start.x] === 1 || maze[goal.y * width + goal.x] === 1) {
      return { success: false, path: null, tree: [], metrics: { nodesExplored: 0 } };
    }
    
    const openSet = [start];
    const closedSet = new Set();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};
    const allNodes = []; // For visualization
    
    const getKey = (node) => `${node.x},${node.y}`;
    const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    
    gScore[getKey(start)] = 0;
    fScore[getKey(start)] = heuristic(start, goal);
    
    while (openSet.length > 0) {
      // Find node with lowest fScore
      let current = openSet[0];
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (fScore[getKey(openSet[i])] < fScore[getKey(current)]) {
          current = openSet[i];
          currentIndex = i;
        }
      }
      
      // Remove current from openSet
      openSet.splice(currentIndex, 1);
      closedSet.add(getKey(current));
      allNodes.push({ x: current.x, y: current.y, parent: cameFrom[getKey(current)] });
      
      // Check if we reached the goal
      if (current.x === goal.x && current.y === goal.y) {
        // Reconstruct path
        const path = [];
        let pathNode = current;
        while (pathNode) {
          path.unshift({ x: pathNode.x + 0.5, y: pathNode.y + 0.5 }); // Center of grid cell
          pathNode = cameFrom[getKey(pathNode)];
        }
        
        return {
          success: true,
          path,
          tree: allNodes,
          metrics: { nodesExplored: allNodes.length }
        };
      }
      
      // Check neighbors
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const neighbor of neighbors) {
        if (neighbor.x < 0 || neighbor.x >= width || 
            neighbor.y < 0 || neighbor.y >= height ||
            maze[neighbor.y * width + neighbor.x] === 1 ||
            closedSet.has(getKey(neighbor))) {
          continue;
        }
        
        const tentativeGScore = gScore[getKey(current)] + 1;
        
        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        } else if (tentativeGScore >= (gScore[getKey(neighbor)] || Infinity)) {
          continue;
        }
        
        cameFrom[getKey(neighbor)] = current;
        gScore[getKey(neighbor)] = tentativeGScore;
        fScore[getKey(neighbor)] = tentativeGScore + heuristic(neighbor, goal);
      }
      
      // Progress callback for visualization
      if (onProgress && allNodes.length % 10 === 0) {
        onProgress(allNodes.map(n => ({ x: n.x, y: n.y, parent: n.parent })), false);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return { success: false, path: null, tree: allNodes, metrics: { nodesExplored: allNodes.length } };
  }
});

// Algorithm Registry
const algorithms = {
  rrt: createRRTAlgorithm(false),
  rrt_star: createRRTAlgorithm(true),
  a_star: createAStarAlgorithm(),
  frontier: {
    name: 'Frontier-Based',
    type: 'exploration',
    async execute(fullMaze, robotPos, goalPoint, options, onProgress) {
      const { width, height, delay = 50 } = options;
      const sensorRange = 3; // Robot can see 3 cells in each direction
      
      // Initialize robot knowledge with starting position
      let currentPos = { x: robotPos.x, y: robotPos.y };
      let knownMap = createInitialKnownMap(fullMaze, currentPos.x, currentPos.y, sensorRange, width, height);
      let exploredNodes = [{ x: currentPos.x, y: currentPos.y }];
      let iterationCount = 0;
      const maxIterations = 200;
      
      while (iterationCount < maxIterations) {
        iterationCount++;
        
        // Detect current frontiers
        const currentFrontiers = detectFrontiers(knownMap, width, height);
        
        if (currentFrontiers.length === 0) {
          // No more frontiers - exploration complete
          break;
        }
        
        // Find nearest accessible frontier
        let nearestFrontier = null;
        let minDistance = Infinity;
        
        for (const frontier of currentFrontiers) {
          const distance = Math.sqrt(
            Math.pow(frontier.x - currentPos.x, 2) + 
            Math.pow(frontier.y - currentPos.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestFrontier = frontier;
          }
        }
        
        if (!nearestFrontier) break;
        
        // Move robot toward frontier (simplified movement)
        const dx = nearestFrontier.x - currentPos.x;
        const dy = nearestFrontier.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const stepSize = Math.min(2, distance);
          currentPos.x += (dx / distance) * stepSize;
          currentPos.y += (dy / distance) * stepSize;
        }
        
        // Update known map based on new robot position
        knownMap = updateKnownMap(knownMap, fullMaze, currentPos.x, currentPos.y, sensorRange, width, height);
        exploredNodes.push({ x: currentPos.x, y: currentPos.y });
        
        // Update frontiers and call progress callback
        if (onProgress) {
          const updatedFrontiers = detectFrontiers(knownMap, width, height);
          onProgress(exploredNodes, false, { frontiers: updatedFrontiers, knownMap, robotPos: currentPos });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      return {
        success: true,
        path: exploredNodes,
        tree: exploredNodes,
        metrics: {
          nodesExplored: exploredNodes.length,
          iterations: iterationCount,
          mapCoverage: calculateCoverage(knownMap, fullMaze)
        },
        finalKnownMap: knownMap
      };
    }
  }
};

// Main Component
const MazeRRTPathfinder = () => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  
  // Maze generation state
  const [dimensions, setDimensions] = useState({ width: 91, height: 91 });
  const [cellSize, setCellSize] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // RRT state
  const [rrtMode, setRrtMode] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('rrt');
  const [startPoint, setStartPoint] = useState(null);
  const [goalPoint, setGoalPoint] = useState(null);
  const [rrtTree, setRrtTree] = useState([]);
  const [rrtPath, setRrtPath] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStatus, setPlanningStatus] = useState('');
  const [algorithmResults, setAlgorithmResults] = useState({});
  const [showTree, setShowTree] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(10);
  
  // Exploration state
  const [explorationMode, setExplorationMode] = useState(false);
  const [knownMap, setKnownMap] = useState(null);
  const [robotPosition, setRobotPosition] = useState(null);
  const [frontiers, setFrontiers] = useState([]);
  
  // RRT parameters
  const [rrtParams, setRrtParams] = useState({
    maxNodes: 3000,
    stepSize: 2.5,
    goalRadius: 3,
    goalBias: 0.1,
    rewireRadius: 5
  });

  // Maze generation (same as before)
  const generateMaze = useCallback((w, h) => {
    const grid = new Uint8Array(w * h);
    grid.fill(1);
    
    const getCell = (x, y) => grid[y * w + x];
    const setCell = (x, y, val) => { grid[y * w + x] = val; };
    
    const carve3x3 = (x, y) => {
      const endY = Math.min(y + 3, h);
      const endX = Math.min(x + 3, w);
      for (let dy = y; dy < endY; dy++) {
        const rowOffset = dy * w;
        for (let dx = x; dx < endX; dx++) {
          grid[rowOffset + dx] = 0;
        }
      }
    };
    
    const carveConnection = (x1, y1, x2, y2) => {
      if (x1 === x2) {
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2) + 2;
        const endY = Math.min(maxY + 1, h);
        const endX = Math.min(x1 + 3, w);
        
        for (let y = minY; y < endY; y++) {
          const rowOffset = y * w;
          for (let dx = x1; dx < endX; dx++) {
            grid[rowOffset + dx] = 0;
          }
        }
      } else {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2) + 2;
        const endX = Math.min(maxX + 1, w);
        const endY = Math.min(y1 + 3, h);
        
        for (let y = y1; y < endY; y++) {
          const rowOffset = y * w;
          for (let x = minX; x < endX; x++) {
            grid[rowOffset + x] = 0;
          }
        }
      }
    };
    
    const visited = new Set();
    const toKey = (x, y) => y * w + x;
    
    const stack = [];
    const startX = 2, startY = 2;
    
    carve3x3(startX, startY);
    stack.push([startX, startY]);
    visited.add(toKey(startX, startY));
    
    const directions = [[4, 0], [0, 4], [-4, 0], [0, -4]];
    
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    
    while (stack.length > 0) {
      const [currentX, currentY] = stack[stack.length - 1];
      const shuffledDirs = shuffle([...directions]);
      let found = false;
      
      for (const [dx, dy] of shuffledDirs) {
        const newX = currentX + dx;
        const newY = currentY + dy;
        
        if (newX > 0 && newX < w - 3 && newY > 0 && newY < h - 3) {
          const key = toKey(newX, newY);
          if (!visited.has(key)) {
            carveConnection(currentX, currentY, newX, newY);
            carve3x3(newX, newY);
            visited.add(key);
            stack.push([newX, newY]);
            found = true;
            break;
          }
        }
      }
      
      if (!found) stack.pop();
    }
    
    // Post-processing
    const random = Math.random;
    const roomThreshold = 0.002;
    const loopThreshold = 0.005;
    const wideningThreshold = 0.003;
    
    for (let y = 1; y < h - 1; y++) {
      const rowOffset = y * w;
      for (let x = 1; x < w - 1; x++) {
        const idx = rowOffset + x;
        const rand = random();
        
        if (rand < roomThreshold && x < w - 8 && y < h - 8) {
          const roomWidth = 4 + Math.floor(random() * 3);
          const roomHeight = 4 + Math.floor(random() * 3);
          const maxY = Math.min(y + roomHeight, h - 2);
          const maxX = Math.min(x + roomWidth, w - 2);
          
          for (let dy = y; dy < maxY; dy++) {
            const roomRowOffset = dy * w;
            for (let dx = x; dx < maxX; dx++) {
              grid[roomRowOffset + dx] = 0;
            }
          }
        }
        else if (rand < loopThreshold && grid[idx] === 1) {
          let paths = 0;
          if (y > 0 && grid[idx - w] === 0) paths++;
          if (y < h - 1 && grid[idx + w] === 0) paths++;
          if (x > 0 && grid[idx - 1] === 0) paths++;
          if (x < w - 1 && grid[idx + 1] === 0) paths++;
          
          if (paths >= 2) grid[idx] = 0;
        }
        else if (rand < wideningThreshold && grid[idx] === 0 && x < w - 4 && y < h - 4) {
          const size = random() > 0.5 ? 3 : 4;
          const maxY = Math.min(y + size, h - 1);
          const maxX = Math.min(x + size, w - 1);
          
          for (let dy = y; dy < maxY; dy++) {
            const wideRowOffset = dy * w;
            for (let dx = x; dx < maxX; dx++) {
              grid[wideRowOffset + dx] = 0;
            }
          }
        }
      }
    }
    
    // Entrance and exit
    for (let i = 0; i < 3; i++) {
      grid[(2 + i) * w] = 0;
      grid[(h - 3 - i) * w + w - 1] = 0;
    }
    
    return grid;
  }, []);

  const maze = useMemo(() => {
    if (dimensions.width && dimensions.height) {
      return generateMaze(dimensions.width, dimensions.height);
    }
    return null;
  }, [dimensions, generateMaze]);

  // Render maze
  const renderMaze = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maze) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    const { width, height } = dimensions;
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    // Use knownMap in exploration mode, full maze in pathfinding mode
    const displayMap = explorationMode && knownMap ? knownMap : maze;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellValue = displayMap[y * width + x];
        let color;
        
        if (explorationMode && knownMap) {
          // In exploration mode: 0 = open (white), 1 = wall (black), 2 = unknown (gray)
          if (cellValue === 0) color = 255;      // Open space - white
          else if (cellValue === 1) color = 0;   // Wall - black  
          else color = 128;                      // Unknown - gray
        } else {
          // In pathfinding mode: 0 = open (white), 1 = wall (black)
          color = cellValue === 1 ? 0 : 255;
        }
        
        for (let dy = 0; dy < cellSize; dy++) {
          for (let dx = 0; dx < cellSize; dx++) {
            const pixelIdx = ((y * cellSize + dy) * canvas.width + (x * cellSize + dx)) * 4;
            data[pixelIdx] = color;
            data[pixelIdx + 1] = color;
            data[pixelIdx + 2] = color;
            data[pixelIdx + 3] = 255;
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [maze, dimensions, cellSize, explorationMode, knownMap]);

  // Render RRT overlay
  const renderRRTOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw algorithm visualization
    if (showTree && rrtTree.length > 0) {
      if (selectedAlgorithm === 'a_star') {
        // Draw A* explored nodes as grid squares
        ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
        for (const node of rrtTree) {
          ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
        }
      } else {
        // Draw RRT tree connections
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (const node of rrtTree) {
          if (node.parent) {
            ctx.beginPath();
            ctx.moveTo(node.parent.x * cellSize, node.parent.y * cellSize);
            ctx.lineTo(node.x * cellSize, node.y * cellSize);
            ctx.stroke();
          }
        }
      }
    }
    
    // Draw frontiers (exploration mode)
    if (explorationMode && frontiers.length > 0) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.8)'; // Orange color for frontiers
      for (const frontier of frontiers) {
        ctx.beginPath();
        ctx.arc(frontier.x * cellSize, frontier.y * cellSize, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // Draw robot position (exploration mode)
    if (explorationMode && robotPosition) {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'; // Green color for robot
      ctx.beginPath();
      ctx.arc(robotPosition.x * cellSize, robotPosition.y * cellSize, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw sensor range circle
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(robotPosition.x * cellSize, robotPosition.y * cellSize, 3 * cellSize, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Draw path
    if (rrtPath) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rrtPath[0].x * cellSize, rrtPath[0].y * cellSize);
      
      for (let i = 1; i < rrtPath.length; i++) {
        ctx.lineTo(rrtPath[i].x * cellSize, rrtPath[i].y * cellSize);
      }
      ctx.stroke();
    }
    
    // Draw start point
    if (startPoint) {
      ctx.fillStyle = 'lime';
      ctx.beginPath();
      ctx.arc(startPoint.x * cellSize, startPoint.y * cellSize, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw goal point
    if (goalPoint) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(goalPoint.x * cellSize, goalPoint.y * cellSize, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw goal radius
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(goalPoint.x * cellSize, goalPoint.y * cellSize, rrtParams.goalRadius * cellSize, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }, [dimensions, cellSize, rrtTree, rrtPath, startPoint, goalPoint, showTree, rrtParams.goalRadius, selectedAlgorithm, explorationMode, frontiers, robotPosition]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event) => {
    if (!rrtMode || !overlayCanvasRef.current) return;
    
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / cellSize;
    const y = (event.clientY - rect.top) / cellSize;
    
    // Check if clicked point is free
    const gridX = Math.floor(x);
    const gridY = Math.floor(y);
    
    if (gridX >= 0 && gridX < dimensions.width && 
        gridY >= 0 && gridY < dimensions.height &&
        maze[gridY * dimensions.width + gridX] === 0) {
      
      if (!startPoint) {
        setStartPoint({ x, y });
        if (explorationMode) {
          setPlanningStatus('Ready to start exploration');
        } else {
          setPlanningStatus('Click to set goal point');
        }
      } else if (!explorationMode && !goalPoint) {
        setGoalPoint({ x, y });
        setPlanningStatus('Ready to plan path');
      } else {
        // Reset and set new start
        setStartPoint({ x, y });
        setGoalPoint(null);
        setRrtTree([]);
        setRrtPath(null);
        setKnownMap(null);
        setRobotPosition(null);
        setFrontiers([]);
        if (explorationMode) {
          setPlanningStatus('Ready to start exploration');
        } else {
          setPlanningStatus('Click to set goal point');
        }
      }
    }
  }, [rrtMode, cellSize, dimensions, maze, startPoint, goalPoint, explorationMode]);

  // Plan path using selected algorithm
  const planPath = useCallback(async () => {
    if (!startPoint || !maze) return;
    if (!explorationMode && !goalPoint) return; // Goal needed for pathfinding, but not exploration
    
    const algorithm = algorithms[selectedAlgorithm];
    if (!algorithm || !algorithm.execute) {
      setPlanningStatus(`${algorithm?.name || selectedAlgorithm.toUpperCase()} algorithm not yet implemented`);
      return;
    }
    
    setIsPlanning(true);
    setRrtTree([]);
    setRrtPath(null);
    
    if (explorationMode) {
      setPlanningStatus('Exploring unknown environment...');
      // Initialize robot position and known map for exploration
      setRobotPosition({ x: startPoint.x, y: startPoint.y });
      const initialKnownMap = createInitialKnownMap(maze, startPoint.x, startPoint.y, 3, dimensions.width, dimensions.height);
      setKnownMap(initialKnownMap);
      const initialFrontiers = detectFrontiers(initialKnownMap, dimensions.width, dimensions.height);
      setFrontiers(initialFrontiers);
    } else {
      setPlanningStatus('Planning path...');
    }
    
    // Calculate delay based on animation speed (0-20 maps to 50-0ms)
    const delay = Math.max(0, 50 - animationSpeed * 2.5);
    
    try {
      const startTime = performance.now();
      
      const result = await algorithm.execute(
        maze, 
        startPoint, 
        goalPoint,
        {
          width: dimensions.width,
          height: dimensions.height,
          delay,
          ...rrtParams
        },
        (nodes, goalReached, extraData) => {
          setRrtTree([...nodes]);
          
          if (explorationMode && extraData) {
            // Update exploration state
            if (extraData.frontiers) setFrontiers(extraData.frontiers);
            if (extraData.knownMap) setKnownMap(extraData.knownMap);
            if (extraData.robotPos) setRobotPosition(extraData.robotPos);
          }
          
          if (goalReached) {
            setPlanningStatus('Goal reached!');
          }
        }
      );
      
      const executionTime = performance.now() - startTime;
      
      // Calculate path length if path exists
      const pathLength = result.path ? 
        result.path.reduce((total, point, i) => {
          if (i === 0) return 0;
          const prev = result.path[i - 1];
          return total + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
        }, 0) : 0;
      
      // Store results for comparison
      const algorithmResult = {
        algorithm: algorithm.name,
        success: result.success,
        executionTime: Math.round(executionTime),
        pathLength: Math.round(pathLength * 10) / 10,
        nodesExplored: result.metrics.nodesExplored,
        timestamp: Date.now()
      };
      
      setAlgorithmResults(prev => ({
        ...prev,
        [selectedAlgorithm]: algorithmResult
      }));
      
      if (result.success) {
        setRrtPath(result.path);
        setPlanningStatus(`${algorithm.name}: Path found! Length: ${algorithmResult.pathLength}, Nodes: ${result.metrics.nodesExplored}, Time: ${algorithmResult.executionTime}ms`);
      } else {
        setPlanningStatus('Failed to find path');
      }
    } catch (error) {
      setPlanningStatus(`Error: ${error.message}`);
    }
    
    setIsPlanning(false);
  }, [startPoint, goalPoint, maze, dimensions, selectedAlgorithm, rrtParams, animationSpeed]);

  // Compare all algorithms
  const compareAlgorithms = useCallback(async () => {
    if (!startPoint || !goalPoint || !maze) return;
    
    const algorithmsToTest = ['rrt', 'rrt_star', 'a_star'];
    const results = {};
    
    setIsPlanning(true);
    setPlanningStatus('Comparing algorithms...');
    
    for (const algKey of algorithmsToTest) {
      const algorithm = algorithms[algKey];
      if (!algorithm.execute) continue;
      
      try {
        const startTime = performance.now();
        const result = await algorithm.execute(
          maze, 
          startPoint, 
          goalPoint,
          {
            width: dimensions.width,
            height: dimensions.height,
            delay: 1, // Fast comparison
            ...rrtParams
          },
          () => {} // No progress callback for comparison
        );
        const executionTime = performance.now() - startTime;
        
        const pathLength = result.path ? 
          result.path.reduce((total, point, i) => {
            if (i === 0) return 0;
            const prev = result.path[i - 1];
            return total + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
          }, 0) : 0;
        
        results[algKey] = {
          algorithm: algorithm.name,
          success: result.success,
          executionTime: Math.round(executionTime),
          pathLength: Math.round(pathLength * 10) / 10,
          nodesExplored: result.metrics.nodesExplored
        };
      } catch (error) {
        results[algKey] = {
          algorithm: algorithm.name,
          success: false,
          error: error.message
        };
      }
    }
    
    setAlgorithmResults(results);
    setPlanningStatus('Comparison complete! Check results below.');
    setIsPlanning(false);
  }, [startPoint, goalPoint, maze, dimensions, rrtParams]);

  // Clear RRT
  const clearRRT = useCallback(() => {
    setStartPoint(null);
    setGoalPoint(null);
    setRrtTree([]);
    setRrtPath(null);
    setAlgorithmResults({});
    setKnownMap(null);
    setRobotPosition(null);
    setFrontiers([]);
    setPlanningStatus(explorationMode ? 'Click to set robot start position' : 'Click to set start point');
  }, [explorationMode]);

  // Effects
  useEffect(() => {
    renderMaze();
  }, [renderMaze]);

  useEffect(() => {
    renderRRTOverlay();
  }, [renderRRTOverlay]);

  useEffect(() => {
    const maxDim = Math.max(dimensions.width, dimensions.height);
    if (maxDim > 91) setCellSize(4);
    else if (maxDim > 71) setCellSize(5);
    else setCellSize(6);
  }, [dimensions]);

  useEffect(() => {
    if (rrtMode && !startPoint) {
      setPlanningStatus(explorationMode ? 'Click to set robot start position' : 'Click to set start point');
    } else if (rrtMode && startPoint && !explorationMode && !goalPoint) {
      setPlanningStatus('Click to set goal point');
    } else if (rrtMode && startPoint && explorationMode) {
      setPlanningStatus('Ready to start exploration');
    } else if (rrtMode && startPoint && goalPoint && !explorationMode) {
      setPlanningStatus('Ready to plan path');
    }
  }, [rrtMode, startPoint, goalPoint, explorationMode]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Maze Generator with Multiple Pathfinding Algorithms
        </h1>
        
        {/* Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          {/* Maze Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Width:</label>
              <select 
                value={dimensions.width} 
                onChange={(e) => setDimensions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={51}>51</option>
                <option value={71}>71</option>
                <option value={91}>91</option>
                <option value={111}>111</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Height:</label>
              <select 
                value={dimensions.height} 
                onChange={(e) => setDimensions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={51}>51</option>
                <option value={71}>71</option>
                <option value={91}>91</option>
                <option value={111}>111</option>
              </select>
            </div>
            
            <button 
              onClick={() => {
                setIsGenerating(true);
                setDimensions(prev => ({ ...prev }));
                clearRRT();
                setTimeout(() => setIsGenerating(false), 50);
              }}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isGenerating ? 'Generating...' : 'Generate New Maze'}
            </button>
          </div>
          
          {/* RRT Controls */}
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                onClick={() => {
                  setRrtMode(!rrtMode);
                  if (!rrtMode) {
                    clearRRT();
                    // Initialize exploration mode if frontier algorithm is selected
                    if (selectedAlgorithm === 'frontier') {
                      setExplorationMode(true);
                    }
                  } else {
                    setExplorationMode(false);
                    setKnownMap(null);
                    setRobotPosition(null);
                    setFrontiers([]);
                  }
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  rrtMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {rrtMode ? (explorationMode ? 'Exploration Mode: ON' : 'Pathfinding Mode: ON') : 'Algorithm Mode: OFF'}
              </button>
              
              {rrtMode && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Algorithm:</label>
                  <select 
                    value={selectedAlgorithm} 
                    onChange={(e) => {
                      setSelectedAlgorithm(e.target.value);
                      const isExploration = algorithms[e.target.value]?.type === 'exploration';
                      setExplorationMode(isExploration);
                      clearRRT();
                    }}
                    className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rrt">RRT (Rapidly-exploring Random Tree)</option>
                    <option value="rrt_star">RRT* (Optimal RRT)</option>
                    <option value="a_star">A* (Grid-based Optimal)</option>
                    <option value="frontier">Frontier-Based Exploration</option>
                  </select>
                </div>
              )}
              
              {rrtMode && (selectedAlgorithm === 'rrt' || selectedAlgorithm === 'rrt_star') && (
                <>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showTree}
                      onChange={(e) => setShowTree(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Show Tree</span>
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Speed:</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  
                  <button
                    onClick={planPath}
                    disabled={!startPoint || (!explorationMode && !goalPoint) || isPlanning}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                  >
                    {isPlanning ? (explorationMode ? 'Exploring...' : 'Planning...') : (explorationMode ? 'Start Exploration' : 'Plan Path')}
                  </button>
                  
                  <button
                    onClick={compareAlgorithms}
                    disabled={!startPoint || !goalPoint || isPlanning}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:bg-orange-400"
                  >
                    {isPlanning ? 'Comparing...' : 'Compare All'}
                  </button>
                  
                  <button
                    onClick={clearRRT}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
            
            {rrtMode && (
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-gray-700">{planningStatus}</p>
              </div>
            )}
            
            {/* Algorithm Comparison Results */}
            {rrtMode && Object.keys(algorithmResults).length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-3 text-center">Algorithm Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(algorithmResults).map(([key, result]) => (
                    <div key={key} className="bg-white p-3 rounded border">
                      <h5 className="font-medium text-sm text-center mb-2">{result.algorithm}</h5>
                      {result.success ? (
                        <div className="text-xs space-y-1">
                          <div>✅ Success</div>
                          <div>Path Length: {result.pathLength}</div>
                          <div>Time: {result.executionTime}ms</div>
                          <div>Nodes: {result.nodesExplored}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-red-600">
                          ❌ Failed {result.error && `(${result.error})`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* RRT Parameters (collapsible) */}
          {rrtMode && (
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-sm">Advanced RRT Parameters</summary>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-xs font-medium">Max Nodes</label>
                  <input
                    type="number"
                    value={rrtParams.maxNodes}
                    onChange={(e) => setRrtParams(prev => ({ ...prev, maxNodes: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Step Size</label>
                  <input
                    type="number"
                    step="0.5"
                    value={rrtParams.stepSize}
                    onChange={(e) => setRrtParams(prev => ({ ...prev, stepSize: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Goal Radius</label>
                  <input
                    type="number"
                    step="0.5"
                    value={rrtParams.goalRadius}
                    onChange={(e) => setRrtParams(prev => ({ ...prev, goalRadius: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Goal Bias</label>
                  <input
                    type="number"
                    step="0.05"
                    value={rrtParams.goalBias}
                    onChange={(e) => setRrtParams(prev => ({ ...prev, goalBias: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Rewire Radius</label>
                  <input
                    type="number"
                    step="0.5"
                    value={rrtParams.rewireRadius}
                    onChange={(e) => setRrtParams(prev => ({ ...prev, rewireRadius: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </details>
          )}
        </div>
        
        {/* Maze Display */}
        <div className="relative flex justify-center bg-white p-4 rounded-lg shadow">
          <div className="relative inline-block">
            <canvas
              ref={canvasRef}
              className="border-2 border-black"
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                imageRendering: 'pixelated'
              }}
            />
            <canvas
              ref={overlayCanvasRef}
              onClick={handleCanvasClick}
              className="absolute top-0 left-0 cursor-crosshair"
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                pointerEvents: rrtMode ? 'auto' : 'none'
              }}
            />
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 text-center text-gray-600 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <p className="text-sm mb-2">
            1. Generate a maze using the controls above
          </p>
          <p className="text-sm mb-2">
            2. Enable Pathfinding Mode and select an algorithm from the dropdown
          </p>
          <p className="text-sm mb-2">
            3. Click on the maze to set start (green) and goal (red) points
          </p>
          <p className="text-sm mb-2">
            4. Click "Plan Path" to find a path using the selected algorithm
          </p>
          <p className="text-sm">
            5. Compare algorithms: RRT (fast, random), RRT* (optimal, slower), A* (optimal, grid-based), Frontier-based (coming soon)
          </p>
        </div>
      </div>
    </div>
  );
};

export default MazeRRTPathfinder;