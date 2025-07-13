
import { WavefrontFrontierDetection } from './WavefrontFrontierDetection.js';
import { SensorManager, DirectionalConeSensor } from './SensorManager.js';
import { PathPlanner } from './PathPlanner.js';

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

// Legacy Frontier Detection (kept for backward compatibility)
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



// Wrapper function for backward compatibility - uses modular sensor system
export const getSensorPositions = (robotX, robotY, robotDirection, sensorRange, width, height) => {
  const sensorManager = new SensorManager(width, height);
  const coneSensor = new DirectionalConeSensor(width, height);
  sensorManager.addSensor('cone', coneSensor);
  
  return sensorManager.getAllSensorPositions(robotX, robotY, robotDirection, { sensorRange });
};

const createInitialKnownMap = (fullMaze, robotX, robotY, robotDirection, sensorRange, width, height) => {
  // Initialize known map: 0 = open, 1 = wall, 2 = unknown
  const knownMap = new Uint8Array(width * height);
  knownMap.fill(2); // Start with everything unknown
  
  // Use modular sensor system for initial mapping
  const sensorManager = new SensorManager(width, height);
  const coneSensor = new DirectionalConeSensor(width, height);
  sensorManager.addSensor('cone', coneSensor);
  
  const result = sensorManager.updateMapWithSensors(knownMap, fullMaze, robotX, robotY, robotDirection, { sensorRange });
  return result.knownMap;
};

const updateKnownMap = (knownMap, fullMaze, robotX, robotY, robotDirection, sensorRange, width, height) => {
  // Use modular sensor system for map updates
  const sensorManager = new SensorManager(width, height);
  const coneSensor = new DirectionalConeSensor(width, height);
  sensorManager.addSensor('cone', coneSensor);
  
  return sensorManager.updateMapWithSensors(knownMap, fullMaze, robotX, robotY, robotDirection, { sensorRange });
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


// Wrapper function for backward compatibility - uses modular pathfinding
export const findPathBFS = (knownMap, startX, startY, targetX, targetY, width, height, timeout = 1000) => {
  const pathPlanner = new PathPlanner(width, height);
  return pathPlanner.findPathBFS(knownMap, startX, startY, targetX, targetY, { timeout });
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
      sensorRange = 15,       // Robot sensor range (matches original cone distance)
      stepSize = 1,           // Movement step size
      maxIterations = 500,    // Max exploration iterations
      waypointTolerance = 0.1, // Distance to waypoint before moving to next
      minFrontierSize = 1,    // Minimum frontier points to consider
      explorationThreshold = 99, // Stop when X% coverage achieved
      pathfindingTimeout = 100000,  // Max BFS search nodes
      useWFD = false,         // Use Wavefront Frontier Detection (research paper version)
      pathfindingAlgorithm = 'bfs', // 'bfs', 'astar', 'dijkstra'
      frontierStrategy = 'nearest'  // 'nearest', 'centroid', 'median'
    } = options;
    
    // Initialize modular components
    const wfdDetector = useWFD ? new WavefrontFrontierDetection(width, height) : null;
    const pathPlanner = new PathPlanner(width, height);
    
    // Helper function to detect frontiers using selected method
    const detectCurrentFrontiers = (knownMap) => {
      if (useWFD && wfdDetector) {
        const frontierGroups = wfdDetector.detectFrontiers(knownMap);
        // Convert grouped frontiers back to individual points for compatibility
        const allPoints = [];
        for (const group of frontierGroups) {
          if (frontierStrategy === 'centroid' && group.centroid) {
            allPoints.push(group.centroid);
          } else if (frontierStrategy === 'median' && group.median) {
            allPoints.push(group.median);
          } else {
            // Default: add all points in the group
            allPoints.push(...group.points);
          }
        }
        return allPoints;
      } else {
        return detectFrontiers(knownMap, width, height);
      }
    };
    
    // Initialize robot knowledge with starting position and direction
    let currentPos = { x: robotPos.x, y: robotPos.y };
    let robotDirection = DIRECTIONS.NORTH; // Initial direction
    let knownMap = createInitialKnownMap(fullMaze, currentPos.x, currentPos.y, robotDirection, sensorRange, width, height);
    
    // Initial 360° spin to survey surroundings
    const allDirections = [DIRECTIONS.NORTH, DIRECTIONS.EAST, DIRECTIONS.SOUTH, DIRECTIONS.WEST];
    for (const direction of allDirections) {
      robotDirection = direction;
      const updateResult = updateKnownMap(knownMap, fullMaze, currentPos.x, currentPos.y, robotDirection, sensorRange, width, height);
      knownMap = updateResult.knownMap;
      
      // Show spinning progress
      if (onProgress) {
        const spinFrontiers = detectCurrentFrontiers(knownMap);
        onProgress([{ x: currentPos.x, y: currentPos.y }], false, { 
          frontiers: spinFrontiers, 
          knownMap, 
          robotPos: currentPos, 
          robotDirection,
          sensorPositions: updateResult.visibleSensorPositions,
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
        const currentFrontiers = detectCurrentFrontiers(knownMap);
        
        
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
        
        // Find path to the frontier using selected pathfinding algorithm
        if (pathfindingAlgorithm === 'astar') {
          currentPath = pathPlanner.findPathAStar(knownMap, currentPos.x, currentPos.y, currentTarget.x, currentTarget.y, { timeout: pathfindingTimeout });
        } else if (pathfindingAlgorithm === 'dijkstra') {
          currentPath = pathPlanner.findPathDijkstra(knownMap, currentPos.x, currentPos.y, currentTarget.x, currentTarget.y, { timeout: pathfindingTimeout });
        } else {
          currentPath = pathPlanner.findPathBFS(knownMap, currentPos.x, currentPos.y, currentTarget.x, currentTarget.y, { timeout: pathfindingTimeout });
        }
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
      const updateResult = updateKnownMap(knownMap, fullMaze, currentPos.x, currentPos.y, robotDirection, sensorRange, width, height);
      knownMap = updateResult.knownMap;
      exploredNodes.push({ x: currentPos.x, y: currentPos.y });
      
      // Update frontiers and call progress callback
      if (onProgress) {
        const updatedFrontiers = detectCurrentFrontiers(knownMap);
        onProgress(exploredNodes, false, { frontiers: updatedFrontiers, knownMap, robotPos: currentPos, robotDirection, sensorPositions: updateResult.visibleSensorPositions });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const finalCoverage = calculateCoverage(knownMap, fullMaze);
    const finalFrontiers = detectCurrentFrontiers(knownMap);
    
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
          pathfindingTimeout,
          useWFD,
          pathfindingAlgorithm,
          frontierStrategy
        }
      },
      finalKnownMap: knownMap
    };
  }
});