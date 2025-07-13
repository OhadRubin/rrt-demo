import { createRRTAlgorithm } from './RRT.js';
import { createAStarAlgorithm } from './AStar.js';
import { createFrontierAlgorithm } from './Frontier.js';

// Algorithm Registry
export const algorithms = {
  rrt: createRRTAlgorithm(false),
  rrt_star: createRRTAlgorithm(true),
  a_star: createAStarAlgorithm(),
  frontier: createFrontierAlgorithm()
};