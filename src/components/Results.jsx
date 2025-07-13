import React from 'react';

const Results = ({ algorithmResults, rrtMode }) => {
  if (!rrtMode || Object.keys(algorithmResults).length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-white p-4 rounded-lg shadow">
      <h4 className="font-semibold text-sm mb-3 text-center">Algorithm Comparison</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(algorithmResults).map(([key, result]) => (
          <div key={key} className="bg-gray-50 p-3 rounded border">
            <h5 className="font-medium text-sm text-center mb-2">{result.algorithm}</h5>
            {result.success ? (
              <div className="text-xs space-y-1">
                <div>✅ Success</div>
                <div>Path Length: {result.pathLength}</div>
                <div>Time: {result.executionTime}ms</div>
                <div>Nodes: {result.nodesExplored}</div>
                {result.mapCoverage && (
                  <div>Coverage: {Math.round(result.mapCoverage)}%</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-red-600">
                ❌ Failed {result.error && `(${result.error})`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;