// SENSOR MODE TOGGLE: Change 'true' to 'false' in getSensorPositions calls to switch modes
// true = GENEROUS sensor (3x3 base + wide cone + diagonals) - for debugging
// false = PRECISE expanding cone (your preferred triangular pattern)

const GENEROUS_SENSOR = true;
// Robot directions
const DIRECTIONS = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

const DIRECTION_VECTORS = {
  [DIRECTIONS.NORTH]: [0, -1],
  [DIRECTIONS.EAST]: [1, 0],
  [DIRECTIONS.SOUTH]: [0, 1],
  [DIRECTIONS.WEST]: [-1, 0]
};

// Frontier Detection Functions (based on WFD algorithm from paper)
const detectFrontiers = (knownMap, width, height) => {
  if (!knownMap) return [];
  
  const frontierPoints = [];
  
  // Find all frontier points (known open cells adjacent to unknown cells)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Check if this cell is known open space (value 0)
      if (knownMap[idx] === 0) {
        // Check if it has at least one unknown neighbor
        const neighbors = [
          knownMap[(y-1) * width + x],     // top
          knownMap[(y+1) * width + x],     // bottom
          knownMap[y * width + (x-1)],     // left
          knownMap[y * width + (x+1)]      // right
        ];
        
        if (neighbors.some(neighbor => neighbor === 2)) {
          frontierPoints.push({ x: x + 0.5, y: y + 0.5 });
        }
      }
    }
  }
  
  return frontierPoints;
};

// Line-of-sight checking - returns true if point (x2,y2) is visible from (x1,y1)
const hasLineOfSight = (fullMaze, x1, y1, x2, y2, width, height) => {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const x = x1;
  const y = y1;
  
  const n = 1 + dx + dy;
  const x_inc = (x2 > x1) ? 1 : -1;
  const y_inc = (y2 > y1) ? 1 : -1;
  let error = dx - dy;
  
  let currentX = x;
  let currentY = y;
  
  for (let i = 0; i < n; i++) {
    // Check if current position is a wall
    if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
      if (fullMaze[currentY * width + currentX] === 1) {
        // Hit a wall - check if this is the target position
        return (currentX === x2 && currentY === y2);
      }
    }
    
    if (error > 0) {
      currentX += x_inc;
      error -= dy;
    } else {
      currentY += y_inc;
      error += dx;
    }
  }
  
  return true;
};

// Get sensor positions based on robot direction and cone angle
const getSensorPositions = (robotX, robotY, robotDirection, sensorRange, width, height, useGenerousSensor = true) => {
  const robotGridX = Math.floor(robotX);
  const robotGridY = Math.floor(robotY);
  const [dirX, dirY] = DIRECTION_VECTORS[robotDirection];
  const sensorPositions = [];
  
  if (useGenerousSensor) {
    // GENEROUS SENSOR - for debugging/quick exploration
    // Add 3x3 area around robot
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = robotGridX + dx;
        const y = robotGridY + dy;
        if (x >= 0 && x < width && y >= 0 && y < height) {
          sensorPositions.push([x, y]);
        }
      }
    }
    
    // Add wide cone with diagonals
    for (let dist = 1; dist <= sensorRange; dist++) {
      const frontX = robotGridX + dirX * dist;
      const frontY = robotGridY + dirY * dist;
      
      // Wide cone sides
      for (let side = -dist; side <= dist; side++) {
        let x, y;
        
        if (robotDirection === DIRECTIONS.NORTH || robotDirection === DIRECTIONS.SOUTH) {
          x = frontX;
          y = frontY + side;
        } else {
          x = frontX + side;
          y = frontY;
        }
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          sensorPositions.push([x, y]);
        }
      }
      
      // Add diagonal coverage
      const diagonals = [
        [frontX + 1, frontY + 1], [frontX + 1, frontY - 1],
        [frontX - 1, frontY + 1], [frontX - 1, frontY - 1]
      ];
      
      for (const [diagX, diagY] of diagonals) {
        if (diagX >= 0 && diagX < width && diagY >= 0 && diagY < height) {
          sensorPositions.push([diagX, diagY]);
        }
      }
    }
  } else {
    // PRECISE EXPANDING CONE - your preferred pattern
    // Add robot position
    sensorPositions.push([robotGridX, robotGridY]);
    
    // Add expanding cone in forward direction
    for (let dist = 1; dist <= sensorRange; dist++) {
      const frontX = robotGridX + dirX * dist;
      const frontY = robotGridY + dirY * dist;
      
      // Width at this distance: starts at 3, grows by 2 each step (3, 5, 7, 9...)
      const halfWidth = dist;
      
      for (let side = -halfWidth; side <= halfWidth; side++) {
        let x, y;
        
        if (robotDirection === DIRECTIONS.NORTH || robotDirection === DIRECTIONS.SOUTH) {
          // Moving vertically, expand horizontally
          x = frontX;
          y = frontY + side;
        } else {
          // Moving horizontally, expand vertically  
          x = frontX + side;
          y = frontY;
        }
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          sensorPositions.push([x, y]);
        }
      }
    }
  }
  
  return sensorPositions;
};

const createInitialKnownMap = (fullMaze, robotX, robotY, robotDirection, sensorRange, width, height) => {
  // Initialize known map: 0 = open, 1 = wall, 2 = unknown
  const knownMap = new Uint8Array(width * height);
  knownMap.fill(2); // Start with everything unknown
  
  // Reveal area using directional sensor with line-of-sight
  const robotGridX = Math.floor(robotX);
  const robotGridY = Math.floor(robotY);
  const sensorPositions = getSensorPositions(robotX, robotY, robotDirection, sensorRange, width, height, GENEROUS_SENSOR);
  
  for (const [x, y] of sensorPositions) {
    if (hasLineOfSight(fullMaze, robotGridX, robotGridY, x, y, width, height)) {
      knownMap[y * width + x] = fullMaze[y * width + x];
    }
  }
  
  return knownMap;
};

const updateKnownMap = (knownMap, fullMaze, robotX, robotY, robotDirection, sensorRange, width, height) => {
  const newKnownMap = new Uint8Array(knownMap);
  const robotGridX = Math.floor(robotX);
  const robotGridY = Math.floor(robotY);
  
  // Reveal new area using directional sensor with line-of-sight
  const sensorPositions = getSensorPositions(robotX, robotY, robotDirection, sensorRange, width, height, true);
  
  for (const [x, y] of sensorPositions) {
    if (hasLineOfSight(fullMaze, robotGridX, robotGridY, x, y, width, height)) {
      newKnownMap[y * width + x] = fullMaze[y * width + x];
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


// BFS pathfinding using robot's known map (allows movement through unknown space)
const findPathBFS = (knownMap, startX, startY, targetX, targetY, width, height, timeout = 1000) => {
  const startGridX = Math.floor(startX);
  const startGridY = Math.floor(startY);
  const targetGridX = Math.floor(targetX);
  const targetGridY = Math.floor(targetY);
  
  // Check if target is accessible
  if (targetGridX < 0 || targetGridX >= width || targetGridY < 0 || targetGridY >= height) {
    return null;
  }
  const targetCellValue = knownMap[targetGridY * width + targetGridX];
  if (targetCellValue === 1) {
    return null; // Target is a known wall
  }
  
  const startCellValue = knownMap[startGridY * width + startGridX];
  if (startCellValue !== 0) {
    return null;
  }
  
  const queue = [{x: startGridX, y: startGridY, path: []}];
  const visited = new Set();
  visited.add(`${startGridX},${startGridY}`);
  
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up
  let nodesExplored = 0;
  
  while (queue.length > 0 && nodesExplored < timeout) {
    nodesExplored++;
    const {x, y, path} = queue.shift();
    
    // Check if we reached target
    if (x === targetGridX && y === targetGridY) {
      return [...path, {x: x + 0.5, y: y + 0.5}];
    }
    
    // Explore neighbors
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      const key = `${newX},${newY}`;
      
      if (newX >= 0 && newX < width && newY >= 0 && newY < height && !visited.has(key)) {
        const cellValue = knownMap[newY * width + newX];
        
        if (cellValue === 0) {
          visited.add(key);
          queue.push({
            x: newX, 
            y: newY, 
            path: [...path, {x: x + 0.5, y: y + 0.5}]
          });
        }
      }
    }
  }
  
  return null; // No path found
};

// Frontier-based exploration algorithm
export const createFrontierAlgorithm = () => ({
  name: 'Frontier-Based',
  type: 'exploration',
  async execute(fullMaze, robotPos, _goalPoint, options, onProgress) {
    const { 
      width, 
      height, 
      delay = 50,
      // Frontier-specific parameters with defaults
      sensorRange = 3,        // Robot sensor range
      stepSize = 1,           // Movement step size
      maxIterations = 500,    // Max exploration iterations
      waypointTolerance = 0.1, // Distance to waypoint before moving to next
      minFrontierSize = 1,    // Minimum frontier points to consider
      explorationThreshold = 99, // Stop when X% coverage achieved
      pathfindingTimeout = 100000  // Max BFS search nodes
    } = options;
    
    // Initialize robot knowledge with starting position and direction
    let currentPos = { x: robotPos.x, y: robotPos.y };
    let robotDirection = DIRECTIONS.NORTH; // Initial direction
    let knownMap = createInitialKnownMap(fullMaze, currentPos.x, currentPos.y, robotDirection, sensorRange, width, height);
    
    // Initial 360° spin to survey surroundings
    const allDirections = [DIRECTIONS.NORTH, DIRECTIONS.EAST, DIRECTIONS.SOUTH, DIRECTIONS.WEST];
    for (const direction of allDirections) {
      robotDirection = direction;
      knownMap = updateKnownMap(knownMap, fullMaze, currentPos.x, currentPos.y, robotDirection, sensorRange, width, height);
      
      // Show spinning progress
      if (onProgress) {
        const spinFrontiers = detectFrontiers(knownMap, width, height);
        onProgress([{ x: currentPos.x, y: currentPos.y }], false, { 
          frontiers: spinFrontiers, 
          knownMap, 
          robotPos: currentPos, 
          robotDirection,
          isSpinning: true 
        });
        await new Promise(resolve => setTimeout(resolve, delay * 2)); // Slower for visibility
      }
    }
    
    let exploredNodes = [{ x: currentPos.x, y: currentPos.y }];
    let iterationCount = 0;
    let currentTarget = null;
    let currentPath = null;
    let pathIndex = 0;
    let failedFrontiers = new Map(); // Track failed attempts per frontier
    let consecutiveFailures = 0; // Count consecutive pathfinding failures
    
    // while (iterationCount < maxIterations) {
    while (true) {
      iterationCount++;
      
      // Only plan new path if we don't have a current path in progress
      if (!currentTarget || !currentPath || pathIndex >= currentPath.length) {
        // Detect current frontiers
        const currentFrontiers = detectFrontiers(knownMap, width, height);
        
        
        // Check exploration completion conditions
        const currentCoverage = calculateCoverage(knownMap, fullMaze);
        
        if (currentFrontiers.length === 0) {
          break;
        }
        
        if (currentCoverage >= explorationThreshold) {
          break;
        }
        
        // Filter out frontiers that have failed too many times
        const validFrontiers = currentFrontiers.filter(frontier => {
          const key = `${frontier.x.toFixed(1)},${frontier.y.toFixed(1)}`;
          const failures = failedFrontiers.get(key) || 0;
          return failures < 3; // Skip frontiers that failed 3+ times
        });
        
        if (validFrontiers.length === 0) {
          break;
        }
        
        // Find nearest accessible frontier
        let nearestFrontier = null;
        let minDistance = Infinity;
        
        for (const frontier of validFrontiers) {
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
        
        currentTarget = nearestFrontier;
        
        // Find path to the frontier using BFS with known map
        currentPath = findPathBFS(knownMap, currentPos.x, currentPos.y, currentTarget.x, currentTarget.y, width, height, pathfindingTimeout);
        pathIndex = 0;
        
        if (currentPath && currentPath.length > 0) {
          consecutiveFailures = 0; // Reset failure counter on successful pathfinding
        } else {
          // Track failed attempts for this frontier
          const frontierKey = `${currentTarget.x.toFixed(1)},${currentTarget.y.toFixed(1)}`;
          const currentFailures = failedFrontiers.get(frontierKey) || 0;
          failedFrontiers.set(frontierKey, currentFailures + 1);
          
          consecutiveFailures++;
          
          // If too many consecutive failures, break to avoid infinite loop
          if (consecutiveFailures > validFrontiers.length * 2) {
            break;
          }
          
          currentTarget = null;
          currentPath = null;
          continue; // Try next frontier
        }
      }
      
      // Follow the path if we have one
      if (currentPath && pathIndex < currentPath.length) {
        const nextWaypoint = currentPath[pathIndex];
        const distanceToWaypoint = Math.sqrt(
          Math.pow(nextWaypoint.x - currentPos.x, 2) + 
          Math.pow(nextWaypoint.y - currentPos.y, 2)
        );
        
        // Move toward next waypoint
        if (distanceToWaypoint > waypointTolerance) {
          const actualStepSize = Math.min(stepSize, distanceToWaypoint);
          const dx = nextWaypoint.x - currentPos.x;
          const dy = nextWaypoint.y - currentPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Update robot direction based on movement
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;
          
          if (Math.abs(normalizedDx) > Math.abs(normalizedDy)) {
            robotDirection = normalizedDx > 0 ? DIRECTIONS.EAST : DIRECTIONS.WEST;
          } else {
            robotDirection = normalizedDy > 0 ? DIRECTIONS.SOUTH : DIRECTIONS.NORTH;
          }
          
          currentPos.x += (dx / distance) * actualStepSize;
          currentPos.y += (dy / distance) * actualStepSize;
          
        } else {
          // Reached waypoint, move to next one
          pathIndex++;
          
          if (pathIndex >= currentPath.length) {
            currentTarget = null;
            currentPath = null;
            pathIndex = 0;
          }
        }
      }
      
      // Update known map based on new robot position and direction
      knownMap = updateKnownMap(knownMap, fullMaze, currentPos.x, currentPos.y, robotDirection, sensorRange, width, height);
      exploredNodes.push({ x: currentPos.x, y: currentPos.y });
      
      // Update frontiers and call progress callback
      if (onProgress) {
        const updatedFrontiers = detectFrontiers(knownMap, width, height);
        onProgress(exploredNodes, false, { frontiers: updatedFrontiers, knownMap, robotPos: currentPos, robotDirection });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const finalCoverage = calculateCoverage(knownMap, fullMaze);
    const finalFrontiers = detectFrontiers(knownMap, width, height);
    
    return {
      success: true,
      path: exploredNodes,
      tree: exploredNodes,
      metrics: {
        nodesExplored: exploredNodes.length,
        iterations: iterationCount,
        mapCoverage: finalCoverage,
        remainingFrontiers: finalFrontiers.length,
        explorationComplete: finalFrontiers.length === 0 || finalCoverage >= explorationThreshold,
        parameters: {
          sensorRange,
          stepSize,
          maxIterations,
          waypointTolerance,
          minFrontierSize,
          explorationThreshold,
          pathfindingTimeout
        }
      },
      finalKnownMap: knownMap
    };
  }
});