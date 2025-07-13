src
├── App.css
├── App.test.tsx
├── App.tsx
├── algorithms
│   ├── AStar.js
│   ├── Frontier.js
│   ├── PathPlanner.js
│   ├── RRT.js
│   ├── SensorManager.js
│   ├── WavefrontFrontierDetection.js
│   └── index.js
├── components
│   ├── Controls.jsx
│   ├── MazeCanvas.jsx
│   ├── MazePathfinder.jsx
│   └── Results.jsx
├── frontier-exploration.jsx
├── hooks
│   ├── useMaze.js
│   └── usePathfinding.js
├── index.css
├── index.tsx
├── logo.svg
├── maze
│   ├── CollisionChecker.js
│   └── MazeGenerator.js
├── react-app-env.d.ts
├── setupTests.ts
└── utils
    └── helpers.js

6 directories, 25 files


🔍 Found 17 .js, .jsx files (git-tracked)

📁 AStar.js
----------------------------------------

📁 Frontier.js
----------------------------------------
⚙️ def detectFrontiers (22-50)
⚙️ def getSensorPositions (55-61)
⚙️ def createInitialKnownMap (63-75)
⚙️ def updateKnownMap (77-84)
⚙️ def calculateCoverage (86-100)
⚙️ def findPathBFS (104-107)
⚙️ def detectCurrentFrontiers (136-155)

📁 PathPlanner.js
----------------------------------------
🏛️ class PathPlanner (4-287)
  🔧 def findPathBFS (11-16)
  🔧 def visited.add (30-35)
  🔧 def queue.push (50-55)
  🔧 def findPathAStar (63-68)
  🔧 def !this.isValidMove (125-130)
  🔧 def findPathDijkstra (147-152)
  🔧 def !this.isValidMove (214-219)
  🔧 def isValidTarget (230-235)
  🔧 def isValidStart (235-240)
  🔧 def isValidMove (240-245)
  🔧 def heuristic (252-257)
  🔧 def reconstructPath (256-261)
  🔧 def path.unshift (261-266)
  🔧 def path.unshift (267-272)
  🔧 def reconstructDijkstraPath (272-277)
  🔧 def path.unshift (277-282)
  🔧 def path.unshift (283-288)
🏛️ class PathPlanner (4-287)
  🔧 def findPathBFS (11-16)
  🔧 def visited.add (30-35)
  🔧 def queue.push (50-55)
  🔧 def findPathAStar (63-68)
  🔧 def !this.isValidMove (125-130)
  🔧 def findPathDijkstra (147-152)
  🔧 def !this.isValidMove (214-219)
  🔧 def isValidTarget (230-235)
  🔧 def isValidStart (235-240)
  🔧 def isValidMove (240-245)
  🔧 def heuristic (252-257)
  🔧 def reconstructPath (256-261)
  🔧 def path.unshift (261-266)
  🔧 def path.unshift (267-272)
  🔧 def reconstructDijkstraPath (272-277)
  🔧 def path.unshift (277-282)
  🔧 def path.unshift (283-288)

📁 RRT.js
----------------------------------------
🏛️ class RRTNode (4-28)
  🔧 def distanceTo (13-18)
  🔧 def getPathToRoot (19-24)
  🔧 def path.unshift (23-28)
🏛️ class RRTPlanner (31-219)
  🔧 def buildRRT (54-59)
  🔧 def findNearestNode (89-94)
  🔧 def steer (107-112)
  🔧 def extend (123-128)
  🔧 def findNearbyNodes (152-157)
  🔧 def chooseParent (158-163)
  🔧 def rewire (175-180)
  🔧 def this.collisionChecker.isPathCollisionFree (179-184)
  🔧 def isGoalReached (186-191)
  🔧 def node.distanceTo (187-192)
  🔧 def extractPath (190-195)
  🔧 def smoothPath (195-200)

📁 SensorManager.js
----------------------------------------
🏛️ class SensorManager (4-83)
  🔧 def addSensor (12-17)
  🔧 def getAllSensorPositions (17-22)
  🔧 def allPositions.add (23-28)
  🔧 def positions.forEach (28-33)
  🔧 def Array.from (32-37)
  🔧 def updateMapWithSensors (39-44)
  🔧 def hasLineOfSight (58-63)
🏛️ class DirectionalConeSensor (86-149)
  🔧 def getSensorPositions (92-97)
🏛️ class LaserSensor (152-180)
  🔧 def getSensorPositions (158-163)
🏛️ class SonarSensorArray (183-214)
  🔧 def getSensorPositions (190-195)
🏛️ class SensorManager (4-83)
  🔧 def addSensor (12-17)
  🔧 def getAllSensorPositions (17-22)
  🔧 def allPositions.add (23-28)
  🔧 def positions.forEach (28-33)
  🔧 def Array.from (32-37)
  🔧 def updateMapWithSensors (39-44)
  🔧 def hasLineOfSight (58-63)
🏛️ class DirectionalConeSensor (86-149)
  🔧 def getSensorPositions (92-97)
🏛️ class LaserSensor (152-180)
  🔧 def getSensorPositions (158-163)
🏛️ class SonarSensorArray (183-214)
  🔧 def getSensorPositions (190-195)

📁 WavefrontFrontierDetection.js
----------------------------------------
🏛️ class WavefrontFrontierDetection (4-179)
  🔧 def detectFrontiers (11-16)
  🔧 def frontierGroups.map (17-22)
  🔧 def findFrontierPoints (26-31)
  🔧 def mapOpenList.push (36-41)
  🔧 def frontierPoints.push (51-56)
  🔧 def !mapOpenList.some (62-67)
  🔧 def isFrontierPoint (72-77)
  🔧 def neighbors.some (74-79)
  🔧 def groupFrontierPoints (81-86)
  🔧 def bfsGroupFrontier (99-104)
  🔧 def calculateCentroid (134-139)
  🔧 def calculateMedian (147-152)
  🔧 def getNeighbors (164-169)
  🔧 def neighbors.push (173-178)
🏛️ class WavefrontFrontierDetection (4-179)
  🔧 def detectFrontiers (11-16)
  🔧 def frontierGroups.map (17-22)
  🔧 def findFrontierPoints (26-31)
  🔧 def mapOpenList.push (36-41)
  🔧 def frontierPoints.push (51-56)
  🔧 def !mapOpenList.some (62-67)
  🔧 def isFrontierPoint (72-77)
  🔧 def neighbors.some (74-79)
  🔧 def groupFrontierPoints (81-86)
  🔧 def bfsGroupFrontier (99-104)
  🔧 def calculateCentroid (134-139)
  🔧 def calculateMedian (147-152)
  🔧 def getNeighbors (164-169)
  🔧 def neighbors.push (173-178)

📁 index.js
----------------------------------------

📁 Controls.jsx
----------------------------------------
⚙️ def Controls (3-299)

📁 MazeCanvas.jsx
----------------------------------------
⚙️ def MazeCanvas (3-223)

📁 MazePathfinder.jsx
----------------------------------------
⚙️ def MazePathfinder (9-171)
⚙️ def handleModeToggle (64-75)
⚙️ def handleAlgorithmChange (77-82)
⚙️ def handleCanvasClick (84-87)
⚙️ def handleMazeRegenerate (89-92)
⚙️ def MazePathfinder (9-171)
⚙️ def handleModeToggle (64-75)
⚙️ def handleMazeRegenerate (89-92)

📁 Results.jsx
----------------------------------------
⚙️ def Results (3-35)

📁 frontier-exploration.jsx
----------------------------------------
⚙️ def FrontierExploration (378-589)
⚙️ def createInitialGrid (382-400)
⚙️ def handleStart (428-432)
⚙️ def handlePause (434-436)
⚙️ def handleReset (438-444)
⚙️ def handleStep (446-454)
⚙️ def FrontierExploration (378-589)
⚙️ def createInitialGrid (382-400)
⚙️ def handleStart (428-432)
⚙️ def handlePause (434-436)
⚙️ def handleReset (438-444)
⚙️ def handleStep (446-454)
🏛️ class AStar (48-133)
  🔧 def heuristic (55-60)
  🔧 def getNeighbors (59-64)
  🔧 def neighbors.push (69-74)
  🔧 def findPath (76-81)
  🔧 def gScore.set (82-87)
  🔧 def fScore.set (83-88)
  🔧 def cameFrom.get (107-112)
🏛️ class FrontierDetector (136-191)
  🔧 def detectFrontiers (143-148)
  🔧 def frontiers.push (166-171)
  🔧 def findClosestFrontier (175-180)
🏛️ class ExplorationManager (194-376)
  🔧 def exploreAround (213-218)
  🔧 def reset (274-279)
  🔧 def getVisualizationGrid (289-294)
  🔧 def getRobotDirectionSymbol (315-320)
  🔧 def executeStep (319-324)

📁 useMaze.js
----------------------------------------
⚙️ def useMaze (4-39)
⚙️ def useMaze (4-39)

📁 usePathfinding.js
----------------------------------------
⚙️ def findRandomPoints (5-58)
⚙️ def usePathfinding (60-351)

📁 CollisionChecker.js
----------------------------------------
🏛️ class MazeCollisionChecker (2-49)
  🔧 def isPointInObstacle (9-14)
  🔧 def isPathCollisionFree (18-23)
  🔧 def getRandomFreePoint (35-40)
  🔧 def isWithinBounds (46-51)
🏛️ class MazeCollisionChecker (2-49)
  🔧 def isPointInObstacle (9-14)
  🔧 def isPathCollisionFree (18-23)
  🔧 def getRandomFreePoint (35-40)
  🔧 def isWithinBounds (46-51)

📁 MazeGenerator.js
----------------------------------------
⚙️ def generateMaze (2-146)
⚙️ def carve3x3 (6-15)
⚙️ def carveConnection (17-43)
⚙️ def shuffle (57-63)

📁 helpers.js
----------------------------------------
⚙️ def calculatePathLength (3-11)
⚙️ def isPointInMaze (13-20)
⚙️ def formatTime (22-27)
⚙️ def formatDistance (29-31)

## Project Overview

This is a React-based educational application that demonstrates multiple pathfinding and exploration algorithms. The application generates mazes, performs autonomous exploration using frontier-based algorithms, and compares various pathfinding techniques including RRT, RRT*, A*, and frontier-based exploration. It features two main modes: traditional pathfinding visualization and autonomous robot exploration simulation.

## Directory Structure

```
src/
├── algorithms/          # Core pathfinding and exploration algorithms
├── components/          # React UI components  
├── hooks/              # Custom React hooks for state and logic
├── maze/               # Maze generation and collision detection
└── utils/              # Utility functions and helpers
```

## File Descriptions

### `src/algorithms/`

#### `Frontier.js`
**Purpose:** Implements the core Frontier-Based Exploration algorithm with modular sensor and pathfinding systems.

**Key Features:**
- `createFrontierAlgorithm()` - Main frontier-based exploration implementation that:
  1. Uses modular sensor systems for environment perception
  2. Detects frontier points (boundaries between known and unknown areas)
  3. Plans paths to frontiers using configurable pathfinding algorithms
  4. Supports multiple sensor types and pathfinding strategies
- Modular sensor integration with SensorManager and PathPlanner
- Support for Wavefront Frontier Detection (WFD) research paper algorithm
- Configurable exploration parameters and real-time progress callbacks
- Line-of-sight calculations for realistic sensor simulation

**Exports:** `createFrontierAlgorithm()`, `getSensorPositions()`, `findPathBFS()`

#### `AStar.js`
**Purpose:** Standard A* pathfinding algorithm implementation for grid-based environments.

**Key Features:**
- `createAStarAlgorithm()` - Grid-based A* pathfinding with visualization support
- Manhattan distance heuristic for grid environments
- Path reconstruction and progress callbacks for animation
- Optimized for maze environments with wall obstacles
- Node exploration tracking for visualization purposes

**Exports:** `createAStarAlgorithm()`

#### `PathPlanner.js`
**Purpose:** Modular pathfinding system supporting multiple algorithms (BFS, A*, Dijkstra) for exploration use.

**Key Features:**
- `PathPlanner` class - Unified interface for multiple pathfinding algorithms
- `findPathBFS()` - Breadth-first search for shortest paths
- `findPathAStar()` - A* with configurable heuristic weighting
- `findPathDijkstra()` - Dijkstra's algorithm for guaranteed shortest paths
- Validation and error handling for invalid start/goal positions
- Path reconstruction utilities for all algorithms

**Exports:** `PathPlanner` class with multiple pathfinding methods

#### `SensorManager.js`
**Purpose:** Modular sensor system for robot perception and environment mapping.

**Key Features:**
- `SensorManager` class - Manages multiple sensor types and sensor fusion
- `DirectionalConeSensor` - Cone-shaped sensor simulation for directional robots
- `LaserSensor` - 360-degree laser scanner simulation
- `SonarSensorArray` - Multi-sensor sonar array simulation
- Line-of-sight calculations using Bresenham's algorithm
- Configurable sensor parameters (range, resolution, angle)

**Exports:** Sensor manager and multiple sensor implementations

#### `WavefrontFrontierDetection.js`
**Purpose:** Research paper implementation of Wavefront Frontier Detection algorithm.

**Key Features:**
- `WavefrontFrontierDetection` class - Implements WFD research paper algorithm
- Frontier point detection using map-open-list and map-close-list approach
- Frontier grouping using BFS for connected frontier regions
- Centroid and median calculation for frontier target selection
- More sophisticated frontier detection than basic edge detection

**Exports:** `WavefrontFrontierDetection` class

#### `RRT.js`
**Purpose:** Rapidly-exploring Random Tree (RRT and RRT*) algorithms for pathfinding.

**Key Features:**
- `RRTPlanner` class - Implements both RRT and RRT* algorithms
- Goal biasing and adaptive step sizing
- RRT* optimizations with rewiring for path improvement
- Path smoothing for more natural trajectories
- Collision checking integration with maze environments
- Configurable parameters (max nodes, step size, goal radius)

**Exports:** `createRRTAlgorithm()` for both RRT and RRT*

#### `index.js`
**Purpose:** Central algorithm registry and modular component exports.

**Key Features:**
- Algorithm registry mapping names to implementations
- Exports all modular components for reuse
- Unified interface for algorithm selection and execution

**Exports:** All algorithms and modular components

### `src/components/`

#### `MazeCanvas.jsx`
**Purpose:** High-performance canvas rendering component for maze visualization and algorithm animation.

**Key Features:**
- Dual-canvas rendering (base maze + algorithm overlay)
- ImageData-based maze rendering for performance
- Real-time algorithm visualization (RRT trees, A* exploration, frontiers)
- Robot position and sensor coverage visualization
- Interactive canvas for point selection and path planning
- Supports both pathfinding and exploration visualization modes

**Props:** Maze data, algorithm state, visualization settings, interaction handlers

#### `MazePathfinder.jsx`
**Purpose:** Main orchestration component that coordinates all pathfinding and exploration functionality.

**Key Features:**
- Integration of all custom hooks for state management
- Mode switching between pathfinding and exploration
- Algorithm selection and parameter configuration
- Status management and user feedback
- Coordinates canvas rendering, controls, and results display

**Dependencies:** All hooks, canvas, controls, and results components

#### `Controls.jsx`
**Purpose:** Comprehensive control panel for maze generation, algorithm selection, and parameter tuning.

**Key Features:**
- Maze generation controls (size, regeneration)
- Algorithm selection and mode switching
- Advanced parameter controls for RRT and Frontier algorithms
- Real-time status display and user guidance
- Collapsible sections for advanced parameters
- Animation speed and visualization controls

**Props:** All state and control handlers from parent component

#### `Results.jsx`
**Purpose:** Algorithm comparison and performance metrics display.

**Key Features:**
- Side-by-side algorithm performance comparison
- Execution time, path length, and node exploration metrics
- Success/failure status indication
- Exploration coverage metrics for frontier algorithms
- Clean, organized display of algorithm results

**Props:** Algorithm results data and display mode

### `src/hooks/`

#### `useMaze.js`
**Purpose:** Maze generation and management with automatic cell size adjustment.

**Key Features:**
- `useMaze()` hook - Manages maze state and generation
- Automatic maze regeneration on dimension changes
- Dynamic cell size calculation based on maze dimensions
- Performance-optimized maze generation with loading states
- Memoized maze data to prevent unnecessary recalculations

**Returns:** Maze data, dimensions, cell size, and generation controls

#### `usePathfinding.js`
**Purpose:** Comprehensive pathfinding and exploration state management.

**Key Features:**
- `usePathfinding()` hook - Central state management for all algorithms
- Automatic random point generation with distance constraints
- Algorithm execution with progress callbacks and animation
- Parameter management for RRT and Frontier algorithms
- Exploration mode support with robot state tracking
- Algorithm comparison functionality
- Path length calculation and performance metrics

**Returns:** Complete pathfinding state and control functions

### `src/maze/`

#### `MazeGenerator.js`
**Purpose:** Procedural maze generation using modified depth-first search algorithm.

**Key Features:**
- `generateMaze()` - Generates complex mazes with multiple features
- 3x3 room carving for larger open spaces
- Post-processing for rooms, loops, and path widening
- Guaranteed connectivity and entrance/exit placement
- Optimized for pathfinding algorithm demonstration
- Configurable maze complexity and features

**Exports:** `generateMaze()` function

#### `CollisionChecker.js`
**Purpose:** Collision detection and path validation for RRT algorithms.

**Key Features:**
- `MazeCollisionChecker` class - Provides collision detection services
- Point-in-obstacle checking for maze environments
- Path collision detection with configurable step size
- Random free point generation for RRT sampling
- Boundary checking and validation utilities

**Exports:** `MazeCollisionChecker` class

### `src/utils/`

#### `helpers.js`
**Purpose:** Shared utility functions for path calculations and formatting.

**Key Features:**
- `calculatePathLength()` - Euclidean distance calculation for paths
- `isPointInMaze()` - Validation for point coordinates
- `formatTime()` - Human-readable time formatting
- `formatDistance()` - Consistent distance formatting
- Reusable utilities for metrics and validation

**Exports:** Path calculation and formatting utilities

### `src/` (Root Components)

#### `App.tsx`
**Purpose:** Main application component with mode switching between pathfinding and exploration.

**Key Features:**
- Toggle between MazePathfinder and FrontierExploration components
- Clean mode switching interface
- Styling and layout coordination

#### `frontier-exploration.jsx`
**Purpose:** Standalone frontier exploration demonstration with integrated algorithms.

**Key Features:**
- Self-contained exploration demo with embedded algorithms
- Real-time frontier detection and robot movement visualization
- Interactive controls for exploration parameters
- Step-by-step and continuous exploration modes
- Educational visualization of frontier-based exploration concepts

## Architecture Highlights

### Performance Optimizations
- **Canvas Rendering:** ImageData-based maze rendering for smooth performance
- **Memoized Components:** Prevents unnecessary re-renders in visualization
- **Modular Algorithms:** Pluggable algorithm system for easy extension
- **Efficient Data Structures:** Uint8Array for maze data and Set-based lookups

### State Management
- **Custom Hooks:** Clean separation of concerns with specialized hooks
- **Progress Callbacks:** Real-time algorithm visualization and feedback
- **Parameter Management:** Configurable algorithm parameters with validation
- **Mode Switching:** Seamless transitions between pathfinding and exploration

### Algorithm Design
- **Modular Architecture:** Pluggable sensors, pathfinders, and frontier detectors
- **Research Integration:** Implementation of published research algorithms (WFD)
- **Multiple Strategies:** Support for BFS, A*, Dijkstra, RRT, and RRT* pathfinding
- **Real-time Visualization:** Progress callbacks for smooth animation

### Educational Features
- **Algorithm Comparison:** Side-by-side performance metrics and visualization
- **Interactive Controls:** Real-time parameter adjustment and mode switching
- **Visual Feedback:** Clear indication of algorithm progress and results
- **Research Implementation:** Direct implementation of frontier exploration research