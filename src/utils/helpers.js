// Shared utility functions

export const calculatePathLength = (path) => {
  if (!path || path.length < 2) return 0;
  
  return path.reduce((total, point, i) => {
    if (i === 0) return 0;
    const prev = path[i - 1];
    return total + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
  }, 0);
};

export const isPointInMaze = (x, y, maze, width, height) => {
  const gridX = Math.floor(x);
  const gridY = Math.floor(y);
  
  return gridX >= 0 && gridX < width && 
         gridY >= 0 && gridY < height &&
         maze[gridY * width + gridX] === 0;
};

export const formatTime = (milliseconds) => {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }
  return `${(milliseconds / 1000).toFixed(1)}s`;
};

export const formatDistance = (distance) => {
  return Math.round(distance * 10) / 10;
};