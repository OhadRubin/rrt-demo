import { useState, useCallback } from 'react';
import { algorithms } from '../algorithms/index.js';

export const usePathfinding = (maze, dimensions) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('rrt');
  const [startPoint, setStartPoint] = useState(null);
  const [goalPoint, setGoalPoint] = useState(null);
  const [rrtTree, setRrtTree] = useState([]);
  const [rrtPath, setRrtPath] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStatus, setPlanningStatus] = useState('');
  const [algorithmResults, setAlgorithmResults] = useState({});
  const [animationSpeed, setAnimationSpeed] = useState(10);
  
  // Exploration state
  const [explorationMode, setExplorationMode] = useState(false);
  const [knownMap, setKnownMap] = useState(null);
  const [robotPosition, setRobotPosition] = useState(null);
  const [frontiers, setFrontiers] = useState([]);

  // RRT parameters
  const [rrtParams, setRrtParams] = useState({
    maxNodes: 3000,
    stepSize: 2.5,
    goalRadius: 3,
    goalBias: 0.1,
    rewireRadius: 5
  });

  // Plan path using selected algorithm
  const planPath = useCallback(async () => {
    if (!startPoint || !maze) return;
    if (!explorationMode && !goalPoint) return; // Goal needed for pathfinding, but not exploration
    
    const algorithm = algorithms[selectedAlgorithm];
    if (!algorithm || !algorithm.execute) {
      setPlanningStatus(`${algorithm?.name || selectedAlgorithm.toUpperCase()} algorithm not yet implemented`);
      return;
    }
    
    setIsPlanning(true);
    setRrtTree([]);
    setRrtPath(null);
    
    if (explorationMode) {
      setPlanningStatus('Exploring unknown environment...');
      setRobotPosition({ x: startPoint.x, y: startPoint.y });
      // Note: Initial known map creation moved to Frontier algorithm
    } else {
      setPlanningStatus('Planning path...');
    }
    
    // Calculate delay based on animation speed (0-20 maps to 50-0ms)
    const delay = Math.max(0, 50 - animationSpeed * 2.5);
    
    try {
      const startTime = performance.now();
      
      const result = await algorithm.execute(
        maze, 
        startPoint, 
        goalPoint,
        {
          width: dimensions.width,
          height: dimensions.height,
          delay,
          ...rrtParams
        },
        (nodes, goalReached, extraData) => {
          setRrtTree([...nodes]);
          
          if (explorationMode && extraData) {
            // Update exploration state
            if (extraData.frontiers) setFrontiers(extraData.frontiers);
            if (extraData.knownMap) setKnownMap(extraData.knownMap);
            if (extraData.robotPos) setRobotPosition(extraData.robotPos);
          }
          
          if (goalReached) {
            setPlanningStatus('Goal reached!');
          }
        }
      );
      
      const executionTime = performance.now() - startTime;
      
      // Calculate path length if path exists
      const pathLength = result.path ? 
        result.path.reduce((total, point, i) => {
          if (i === 0) return 0;
          const prev = result.path[i - 1];
          return total + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
        }, 0) : 0;
      
      // Store results for comparison
      const algorithmResult = {
        algorithm: algorithm.name,
        success: result.success,
        executionTime: Math.round(executionTime),
        pathLength: Math.round(pathLength * 10) / 10,
        nodesExplored: result.metrics.nodesExplored,
        timestamp: Date.now()
      };
      
      setAlgorithmResults(prev => ({
        ...prev,
        [selectedAlgorithm]: algorithmResult
      }));
      
      if (result.success) {
        setRrtPath(result.path);
        setPlanningStatus(`${algorithm.name}: Path found! Length: ${algorithmResult.pathLength}, Nodes: ${result.metrics.nodesExplored}, Time: ${algorithmResult.executionTime}ms`);
      } else {
        setPlanningStatus('Failed to find path');
      }
    } catch (error) {
      setPlanningStatus(`Error: ${error.message}`);
    }
    
    setIsPlanning(false);
  }, [startPoint, goalPoint, maze, dimensions, selectedAlgorithm, rrtParams, animationSpeed, explorationMode]);

  // Compare all algorithms
  const compareAlgorithms = useCallback(async () => {
    if (!startPoint || !goalPoint || !maze) return;
    
    const algorithmsToTest = ['rrt', 'rrt_star', 'a_star'];
    const results = {};
    
    setIsPlanning(true);
    setPlanningStatus('Comparing algorithms...');
    
    for (const algKey of algorithmsToTest) {
      const algorithm = algorithms[algKey];
      if (!algorithm.execute) continue;
      
      try {
        const startTime = performance.now();
        const result = await algorithm.execute(
          maze, 
          startPoint, 
          goalPoint,
          {
            width: dimensions.width,
            height: dimensions.height,
            delay: 1, // Fast comparison
            ...rrtParams
          },
          () => {} // No progress callback for comparison
        );
        const executionTime = performance.now() - startTime;
        
        const pathLength = result.path ? 
          result.path.reduce((total, point, i) => {
            if (i === 0) return 0;
            const prev = result.path[i - 1];
            return total + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
          }, 0) : 0;
        
        results[algKey] = {
          algorithm: algorithm.name,
          success: result.success,
          executionTime: Math.round(executionTime),
          pathLength: Math.round(pathLength * 10) / 10,
          nodesExplored: result.metrics.nodesExplored
        };
      } catch (error) {
        results[algKey] = {
          algorithm: algorithm.name,
          success: false,
          error: error.message
        };
      }
    }
    
    setAlgorithmResults(results);
    setPlanningStatus('Comparison complete! Check results below.');
    setIsPlanning(false);
  }, [startPoint, goalPoint, maze, dimensions, rrtParams]);

  // Clear pathfinding state
  const clearPathfinding = useCallback(() => {
    setStartPoint(null);
    setGoalPoint(null);
    setRrtTree([]);
    setRrtPath(null);
    setAlgorithmResults({});
    setKnownMap(null);
    setRobotPosition(null);
    setFrontiers([]);
    setPlanningStatus(explorationMode ? 'Click to set robot start position' : 'Click to set start point');
  }, [explorationMode]);

  // Handle point setting from canvas clicks
  const setPoint = useCallback((x, y) => {
    // Check if clicked point is free
    const gridX = Math.floor(x);
    const gridY = Math.floor(y);
    
    if (gridX >= 0 && gridX < dimensions.width && 
        gridY >= 0 && gridY < dimensions.height &&
        maze[gridY * dimensions.width + gridX] === 0) {
      
      if (!startPoint) {
        setStartPoint({ x, y });
        if (explorationMode) {
          setPlanningStatus('Ready to start exploration');
        } else {
          setPlanningStatus('Click to set goal point');
        }
      } else if (!explorationMode && !goalPoint) {
        setGoalPoint({ x, y });
        setPlanningStatus('Ready to plan path');
      } else {
        // Reset and set new start
        setStartPoint({ x, y });
        setGoalPoint(null);
        setRrtTree([]);
        setRrtPath(null);
        setKnownMap(null);
        setRobotPosition(null);
        setFrontiers([]);
        if (explorationMode) {
          setPlanningStatus('Ready to start exploration');
        } else {
          setPlanningStatus('Click to set goal point');
        }
      }
    }
  }, [maze, dimensions, startPoint, goalPoint, explorationMode]);

  return {
    selectedAlgorithm,
    setSelectedAlgorithm,
    startPoint,
    goalPoint,
    rrtTree,
    rrtPath,
    isPlanning,
    planningStatus,
    setPlanningStatus,
    algorithmResults,
    animationSpeed,
    setAnimationSpeed,
    explorationMode,
    setExplorationMode,
    knownMap,
    robotPosition,
    frontiers,
    rrtParams,
    setRrtParams,
    planPath,
    compareAlgorithms,
    clearPathfinding,
    setPoint
  };
};