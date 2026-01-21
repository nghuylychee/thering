// DiceBound Configuration

const CONFIG = {
    // Grid size
    GRID_W: 8,
    GRID_H: 10,

    // Player
    PLAYER_START_VALUE: 2,

    // Enemy types - D&D Monster Theme
    ENEMY_TYPES: [
        { name: 'Giant Rat', value: 1, emoji: '🐀' },
        { name: 'Goblin', value: 3, emoji: '👺' },
        { name: 'Orc', value: 5, emoji: '👹' },
        { name: 'Dragon', value: 8, emoji: '🐉' }
    ],

    // Item types - D&D Treasure Theme
    ITEM_TYPES: [
        { name: 'Small Gem', value: 1, emoji: '💎' },
        { name: 'Treasure Ring', value: 2, emoji: '💍' },
        { name: 'Enchanted Blade', value: 3, emoji: '⚔️' },
        { name: 'Royal Crown', value: 5, emoji: '👑' }
    ],

    // Special Grid Types - D&D Dungeon Hazards
    SPECIAL_GRID_TYPES: {
        'box': {
            name: 'Barrel',
            emoji: '🧱',
            type: 'obstacle',
            walkable: false
        },
        'lava': {
            name: 'Fire Pit',
            emoji: '🔥',
            type: 'damage',
            damage: 1,
            value: -1,
            walkable: true
        },
        'swamp': {
            name: 'Poison Pool',
            emoji: '🌊',
            type: 'trap',
            damage: 2,
            value: -2,
            trapChance: 0.5, // 50% chance to get trapped
            walkable: true
        },
        'canon': {
            name: 'Teleport Rune',
            emoji: '⚡',
            type: 'teleport',
            walkable: true
        }
    },

    // Dice
    DICE_SIDES: 6, // 1D6

    // Level configurations are now in level-design.js
    // LEVELS will be attached from LEVEL_DESIGN.LEVELS after level-design.js loads
    
    // Procedural Dungeon Generation Config
    DUNGEON_CONFIG: {
        mapWidth: 50,
        mapHeight: 50,
        roomCountMin: 8,
        roomCountMax: 15,
        minRoomSize: 8,
        maxRoomSize: 20,
        corridorWidth: 1,
        zoneTypes: ['lava', 'swamp', 'treasure', 'combat', 'mixed'],
        // Enemy spawn per room
        enemyPerRoomMin: 1,  // Minimum enemies per room
        enemyPerRoomMax: 4,  // Maximum enemies per room
        // Room clustering (for better proximity)
        maxClusterDistance: 8,  // Max distance between rooms in a cluster
        // Block cells (obstacles) in rooms
        blockCellsPercentMin: 5,  // Minimum percentage of room area for obstacles (5%)
        blockCellsPercentMax: 15, // Maximum percentage of room area for obstacles (15%)
        minRoomAreaForBlocks: 20,  // Minimum room area to add obstacles
        // Path network density
        extraPathsPercent: 100,  // Percentage of junctions to create extra paths (60%)
        maxPathDistance: 30,    // Maximum distance for extra paths (30 cells)
        randomPathsCount: 50,   // Number of random paths to fill empty space
        clearingRadius: 3,      // Radius of open area around junctions (3 cells)
        // Additional path connections
        emptyAreaConnections: 80,  // Number of empty areas to connect to paths
        pathPointConnections: 40,  // Number of connections between existing path points
        meshConnections: true,     // Enable mesh network (connect path midpoints)
        meshConnectionChance: 100, // Chance to connect nearby path midpoints (0.3 = 30%)
        meshMaxDistance: 4        // Max distance for mesh connections (12 cells)
    },
    
    // Day/Night Cycle Config
    DAY_NIGHT_CONFIG: {
        daysPerWeek: 3,
        nightsPerWeek: 3,
        maxDayTurns: 5,
        maxNightTurns: 5,
        dayVisionRadius: 5,
        nightVisionRadius: 3
    },
    
    // Boss System Config
    BOSS_CONFIG: {
        bossesPerRun: 3,              // Number of bosses in a run
        spawnAfterWeeks: 1,           // Boss spawns after N weeks
        baseBossValue: 8,              // Base boss value (Dragon level)
        bossScalingFactor: 1.5,       // Boss strength multiplier per boss
        bossHPMultiplier: 5,           // Boss HP = value * multiplier
        bossDamageMultiplier: 1.2,     // Boss damage multiplier
        bossSpeedMultiplier: 1.1       // Boss speed multiplier
    }
};

// Get Level Config
function getLevelConfig(levelNumber) {
    // Use LEVEL_DESIGN.LEVELS if available, otherwise fallback to CONFIG.LEVELS
    const levels = (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) 
        ? LEVEL_DESIGN.LEVELS 
        : (CONFIG.LEVELS || []);
    
    const level = levels.find(l => l.level === levelNumber);
    return level || levels[levels.length - 1]; // Return last level if not found
}


