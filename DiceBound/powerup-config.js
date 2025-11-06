// Power-up Configuration for DiceBound
// Định nghĩa các power-up có thể mua sau mỗi level

const POWERUP_CONFIG = {
    // Power-up types với các thuộc tính khác nhau
    types: {
        // Dice Roll Upgrades
        'min_roll_boost': {
            name: 'Min Roll Boost',
            description: 'Tăng minimum dice roll +1',
            diceRequired: 2,
            category: 'dice',
            effect: 'increase_min_roll',
            value: 1
        },
        'max_roll_boost': {
            name: 'Max Roll Boost',
            description: 'Tăng maximum dice roll +1',
            diceRequired: 2,
            category: 'dice',
            effect: 'increase_max_roll',
            value: 1
        },
        
        // Starting Value Upgrades
        'start_value_boost': {
            name: 'Start Value Boost',
            description: '+1 Base Power trong run',
            diceRequired: 3,
            category: 'value',
            effect: 'increase_start_value',
            value: 1
        },
        'double_start_value': {
            name: 'Double Start Value',
            description: '+2 Base Power trong run',
            diceRequired: 5,
            category: 'value',
            effect: 'increase_start_value',
            value: 2
        }
    },
    
    // Get random power-ups for upgrade phase
    getRandomPowerups: function(count = 3) {
        const powerupKeys = Object.keys(this.types);
        const shuffled = powerupKeys.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(key => ({
            id: key,
            ...this.types[key]
        }));
    },
    
    // Get power-up by ID
    getPowerup: function(powerupId) {
        return this.types[powerupId] || null;
    },
    
    // Check if player can afford power-up
    canAfford: function(powerupId, resources) {
        const powerup = this.getPowerup(powerupId);
        return powerup && resources >= powerup.diceRequired;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = POWERUP_CONFIG;
}

