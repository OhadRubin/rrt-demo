// Frontier Detection Functions (based on WFD algorithm from paper)
const detectFrontiers = (knownMap, width, height) => {
  if (!knownMap) return [];
  
  const frontierPoints = [];
  
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
  if (knownMap[targetGridY * width + targetGridX] === 1) {
    return null; // Target is a known wall
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
      
      if (newX >= 0 && newX < width && newY >= 0 && newY < height && 
          !visited.has(key) && knownMap[newY * width + newX] !== 1) {
        
        visited.add(key);
        queue.push({
          x: newX, 
          y: newY, 
          path: [...path, {x: x + 0.5, y: y + 0.5}]
        });
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
      pathfindingTimeout = 1000  // Max BFS search nodes
    } = options;
    
    // Initialize robot knowledge with starting position
    let currentPos = { x: robotPos.x, y: robotPos.y };
    let knownMap = createInitialKnownMap(fullMaze, currentPos.x, currentPos.y, sensorRange, width, height);
    let exploredNodes = [{ x: currentPos.x, y: currentPos.y }];
    let iterationCount = 0;
    let currentTarget = null;
    let currentPath = null;
    let pathIndex = 0;
    
    while (true) {
      iterationCount++;
      
      // Detect current frontiers
      const currentFrontiers = detectFrontiers(knownMap, width, height);
      
      // Check exploration completion conditions
      const currentCoverage = calculateCoverage(knownMap, fullMaze);
      
      if (currentFrontiers.length === 0) {
        console.log(`EXPLORATION_COMPLETE: No more frontiers found. Coverage: ${currentCoverage.toFixed(1)}%`);
        break;
      }
      
      if (currentCoverage >= explorationThreshold) {
        console.log(`EXPLORATION_COMPLETE: Coverage threshold reached (${currentCoverage.toFixed(1)}% >= ${explorationThreshold}%)`);
        break;
      }
      
      // Use all frontiers - remove problematic size filtering
      const validFrontiers = currentFrontiers;
      
      // Remove early termination based on frontier filtering
      // Let the algorithm continue as long as frontiers exist
      
      // Find nearest accessible frontier (skip inaccessible ones)
      let nearestFrontier = null;
      let minDistance = Infinity;
      
      for (const frontier of validFrontiers) {
        // Skip if frontier is marked as inaccessible
        if (frontier.inaccessible) continue;
        
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
      
      // Check if we need to plan a new path (new frontier or no current path)
      if (!currentTarget || !currentPath || (currentTarget.x !== nearestFrontier.x || currentTarget.y !== nearestFrontier.y)) {
        currentTarget = nearestFrontier;
        
        // Find path to the frontier using BFS with known map
        currentPath = findPathBFS(knownMap, currentPos.x, currentPos.y, currentTarget.x, currentTarget.y, width, height, pathfindingTimeout);
        pathIndex = 0;
        
        if (currentPath && currentPath.length > 0) {
          console.log(`PATHFINDING_DEBUG: Found path to frontier (${currentTarget.x.toFixed(2)}, ${currentTarget.y.toFixed(2)}) with ${currentPath.length} steps`);
        } else {
          console.log(`PATHFINDING_DEBUG: No path found to frontier (${currentTarget.x.toFixed(2)}, ${currentTarget.y.toFixed(2)}) - trying next frontier`);
          
          // Instead of marking as inaccessible permanently, just skip this iteration
          // and try again next time - the map state might change
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
          
          currentPos.x += (dx / distance) * actualStepSize;
          currentPos.y += (dy / distance) * actualStepSize;
          
          console.log(`MOVEMENT_DEBUG: Moving to waypoint ${pathIndex + 1}/${currentPath.length} at (${nextWaypoint.x.toFixed(2)}, ${nextWaypoint.y.toFixed(2)}) [step: ${actualStepSize.toFixed(2)}]`);
        } else {
          // Reached waypoint, move to next one
          pathIndex++;
          console.log(`MOVEMENT_DEBUG: Reached waypoint ${pathIndex}/${currentPath.length}`);
          
          if (pathIndex >= currentPath.length) {
            console.log(`MOVEMENT_DEBUG: Reached frontier target! Starting new exploration cycle`);
            currentTarget = null;
            currentPath = null;
          }
        }
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
    
    const finalCoverage = calculateCoverage(knownMap, fullMaze);
    const finalFrontiers = detectFrontiers(knownMap, width, height);
    
    console.log(`EXPLORATION_FINISHED: Total iterations: ${iterationCount}/${maxIterations}`);
    console.log(`EXPLORATION_FINISHED: Final coverage: ${finalCoverage.toFixed(1)}%`);
    console.log(`EXPLORATION_FINISHED: Remaining frontiers: ${finalFrontiers.length}`);
    console.log(`EXPLORATION_FINISHED: Nodes explored: ${exploredNodes.length}`);
    
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