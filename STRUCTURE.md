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