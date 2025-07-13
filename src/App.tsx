import { useState } from 'react';
import './App.css';
import MazePathfinder from './components/MazePathfinder';
import FrontierExploration from './frontier-exploration';

function App() {
  const [activeComponent, setActiveComponent] = useState('maze');

  const toggleComponent = () => {
    setActiveComponent(prev => prev === 'maze' ? 'frontier' : 'maze');
  };

  return (
    <div>
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={toggleComponent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Switch to {activeComponent === 'maze' ? 'Frontier Exploration' : 'Maze Pathfinder'}
        </button>
      </div>
      {activeComponent === 'maze' ? <MazePathfinder /> : <FrontierExploration />}
    </div>
  );
}

export default App;
