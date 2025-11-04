// DiceBound Configuration

const CONFIG = {
    // Grid size
    GRID_W: 8,
    GRID_H: 10,

    // Entity counts
    ENEMY_COUNT: 3,
    ITEM_COUNT: 5,

    // Player
    PLAYER_START_VALUE: 2,

    // Enemy types
    ENEMY_TYPES: [
        { name: 'Weak', value: 1, emoji: '👹' },
        { name: 'Normal', value: 3, emoji: '👹' },
        { name: 'Strong', value: 5, emoji: '👹' },
        { name: 'Boss', value: 8, emoji: '👹' }
    ],

    // Item types
    ITEM_TYPES: [
        { name: 'Small', value: 1, emoji: '💎' },
        { name: 'Medium', value: 2, emoji: '💎' },
        { name: 'Large', value: 3, emoji: '💎' },
        { name: 'Huge', value: 5, emoji: '💎' }
    ],

    // Dice
    DICE_SIDES: 6, // 1D6
};

