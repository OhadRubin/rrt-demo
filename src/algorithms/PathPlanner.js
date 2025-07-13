// Path Planning Algorithms for Exploration
// Supports BFS, A* and other pathfinding algorithms used in research papers

export class PathPlanner {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  // BFS pathfinding (current implementation)
  findPathBFS(knownMap, startX, startY, targetX, targetY, options = {}) {
    const { timeout = 1000, allowUnknown = false } = options;
    
    const startGridX = Math.floor(startX);
    const startGridY = Math.floor(startY);
    const targetGridX = Math.floor(targetX);
    const targetGridY = Math.floor(targetY);
    
    // Validation checks
    if (!this.isValidTarget(targetGridX, targetGridY, knownMap)) {
      return null;
    }
    
    if (!this.isValidStart(startGridX, startGridY, knownMap)) {
      return null;
    }
    
    const queue = [{x: startGridX, y: startGridY, path: []}];
    const visited = new Set();
    visited.add(`${startGridX},${startGridY}`);
    
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let nodesExplored = 0;
    
    while (queue.length > 0 && nodesExplored < timeout) {
      nodesExplored++;
      const {x, y, path} = queue.shift();
      
      if (x === targetGridX && y === targetGridY) {
        return [...path, {x: x + 0.5, y: y + 0.5}];
      }
      
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        const key = `${newX},${newY}`;
        
        if (this.isValidMove(newX, newY, visited, knownMap, allowUnknown)) {
          visited.add(key);
          queue.push({
            x: newX, 
            y: newY, 
            path: [...path, {x: x + 0.5, y: y + 0.5}]
          });
        }
      }
    }
    
    return null;
  }

  // A* pathfinding (research paper's preferred method)
  findPathAStar(knownMap, startX, startY, targetX, targetY, options = {}) {
    const { timeout = 1000, allowUnknown = false, heuristicWeight = 1.0 } = options;
    
    const startGridX = Math.floor(startX);
    const startGridY = Math.floor(startY);
    const targetGridX = Math.floor(targetX);
    const targetGridY = Math.floor(targetY);
    
    if (!this.isValidTarget(targetGridX, targetGridY, knownMap)) {
      return null;
    }
    
    if (!this.isValidStart(startGridX, startGridY, knownMap)) {
      return null;
    }

    const openSet = new Set();
    const closedSet = new Set();
    const gScore = new Map();
    const fScore = new Map();
    const cameFrom = new Map();
    
    const startKey = `${startGridX},${startGridY}`;
    const targetKey = `${targetGridX},${targetGridY}`;
    
    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(startGridX, startGridY, targetGridX, targetGridY) * heuristicWeight);
    
    let nodesExplored = 0;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    while (openSet.size > 0 && nodesExplored < timeout) {
      nodesExplored++;
      
      // Find node with lowest f-score
      let current = null;
      let lowestF = Infinity;
      
      for (const node of openSet) {
        const f = fScore.get(node) || Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = node;
        }
      }
      
      if (current === targetKey) {
        return this.reconstructPath(cameFrom, current);
      }
      
      openSet.delete(current);
      closedSet.add(current);
      
      const [currentX, currentY] = current.split(',').map(Number);
      
      for (const [dx, dy] of directions) {
        const newX = currentX + dx;
        const newY = currentY + dy;
        const neighborKey = `${newX},${newY}`;
        
        if (closedSet.has(neighborKey) || 
            !this.isValidMove(newX, newY, new Set(), knownMap, allowUnknown)) {
          continue;
        }
        
        const tentativeG = (gScore.get(current) || 0) + 1;
        
        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        } else if (tentativeG >= (gScore.get(neighborKey) || 0)) {
          continue;
        }
        
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + this.heuristic(newX, newY, targetGridX, targetGridY) * heuristicWeight);
      }
    }
    
    return null;
  }

  // Dijkstra's algorithm (also mentioned in research paper)
  findPathDijkstra(knownMap, startX, startY, targetX, targetY, options = {}) {
    const { timeout = 1000, allowUnknown = false } = options;
    
    const startGridX = Math.floor(startX);
    const startGridY = Math.floor(startY);
    const targetGridX = Math.floor(targetX);
    const targetGridY = Math.floor(targetY);
    
    if (!this.isValidTarget(targetGridX, targetGridY, knownMap)) {
      return null;
    }
    
    if (!this.isValidStart(startGridX, startGridY, knownMap)) {
      return null;
    }

    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    
    // Initialize distances
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const key = `${x},${y}`;
        distances.set(key, Infinity);
        unvisited.add(key);
      }
    }
    
    const startKey = `${startGridX},${startGridY}`;
    const targetKey = `${targetGridX},${targetGridY}`;
    distances.set(startKey, 0);
    
    let nodesExplored = 0;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    while (unvisited.size > 0 && nodesExplored < timeout) {
      nodesExplored++;
      
      // Find unvisited node with minimum distance
      let current = null;
      let minDistance = Infinity;
      
      for (const node of unvisited) {
        const dist = distances.get(node);
        if (dist < minDistance) {
          minDistance = dist;
          current = node;
        }
      }
      
      if (!current || minDistance === Infinity) break;
      
      unvisited.delete(current);
      
      if (current === targetKey) {
        return this.reconstructDijkstraPath(previous, current);
      }
      
      const [currentX, currentY] = current.split(',').map(Number);
      
      for (const [dx, dy] of directions) {
        const newX = currentX + dx;
        const newY = currentY + dy;
        const neighborKey = `${newX},${newY}`;
        
        if (!unvisited.has(neighborKey) || 
            !this.isValidMove(newX, newY, new Set(), knownMap, allowUnknown)) {
          continue;
        }
        
        const alt = distances.get(current) + 1;
        if (alt < distances.get(neighborKey)) {
          distances.set(neighborKey, alt);
          previous.set(neighborKey, current);
        }
      }
    }
    
    return null;
  }

  // Helper methods
  isValidTarget(x, y, knownMap) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return knownMap[y * this.width + x] !== 1; // Not a known wall
  }

  isValidStart(x, y, knownMap) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return knownMap[y * this.width + x] === 0; // Must be known open space
  }

  isValidMove(x, y, visited, knownMap, allowUnknown = false) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    if (visited.has(`${x},${y}`)) return false;
    
    const cellValue = knownMap[y * this.width + x];
    if (cellValue === 1) return false; // Wall
    if (cellValue === 0) return true;  // Known open
    if (cellValue === 2 && allowUnknown) return true; // Unknown (if allowed)
    
    return false;
  }

  heuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan distance
  }

  reconstructPath(cameFrom, current) {
    const path = [];
    
    while (cameFrom.has(current)) {
      const [x, y] = current.split(',').map(Number);
      path.unshift({x: x + 0.5, y: y + 0.5});
      current = cameFrom.get(current);
    }
    
    // Add start position
    const [startX, startY] = current.split(',').map(Number);
    path.unshift({x: startX + 0.5, y: startY + 0.5});
    
    return path;
  }

  reconstructDijkstraPath(previous, current) {
    const path = [];
    
    while (previous.has(current)) {
      const [x, y] = current.split(',').map(Number);
      path.unshift({x: x + 0.5, y: y + 0.5});
      current = previous.get(current);
    }
    
    // Add start position
    const [startX, startY] = current.split(',').map(Number);
    path.unshift({x: startX + 0.5, y: startY + 0.5});
    
    return path;
  }
}