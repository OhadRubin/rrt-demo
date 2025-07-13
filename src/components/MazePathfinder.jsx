import React, { useEffect } from 'react';
import { useMaze } from '../hooks/useMaze.js';
import { usePathfinding } from '../hooks/usePathfinding.js';
import { algorithms } from '../algorithms/index.js';
import MazeCanvas from './MazeCanvas.jsx';
import Controls from './Controls.jsx';
import Results from './Results.jsx';

const MazePathfinder = () => {
  const {
    maze,
    dimensions,
    setDimensions,
    cellSize,
    isGenerating,
    regenerateMaze
  } = useMaze();

  const {
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
  } = usePathfinding(maze, dimensions);

  const [rrtMode, setRrtMode] = React.useState(false);
  const [showTree, setShowTree] = React.useState(true);

  // Update planning status based on current state
  useEffect(() => {
    if (rrtMode && !startPoint) {
      setPlanningStatus(explorationMode ? 'Click to set robot start position' : 'Click to set start point');
    } else if (rrtMode && startPoint && !explorationMode && !goalPoint) {
      setPlanningStatus('Click to set goal point');
    } else if (rrtMode && startPoint && explorationMode) {
      setPlanningStatus('Ready to start exploration');
    } else if (rrtMode && startPoint && goalPoint && !explorationMode) {
      setPlanningStatus('Ready to plan path');
    }
  }, [rrtMode, startPoint, goalPoint, explorationMode, setPlanningStatus]);

  const handleModeToggle = () => {
    setRrtMode(!rrtMode);
    if (!rrtMode) {
      clearPathfinding();
      // Initialize exploration mode if frontier algorithm is selected
      if (selectedAlgorithm === 'frontier') {
        setExplorationMode(true);
      }
    } else {
      setExplorationMode(false);
    }
  };

  const handleAlgorithmChange = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    const isExploration = algorithms[algorithm]?.type === 'exploration';
    setExplorationMode(isExploration);
    clearPathfinding();
  };

  const handleCanvasClick = (x, y) => {
    if (!rrtMode) return;
    setPoint(x, y);
  };

  const handleMazeRegenerate = () => {
    regenerateMaze();
    clearPathfinding();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Maze Generator with Multiple Pathfinding Algorithms
        </h1>
        
        <Controls
          dimensions={dimensions}
          setDimensions={setDimensions}
          isGenerating={isGenerating}
          onRegenerate={handleMazeRegenerate}
          rrtMode={rrtMode}
          onModeToggle={handleModeToggle}
          explorationMode={explorationMode}
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmChange={handleAlgorithmChange}
          showTree={showTree}
          setShowTree={setShowTree}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          startPoint={startPoint}
          goalPoint={goalPoint}
          isPlanning={isPlanning}
          onPlanPath={planPath}
          onCompareAlgorithms={compareAlgorithms}
          onClear={clearPathfinding}
          planningStatus={planningStatus}
          rrtParams={rrtParams}
          setRrtParams={setRrtParams}
        />
        
        <MazeCanvas
          maze={maze}
          dimensions={dimensions}
          cellSize={cellSize}
          rrtMode={rrtMode}
          explorationMode={explorationMode}
          knownMap={knownMap}
          rrtTree={rrtTree}
          rrtPath={rrtPath}
          startPoint={startPoint}
          goalPoint={goalPoint}
          showTree={showTree}
          selectedAlgorithm={selectedAlgorithm}
          frontiers={frontiers}
          robotPosition={robotPosition}
          rrtParams={rrtParams}
          onCanvasClick={handleCanvasClick}
        />
        
        <Results algorithmResults={algorithmResults} rrtMode={rrtMode} />
        
        <div className="mt-6 text-center text-gray-600 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <p className="text-sm mb-2">
            1. Generate a maze using the controls above
          </p>
          <p className="text-sm mb-2">
            2. Enable Pathfinding Mode and select an algorithm from the dropdown
          </p>
          <p className="text-sm mb-2">
            3. Click on the maze to set start (green) and goal (red) points
          </p>
          <p className="text-sm mb-2">
            4. Click "Plan Path" to find a path using the selected algorithm
          </p>
          <p className="text-sm">
            5. Compare algorithms: RRT (fast, random), RRT* (optimal, slower), A* (optimal, grid-based), Frontier-based (exploration)
          </p>
        </div>
      </div>
    </div>
  );
};

export default MazePathfinder;