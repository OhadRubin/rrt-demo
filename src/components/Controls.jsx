import React from 'react';

const Controls = ({
  dimensions,
  setDimensions,
  isGenerating,
  onRegenerate,
  rrtMode,
  onModeToggle,
  explorationMode,
  selectedAlgorithm,
  onAlgorithmChange,
  showTree,
  setShowTree,
  animationSpeed,
  setAnimationSpeed,
  startPoint,
  goalPoint,
  isPlanning,
  onPlanPath,
  onCompareAlgorithms,
  onClear,
  planningStatus,
  rrtParams,
  setRrtParams,
  frontierParams,
  setFrontierParams
}) => {
  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow">
      {/* Maze Controls */}
      <div className="flex flex-wrap gap-4 justify-center items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Width:</label>
          <select 
            value={dimensions.width} 
            onChange={(e) => setDimensions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
            className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={51}>51</option>
            <option value={71}>71</option>
            <option value={91}>91</option>
            <option value={111}>111</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Height:</label>
          <select 
            value={dimensions.height} 
            onChange={(e) => setDimensions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
            className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={51}>51</option>
            <option value={71}>71</option>
            <option value={91}>91</option>
            <option value={111}>111</option>
          </select>
        </div>
        
        <button 
          onClick={onRegenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isGenerating ? 'Generating...' : 'Generate New Maze'}
        </button>
      </div>
      
      {/* Algorithm Controls */}
      <div className="border-t pt-4">
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <button
            onClick={onModeToggle}
            className={`px-4 py-2 rounded transition-colors ${
              rrtMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {rrtMode ? (explorationMode ? 'Exploration Mode: ON' : 'Pathfinding Mode: ON') : 'Algorithm Mode: OFF'}
          </button>
          
          {rrtMode && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Algorithm:</label>
              <select 
                value={selectedAlgorithm} 
                onChange={(e) => onAlgorithmChange(e.target.value)}
                className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rrt">RRT (Rapidly-exploring Random Tree)</option>
                <option value="rrt_star">RRT* (Optimal RRT)</option>
                <option value="a_star">A* (Grid-based Optimal)</option>
                <option value="frontier">Frontier-Based Exploration</option>
              </select>
            </div>
          )}
          
          {rrtMode && (selectedAlgorithm === 'rrt' || selectedAlgorithm === 'rrt_star') && (
            <>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showTree}
                  onChange={(e) => setShowTree(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Show Tree</span>
              </label>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Speed:</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="w-20"
                />
              </div>
            </>
          )}
          
          {rrtMode && (
            <>
              <button
                onClick={onPlanPath}
                disabled={!startPoint || (!explorationMode && !goalPoint) || isPlanning}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-purple-400"
              >
                {isPlanning ? (explorationMode ? 'Exploring...' : 'Planning...') : (explorationMode ? 'Start Exploration' : 'Plan Path')}
              </button>
              
              {!explorationMode && (
                <button
                  onClick={onCompareAlgorithms}
                  disabled={!startPoint || !goalPoint || isPlanning}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:bg-orange-400"
                >
                  {isPlanning ? 'Comparing...' : 'Compare All'}
                </button>
              )}
              
              <button
                onClick={onClear}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
        
        {rrtMode && (
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-gray-700">{planningStatus}</p>
          </div>
        )}
        
        {/* RRT Parameters (collapsible) */}
        {rrtMode && (selectedAlgorithm === 'rrt' || selectedAlgorithm === 'rrt_star') && (
          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-sm">Advanced RRT Parameters</summary>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs font-medium">Max Nodes</label>
                <input
                  type="number"
                  value={rrtParams.maxNodes}
                  onChange={(e) => setRrtParams(prev => ({ ...prev, maxNodes: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Step Size</label>
                <input
                  type="number"
                  step="0.5"
                  value={rrtParams.stepSize}
                  onChange={(e) => setRrtParams(prev => ({ ...prev, stepSize: parseFloat(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Goal Radius</label>
                <input
                  type="number"
                  step="0.5"
                  value={rrtParams.goalRadius}
                  onChange={(e) => setRrtParams(prev => ({ ...prev, goalRadius: parseFloat(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Goal Bias</label>
                <input
                  type="number"
                  step="0.05"
                  value={rrtParams.goalBias}
                  onChange={(e) => setRrtParams(prev => ({ ...prev, goalBias: parseFloat(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Rewire Radius</label>
                <input
                  type="number"
                  step="0.5"
                  value={rrtParams.rewireRadius}
                  onChange={(e) => setRrtParams(prev => ({ ...prev, rewireRadius: parseFloat(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
          </details>
        )}

        {/* Frontier Parameters (collapsible) */}
        {explorationMode && selectedAlgorithm === 'frontier' && (
          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-sm">Advanced Frontier Parameters</summary>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs font-medium">Sensor Range</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={frontierParams.sensorRange}
                  onChange={(e) => setFrontierParams(prev => ({ ...prev, sensorRange: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Step Size</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5"
                  value={frontierParams.stepSize}
                  onChange={(e) => setFrontierParams(prev => ({ ...prev, stepSize: parseFloat(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Max Iterations</label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  value={frontierParams.maxIterations}
                  onChange={(e) => setFrontierParams(prev => ({ ...prev, maxIterations: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Waypoint Tolerance</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1"
                  value={frontierParams.waypointTolerance}
                  onChange={(e) => setFrontierParams(prev => ({ ...prev, waypointTolerance: parseFloat(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Coverage Threshold (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={frontierParams.explorationThreshold}
                  onChange={(e) => setFrontierParams(prev => ({ ...prev, explorationThreshold: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Pathfinding Timeout</label>
                <input
                  type="number"
                  min="100"
                  max="5000"
                  value={frontierParams.pathfindingTimeout}
                  onChange={(e) => setFrontierParams(prev => ({ ...prev, pathfindingTimeout: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default Controls;