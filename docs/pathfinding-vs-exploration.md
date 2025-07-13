# Pathfinding vs Exploration Algorithms

This document explains the fundamental differences between **pathfinding** and **exploration** algorithms, and how they're implemented in this maze application.

## Core Concepts

### Pathfinding Algorithms
**Purpose**: Find optimal routes in **known environments**
- **Input**: Complete map + start point + goal point
- **Output**: Optimal path between two specific points
- **Goal**: Minimize path cost (distance, time, etc.)
- **Knowledge**: Full environment knowledge required

### Exploration Algorithms  
**Purpose**: Map and discover **unknown environments**
- **Input**: Partial/no map + robot position + sensors
- **Output**: Complete map of explorable area
- **Goal**: Maximize information gain and coverage
- **Knowledge**: Builds knowledge incrementally

---

## Algorithm Comparison

| Aspect | Pathfinding | Exploration |
|--------|-------------|-------------|
| **Environment** | Fully known | Unknown/partially known |
| **Objective** | Reach specific goal | Discover entire space |
| **Planning** | One-time optimal plan | Continuous replanning |
| **Success Metric** | Shortest path found | Complete coverage achieved |
| **Examples** | GPS navigation, game AI | Robot mapping, search & rescue |

---

## Algorithms in This Application

### 1. Pathfinding Algorithms (`type: 'pathfinding'`)

#### **A* (AStar.js)**
```javascript
// Traditional A* for known mazes
export const createAStarAlgorithm = () => ({
  name: 'A*',
  type: 'pathfinding',
  async execute(maze, startPoint, goalPoint, options, onProgress) {
    // Works on complete known maze
    // Finds optimal path using f = g + h heuristic
    // Guarantees shortest path
  }
});
```

**How it works:**
1. Start with complete maze knowledge
2. Use f(n) = g(n) + h(n) scoring
   - g(n) = actual cost from start
   - h(n) = heuristic estimate to goal
3. Explore most promising nodes first
4. Terminates when goal reached

**Use case**: "I know the entire maze, get me from Point A to Point B optimally"

#### **RRT/RRT* (RRT.js)**
```javascript
// Rapidly-exploring Random Trees
export const createRRTAlgorithm = (useRRTStar = false) => ({
  name: useRRTStar ? 'RRT*' : 'RRT',
  type: 'pathfinding',
  // Builds random tree toward goal
  // RRT* optimizes for path quality
});
```

**How it works:**
1. Incrementally build tree of random samples
2. Connect samples if collision-free
3. Bias growth toward goal
4. RRT* version rewires for optimality

**Use case**: High-dimensional spaces, complex constraints

### 2. Exploration Algorithms (`type: 'exploration'`)

#### **Frontier-Based Exploration (Frontier.js)**
```javascript
// Wavefront Frontier Detection (WFD)
export const createFrontierAlgorithm = () => ({
  name: 'Frontier-Based',
  type: 'exploration',
  async execute(fullMaze, robotPos, _goalPoint, options, onProgress) {
    // Discovers unknown environment incrementally
    // No goal point needed - explores everything
  }
});
```

**How it works:**
1. Start with sensor data around robot
2. Detect frontiers (boundaries between known/unknown)
3. Move toward nearest frontier
4. Update map with new sensor data
5. Repeat until no frontiers remain

**Use case**: "I don't know the maze, help me map it completely"

---

## A* for Exploration vs Pathfinding

### Traditional A* (Our Implementation)
```javascript
// Known environment pathfinding
function traditionalAStar(knownMaze, start, goal) {
  // One-time planning with complete information
  return findOptimalPath(knownMaze, start, goal);
}
```

### A*-Based Exploration (Not implemented)
```javascript
// Unknown environment exploration
function astarExploration(partialMap, robotPos, sensorRange) {
  while (hasUnexploredAreas(partialMap)) {
    // 1. Detect frontiers
    const frontiers = detectFrontiers(partialMap);
    
    // 2. Use A* to plan path to selected frontier
    const target = selectBestFrontier(frontiers);
    const path = astar(partialMap, robotPos, target);
    
    // 3. Execute path and update map
    for (const waypoint of path) {
      robotPos = waypoint;
      updateMapWithSensors(partialMap, robotPos, sensorRange);
      
      // 4. Replan if new obstacles discovered
      if (pathInvalid(path, partialMap)) break;
    }
  }
}
```

**Key differences:**
- **Traditional A***: Complete map, single plan, optimal path
- **Exploration A***: Partial map, continuous replanning, information-seeking

---

## When to Use Each Approach

### Use Pathfinding When:
- ✅ Environment is fully known
- ✅ Have specific start and goal points  
- ✅ Want optimal/efficient routes
- ✅ Examples: GPS navigation, game AI, logistics

### Use Exploration When:
- ✅ Environment is unknown or changing
- ✅ Need to map/discover the space
- ✅ Want complete coverage
- ✅ Examples: Search & rescue, space exploration, cleaning robots

---

## Implementation in UI

### Pathfinding Mode
```javascript
// User clicks: Start Point → Goal Point → Plan Path
// Algorithm finds optimal route through known maze
<option value="rrt">RRT (fast, probabilistic)</option>
<option value="rrt_star">RRT* (optimal, slower)</option>
<option value="a_star">A* (optimal, grid-based)</option>
```

### Exploration Mode
```javascript
// User clicks: Start Point → Start Exploration  
// Algorithm maps unknown environment
<option value="frontier">Frontier-Based Exploration</option>
```

---

## Real-World Examples

### Pathfinding Applications
- **GPS Navigation**: Known road networks, find fastest route
- **Game AI**: Known game maps, move characters optimally
- **Robot Navigation**: Known warehouse, deliver packages efficiently

### Exploration Applications  
- **Mars Rovers**: Unknown terrain, map surface features
- **Search & Rescue**: Unknown disaster areas, find survivors
- **Autonomous Vehicles**: Unknown parking lots, find spaces
- **Cleaning Robots**: Unknown room layouts, ensure complete coverage

---

## Code Architecture

Our refactored architecture cleanly separates these concerns:

```
src/algorithms/
├── AStar.js     # Pathfinding in known environments
├── RRT.js       # Pathfinding with sampling
├── Frontier.js  # Exploration of unknown environments
└── index.js     # Algorithm registry
```

Each algorithm implements a common interface:
```javascript
{
  name: string,
  type: 'pathfinding' | 'exploration',
  execute: async function(maze, start, goal, options, onProgress)
}
```

This allows the UI to treat them uniformly while maintaining their distinct purposes.

---

## Further Reading

- **A* Algorithm**: Hart, P. E.; Nilsson, N. J.; Raphael, B. (1968)
- **RRT**: LaValle, S. M. (1998) 
- **Frontier-Based Exploration**: Yamauchi, B. (1997)
- **SLAM**: Simultaneous Localization and Mapping surveys