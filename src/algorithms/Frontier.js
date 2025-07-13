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

// Frontier-based exploration algorithm
export const createFrontierAlgorithm = () => ({
  name: 'Frontier-Based',
  type: 'exploration',
  async execute(fullMaze, robotPos, _goalPoint, options, onProgress) {
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
});