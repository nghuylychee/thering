// Level Generator for DiceQuest
// Generates level layouts based on tuning parameters

// Calculate Manhattan distance
function calculateManhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

// Find path between two points (simple BFS) - renamed to avoid conflict with game.js
function findPathInGrid(grid, startX, startY, targetX, targetY, maxSteps = 100) {
    if (!grid || !grid[0] || grid.length === 0) return null;
    
    const width = grid[0].length;
    const height = grid.length;
    const visited = new Set();
    const queue = [{ x: startX, y: startY, path: [] }];
    
    const directions = [
        { dx: 0, dy: -1, name: 'up' },
        { dx: 1, dy: 0, name: 'right' },
        { dx: 0, dy: 1, name: 'down' },
        { dx: -1, dy: 0, name: 'left' }
    ];
    
    while (queue.length > 0) {
        const current = queue.shift();
        const key = `${current.x},${current.y}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (current.x === targetX && current.y === targetY) {
            return current.path;
        }
        
        if (current.path.length >= maxSteps) continue;
        
        for (const dir of directions) {
            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;
            
            if (newX < 0 || newX >= width || newY < 0 || newY >= height) continue;
            
            const cell = grid[newY] && grid[newY][newX];
            if (cell === undefined) continue;
            
            // Check if cell is walkable (not obstacle, not occupied)
            // Obstacles: 'B' (Box), 'L' (Lava), 'S' (Swamp), 'C' (Canon) are not walkable
            // But we can walk through Lava and Swamp (they just slow us down)
            // Only Box and Canon block movement
            if (cell === 'B' || cell === 'C' || cell === 'occupied') continue;
            
            const newKey = `${newX},${newY}`;
            if (!visited.has(newKey)) {
                queue.push({
                    x: newX,
                    y: newY,
                    path: [...current.path, dir.name]
                });
            }
        }
    }
    
    return null; // No path found
}

// Check if path exists between two points
function hasPath(grid, startX, startY, targetX, targetY) {
    return findPathInGrid(grid, startX, startY, targetX, targetY) !== null;
}

// Get all walkable cells
function getWalkableCells(grid) {
    const walkable = [];
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const cell = grid[y][x];
            // Only Box ('B') and Canon ('C') block movement
            // Lava ('L') and Swamp ('S') are walkable but slow
            if (cell !== 'B' && cell !== 'C' && cell !== 'occupied') {
                walkable.push({ x, y });
            }
        }
    }
    return walkable;
}

// Get cells at specific distance range from a point
function getCellsAtDistance(grid, centerX, centerY, minDist, maxDist) {
    const cells = [];
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const cell = grid[y][x];
            // Only Box ('B') and Canon ('C') block - Lava and Swamp are walkable
            if (cell === 'B' || cell === 'C' || cell === 'occupied') continue;
            const dist = calculateManhattanDistance(centerX, centerY, x, y);
            if (dist >= minDist && dist <= maxDist) {
                cells.push({ x, y });
            }
        }
    }
    return cells;
}

// Generate level based on parameters
function generateLevel(parameters) {
    const {
        gridWidth = 8,
        gridHeight = 10,
        
        // Enemies
        totalEnemyPower = 10,
        enemyCount = 3,
        enemyMinDistance = 2,
        enemyMaxDistance = 8,
        
        // Items
        totalItemValue = 5,
        itemCount = 3,
        itemMinDistance = 1,
        itemMaxDistance = 6,
        itemMinDistanceFromEnemy = 0,
        
        // Obstacles (exact counts - no scaling)
        obstacleBox = 5,
        obstacleLava = 2,
        obstacleSwamp = 1,
        obstacleCanon = 0,
        
        // Princess & Portal
        princessDistance = 5,
        portalDistance = 3,
        
        // Level config
        playerStartValue = 2,
        goldPerLevel = 10,
        goldPerBag = 5,
        minItems = 1,
        maxItems = 5,
        spawnTurns = 3,
        
        // Level metadata
        level = 1,
        name = 'Generated Level',
        description = 'Auto-generated level'
    } = parameters;
    
    const maxRetries = 50;
    let attempts = 0;
    
    while (attempts < maxRetries) {
        attempts++;
        
        // Initialize grid with empty cells
        const grid = [];
        for (let y = 0; y < gridHeight; y++) {
            grid[y] = [];
            for (let x = 0; x < gridWidth; x++) {
                grid[y][x] = 0; // Empty
            }
        }
        
        // Place player (center or random)
        let playerX, playerY;
        if (gridWidth >= 6 && gridHeight >= 6) {
            // Place near center
            playerX = Math.floor(gridWidth / 2);
            playerY = Math.floor(gridHeight / 2);
        } else {
            // Random placement
            playerX = Math.floor(Math.random() * gridWidth);
            playerY = Math.floor(Math.random() * gridHeight);
        }
        grid[playerY][playerX] = 'P';
        
        // Use exact obstacle counts specified by user (no scaling)
        // Build obstacle types array with exact counts
        const obstacleTypes = [];
        for (let i = 0; i < obstacleBox; i++) obstacleTypes.push('B');
        for (let i = 0; i < obstacleLava; i++) obstacleTypes.push('L');
        for (let i = 0; i < obstacleSwamp; i++) obstacleTypes.push('S');
        for (let i = 0; i < obstacleCanon; i++) obstacleTypes.push('C');
        
        // Shuffle obstacles for random distribution
        for (let i = obstacleTypes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [obstacleTypes[i], obstacleTypes[j]] = [obstacleTypes[j], obstacleTypes[i]];
        }
        
        // Place obstacles
        // Get all available cells (excluding player position)
        const availableCells = [];
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                if (x !== playerX || y !== playerY) {
                    availableCells.push({ x, y });
                }
            }
        }
        
        // Shuffle available cells
        for (let i = availableCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableCells[i], availableCells[j]] = [availableCells[j], availableCells[i]];
        }
        
        // Place obstacles in shuffled cells
        let obstaclesPlaced = 0;
        for (let i = 0; i < obstacleTypes.length && obstaclesPlaced < obstacleTypes.length && i < availableCells.length; i++) {
            const cell = availableCells[i];
            // Only place if cell is empty (0)
            if (grid[cell.y][cell.x] === 0) {
                grid[cell.y][cell.x] = obstacleTypes[obstaclesPlaced];
                obstaclesPlaced++;
            }
        }
        
        // If we couldn't place all obstacles, log warning and retry
        if (obstaclesPlaced < obstacleTypes.length) {
            console.warn(`Attempt ${attempts}: Could only place ${obstaclesPlaced} out of ${obstacleTypes.length} obstacles, retrying...`);
            continue;
        }
        
        console.log(`Placed ${obstaclesPlaced} obstacles: Box=${obstacleBox}, Lava=${obstacleLava}, Swamp=${obstacleSwamp}, Canon=${obstacleCanon}`);
        
        // Place enemies
        const enemyValues = distributePower(totalEnemyPower, enemyCount, [1, 3, 5, 8]);
        const enemies = [];
        const enemyCells = getCellsAtDistance(grid, playerX, playerY, enemyMinDistance, enemyMaxDistance);
        
        // Filter out cells that have obstacles - enemies can ONLY be placed on empty cells (0)
        // This prevents overwriting obstacles (B, L, S, C)
        const validEnemyCells = enemyCells.filter(cell => {
            const cellValue = grid[cell.y][cell.x];
            // Can ONLY place on empty cells (0) - do not overwrite obstacles
            return cellValue === 0;
        });
        
        if (validEnemyCells.length < enemyCount) {
            // Not enough valid cells at required distance, try again
            continue;
        }
        
        // Shuffle and place enemies
        const shuffledEnemyCells = [...validEnemyCells].sort(() => Math.random() - 0.5);
        let enemiesPlaced = 0;
        
        for (let i = 0; i < enemyCount && i < shuffledEnemyCells.length; i++) {
            const cell = shuffledEnemyCells[i];
            const cellValue = grid[cell.y][cell.x];
            // Can ONLY place on empty cells (0) - do not overwrite obstacles
            if (cellValue === 0) {
                grid[cell.y][cell.x] = -enemyValues[enemiesPlaced];
                enemies.push({ x: cell.x, y: cell.y, value: enemyValues[enemiesPlaced] });
                enemiesPlaced++;
            }
        }
        
        if (enemiesPlaced < enemyCount) {
            // Couldn't place all enemies, try again
            continue;
        }
        
        // Place items
        const itemValues = distributePower(totalItemValue, itemCount, [1, 2, 3, 5]);
        const items = [];
        const itemCells = getCellsAtDistance(grid, playerX, playerY, itemMinDistance, itemMaxDistance);
        
        // Filter items that are far enough from enemies and can be placed
        // Items can ONLY be placed on empty cells (0) - do not overwrite obstacles
        const validItemCells = itemCells.filter(cell => {
            const cellValue = grid[cell.y][cell.x];
            // Can ONLY place on empty cells (0) - do not overwrite obstacles
            if (cellValue !== 0) return false;
            if (itemMinDistanceFromEnemy > 0) {
                for (const enemy of enemies) {
                    const dist = calculateManhattanDistance(cell.x, cell.y, enemy.x, enemy.y);
                    if (dist < itemMinDistanceFromEnemy) return false;
                }
            }
            return true;
        });
        
        if (validItemCells.length < itemCount) {
            // Not enough valid cells for items, try again
            continue;
        }
        
        const shuffledItemCells = [...validItemCells].sort(() => Math.random() - 0.5);
        let itemsPlaced = 0;
        
        for (let i = 0; i < itemCount && i < shuffledItemCells.length; i++) {
            const cell = shuffledItemCells[i];
            const cellValue = grid[cell.y][cell.x];
            // Can ONLY place on empty cells (0) - do not overwrite obstacles
            if (cellValue === 0) {
                grid[cell.y][cell.x] = itemValues[itemsPlaced];
                items.push({ x: cell.x, y: cell.y, value: itemValues[itemsPlaced] });
                itemsPlaced++;
            }
        }
        
        if (itemsPlaced < itemCount) {
            // Couldn't place all items, try again
            continue;
        }
        
        // Place princess
        const princessCells = getCellsAtDistance(grid, playerX, playerY, princessDistance - 1, princessDistance + 1);
        // Princess can ONLY be placed on empty cells (0) - do not overwrite obstacles
        const validPrincessCells = princessCells.filter(cell => {
            const cellValue = grid[cell.y][cell.x];
            return cellValue === 0;
        });
        
        if (validPrincessCells.length === 0) {
            continue;
        }
        
        const princessCell = validPrincessCells[Math.floor(Math.random() * validPrincessCells.length)];
        grid[princessCell.y][princessCell.x] = 'R';
        const princessX = princessCell.x;
        const princessY = princessCell.y;
        
        // Portal is spawned by game logic when princess is rescued, so we don't place it here
        // But we should validate that there's a valid location for portal near princess
        
        // Validate paths - CRITICAL: Ensure player can reach princess
        // Create a simplified grid for pathfinding (0 = walkable, obstacles block movement)
        const pathGrid = grid.map(row => row.map(cell => {
            // Box ('B') and Canon ('C') block movement
            if (cell === 'B' || cell === 'C') {
                return 'blocked'; // Blocked cell
            }
            // Lava ('L') and Swamp ('S') are walkable but slow (we can pass through)
            // Player ('P'), Princess ('R'), enemies (negative numbers), items (positive numbers) are walkable
            // Empty (0) is walkable
            return 0; // Walkable
        }));
        
        // CRITICAL: Check path from player to princess - MUST have valid path
        if (!hasPath(pathGrid, playerX, playerY, princessX, princessY)) {
            console.log(`Attempt ${attempts}: No path from player to princess, retrying...`);
            continue;
        }
        
        // Also verify that the path is actually reachable (not too long)
        const path = findPathInGrid(pathGrid, playerX, playerY, princessX, princessY);
        if (!path || path.length > (gridWidth * gridHeight)) {
            console.log(`Attempt ${attempts}: Path too long or invalid, retrying...`);
            continue;
        }
        
        // Check that there's at least one walkable cell near princess for portal spawn
        const portalSpawnCells = getCellsAtDistance(grid, princessX, princessY, portalDistance - 1, portalDistance + 1);
        const validPortalSpawnCells = portalSpawnCells.filter(cell => {
            if (grid[cell.y][cell.x] !== 0) return false;
            // Check if there's a path from princess to this cell
            return hasPath(pathGrid, princessX, princessY, cell.x, cell.y);
        });
        
        if (validPortalSpawnCells.length === 0) {
            continue;
        }
        
        // Convert grid to final format
        const layout = grid.map(row => row.map(cell => cell));
        
        // Calculate actual stats
        const actualWalkable = getWalkableCells(layout).length;
        const actualEnemyPower = enemies.reduce((sum, e) => sum + e.value, 0);
        const actualItemValue = items.reduce((sum, i) => sum + i.value, 0);
        
        // Count actual obstacles placed
        let actualObstacles = 0;
        let actualBox = 0, actualLava = 0, actualSwamp = 0, actualCanon = 0;
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const cell = layout[y][x];
                if (cell === 'B') { actualObstacles++; actualBox++; }
                else if (cell === 'L') { actualObstacles++; actualLava++; }
                else if (cell === 'S') { actualObstacles++; actualSwamp++; }
                else if (cell === 'C') { actualObstacles++; actualCanon++; }
            }
        }
        
        // Return level config
        return {
            level,
            name,
            description,
            playerStartValue,
            goldPerLevel,
            goldPerBag,
            minItems,
            maxItems,
            spawnTurns,
            layout,
            stats: {
                walkableCells: actualWalkable,
                enemyPower: actualEnemyPower,
                enemyCount: enemies.length,
                itemValue: actualItemValue,
                itemCount: items.length,
                obstacles: actualObstacles,
                obstacleBox: actualBox,
                obstacleLava: actualLava,
                obstacleSwamp: actualSwamp,
                obstacleCanon: actualCanon
            }
        };
    }
    
    // If we couldn't generate after max retries, return null
    console.warn('Failed to generate level after', maxRetries, 'attempts');
    return null;
}

// Distribute power among entities
function distributePower(totalPower, count, availableValues) {
    if (count === 0) return [];
    
    const values = [];
    let remainingPower = totalPower;
    
    // Sort available values descending
    const sortedValues = [...availableValues].sort((a, b) => b - a);
    
    for (let i = 0; i < count; i++) {
        if (remainingPower <= 0) {
            // Use minimum value for remaining
            values.push(sortedValues[sortedValues.length - 1]);
            continue;
        }
        
        // Try to use a value that fits
        let value = sortedValues[0];
        for (const v of sortedValues) {
            if (v <= remainingPower) {
                value = v;
                break;
            }
        }
        
        // If this is the last entity, use all remaining power (closest match)
        if (i === count - 1) {
            // Find closest match to remaining power
            let closestValue = sortedValues[sortedValues.length - 1];
            let minDiff = Math.abs(closestValue - remainingPower);
            for (const v of sortedValues) {
                const diff = Math.abs(v - remainingPower);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestValue = v;
                }
            }
            value = closestValue;
        }
        
        values.push(value);
        remainingPower -= value;
    }
    
    // Shuffle to randomize distribution
    return values.sort(() => Math.random() - 0.5);
}

// Generate 10 levels with pacing (Intro → Upgrade → Climax per cluster)
function generate10Levels() {
    const levelConfigs = [
        // Cụm 1: Level 1-3 (Intro → Upgrade → Climax)
        {
            level: 1,
            name: 'Dungeon Entrance',
            description: 'Your first challenge - learn the basics',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 45,
            totalEnemyPower: 4,
            enemyCount: 2,
            enemyMinDistance: 2,
            enemyMaxDistance: 6,
            totalItemValue: 4,
            itemCount: 2,
            itemMinDistance: 1,
            itemMaxDistance: 5,
            itemMinDistanceFromEnemy: 0,
            obstacleBox: 3,
            obstacleLava: 0,
            obstacleSwamp: 0,
            obstacleCanon: 0,
            princessDistance: 4,
            portalDistance: 2,
            playerStartValue: 2,
            goldPerLevel: 10,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 3,
            spawnTurns: 3
        },
        {
            level: 2,
            name: 'Barrel Maze',
            description: 'Navigate through obstacles and monsters',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 50,
            totalEnemyPower: 7,
            enemyCount: 3,
            enemyMinDistance: 2,
            enemyMaxDistance: 7,
            totalItemValue: 6,
            itemCount: 3,
            itemMinDistance: 1,
            itemMaxDistance: 6,
            itemMinDistanceFromEnemy: 0,
            obstacleBox: 5,
            obstacleLava: 1,
            obstacleSwamp: 0,
            obstacleCanon: 0,
            princessDistance: 5,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 12,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 4,
            spawnTurns: 3
        },
        {
            level: 3,
            name: 'Goblin Den',
            description: 'Face hordes of goblins and rats',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 52,
            totalEnemyPower: 9,
            enemyCount: 3,
            enemyMinDistance: 2,
            enemyMaxDistance: 8,
            totalItemValue: 8,
            itemCount: 3,
            itemMinDistance: 1,
            itemMaxDistance: 6,
            itemMinDistanceFromEnemy: 0,
            obstacleBox: 6,
            obstacleLava: 2,
            obstacleSwamp: 0,
            obstacleCanon: 0,
            princessDistance: 6,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 15,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 5,
            spawnTurns: 3
        },
        // Cụm 2: Level 4-6 (Intro → Upgrade → Climax)
        {
            level: 4,
            name: 'Cluttered Corridor',
            description: 'Tight spaces filled with barrels and orcs',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 48,
            totalEnemyPower: 13,
            enemyCount: 4,
            enemyMinDistance: 3,
            enemyMaxDistance: 8,
            totalItemValue: 11,
            itemCount: 4,
            itemMinDistance: 2,
            itemMaxDistance: 7,
            itemMinDistanceFromEnemy: 1,
            obstacleBox: 7,
            obstacleLava: 2,
            obstacleSwamp: 1,
            obstacleCanon: 0,
            princessDistance: 7,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 18,
            goldPerBag: 6,
            minItems: 2,
            maxItems: 6,
            spawnTurns: 3
        },
        {
            level: 5,
            name: 'Fire Chamber',
            description: 'Beware the fire pits and dangerous monsters',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 46,
            totalEnemyPower: 16,
            enemyCount: 4,
            enemyMinDistance: 3,
            enemyMaxDistance: 9,
            totalItemValue: 13,
            itemCount: 4,
            itemMinDistance: 2,
            itemMaxDistance: 7,
            itemMinDistanceFromEnemy: 1,
            obstacleBox: 8,
            obstacleLava: 3,
            obstacleSwamp: 2,
            obstacleCanon: 1,
            princessDistance: 8,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 20,
            goldPerBag: 6,
            minItems: 2,
            maxItems: 7,
            spawnTurns: 3
        },
        {
            level: 6,
            name: 'Monster Lair',
            description: 'Multiple paths filled with dangerous creatures',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 44,
            totalEnemyPower: 20,
            enemyCount: 5,
            enemyMinDistance: 3,
            enemyMaxDistance: 9,
            totalItemValue: 16,
            itemCount: 5,
            itemMinDistance: 2,
            itemMaxDistance: 8,
            itemMinDistanceFromEnemy: 1,
            obstacleBox: 10,
            obstacleLava: 4,
            obstacleSwamp: 3,
            obstacleCanon: 2,
            princessDistance: 9,
            portalDistance: 4,
            playerStartValue: 2,
            goldPerLevel: 25,
            goldPerBag: 7,
            minItems: 2,
            maxItems: 8,
            spawnTurns: 3
        },
        // Cụm 3: Level 7-9 (Intro → Upgrade → Climax)
        {
            level: 7,
            name: 'Poison Pools',
            description: 'Toxic waters and swarms of monsters',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 42,
            totalEnemyPower: 24,
            enemyCount: 5,
            enemyMinDistance: 4,
            enemyMaxDistance: 10,
            totalItemValue: 20,
            itemCount: 5,
            itemMinDistance: 2,
            itemMaxDistance: 8,
            itemMinDistanceFromEnemy: 2,
            obstacleBox: 12,
            obstacleLava: 4,
            obstacleSwamp: 3,
            obstacleCanon: 2,
            princessDistance: 10,
            portalDistance: 4,
            playerStartValue: 2,
            goldPerLevel: 28,
            goldPerBag: 7,
            minItems: 3,
            maxItems: 9,
            spawnTurns: 3
        },
        {
            level: 8,
            name: 'Teleport Runes',
            description: 'Magic runes and closing enemies',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 40,
            totalEnemyPower: 28,
            enemyCount: 6,
            enemyMinDistance: 4,
            enemyMaxDistance: 10,
            totalItemValue: 23,
            itemCount: 6,
            itemMinDistance: 3,
            itemMaxDistance: 9,
            itemMinDistanceFromEnemy: 2,
            obstacleBox: 14,
            obstacleLava: 5,
            obstacleSwamp: 4,
            obstacleCanon: 3,
            princessDistance: 11,
            portalDistance: 4,
            playerStartValue: 2,
            goldPerLevel: 32,
            goldPerBag: 8,
            minItems: 3,
            maxItems: 10,
            spawnTurns: 3
        },
        {
            level: 9,
            name: 'Dungeon Maze',
            description: 'Complex maze with obstacles and monsters',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 38,
            totalEnemyPower: 32,
            enemyCount: 6,
            enemyMinDistance: 4,
            enemyMaxDistance: 11,
            totalItemValue: 26,
            itemCount: 6,
            itemMinDistance: 3,
            itemMaxDistance: 9,
            itemMinDistanceFromEnemy: 2,
            obstacleBox: 16,
            obstacleLava: 5,
            obstacleSwamp: 4,
            obstacleCanon: 3,
            princessDistance: 12,
            portalDistance: 5,
            playerStartValue: 2,
            goldPerLevel: 35,
            goldPerBag: 8,
            minItems: 3,
            maxItems: 10,
            spawnTurns: 3
        },
        // Level 10: Boss/Climax
        {
            level: 10,
            name: 'Dragon\'s Lair',
            description: 'Face the first dragon and its minions',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 36,
            totalEnemyPower: 37,
            enemyCount: 7,
            enemyMinDistance: 5,
            enemyMaxDistance: 12,
            totalItemValue: 30,
            itemCount: 7,
            itemMinDistance: 3,
            itemMaxDistance: 10,
            itemMinDistanceFromEnemy: 2,
            obstacleBox: 18,
            obstacleLava: 6,
            obstacleSwamp: 5,
            obstacleCanon: 4,
            princessDistance: 13,
            portalDistance: 5,
            playerStartValue: 2,
            goldPerLevel: 40,
            goldPerBag: 10,
            minItems: 3,
            maxItems: 10,
            spawnTurns: 3
        }
    ];
    
    const generatedLevels = [];
    let failedCount = 0;
    const maxRetriesPerLevel = 10;
    
    for (const config of levelConfigs) {
        let level = null;
        let attempts = 0;
        
        while (!level && attempts < maxRetriesPerLevel) {
            attempts++;
            level = generateLevel(config);
        }
        
        if (level) {
            generatedLevels.push(level);
            console.log(`Generated Level ${level.level}: ${level.name}`);
        } else {
            failedCount++;
            console.warn(`Failed to generate Level ${config.level} after ${maxRetriesPerLevel} attempts`);
            // Create a placeholder level with error message
            generatedLevels.push({
                level: config.level,
                name: config.name,
                description: config.description + ' (Generation failed)',
                error: true,
                config: config
            });
        }
    }
    
    return {
        levels: generatedLevels,
        successCount: generatedLevels.filter(l => !l.error).length,
        failedCount: failedCount
    };
}

