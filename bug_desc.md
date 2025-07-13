# Bug Report: Frontier Algorithm Ignores Wall Collisions

## Summary
The Frontier-Based Exploration algorithm moves through walls instead of navigating around them, violating basic maze navigation rules.

## Visual Evidence
In the attached screenshot (`bug_desc.png`), the red exploration path clearly cuts through black wall areas instead of following open (white) corridors.

## Root Cause Analysis

### Code Location: `src/algorithms/Frontier.js:130-139`

```javascript
// Move robot toward frontier (simplified movement)
const dx = nearestFrontier.x - currentPos.x;
const dy = nearestFrontier.y - currentPos.y;
const distance = Math.sqrt(dx * dx + dy * dy);

if (distance > 0) {
  const stepSize = Math.min(2, distance);
  currentPos.x += (dx / distance) * stepSize;
  currentPos.y += (dy / distance) * stepSize;
}
```

### Problem
The movement implementation uses **direct line interpolation** toward the target frontier without any collision detection or pathfinding. The robot moves in a straight line regardless of obstacles.

## Expected Behavior
1. Robot should only move through open spaces (maze value `0`)
2. Robot should navigate around walls using pathfinding
3. Exploration path should respect maze topology

## Current Behavior
1. Robot moves directly toward frontiers through any terrain
2. Path cuts through walls (maze value `1`)
3. Movement violates physical constraints of the maze

## Suggested Fixes

### Option 1: Add Collision Detection
```javascript
// Check if movement is valid before applying
const newX = currentPos.x + (dx / distance) * stepSize;
const newY = currentPos.y + (dy / distance) * stepSize;
const gridX = Math.floor(newX);
const gridY = Math.floor(newY);

if (fullMaze[gridY * width + gridX] === 0) {
  currentPos.x = newX;
  currentPos.y = newY;
}
```

### Option 2: Integrate Pathfinding
Use A* or similar algorithm to plan collision-free routes to frontiers through known open space.

### Option 3: Step-by-Step Validation
Move in smaller increments with collision checking at each step.

## Impact
- Breaks maze exploration simulation realism
- Provides incorrect coverage metrics
- Makes algorithm unsuitable for real robotics applications