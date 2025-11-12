// Power-up Configuration for DiceQuest
// Định nghĩa các power-up có thể mua sau mỗi level

const POWERUP_CONFIG = {
    // Power-up types với các thuộc tính khác nhau
    types: {        
        // Stat Boost Power-ups 
        'hp_heal_1': {
            name: 'Minor Heal Potion',
            description: 'Heal +1 HP',
            diceRequired: 2,
            category: 'stat',
            effect: 'heal_hp_1',
            value: 1
        },
        'hp_heal_2': {
            name: 'Heal Potion',
            description: 'Heal +2 HP',
            diceRequired: 4,
            category: 'stat',
            effect: 'heal_hp_2',
            value: 2
        },
        'dmg_min_boost': {
            name: 'Sharpening Stone',
            description: '+1 Minimum Damage',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_dmg_min',
            value: 1
        },
        'dmg_max_boost': {
            name: 'Weapon Enhancement',
            description: '+1 Maximum Damage',
            diceRequired: 3,
            category: 'stat',
            effect: 'increase_dmg_max',
            value: 1
        },
        'spd_min_boost': {
            name: 'Agility Elixir',
            description: '+1 Minimum Speed',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_spd_min',
            value: 1
        },
        'spd_max_boost': {
            name: 'Speed Potion',
            description: '+1 Maximum Speed',
            diceRequired: 4,
            category: 'stat',
            effect: 'increase_spd_max',
            value: 1
        },
        'int_min_boost': {
            name: 'Wisdom Scroll',
            description: '+1 Minimum Intelligence',
            diceRequired: 2,
            category: 'stat',
            effect: 'increase_int_min',
            value: 1
        },
        'int_max_boost': {
            name: 'Intelligence Tome',
            description: '+1 Maximum Intelligence',
            diceRequired: 4,
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

