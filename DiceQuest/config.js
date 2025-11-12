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


