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
        
        // Stat Boost Power-ups
        'hp_boost': {
            name: 'HP Boost',
            description: '+1 Max HP',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_hp',
            value: 1
        },
        'hp_heal': {
            name: 'HP Heal',
            description: 'Heal HP to full',
            diceRequired: 2,
            category: 'stat',
            effect: 'heal_hp_full',
            value: 0
        },
        'dmg_min_boost': {
            name: 'DMG Min Boost',
            description: '+1 Minimum Damage',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_dmg_min',
            value: 1
        },
        'dmg_max_boost': {
            name: 'DMG Max Boost',
            description: '+1 Maximum Damage',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_dmg_max',
            value: 1
        },
        'spd_min_boost': {
            name: 'SPD Min Boost',
            description: '+1 Minimum Speed',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_spd_min',
            value: 1
        },
        'spd_max_boost': {
            name: 'SPD Max Boost',
            description: '+1 Maximum Speed',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_spd_max',
            value: 1
        },
        'int_min_boost': {
            name: 'INT Min Boost',
            description: '+1 Minimum Intelligence',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_int_min',
            value: 1
        },
        'int_max_boost': {
            name: 'INT Max Boost',
            description: '+1 Maximum Intelligence',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_int_max',
            value: 1
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

