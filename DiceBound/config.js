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

    // Item types - only differ by value
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
    DICE_SIDES: 6 // 1D6

    // Level configurations are now in level-design.js
    // LEVELS will be attached from LEVEL_DESIGN.LEVELS after level-design.js loads
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


