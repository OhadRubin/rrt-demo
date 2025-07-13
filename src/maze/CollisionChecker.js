// Collision Checker Class
export class MazeCollisionChecker {
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