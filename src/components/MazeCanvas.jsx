import React, { useRef, useEffect, useCallback } from 'react';

const MazeCanvas = ({
  maze,
  dimensions,
  cellSize,
  rrtMode,
  explorationMode,
  knownMap,
  rrtTree,
  rrtPath,
  startPoint,
  goalPoint,
  showTree,
  selectedAlgorithm,
  frontiers,
  robotPosition,
  sensorPositions,
  rrtParams,
  onCanvasClick
}) => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  // Render maze
  const renderMaze = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maze) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    const { width, height } = dimensions;
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    // Use knownMap in exploration mode, full maze in pathfinding mode
    const displayMap = explorationMode && knownMap ? knownMap : maze;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellValue = displayMap[y * width + x];
        let color;
        
        if (explorationMode && knownMap) {
          // In exploration mode: 0 = open (white), 1 = wall (black), 2 = unknown (gray)
          if (cellValue === 0) color = 255;      // Open space - white
          else if (cellValue === 1) color = 0;   // Wall - black  
          else color = 128;                      // Unknown - gray
        } else {
          // In pathfinding mode: 0 = open (white), 1 = wall (black)
          color = cellValue === 1 ? 0 : 255;
        }
        
        for (let dy = 0; dy < cellSize; dy++) {
          for (let dx = 0; dx < cellSize; dx++) {
            const pixelIdx = ((y * cellSize + dy) * canvas.width + (x * cellSize + dx)) * 4;
            data[pixelIdx] = color;
            data[pixelIdx + 1] = color;
            data[pixelIdx + 2] = color;
            data[pixelIdx + 3] = 255;
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [maze, dimensions, cellSize, explorationMode, knownMap]);

  // Render RRT overlay
  const renderRRTOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw algorithm visualization
    if (showTree && rrtTree.length > 0) {
      if (selectedAlgorithm === 'a_star') {
        // Draw A* explored nodes as grid squares
        ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
        for (const node of rrtTree) {
          ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
        }
      } else {
        // Draw RRT tree connections
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (const node of rrtTree) {
          if (node.parent) {
            ctx.beginPath();
            ctx.moveTo(node.parent.x * cellSize, node.parent.y * cellSize);
            ctx.lineTo(node.x * cellSize, node.y * cellSize);
            ctx.stroke();
          }
        }
      }
    }
    
    // Draw frontiers (exploration mode)
    if (explorationMode && frontiers.length > 0) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.8)'; // Orange color for frontiers
      for (const frontier of frontiers) {
        ctx.beginPath();
        ctx.arc(frontier.x * cellSize, frontier.y * cellSize, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // Draw robot position (exploration mode)
    if (explorationMode && robotPosition) {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'; // Green color for robot
      ctx.beginPath();
      ctx.arc(robotPosition.x * cellSize, robotPosition.y * cellSize, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw sensor range circle
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(robotPosition.x * cellSize, robotPosition.y * cellSize, 3 * cellSize, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Draw sensor positions (what the robot can see)
    if (explorationMode && sensorPositions && sensorPositions.length > 0) {
      ctx.fillStyle = 'rgba(0, 255, 255, 0.6)'; // Cyan color for sensor coverage
      for (const [x, y] of sensorPositions) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
    
    // Draw path
    if (rrtPath) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rrtPath[0].x * cellSize, rrtPath[0].y * cellSize);
      
      for (let i = 1; i < rrtPath.length; i++) {
        ctx.lineTo(rrtPath[i].x * cellSize, rrtPath[i].y * cellSize);
      }
      ctx.stroke();
    }
    
    // Draw start point
    if (startPoint) {
      ctx.fillStyle = 'lime';
      ctx.beginPath();
      ctx.arc(startPoint.x * cellSize, startPoint.y * cellSize, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw goal point
    if (goalPoint) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(goalPoint.x * cellSize, goalPoint.y * cellSize, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw goal radius
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(goalPoint.x * cellSize, goalPoint.y * cellSize, rrtParams.goalRadius * cellSize, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }, [dimensions, cellSize, rrtTree, rrtPath, startPoint, goalPoint, showTree, rrtParams.goalRadius, selectedAlgorithm, explorationMode, frontiers, robotPosition, sensorPositions]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event) => {
    if (!rrtMode || !overlayCanvasRef.current) return;
    
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / cellSize;
    const y = (event.clientY - rect.top) / cellSize;
    
    onCanvasClick(x, y);
  }, [rrtMode, cellSize, onCanvasClick]);

  // Effects
  useEffect(() => {
    renderMaze();
  }, [renderMaze]);

  useEffect(() => {
    renderRRTOverlay();
  }, [renderRRTOverlay]);

  return (
    <div className="relative flex justify-center bg-white p-4 rounded-lg shadow">
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          className="border-2 border-black"
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            imageRendering: 'pixelated'
          }}
        />
        <canvas
          ref={overlayCanvasRef}
          onClick={handleCanvasClick}
          className="absolute top-0 left-0 cursor-crosshair"
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            pointerEvents: rrtMode ? 'auto' : 'none'
          }}
        />
      </div>
    </div>
  );
};

export default MazeCanvas;