import { createRRTAlgorithm } from './RRT.js';
import { createAStarAlgorithm } from './AStar.js';
import { createFrontierAlgorithm } from './Frontier.js';

// Export modular components for reuse in other algorithms
export { WavefrontFrontierDetection } from './WavefrontFrontierDetection.js';
export { SensorManager, DirectionalConeSensor, LaserSensor, SonarSensorArray } from './SensorManager.js';
export { PathPlanner } from './PathPlanner.js';

// Algorithm Registry
export const algorithms = {
  rrt: createRRTAlgorithm(false),
  rrt_star: createRRTAlgorithm(true),
  a_star: createAStarAlgorithm(),
  frontier: createFrontierAlgorithm()
};