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
            goldReward: 1, // Giữ nguyên
            color: '#e74c3c',
            emoji: '👹'
        },
        fast: {
            health: 1,
            speed: 1,
            damage: 10,
            goldReward: 1, // Giảm từ 2 xuống 1
            color: '#f39c12',
            emoji: '👻'
        },
        tank: {
            health: 5,
            speed: 0.5,
            damage: 15,
            goldReward: 2, // Giảm từ 5 xuống 2
            color: '#8e44ad',
            emoji: '👾'
        },
        boss: {
            health: 20,
            speed: 1,
            damage: 25,
            goldReward: 5, // Giảm từ 20 xuống 5
            color: '#c0392b',
            emoji: '🐉'
        }
    },
    
    // Get enemy stats với scaling theo wave
    getEnemyStats: function(waveNumber, enemyType = 'basic') {
        const type = this.types[enemyType];
        
        // Scaling formulas cho HARDCORE difficulty - Tăng mạnh hơn
        const healthMultiplier = 1 + (waveNumber - 1) * 0.5; // 50% increase per wave
        const damageMultiplier = 1 + (waveNumber - 1) * 0.4; // 40% increase per wave
        const goldMultiplier = 1 + (waveNumber - 1) * 0.1; // 10% increase per wave (ít gold hơn)
        
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
