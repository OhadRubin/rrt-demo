import { MazeCollisionChecker } from '../maze/CollisionChecker.js';

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

// Algorithm Interface
export const createRRTAlgorithm = (useRRTStar = false) => ({
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