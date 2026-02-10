// Procedural Path-Based Map Generator for DiceRogue (He is Coming style)
// Generates open-world style maps with path networks and POIs

/**
 * Generate a complete path-based map with paths, junctions, and entities
 * @param {number} width - Map width
 * @param {number} height - Map height
 * @param {number} roomCount - Number of junction points (POIs)
 * @param {number} minRoomSize - Not used in path-based (kept for compatibility)
 * @param {number} maxRoomSize - Not used in path-based (kept for compatibility)
 * @returns {Object} Map data: { grid, rooms, playerStart, roomObstacles, pathNetwork }
 */
function generateDungeon(width, height, roomCount, minRoomSize, maxRoomSize) {
    // Initialize empty grid (0 = empty/wall, 1 = path/floor)
    const grid = [];
    for (let y = 0; y < height; y++) {
        grid[y] = [];
        for (let x = 0; x < width; x++) {
            grid[y][x] = 0; // Empty by default
        }
    }
    
    // Generate path network
    const pathNetwork = generatePathNetwork(width, height, roomCount);
    
    // Carve paths into grid
    pathNetwork.paths.forEach(path => {
        path.cells.forEach(cell => {
            if (cell.x >= 0 && cell.x < width && cell.y >= 0 && cell.y < height) {
                grid[cell.y][cell.x] = 1; // Path
            }
        });
    });
    
    // Create open areas around junctions (small clearings)
    createOpenAreas(pathNetwork.junctions, grid, width, height);
    
    // Fill empty spaces with additional paths (create dense network)
    fillEmptySpaces(pathNetwork, grid, width, height);
    
    // Find starting position first (needed for obstacle validation)
    let playerStart = null;
    
    // Try to use first junction if it's walkable
    if (pathNetwork.junctions.length > 0) {
        const firstJunction = pathNetwork.junctions[0];
        if (grid[firstJunction.y] && grid[firstJunction.y][firstJunction.x] === 1) {
            playerStart = { x: firstJunction.x, y: firstJunction.y };
        }
    }
    
    // If no valid junction, find first walkable cell
    if (!playerStart) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (grid[y][x] === 1) {
                    playerStart = { x, y };
                    break;
                }
            }
            if (playerStart) break;
        }
    }
    
    // Fallback to center if still no walkable cell found (shouldn't happen)
    if (!playerStart) {
        playerStart = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
        // Force center to be walkable as last resort
        grid[playerStart.y][playerStart.x] = 1;
    }
    
    // Generate obstacles (boxes) along paths - will be added to entities
    // Pass playerStart for connectivity validation
    const roomObstacles = generatePathObstacles(pathNetwork, grid, width, height, playerStart);
    
    // Place multi-cell unwalkable decor (2x2, 1x2, 2x1) on path; mutates grid to 0 for those cells
    const multiCellDecors = generateMultiCellDecors(grid, width, height, playerStart, pathNetwork.junctions);
    
    // Convert junctions to rooms format for compatibility
    const rooms = pathNetwork.junctions.map((junction, index) => ({
        x: junction.x - 1,
        y: junction.y - 1,
        width: 3,
        height: 3,
        zone: null,
        junction: true
    }));
    
    // Assign zone themes to junctions (for compatibility)
    assignZoneThemes(rooms);
    
    // Area themes: assign theme per junction, then per cell (nearest junction)
    const areaThemes = buildAreaThemesGrid(grid, width, height, pathNetwork.junctions);
    
    return {
        grid,
        rooms, // For compatibility with existing code
        playerStart,
        roomObstacles,
        pathNetwork, // New: path network data
        multiCellDecors,
        areaThemes
    };
}

/**
 * Generate a network of paths connecting points of interest (junctions)
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {number} pointCount - Number of junction points
 * @returns {Object} Path network: { junctions, paths }
 */
function generatePathNetwork(width, height, pointCount) {
    const junctions = [];
    const paths = [];
    
    // Generate random junction points (POI locations)
    const padding = 5;
    for (let i = 0; i < pointCount; i++) {
        let attempts = 50;
        let x, y;
        let valid = false;
        
        while (attempts > 0 && !valid) {
            attempts--;
            x = Math.floor(Math.random() * (width - padding * 2)) + padding;
            y = Math.floor(Math.random() * (height - padding * 2)) + padding;
            
            // Check minimum distance from other junctions (at least 8 cells)
            valid = true;
            for (const existing of junctions) {
                const distance = Math.abs(x - existing.x) + Math.abs(y - existing.y);
                if (distance < 8) {
                    valid = false;
                    break;
                }
            }
        }
        
        if (valid) {
            junctions.push({ x, y, id: i });
        }
    }
    
    // Build minimum spanning tree to connect all junctions
    const connected = new Set();
    const unconnected = new Set();
    
    if (junctions.length > 0) {
        connected.add(0);
        for (let i = 1; i < junctions.length; i++) {
            unconnected.add(i);
        }
        
        // Connect all junctions with paths
        while (unconnected.size > 0) {
            let minDistance = Infinity;
            let bestFrom = -1;
            let bestTo = -1;
            
            // Find closest unconnected junction to any connected one
            for (const fromIdx of connected) {
                for (const toIdx of unconnected) {
                    const from = junctions[fromIdx];
                    const to = junctions[toIdx];
                    const distance = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestFrom = fromIdx;
                        bestTo = toIdx;
                    }
                }
            }
            
            if (bestFrom >= 0 && bestTo >= 0) {
                // Create path between junctions
                const path = createPath(junctions[bestFrom], junctions[bestTo]);
                paths.push(path);
                connected.add(bestTo);
                unconnected.delete(bestTo);
            } else {
                break;
            }
        }
        
        // Add many extra paths for loops (60% of junctions, max distance 30)
        const extraPathsPercent = CONFIG.DUNGEON_CONFIG.extraPathsPercent || 60;
        const maxPathDistance = CONFIG.DUNGEON_CONFIG.maxPathDistance || 30;
        const extraPaths = Math.floor(junctions.length * (extraPathsPercent / 100));
        
        for (let i = 0; i < extraPaths; i++) {
            const j1 = Math.floor(Math.random() * junctions.length);
            const j2 = Math.floor(Math.random() * junctions.length);
            
            if (j1 !== j2) {
                const from = junctions[j1];
                const to = junctions[j2];
                const distance = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
                
                // Only add if close enough and path doesn't exist
                if (distance <= maxPathDistance) {
                    const pathExists = paths.some(p => 
                        (p.from.id === from.id && p.to.id === to.id) ||
                        (p.from.id === to.id && p.to.id === from.id)
                    );
                    
                    if (!pathExists) {
                        const path = createPath(from, to);
                        paths.push(path);
                    }
                }
            }
        }
        
        // Add random paths to fill empty space (connect nearby paths)
        const randomPathsCount = CONFIG.DUNGEON_CONFIG.randomPathsCount || 15;
        for (let i = 0; i < randomPathsCount; i++) {
            // Pick two random junctions
            const j1 = Math.floor(Math.random() * junctions.length);
            const j2 = Math.floor(Math.random() * junctions.length);
            
            if (j1 !== j2) {
                const from = junctions[j1];
                const to = junctions[j2];
                const distance = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
                
                // Add if within reasonable distance (max 25 cells)
                if (distance <= 25) {
                    const pathExists = paths.some(p => 
                        (p.from.id === from.id && p.to.id === to.id) ||
                        (p.from.id === to.id && p.to.id === from.id)
                    );
                    
                    if (!pathExists) {
                        const path = createPath(from, to);
                        paths.push(path);
                    }
                }
            }
        }
        
        // Add paths between nearby existing paths (create mesh network)
        const enableMesh = CONFIG.DUNGEON_CONFIG.meshConnections !== false;
        if (enableMesh) {
            // Find path midpoints and connect them
            const pathMidpoints = [];
            paths.forEach(path => {
                if (path.cells.length > 4) {
                    const midIndex = Math.floor(path.cells.length / 2);
                    const midpoint = path.cells[midIndex];
                    pathMidpoints.push({ x: midpoint.x, y: midpoint.y, pathId: paths.indexOf(path) });
                }
            });
            
            const meshChance = CONFIG.DUNGEON_CONFIG.meshConnectionChance || 0.3;
            const meshMaxDist = CONFIG.DUNGEON_CONFIG.meshMaxDistance || 12;
            
            // Connect nearby midpoints
            for (let i = 0; i < pathMidpoints.length; i++) {
                for (let j = i + 1; j < pathMidpoints.length; j++) {
                    const mp1 = pathMidpoints[i];
                    const mp2 = pathMidpoints[j];
                    const distance = Math.abs(mp1.x - mp2.x) + Math.abs(mp1.y - mp2.y);
                    
                    // Connect if close and not same path
                    if (distance <= meshMaxDist && mp1.pathId !== mp2.pathId && Math.random() < meshChance) {
                        const path = createPath(mp1, mp2);
                        paths.push(path);
                    }
                }
            }
        }
    }
    
    return { junctions, paths };
}

/**
 * Create a path between two points (L-shaped or direct)
 * @param {Object} from - Start point { x, y, id }
 * @param {Object} to - End point { x, y, id }
 * @returns {Object} Path object with cells array
 */
function createPath(from, to) {
    const cells = [];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    // Create L-shaped path (horizontal first, then vertical)
    const stepX = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
    const stepY = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;
    
    // Horizontal segment
    for (let x = from.x; x !== to.x; x += stepX) {
        cells.push({ x, y: from.y });
    }
    
    // Vertical segment
    for (let y = from.y; y !== to.y; y += stepY) {
        cells.push({ x: to.x, y });
    }
    
    // Add destination
    cells.push({ x: to.x, y: to.y });
    
    return { from, to, cells };
}

/**
 * Create open areas around junctions (small clearings)
 * @param {Array} junctions - Array of junction points
 * @param {Array} grid - Grid array to modify
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 */
function createOpenAreas(junctions, grid, width, height) {
    const clearingRadius = CONFIG.DUNGEON_CONFIG.clearingRadius || 3; // Clearing radius
    
    junctions.forEach(junction => {
        for (let y = junction.y - clearingRadius; y <= junction.y + clearingRadius; y++) {
            for (let x = junction.x - clearingRadius; x <= junction.x + clearingRadius; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const dist = Math.abs(x - junction.x) + Math.abs(y - junction.y);
                    if (dist <= clearingRadius) {
                        grid[y][x] = 1; // Open area
                    }
                }
            }
        }
    });
}

/**
 * Fill empty spaces with additional paths to create dense network
 * @param {Object} pathNetwork - Path network data
 * @param {Array} grid - Grid array to modify
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 */
function fillEmptySpaces(pathNetwork, grid, width, height) {
    // Find all existing path cells
    const pathCells = new Set();
    pathNetwork.paths.forEach(path => {
        path.cells.forEach(cell => {
            pathCells.add(`${cell.x},${cell.y}`);
        });
    });
    
    // Find empty areas near paths and connect them
    const emptyAreas = [];
    const checkRadius = 5;
    
    // Sample random points and check if they're near paths but empty
    const emptyAreaConnections = CONFIG.DUNGEON_CONFIG.emptyAreaConnections || 30;
    for (let i = 0; i < emptyAreaConnections; i++) {
        const x = Math.floor(Math.random() * (width - 10)) + 5;
        const y = Math.floor(Math.random() * (height - 10)) + 5;
        
        // Check if this area is empty
        if (grid[y] && grid[y][x] === 0) {
            // Check if there's a path nearby
            let hasNearbyPath = false;
            for (let dy = -checkRadius; dy <= checkRadius; dy++) {
                for (let dx = -checkRadius; dx <= checkRadius; dx++) {
                    const checkX = x + dx;
                    const checkY = y + dy;
                    if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
                        if (pathCells.has(`${checkX},${checkY}`)) {
                            hasNearbyPath = true;
                            break;
                        }
                    }
                }
                if (hasNearbyPath) break;
            }
            
            if (hasNearbyPath) {
                emptyAreas.push({ x, y });
            }
        }
    }
    
    // Connect empty areas to nearest paths
    emptyAreas.forEach(area => {
        let nearestPathCell = null;
        let minDistance = Infinity;
        
        pathCells.forEach(cellKey => {
            const [px, py] = cellKey.split(',').map(Number);
            const distance = Math.abs(area.x - px) + Math.abs(area.y - py);
            if (distance < minDistance && distance <= 8) {
                minDistance = distance;
                nearestPathCell = { x: px, y: py };
            }
        });
        
        if (nearestPathCell) {
            // Create short path to connect
            const path = createPath(area, nearestPathCell);
            path.cells.forEach(cell => {
                if (cell.x >= 0 && cell.x < width && cell.y >= 0 && cell.y < height) {
                    grid[cell.y][cell.x] = 1; // Path
                }
            });
        }
    });
    
    // Add some random short paths between existing paths
    const existingPathPoints = [];
    pathNetwork.paths.forEach(path => {
        // Sample some points along each path
        for (let i = 0; i < path.cells.length; i += Math.max(3, Math.floor(path.cells.length / 4))) {
            existingPathPoints.push(path.cells[i]);
        }
    });
    
    // Connect nearby path points
    const pathPointConnections = CONFIG.DUNGEON_CONFIG.pathPointConnections || 20;
    for (let i = 0; i < Math.min(pathPointConnections, existingPathPoints.length); i++) {
        const p1 = existingPathPoints[Math.floor(Math.random() * existingPathPoints.length)];
        const p2 = existingPathPoints[Math.floor(Math.random() * existingPathPoints.length)];
        
        if (p1.x !== p2.x || p1.y !== p2.y) {
            const distance = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
            if (distance <= 10 && distance > 3) {
                // Create short connecting path
                const path = createPath(p1, p2);
                path.cells.forEach(cell => {
                    if (cell.x >= 0 && cell.x < width && cell.y >= 0 && cell.y < height) {
                        grid[cell.y][cell.x] = 1; // Path
                    }
                });
            }
        }
    }
}

/**
 * Check if a cell is walkable and not blocked by obstacles
 * @param {number} x - Cell X coordinate
 * @param {number} y - Cell Y coordinate
 * @param {Array} grid - Grid array
 * @param {Array} obstacles - Array of obstacle positions {x, y}
 * @returns {boolean} True if cell is walkable and not blocked
 */
function isCellWalkable(x, y, grid, obstacles) {
    if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) return false;
    if (grid[y][x] !== 1) return false; // Not a walkable cell
    
    // Check if blocked by obstacle
    const isBlocked = obstacles.some(obs => obs.x === x && obs.y === y);
    return !isBlocked;
}

/**
 * Get walkable neighbors of a cell
 * @param {number} x - Cell X coordinate
 * @param {number} y - Cell Y coordinate
 * @param {Array} grid - Grid array
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Array} obstacles - Array of obstacle positions {x, y}
 * @returns {Array} Array of neighbor positions {x, y}
 */
function getWalkableNeighbors(x, y, grid, width, height, obstacles) {
    const neighbors = [];
    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }   // right
    ];
    
    for (const dir of directions) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (isCellWalkable(nx, ny, grid, obstacles)) {
            neighbors.push({ x: nx, y: ny });
        }
    }
    
    return neighbors;
}

/**
 * Count total walkable cells in the grid
 * @param {Array} grid - Grid array
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @returns {number} Total count of walkable cells
 */
function countTotalWalkableCells(grid, width, height) {
    let count = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (grid[y] && grid[y][x] === 1) {
                count++;
            }
        }
    }
    return count;
}

/**
 * Validate map connectivity using BFS
 * @param {Array} grid - Grid array
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Array} obstacles - Array of obstacle positions {x, y}
 * @param {Object} playerStart - Player start position {x, y}
 * @returns {Object} { isConnected: boolean, reachableCount: number, totalWalkable: number }
 */
function validateMapConnectivity(grid, width, height, obstacles, playerStart) {
    if (!playerStart || grid[playerStart.y][playerStart.x] !== 1) {
        return { isConnected: false, reachableCount: 0, totalWalkable: 0 };
    }
    
    const totalWalkable = countTotalWalkableCells(grid, width, height);
    const totalObstacles = obstacles.length;
    const expectedReachable = totalWalkable - totalObstacles;
    
    // BFS from playerStart
    const queue = [{ x: playerStart.x, y: playerStart.y }];
    const visited = new Set();
    visited.add(`${playerStart.x},${playerStart.y}`);
    
    while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = getWalkableNeighbors(current.x, current.y, grid, width, height, obstacles);
        
        for (const neighbor of neighbors) {
            const key = `${neighbor.x},${neighbor.y}`;
            if (!visited.has(key)) {
                visited.add(key);
                queue.push(neighbor);
            }
        }
    }
    
    const reachableCount = visited.size;
    const isConnected = reachableCount === expectedReachable;
    
    return { isConnected, reachableCount, totalWalkable: expectedReachable };
}

/**
 * Check if a specific obstacle creates a dead-end
 * @param {Array} grid - Grid array
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Array} obstacles - Array of obstacle positions {x, y}
 * @param {Object} obstacleToCheck - Obstacle to check {x, y}
 * @param {Object} playerStart - Player start position {x, y}
 * @returns {boolean} True if obstacle creates a dead-end
 */
function checkObstacleCreatesDeadEnd(grid, width, height, obstacles, obstacleToCheck, playerStart) {
    // Create temporary obstacles list with the obstacle to check
    const tempObstacles = [...obstacles, obstacleToCheck];
    
    // Validate connectivity with this obstacle
    const validation = validateMapConnectivity(grid, width, height, tempObstacles, playerStart);
    
    // Compare with connectivity without this obstacle
    const validationWithout = validateMapConnectivity(grid, width, height, obstacles, playerStart);
    
    // If adding this obstacle reduces reachable cells, it creates a dead-end
    return validation.reachableCount < validationWithout.reachableCount;
}

/**
 * Generate obstacles (boxes) along paths
 * @param {Object} pathNetwork - Path network data
 * @param {Array} grid - Grid array
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Object} playerStart - Player start position {x, y}
 * @returns {Array} Array of obstacle positions
 */
function generatePathObstacles(pathNetwork, grid, width, height, playerStart) {
    const obstacles = [];
    const blockPercentMin = CONFIG.DUNGEON_CONFIG.blockCellsPercentMin || 5;
    const blockPercentMax = CONFIG.DUNGEON_CONFIG.blockCellsPercentMax || 15;
    
    // Calculate total path cells
    let totalPathCells = 0;
    pathNetwork.paths.forEach(path => {
        totalPathCells += path.cells.length;
    });
    
    // Add obstacles along paths (not at junctions)
    const obstaclePercent = blockPercentMin + Math.random() * (blockPercentMax - blockPercentMin);
    const obstacleCount = Math.floor(totalPathCells * (obstaclePercent / 100));
    
    const junctionPositions = new Set();
    pathNetwork.junctions.forEach(j => {
        junctionPositions.add(`${j.x},${j.y}`);
    });
    
    for (let i = 0; i < obstacleCount; i++) {
        // Pick a random path
        if (pathNetwork.paths.length === 0) break;
        
        const path = pathNetwork.paths[Math.floor(Math.random() * pathNetwork.paths.length)];
        if (path.cells.length < 3) continue; // Skip very short paths
        
        // Pick a random cell along the path (not first or last, and not at junction)
        const cellIndex = 1 + Math.floor(Math.random() * (path.cells.length - 2));
        const cell = path.cells[cellIndex];
        
        const cellKey = `${cell.x},${cell.y}`;
        if (!junctionPositions.has(cellKey)) {
            // Check if obstacle already exists at this position
            const alreadyExists = obstacles.some(obs => obs.x === cell.x && obs.y === cell.y);
            if (!alreadyExists && grid[cell.y] && grid[cell.y][cell.x] === 1) {
                obstacles.push({ x: cell.x, y: cell.y });
            }
        }
    }
    
    return obstacles;
}

/** Multi-cell decor templates: { w, h, assetId } */
const MULTI_CELL_DECOR_TEMPLATES = [
    { w: 2, h: 2, assetId: 'decor_2x2' },
    { w: 1, h: 2, assetId: 'decor_1x2' },
    { w: 2, h: 1, assetId: 'decor_2x1' }
];

/**
 * Place multi-cell unwalkable decor on path; mutates grid (sets cells to 0) and returns list of blocks.
 * @param {Array} grid - Grid array (0/1)
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Object} playerStart - { x, y }
 * @param {Array} junctions - Array of { x, y }
 * @returns {Array} multiCellDecors: [{ x, y, w, h, assetId }]
 */
function generateMultiCellDecors(grid, width, height, playerStart, junctions) {
    const multiCellDecors = [];
    const junctionSet = new Set((junctions || []).map(j => `${j.x},${j.y}`));
    const minBlocks = 2;
    const maxBlocks = 7;
    const count = minBlocks + Math.floor(Math.random() * (maxBlocks - minBlocks + 1));
    let placed = 0;
    let attempts = 0;
    const maxAttempts = 120;

    while (placed < count && attempts < maxAttempts) {
        attempts++;
        const template = MULTI_CELL_DECOR_TEMPLATES[Math.floor(Math.random() * MULTI_CELL_DECOR_TEMPLATES.length)];
        const w = template.w;
        const h = template.h;
        const x = Math.floor(Math.random() * (width - w + 1));
        const y = Math.floor(Math.random() * (height - h + 1));

        let valid = true;
        for (let dy = 0; dy < h && valid; dy++) {
            for (let dx = 0; dx < w && valid; dx++) {
                const gx = x + dx;
                const gy = y + dy;
                if (!grid[gy] || grid[gy][gx] !== 1) valid = false;
                const key = `${gx},${gy}`;
                if (junctionSet.has(key)) valid = false;
                if (playerStart && gx === playerStart.x && gy === playerStart.y) valid = false;
            }
        }
        if (!valid) continue;

        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                grid[y + dy][x + dx] = 0;
            }
        }
        multiCellDecors.push({ x, y, w, h, assetId: template.assetId });
        placed++;
    }

    return multiCellDecors;
}

/**
 * Assign themed zones to rooms/junctions (for compatibility)
 * @param {Array} rooms - Array of room objects
 */
function assignZoneThemes(rooms) {
    const zoneTypes = CONFIG.DUNGEON_CONFIG.zoneTypes;
    
    // Group rooms into clusters (simple: assign zones in order)
    rooms.forEach((room, index) => {
        const zoneIndex = Math.floor(index / Math.ceil(rooms.length / zoneTypes.length));
        room.zone = zoneTypes[Math.min(zoneIndex, zoneTypes.length - 1)];
    });
    
    // Randomize some zones for variety
    rooms.forEach(room => {
        if (Math.random() < 0.3) { // 30% chance to randomize
            room.zone = zoneTypes[Math.floor(Math.random() * zoneTypes.length)];
        }
    });
}

/**
 * Build 2D array areaThemes[y][x] = themeId (nearest junction's theme).
 * @param {Array} grid - Grid 0/1
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Array} junctions - Array of { x, y }
 * @returns {Array} areaThemes[y][x] = themeId string
 */
function buildAreaThemesGrid(grid, width, height, junctions) {
    const themeIds = CONFIG.DUNGEON_CONFIG.areaThemeIds || ['greenland', 'freljord', 'hot_sand', 'sakura', 'island'];
    const defaultTheme = themeIds[0];
    const junctionThemes = (junctions || []).map((_, i) => themeIds[i % themeIds.length]);
    
    const areaThemes = [];
    for (let y = 0; y < height; y++) {
        areaThemes[y] = [];
        for (let x = 0; x < width; x++) {
            if (!junctions || junctions.length === 0) {
                areaThemes[y][x] = defaultTheme;
                continue;
            }
            let best = 0;
            let bestDist = Infinity;
            for (let j = 0; j < junctions.length; j++) {
                const dx = x - junctions[j].x;
                const dy = y - junctions[j].y;
                const dist = Math.abs(dx) + Math.abs(dy);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = j;
                }
            }
            areaThemes[y][x] = junctionThemes[best];
        }
    }
    return areaThemes;
}

/**
 * Place entities (enemies, items, special grids) along paths and at junctions
 * @param {Object} dungeon - Dungeon data from generateDungeon
 * @param {Object} levelConfig - Level configuration for spawn rates
 * @returns {Object} Entity placement data: { enemies, items, specialGrids, princess, portal }
 */
function placeEntities(dungeon, levelConfig) {
    const { pathNetwork, grid, rooms, playerStart } = dungeon;
    const entities = {
        enemies: [],
        items: [],
        specialGrids: [],
        princess: null,
        portal: null
    };
    
    // Room obstacles (box) — tạm tắt gen box
    // if (dungeon.roomObstacles) {
    //     dungeon.roomObstacles.forEach(obstacle => {
    //         if (grid[obstacle.y] && grid[obstacle.y][obstacle.x] === 1) {
    //             entities.specialGrids.push({ x: obstacle.x, y: obstacle.y, type: 'box' });
    //         }
    //     });
    // }
    
    // Calculate total path cells for spawn density
    let totalPathCells = 0;
    if (pathNetwork && pathNetwork.paths) {
        pathNetwork.paths.forEach(path => {
            totalPathCells += path.cells.length;
        });
    } else {
        // Fallback: count floor cells
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x] === 1) totalPathCells++;
            }
        }
    }
    
    // Enemy count from level config or default
    const enemyCount = levelConfig?.enemyCount || Math.floor(totalPathCells / 15);
    const itemCount = levelConfig?.itemCount || Math.floor(totalPathCells / 20);
    const specialGridCount = levelConfig?.specialGridCount || Math.floor(totalPathCells / 25);
    
    // Create junction positions set for quick lookup
    const junctionPositions = new Set();
    if (pathNetwork && pathNetwork.junctions) {
        pathNetwork.junctions.forEach(j => {
            junctionPositions.add(`${j.x},${j.y}`);
        });
    }
    
    // Helper function to calculate distance from player spawn
    const getDistanceFromSpawn = (x, y) => {
        if (!playerStart) return Infinity;
        return Math.abs(x - playerStart.x) + Math.abs(y - playerStart.y);
    };
    
    // Spawn safe zone radius (no strong enemies within this distance)
    const spawnSafeRadius = 10;
    
    // --- Place POIs first so we can avoid them for enemies and player start ---
    const poiConfig = CONFIG.POI_CONFIG;
    const isPositionAvailableForPOI = (x, y) => {
        if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) return false;
        if (grid[y][x] !== 1) return false;
        if (playerStart && x === playerStart.x && y === playerStart.y) return false;
        return !entities.specialGrids.some(sg => sg.x === x && sg.y === y);
    };
    const availablePositionsForPOI = [];
    if (pathNetwork && pathNetwork.paths) {
        pathNetwork.paths.forEach(path => {
            path.cells.forEach(cell => {
                if (isPositionAvailableForPOI(cell.x, cell.y)) availablePositionsForPOI.push({ x: cell.x, y: cell.y });
            });
        });
    }
    const shuffledPOIPositions = [...availablePositionsForPOI].sort(() => Math.random() - 0.5);
    for (const junction of (pathNetwork?.junctions || [])) {
        if (isPositionAvailableForPOI(junction.x, junction.y)) {
            if (Math.random() < 0.5) {
                entities.specialGrids.push({ x: junction.x, y: junction.y, type: 'shop' });
            } else if (Math.random() < 0.5) {
                entities.specialGrids.push({ x: junction.x, y: junction.y, type: 'healer' });
            }
        }
    }
    const shopCount = Math.floor(Math.random() * (poiConfig.shop.spawnCountMax - poiConfig.shop.spawnCountMin + 1)) + poiConfig.shop.spawnCountMin;
    let shopsPlaced = entities.specialGrids.filter(sg => sg.type === 'shop').length;
    for (const pos of shuffledPOIPositions) {
        if (shopsPlaced >= shopCount) break;
        if (isPositionAvailableForPOI(pos.x, pos.y) && !junctionPositions.has(`${pos.x},${pos.y}`)) {
            entities.specialGrids.push({ x: pos.x, y: pos.y, type: 'shop' });
            shopsPlaced++;
        }
    }
    const statCheckCount = Math.floor(Math.random() * (poiConfig.stat_check.spawnCountMax - poiConfig.stat_check.spawnCountMin + 1)) + poiConfig.stat_check.spawnCountMin;
    let statChecksPlaced = 0;
    for (const pos of shuffledPOIPositions) {
        if (statChecksPlaced >= statCheckCount) break;
        if (isPositionAvailableForPOI(pos.x, pos.y)) {
            entities.specialGrids.push({ x: pos.x, y: pos.y, type: 'stat_check' });
            statChecksPlaced++;
        }
    }
    const healerCount = Math.floor(Math.random() * (poiConfig.healer.spawnCountMax - poiConfig.healer.spawnCountMin + 1)) + poiConfig.healer.spawnCountMin;
    let healersPlaced = entities.specialGrids.filter(sg => sg.type === 'healer').length;
    for (const pos of shuffledPOIPositions) {
        if (healersPlaced >= healerCount) break;
        if (isPositionAvailableForPOI(pos.x, pos.y)) {
            entities.specialGrids.push({ x: pos.x, y: pos.y, type: 'healer' });
            healersPlaced++;
        }
    }
    const isPOICell = (x, y) => entities.specialGrids.some(sg => sg.x === x && sg.y === y && (sg.type === 'shop' || sg.type === 'stat_check' || sg.type === 'healer'));
    
    // Place enemies along paths and at junctions (do not spawn on POI cells)
    let enemiesPlaced = 0;
    const enemyPerRoomMin = CONFIG.DUNGEON_CONFIG.enemyPerRoomMin || 1;
    const enemyPerRoomMax = CONFIG.DUNGEON_CONFIG.enemyPerRoomMax || 4;
    
    // Place enemies at junctions first
    if (pathNetwork && pathNetwork.junctions) {
        for (const junction of pathNetwork.junctions) {
            if (enemiesPlaced >= enemyCount) break;
            
            // Check distance from spawn - reduce enemy count near spawn
            const distanceFromSpawn = getDistanceFromSpawn(junction.x, junction.y);
            let enemiesAtJunction = Math.floor(Math.random() * (enemyPerRoomMax - enemyPerRoomMin + 1)) + enemyPerRoomMin;
            
            // Reduce enemies near spawn area
            if (distanceFromSpawn < spawnSafeRadius) {
                // Only 0-1 enemy near spawn, and only weak ones
                enemiesAtJunction = Math.random() < 0.3 ? 1 : 0;
            }
            
            for (let i = 0; i < enemiesAtJunction && enemiesPlaced < enemyCount; i++) {
                // Place near junction (within 2 cells)
                const offsetX = Math.floor(Math.random() * 5) - 2;
                const offsetY = Math.floor(Math.random() * 5) - 2;
                const x = junction.x + offsetX;
                const y = junction.y + offsetY;
                
                if (grid[y] && grid[y][x] === 1) {
                    const hasEnemy = entities.enemies.some(e => e.x === x && e.y === y);
                    const hasBox = entities.specialGrids.some(sg => sg.x === x && sg.y === y && sg.type === 'box');
                    if (isPOICell(x, y)) continue;
                    if (!hasEnemy && !hasBox) {
                        // Determine enemy value based on distance from spawn
                        const enemyDistance = getDistanceFromSpawn(x, y);
                        let enemyValue;
                        if (enemyDistance < spawnSafeRadius) {
                            enemyValue = 1;
                        } else {
                            enemyValue = Math.random() < 0.7 ? 1 : (Math.random() < 0.5 ? 3 : 5);
                        }
                        const enemyType = findEnemyTypeByValue(enemyValue);
                        entities.enemies.push({
                            x,
                            y,
                            type: enemyType.name,
                            value: enemyValue,
                            emoji: enemyType.emoji
                        });
                        enemiesPlaced++;
                    }
                }
            }
        }
    }
    
    // Place remaining enemies along paths
    if (pathNetwork && pathNetwork.paths) {
        for (const path of pathNetwork.paths) {
            if (enemiesPlaced >= enemyCount) break;
            
            // Place enemies along path (skip first and last cells - junctions)
            for (let i = 1; i < path.cells.length - 1 && enemiesPlaced < enemyCount; i++) {
                const cell = path.cells[i];
                const cellKey = `${cell.x},${cell.y}`;
                
                // Check distance from spawn
                const enemyDistance = getDistanceFromSpawn(cell.x, cell.y);
                
                // Reduce spawn chance near spawn area
                let spawnChance = 0.3; // 30% chance per cell
                if (enemyDistance < spawnSafeRadius) {
                    spawnChance = 0.05; // Only 5% chance near spawn
                }
                
                if (Math.random() < spawnChance) {
                    if (!junctionPositions.has(cellKey) && grid[cell.y] && grid[cell.y][cell.x] === 1 && !isPOICell(cell.x, cell.y)) {
                        const hasEnemy = entities.enemies.some(e => e.x === cell.x && e.y === cell.y);
                        const hasBox = entities.specialGrids.some(sg => sg.x === cell.x && sg.y === cell.y && sg.type === 'box');
                        if (!hasEnemy && !hasBox) {
                            let enemyValue;
                            if (enemyDistance < spawnSafeRadius) {
                                enemyValue = 1;
                            } else {
                                enemyValue = Math.random() < 0.8 ? 1 : (Math.random() < 0.5 ? 3 : 5);
                            }
                            const enemyType = findEnemyTypeByValue(enemyValue);
                            entities.enemies.push({
                                x: cell.x,
                                y: cell.y,
                                type: enemyType.name,
                                value: enemyValue,
                                emoji: enemyType.emoji
                            });
                            enemiesPlaced++;
                        }
                    }
                }
            }
        }
    }
    
    // Place items along paths
    let itemsPlaced = 0;
    if (pathNetwork && pathNetwork.paths) {
        for (const path of pathNetwork.paths) {
            if (itemsPlaced >= itemCount) break;
            
            for (let i = 0; i < path.cells.length && itemsPlaced < itemCount; i++) {
                if (Math.random() < 0.15) { // 15% chance per cell
                    const cell = path.cells[i];
                    
                    if (grid[cell.y] && grid[cell.y][cell.x] === 1 && !isPOICell(cell.x, cell.y)) {
                        const hasEnemy = entities.enemies.some(e => e.x === cell.x && e.y === cell.y);
                        const hasBox = entities.specialGrids.some(sg => sg.x === cell.x && sg.y === cell.y && sg.type === 'box');
                        if (!hasEnemy && !hasBox) {
                            const itemValue = Math.random() < 0.7 ? 1 : 2;
                            const itemType = findItemTypeByValue(itemValue);
                            entities.items.push({
                                x: cell.x,
                                y: cell.y,
                                type: itemType.name,
                                value: itemValue,
                                emoji: itemType.emoji
                            });
                            itemsPlaced++;
                        }
                    }
                }
            }
        }
    }
    
    // Place special grids along paths
    let specialGridsPlaced = 0;
    if (pathNetwork && pathNetwork.paths) {
        for (const path of pathNetwork.paths) {
            if (specialGridsPlaced >= specialGridCount) break;
            
            for (let i = 0; i < path.cells.length && specialGridsPlaced < specialGridCount; i++) {
                if (Math.random() < 0.1) { // 10% chance per cell
                    const cell = path.cells[i];
                    const cellKey = `${cell.x},${cell.y}`;
                    
                    if (!junctionPositions.has(cellKey) && grid[cell.y] && grid[cell.y][cell.x] === 1) {
                        const hasEnemy = entities.enemies.some(e => e.x === cell.x && e.y === cell.y);
                        const hasItem = entities.items.some(it => it.x === cell.x && it.y === cell.y);
                        const hasBox = entities.specialGrids.some(sg => sg.x === cell.x && sg.y === cell.y && sg.type === 'box');
                        
                        if (!hasEnemy && !hasItem && !hasBox) {
                            let gridType = null;
                            // Lava/swamp tạm tắt — chỉ gen canon
                            if (Math.random() < 0.2) {
                                gridType = 'canon';
                            }
                            if (gridType) {
                                entities.specialGrids.push({ x: cell.x, y: cell.y, type: gridType });
                                specialGridsPlaced++;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Place princess at farthest junction
    if (pathNetwork && pathNetwork.junctions && pathNetwork.junctions.length > 0) {
        const startJunction = pathNetwork.junctions[0];
        let farthestJunction = pathNetwork.junctions[0];
        let maxDistance = 0;
        
        pathNetwork.junctions.forEach(junction => {
            const distance = Math.abs(junction.x - startJunction.x) + 
                           Math.abs(junction.y - startJunction.y);
            if (distance > maxDistance) {
                maxDistance = distance;
                farthestJunction = junction;
            }
        });
        
        entities.princess = { 
            x: farthestJunction.x, 
            y: farthestJunction.y 
        };
    }
    
    // Portal will be spawned after princess is rescued (handled in game.js)
    
    return entities;
}
