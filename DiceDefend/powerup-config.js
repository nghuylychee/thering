// Power-up Configuration
// Định nghĩa các power-up có thể mua sau mỗi wave

const POWERUP_CONFIG = {
    // Power-up types với các thuộc tính khác nhau
    types: {
        // Dice Upgrades
        'dice_upgrade': {
            name: 'Dice Upgrade',
            description: 'Upgrade một dice hiện có lên loại cao hơn',
            diceRequired: 2,
            category: 'dice',
            effect: 'upgrade_dice'
        },
        'new_dice': {
            name: 'New Dice',
            description: 'Thêm một dice D2 mới vào slot trống',
            diceRequired: 3,
            category: 'dice',
            effect: 'add_dice'
        },
        
        // Damage Upgrades
        'damage_boost': {
            name: 'Damage Boost',
            description: 'Tăng damage của tất cả bullets +1',
            diceRequired: 2,
            category: 'damage',
            effect: 'increase_damage',
            value: 1
        },
        'critical_hit': {
            name: 'Critical Hit',
            description: '10% chance bullets gây double damage',
            diceRequired: 4,
            category: 'damage',
            effect: 'critical_chance',
            value: 0.1
        },
        
        // Speed Upgrades
        'bullet_speed': {
            name: 'Bullet Speed',
            description: 'Tăng tốc độ bullets +0.5',
            diceRequired: 2,
            category: 'speed',
            effect: 'increase_bullet_speed',
            value: 0.5
        },
        'cooldown_reduction': {
            name: 'Cooldown Reduction',
            description: 'Giảm cooldown của tất cả dice -20%',
            diceRequired: 3,
            category: 'speed',
            effect: 'reduce_cooldown',
            value: 0.2
        },
        
        // Defense Upgrades
        'castle_heal': {
            name: 'Castle Heal',
            description: 'Hồi phục 50 HP cho castle',
            diceRequired: 2,
            category: 'defense',
            effect: 'heal_castle',
            value: 50
        },
        'castle_shield': {
            name: 'Castle Shield',
            description: 'Giảm damage nhận vào -25%',
            diceRequired: 4,
            category: 'defense',
            effect: 'damage_reduction',
            value: 0.25
        },
        
        // Special Upgrades
        'multi_shot': {
            name: 'Multi Shot',
            description: 'Mỗi dice bắn thêm 1 bullet',
            diceRequired: 5,
            category: 'special',
            effect: 'multi_shot',
            value: 1
        },
        'piercing': {
            name: 'Piercing',
            description: 'Bullets có thể xuyên qua enemy',
            diceRequired: 6,
            category: 'special',
            effect: 'piercing'
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
