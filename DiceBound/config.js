// DiceBound Configuration

const CONFIG = {
    // Grid size
    GRID_W: 8,
    GRID_H: 10,

    // Player
    PLAYER_START_VALUE: 2,

    // Enemy types
    ENEMY_TYPES: [
        { name: 'Weak', value: 1, emoji: '👺' },
        { name: 'Normal', value: 3, emoji: '😈' },
        { name: 'Strong', value: 5, emoji: '👹' },
        { name: 'Boss', value: 8, emoji: '👑' }
    ],

    // Item types
    ITEM_TYPES: [
        { name: 'Small', value: 1, emoji: '⭐' },
        { name: 'Medium', value: 2, emoji: '💎' },
        { name: 'Large', value: 3, emoji: '💠' },
        { name: 'Huge', value: 5, emoji: '👑' }
    ],

    // Special Grid Types
    SPECIAL_GRID_TYPES: {
        'box': {
            name: 'Box',
            emoji: '📦',
            type: 'obstacle',
            walkable: false
        },
        'lava': {
            name: 'Lava',
            emoji: '🌋',
            type: 'damage',
            damage: 1,
            value: -1,
            walkable: true
        },
        'swamp': {
            name: 'Swamp',
            emoji: '🪵',
            type: 'trap',
            damage: 2,
            value: -2,
            trapChance: 0.5, // 50% chance to get trapped
            walkable: true
        },
        'canon': {
            name: 'Canon',
            emoji: '💣',
            type: 'teleport',
            walkable: true
        }
    },

    // Dice
    DICE_SIDES: 6, // 1D6

    // Level Configurations (10 levels with increasing difficulty)
    LEVELS: [
        {
            level: 1,
            name: 'Tutorial',
            enemyCount: 2,
            enemyDistribution: { 'Weak': 100 }, // 100% Weak
            itemCount: 6,
            playerStartValue: 2,
            description: 'Learn the basics',
            specialGridCount: 0, // No special grids for tutorial
            specialGridTypes: []
        },
        {
            level: 2,
            name: 'Easy Start',
            enemyCount: 3,
            enemyDistribution: { 'Weak': 80, 'Normal': 20 },
            itemCount: 5,
            playerStartValue: 2,
            description: 'Simple enemies',
            specialGridCount: 3, // Add some special grids
            specialGridTypes: ['box', 'lava', 'swamp']
        },
        {
            level: 3,
            name: 'Getting Serious',
            enemyCount: 3,
            enemyDistribution: { 'Weak': 50, 'Normal': 50 },
            itemCount: 5,
            playerStartValue: 2,
            description: 'More balanced',
            specialGridCount: 4,
            specialGridTypes: ['box', 'lava', 'swamp']
        },
        {
            level: 4,
            name: 'Rising Challenge',
            enemyCount: 4,
            enemyDistribution: { 'Weak': 30, 'Normal': 70 },
            itemCount: 4,
            playerStartValue: 2,
            description: 'Stronger foes',
            specialGridCount: 5,
            specialGridTypes: ['box', 'lava', 'swamp']
        },
        {
            level: 5,
            name: 'Mid Boss',
            enemyCount: 4,
            enemyDistribution: { 'Normal': 60, 'Strong': 40 },
            itemCount: 4,
            playerStartValue: 2,
            description: 'First challenge',
            specialGridCount: 6,
            specialGridTypes: ['box', 'lava', 'swamp', 'canon']
        },
        {
            level: 6,
            name: 'Hard Mode',
            enemyCount: 5,
            enemyDistribution: { 'Normal': 50, 'Strong': 50 },
            itemCount: 3,
            playerStartValue: 2,
            description: 'Difficulty spike',
            specialGridCount: 7,
            specialGridTypes: ['box', 'lava', 'swamp', 'canon']
        },
        {
            level: 7,
            name: 'Elite',
            enemyCount: 5,
            enemyDistribution: { 'Normal': 30, 'Strong': 70 },
            itemCount: 3,
            playerStartValue: 2,
            description: 'Elite enemies',
            specialGridCount: 8,
            specialGridTypes: ['box', 'lava', 'swamp', 'canon']
        },
        {
            level: 8,
            name: 'Boss Rush',
            enemyCount: 4,
            enemyDistribution: { 'Strong': 60, 'Boss': 40 },
            itemCount: 2,
            playerStartValue: 2,
            description: 'Bosses appear',
            specialGridCount: 9,
            specialGridTypes: ['box', 'lava', 'swamp', 'canon']
        },
        {
            level: 9,
            name: 'Nightmare',
            enemyCount: 6,
            enemyDistribution: { 'Strong': 50, 'Boss': 50 },
            itemCount: 2,
            playerStartValue: 2,
            description: 'Extreme challenge',
            specialGridCount: 10,
            specialGridTypes: ['box', 'lava', 'swamp', 'canon']
        },
        {
            level: 10,
            name: 'Final Boss',
            enemyCount: 5,
            enemyDistribution: { 'Boss': 100 },
            itemCount: 1,
            playerStartValue: 2,
            description: 'The ultimate test',
            specialGridCount: 12,
            specialGridTypes: ['box', 'lava', 'swamp', 'canon']
        }
    ]
};

// Get Level Config
function getLevelConfig(levelNumber) {
    const level = CONFIG.LEVELS.find(l => l.level === levelNumber);
    return level || CONFIG.LEVELS[CONFIG.LEVELS.length - 1]; // Return last level if not found
}


