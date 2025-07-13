// Maze generation functionality
export const generateMaze = (w, h) => {
  const grid = new Uint8Array(w * h);
  grid.fill(1);
  
  const carve3x3 = (x, y) => {
    const endY = Math.min(y + 3, h);
    const endX = Math.min(x + 3, w);
    for (let dy = y; dy < endY; dy++) {
      const rowOffset = dy * w;
      for (let dx = x; dx < endX; dx++) {
        grid[rowOffset + dx] = 0;
      }
    }
  };
  
  const carveConnection = (x1, y1, x2, y2) => {
    if (x1 === x2) {
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2) + 2;
      const endY = Math.min(maxY + 1, h);
      const endX = Math.min(x1 + 3, w);
      
      for (let y = minY; y < endY; y++) {
        const rowOffset = y * w;
        for (let dx = x1; dx < endX; dx++) {
          grid[rowOffset + dx] = 0;
        }
      }
    } else {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2) + 2;
      const endX = Math.min(maxX + 1, w);
      const endY = Math.min(y1 + 3, h);
      
      for (let y = y1; y < endY; y++) {
        const rowOffset = y * w;
        for (let x = minX; x < endX; x++) {
          grid[rowOffset + x] = 0;
        }
      }
    }
  };
  
  const visited = new Set();
  const toKey = (x, y) => y * w + x;
  
  const stack = [];
  const startX = 2, startY = 2;
  
  carve3x3(startX, startY);
  stack.push([startX, startY]);
  visited.add(toKey(startX, startY));
  
  const directions = [[4, 0], [0, 4], [-4, 0], [0, -4]];
  
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  
  while (stack.length > 0) {
    const [currentX, currentY] = stack[stack.length - 1];
    const shuffledDirs = shuffle([...directions]);
    let found = false;
    
    for (const [dx, dy] of shuffledDirs) {
      const newX = currentX + dx;
      const newY = currentY + dy;
      
      if (newX > 0 && newX < w - 3 && newY > 0 && newY < h - 3) {
        const key = toKey(newX, newY);
        if (!visited.has(key)) {
          carveConnection(currentX, currentY, newX, newY);
          carve3x3(newX, newY);
          visited.add(key);
          stack.push([newX, newY]);
          found = true;
          break;
        }
      }
    }
    
    if (!found) stack.pop();
  }
  
  // Post-processing
  const random = Math.random;
  const roomThreshold = 0.002;
  const loopThreshold = 0.005;
  const wideningThreshold = 0.003;
  
  for (let y = 1; y < h - 1; y++) {
    const rowOffset = y * w;
    for (let x = 1; x < w - 1; x++) {
      const idx = rowOffset + x;
      const rand = random();
      
      if (rand < roomThreshold && x < w - 8 && y < h - 8) {
        const roomWidth = 4 + Math.floor(random() * 3);
        const roomHeight = 4 + Math.floor(random() * 3);
        const maxY = Math.min(y + roomHeight, h - 2);
        const maxX = Math.min(x + roomWidth, w - 2);
        
        for (let dy = y; dy < maxY; dy++) {
          const roomRowOffset = dy * w;
          for (let dx = x; dx < maxX; dx++) {
            grid[roomRowOffset + dx] = 0;
          }
        }
      }
      else if (rand < loopThreshold && grid[idx] === 1) {
        let paths = 0;
        if (y > 0 && grid[idx - w] === 0) paths++;
        if (y < h - 1 && grid[idx + w] === 0) paths++;
        if (x > 0 && grid[idx - 1] === 0) paths++;
        if (x < w - 1 && grid[idx + 1] === 0) paths++;
        
        if (paths >= 2) grid[idx] = 0;
      }
      else if (rand < wideningThreshold && grid[idx] === 0 && x < w - 4 && y < h - 4) {
        const size = random() > 0.5 ? 3 : 4;
        const maxY = Math.min(y + size, h - 1);
        const maxX = Math.min(x + size, w - 1);
        
        for (let dy = y; dy < maxY; dy++) {
          const wideRowOffset = dy * w;
          for (let dx = x; dx < maxX; dx++) {
            grid[wideRowOffset + dx] = 0;
          }
        }
      }
    }
  }
  
  // Entrance and exit
  for (let i = 0; i < 3; i++) {
    grid[(2 + i) * w] = 0;
    grid[(h - 3 - i) * w + w - 1] = 0;
  }
  
  return grid;
};