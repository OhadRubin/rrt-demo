import React, { useState, useEffect, useCallback } from 'react';

// Cell types for the grid
const CELL_TYPES = {
  UNKNOWN: 0,
  FREE: 1,
  OBSTACLE: 2,
  FRONTIER: 3,
  ROBOT: 4,
  PATH: 5,
  EXPLORED: 6
};

// Robot directions
const DIRECTIONS = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

const DIRECTION_VECTORS = {
  [DIRECTIONS.NORTH]: [-1, 0],
  [DIRECTIONS.EAST]: [0, 1],
  [DIRECTIONS.SOUTH]: [1, 0],
  [DIRECTIONS.WEST]: [0, -1]
};

const DIRECTION_NAMES = {
  [DIRECTIONS.NORTH]: '↑',
  [DIRECTIONS.EAST]: '→',
  [DIRECTIONS.SOUTH]: '↓',
  [DIRECTIONS.WEST]: '←'
};

// Colors for visualization
const CELL_COLORS = {
  [CELL_TYPES.UNKNOWN]: '#2a2a2a',
  [CELL_TYPES.FREE]: '#e8e8e8',
  [CELL_TYPES.OBSTACLE]: '#8b4513',
  [CELL_TYPES.FRONTIER]: '#ff6b6b',
  [CELL_TYPES.ROBOT]: '#4ecdc4',
  [CELL_TYPES.PATH]: '#45b7d1',
  [CELL_TYPES.EXPLORED]: '#98fb98'
};

// A* Pathfinding Algorithm
class AStar {
  constructor(grid) {
    this.grid = grid;
    this.rows = grid.length;
    this.cols = grid[0].length;
  }

  heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  getNeighbors(node) {
    const neighbors = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dx, dy] of directions) {
      const x = node.x + dx;
      const y = node.y + dy;
      
      if (x >= 0 && x < this.rows && y >= 0 && y < this.cols) {
        if (this.grid[x][y] !== CELL_TYPES.OBSTACLE && this.grid[x][y] !== CELL_TYPES.UNKNOWN) {
          neighbors.push({ x, y });
        }
      }
    }
    return neighbors;
  }

  findPath(start, goal) {
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(`${start.x},${start.y}`, 0);
    fScore.set(`${start.x},${start.y}`, this.heuristic(start, goal));

    while (openSet.length > 0) {
      // Find node with lowest fScore
      let current = openSet[0];
      let currentIndex = 0;
      
      for (let i = 1; i < openSet.length; i++) {
        const currentKey = `${current.x},${current.y}`;
        const iKey = `${openSet[i].x},${openSet[i].y}`;
        if (fScore.get(iKey) < fScore.get(currentKey)) {
          current = openSet[i];
          currentIndex = i;
        }
      }

      openSet.splice(currentIndex, 1);

      // Check if we reached the goal
      if (current.x === goal.x && current.y === goal.y) {
        const path = [];
        let temp = current;
        while (temp) {
          path.unshift(temp);
          temp = cameFrom.get(`${temp.x},${temp.y}`);
        }
        return path;
      }

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        const currentKey = `${current.x},${current.y}`;
        const tentativeGScore = gScore.get(currentKey) + 1;

        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, goal));

          const inOpenSet = openSet.some(node => node.x === neighbor.x && node.y === neighbor.y);
          if (!inOpenSet) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return null; // No path found
  }
}

// Frontier Detection Algorithm
class FrontierDetector {
  constructor(grid) {
    this.grid = grid;
    this.rows = grid.length;
    this.cols = grid[0].length;
  }

  detectFrontiers() {
    const frontiers = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // A frontier is a free cell adjacent to an unknown cell
        if (this.grid[i][j] === CELL_TYPES.FREE || this.grid[i][j] === CELL_TYPES.EXPLORED) {
          let hasUnknownNeighbor = false;
          
          for (const [dx, dy] of directions) {
            const x = i + dx;
            const y = j + dy;
            
            if (x >= 0 && x < this.rows && y >= 0 && y < this.cols) {
              if (this.grid[x][y] === CELL_TYPES.UNKNOWN) {
                hasUnknownNeighbor = true;
                break;
              }
            }
          }
          
          if (hasUnknownNeighbor) {
            frontiers.push({ x: i, y: j });
          }
        }
      }
    }

    return frontiers;
  }

  findClosestFrontier(robotPos, frontiers) {
    if (frontiers.length === 0) return null;

    let closest = frontiers[0];
    let minDistance = Math.abs(robotPos.x - closest.x) + Math.abs(robotPos.y - closest.y);

    for (const frontier of frontiers) {
      const distance = Math.abs(robotPos.x - frontier.x) + Math.abs(robotPos.y - frontier.y);
      if (distance < minDistance) {
        minDistance = distance;
        closest = frontier;
      }
    }

    return closest;
  }
}

// Exploration Manager - coordinates the entire process
class ExplorationManager {
  constructor(grid, robotPos) {
    this.originalGrid = grid.map(row => [...row]);
    this.grid = grid.map(row => [...row]);
    this.robotPos = { ...robotPos };
    this.initialRobotPos = { ...robotPos };
    this.robotDirection = DIRECTIONS.NORTH; // Initial direction
    this.initialRobotDirection = DIRECTIONS.NORTH;
    this.aStar = new AStar(this.grid);
    this.frontierDetector = new FrontierDetector(this.grid);
    this.currentPath = [];
    this.pathIndex = 0;
    this.isComplete = false;
    this.step = 0;
    
    // Initially explore around robot position
    this.exploreAround(this.robotPos, 2);
  }

  exploreAround(pos, radius) {
    // Directional sensor - only explore in a cone in front of the robot
    const [dx, dy] = DIRECTION_VECTORS[this.robotDirection];
    
    // Define sensor cone angle (roughly 90 degrees in front)
    const sensorPositions = [];
    
    // Forward direction positions
    for (let dist = 1; dist <= radius; dist++) {
      const frontX = pos.x + dx * dist;
      const frontY = pos.y + dy * dist;
      
      if (frontX >= 0 && frontX < this.grid.length && frontY >= 0 && frontY < this.grid[0].length) {
        sensorPositions.push([frontX, frontY]);
      }
      
      // Add positions to the sides (creating cone effect)
      for (let side = 1; side <= Math.min(dist, radius); side++) {
        if (this.robotDirection === DIRECTIONS.NORTH || this.robotDirection === DIRECTIONS.SOUTH) {
          // Check left and right when facing north/south
          const leftY = frontY - side;
          const rightY = frontY + side;
          
          if (leftY >= 0 && leftY < this.grid[0].length) {
            sensorPositions.push([frontX, leftY]);
          }
          if (rightY >= 0 && rightY < this.grid[0].length) {
            sensorPositions.push([frontX, rightY]);
          }
        } else {
          // Check up and down when facing east/west
          const upX = frontX - side;
          const downX = frontX + side;
          
          if (upX >= 0 && upX < this.grid.length) {
            sensorPositions.push([upX, frontY]);
          }
          if (downX >= 0 && downX < this.grid.length) {
            sensorPositions.push([downX, frontY]);
          }
        }
      }
    }
    
    // Also explore current position and immediate neighbors
    for (let i = Math.max(0, pos.x - 1); i <= Math.min(this.grid.length - 1, pos.x + 1); i++) {
      for (let j = Math.max(0, pos.y - 1); j <= Math.min(this.grid[0].length - 1, pos.y + 1); j++) {
        sensorPositions.push([i, j]);
      }
    }
    
    // Apply sensor readings
    for (const [i, j] of sensorPositions) {
      if (this.originalGrid[i][j] !== CELL_TYPES.OBSTACLE) {
        this.grid[i][j] = this.originalGrid[i][j] === CELL_TYPES.OBSTACLE ? CELL_TYPES.OBSTACLE : CELL_TYPES.FREE;
      } else {
        this.grid[i][j] = CELL_TYPES.OBSTACLE;
      }
    }
  }

  reset() {
    this.grid = this.originalGrid.map(row => row.map(cell => 
      cell === CELL_TYPES.OBSTACLE ? CELL_TYPES.OBSTACLE : CELL_TYPES.UNKNOWN
    ));
    this.robotPos = { ...this.initialRobotPos };
    this.robotDirection = this.initialRobotDirection;
    this.aStar = new AStar(this.grid);
    this.frontierDetector = new FrontierDetector(this.grid);
    this.currentPath = [];
    this.pathIndex = 0;
    this.isComplete = false;
    this.step = 0;
    this.exploreAround(this.robotPos, 2);
  }

  getVisualizationGrid() {
    const visGrid = this.grid.map(row => [...row]);
    
    // Mark frontiers
    const frontiers = this.frontierDetector.detectFrontiers();
    for (const frontier of frontiers) {
      if (visGrid[frontier.x][frontier.y] !== CELL_TYPES.ROBOT) {
        visGrid[frontier.x][frontier.y] = CELL_TYPES.FRONTIER;
      }
    }

    // Mark current path
    for (let i = 0; i < this.currentPath.length; i++) {
      const pathNode = this.currentPath[i];
      if (visGrid[pathNode.x][pathNode.y] !== CELL_TYPES.ROBOT && 
          visGrid[pathNode.x][pathNode.y] !== CELL_TYPES.FRONTIER) {
        visGrid[pathNode.x][pathNode.y] = CELL_TYPES.PATH;
      }
    }

    // Mark robot position
    visGrid[this.robotPos.x][this.robotPos.y] = CELL_TYPES.ROBOT;

    return visGrid;
  }

  getRobotDirectionSymbol() {
    return DIRECTION_NAMES[this.robotDirection];
  }

  executeStep() {
    if (this.isComplete) return false;

    // If we have a current path, move along it
    if (this.currentPath.length > 0 && this.pathIndex < this.currentPath.length) {
      const nextPos = this.currentPath[this.pathIndex];
      
      // Update robot direction based on movement
      const dx = nextPos.x - this.robotPos.x;
      const dy = nextPos.y - this.robotPos.y;
      
      if (dx === -1 && dy === 0) this.robotDirection = DIRECTIONS.NORTH;
      else if (dx === 1 && dy === 0) this.robotDirection = DIRECTIONS.SOUTH;
      else if (dx === 0 && dy === -1) this.robotDirection = DIRECTIONS.WEST;
      else if (dx === 0 && dy === 1) this.robotDirection = DIRECTIONS.EAST;
      
      this.robotPos = { ...nextPos };
      this.pathIndex++;
      
      // If we reached the end of the path, explore around the new position
      if (this.pathIndex >= this.currentPath.length) {
        this.exploreAround(this.robotPos, 1);
        this.currentPath = [];
        this.pathIndex = 0;
      }
      
      this.step++;
      return true;
    }

    // Stage 1: Frontier Detection
    const frontiers = this.frontierDetector.detectFrontiers();
    
    if (frontiers.length === 0) {
      this.isComplete = true;
      return false;
    }

    // Stage 2: Travel to frontier
    const targetFrontier = this.frontierDetector.findClosestFrontier(this.robotPos, frontiers);
    
    if (targetFrontier) {
      this.aStar = new AStar(this.grid); // Update A* with current grid
      this.currentPath = this.aStar.findPath(this.robotPos, targetFrontier);
      
      if (this.currentPath) {
        this.pathIndex = 1; // Skip first position (current robot position)
      } else {
        // If no path found, mark as complete
        this.isComplete = true;
        return false;
      }
    }

    this.step++;
    return true;
  }
}

const FrontierExploration = () => {
  const GRID_SIZE = 20;
  
  // Create a grid with some obstacles
  const createInitialGrid = () => {
    const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(CELL_TYPES.UNKNOWN));
    
    // Add some obstacles
    const obstacles = [
      {x: 5, y: 5}, {x: 5, y: 6}, {x: 5, y: 7},
      {x: 10, y: 8}, {x: 10, y: 9}, {x: 10, y: 10}, {x: 11, y: 10}, {x: 12, y: 10},
      {x: 15, y: 3}, {x: 15, y: 4}, {x: 15, y: 5}, {x: 16, y: 5}, {x: 17, y: 5},
      {x: 8, y: 15}, {x: 9, y: 15}, {x: 10, y: 15}, {x: 8, y: 16}, {x: 9, y: 16}
    ];
    
    obstacles.forEach(obs => {
      if (obs.x >= 0 && obs.x < GRID_SIZE && obs.y >= 0 && obs.y < GRID_SIZE) {
        grid[obs.x][obs.y] = CELL_TYPES.OBSTACLE;
      }
    });
    
    return grid;
  };

  const [grid, setGrid] = useState(() => createInitialGrid());
  const [explorationManager, setExplorationManager] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(200);

  // Initialize exploration manager
  useEffect(() => {
    const manager = new ExplorationManager(grid, { x: 2, y: 2 });
    setExplorationManager(manager);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isRunning || !explorationManager) return;

    const interval = setInterval(() => {
      const continueExploration = explorationManager.executeStep();
      if (!continueExploration) {
        setIsRunning(false);
      }
      setGrid(explorationManager.getVisualizationGrid());
    }, speed);

    return () => clearInterval(interval);
  }, [isRunning, explorationManager, speed]);

  const handleStart = () => {
    if (explorationManager && !explorationManager.isComplete) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (explorationManager) {
      explorationManager.reset();
      setGrid(explorationManager.getVisualizationGrid());
    }
  };

  const handleStep = () => {
    if (explorationManager && !isRunning) {
      const continueExploration = explorationManager.executeStep();
      if (!continueExploration) {
        setIsRunning(false);
      }
      setGrid(explorationManager.getVisualizationGrid());
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Frontier-Based Exploration</h1>
      
      <div className="mb-6 text-center">
        <p className="text-gray-600 mb-2">
          Watch as the robot explores an unknown environment using frontier detection and A* pathfinding
        </p>
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={handleStart}
            disabled={isRunning || (explorationManager && explorationManager.isComplete)}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            Start
          </button>
          <button
            onClick={handlePause}
            disabled={!isRunning}
            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400"
          >
            Pause
          </button>
          <button
            onClick={handleStep}
            disabled={isRunning || (explorationManager && explorationManager.isComplete)}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Step
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Reset
          </button>
        </div>
        
        <div className="flex justify-center items-center gap-2 mb-4">
          <label htmlFor="speed">Speed:</label>
          <input
            id="speed"
            type="range"
            min="50"
            max="1000"
            step="50"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-32"
          />
          <span>{speed}ms</span>
        </div>

        {explorationManager && (
          <div className="text-sm text-gray-600 mb-4">
            Steps: {explorationManager.step} | 
            Direction: {explorationManager.getRobotDirectionSymbol()} | 
            Status: {explorationManager.isComplete ? 'Exploration Complete!' : isRunning ? 'Running' : 'Paused'}
          </div>
        )}
      </div>

      <div className="flex justify-center mb-4">
        <div 
          className="grid gap-1 p-4 bg-gray-100 rounded"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: 'fit-content'
          }}
        >
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className="w-6 h-6 border border-gray-300 flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: CELL_COLORS[cell] }}
                title={`(${i},${j})`}
              >
                {cell === CELL_TYPES.ROBOT && explorationManager ? explorationManager.getRobotDirectionSymbol() : ''}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Legend</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: CELL_COLORS[CELL_TYPES.UNKNOWN] }}></div>
              <span>Unknown</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: CELL_COLORS[CELL_TYPES.FREE] }}></div>
              <span>Free Space</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: CELL_COLORS[CELL_TYPES.OBSTACLE] }}></div>
              <span>Obstacle</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold mb-2">Exploration</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: CELL_COLORS[CELL_TYPES.FRONTIER] }}></div>
              <span>Frontier</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: CELL_COLORS[CELL_TYPES.PATH] }}></div>
              <span>A* Path</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: CELL_COLORS[CELL_TYPES.ROBOT] }}></div>
              <span>Robot</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-semibold mb-2">Algorithm</h3>
          <div className="text-xs space-y-1">
            <div><strong>Stage 1:</strong> Detect frontiers (boundaries between known/unknown)</div>
            <div><strong>Stage 2:</strong> Use A* to navigate to closest frontier</div>
            <div><strong>Repeat:</strong> Until no frontiers remain</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontierExploration;