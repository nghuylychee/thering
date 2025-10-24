// Enemy Configuration
// Định nghĩa các thuộc tính cơ bản của enemy và gold reward

const ENEMY_CONFIG = {
    // Enemy types (có thể mở rộng sau)
    // goldReward: Lượng gold nhận được khi tiêu diệt enemy (có thể điều chỉnh)
    types: {
        basic: {
            health: 1,
            speed: 0.5,
            damage: 10,
            goldReward: 1,
            color: '#e74c3c',
            emoji: '👹'
        },
        fast: {
            health: 1,
            speed: 1,
            damage: 10,
            goldReward: 2,
            color: '#f39c12',
            emoji: '👻'
        },
        tank: {
            health: 5,
            speed: 0.5,
            damage: 15,
            goldReward: 5,
            color: '#8e44ad',
            emoji: '👾'
        },
        boss: {
            health: 20,
            speed: 1,
            damage: 25,
            goldReward: 20,
            color: '#c0392b',
            emoji: '🐉'
        }
    },
    
    // Get enemy stats với scaling theo wave
    getEnemyStats: function(waveNumber, enemyType = 'basic') {
        const type = this.types[enemyType];
        
        // Scaling formulas cho hardcore difficulty
        const healthMultiplier = 1 + (waveNumber - 1) * 0.3; // 30% increase per wave
        const damageMultiplier = 1 + (waveNumber - 1) * 0.2; // 20% increase per wave
        const goldMultiplier = 1 + (waveNumber - 1) * 0.15; // 15% increase per wave
        
        return {
            health: Math.max(1, Math.floor(type.health * healthMultiplier)),
            speed: type.speed, // Speed không scale để giữ gameplay balance
            damage: Math.max(1, Math.floor(type.damage * damageMultiplier)),
            goldReward: Math.max(1, Math.floor(type.goldReward * goldMultiplier)),
            color: type.color,
            emoji: type.emoji
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENEMY_CONFIG;
}
