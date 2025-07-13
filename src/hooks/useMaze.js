import { useState, useMemo, useCallback, useEffect } from 'react';
import { generateMaze } from '../maze/MazeGenerator.js';

export const useMaze = () => {
  const [dimensions, setDimensions] = useState({ width: 91, height: 91 });
  const [cellSize, setCellSize] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate maze when dimensions change
  const maze = useMemo(() => {
    if (dimensions.width && dimensions.height) {
      return generateMaze(dimensions.width, dimensions.height);
    }
    return null;
  }, [dimensions]);

  // Adjust cell size based on maze dimensions
  useEffect(() => {
    const maxDim = Math.max(dimensions.width, dimensions.height);
    if (maxDim > 91) setCellSize(4);
    else if (maxDim > 71) setCellSize(5);
    else setCellSize(6);
  }, [dimensions]);

  const regenerateMaze = useCallback(() => {
    setIsGenerating(true);
    setDimensions(prev => ({ ...prev }));
    setTimeout(() => setIsGenerating(false), 50);
  }, []);

  return {
    maze,
    dimensions,
    setDimensions,
    cellSize,
    isGenerating,
    regenerateMaze
  };
};