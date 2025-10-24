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
    
    // Get enemy stats (không thay đổi theo wave)
    getEnemyStats: function(waveNumber, enemyType = 'basic') {
        const type = this.types[enemyType];
        
        return {
            health: type.health,
            speed: type.speed,
            damage: type.damage,
            goldReward: type.goldReward,
            color: type.color,
            emoji: type.emoji
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENEMY_CONFIG;
}
