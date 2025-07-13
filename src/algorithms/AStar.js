// A* Algorithm Implementation
export const createAStarAlgorithm = () => ({
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