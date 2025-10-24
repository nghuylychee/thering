// Enemy Configuration
// Định nghĩa các thuộc tính cơ bản của enemy

const ENEMY_CONFIG = {
    // Enemy types (có thể mở rộng sau)
    types: {
        basic: {
            health: 1,
            speed: 1,
            damage: 10,
            color: '#e74c3c',
            emoji: '👹'
        },
        fast: {
            health: 1,
            speed: 2,
            damage: 8,
            color: '#f39c12',
            emoji: '👻'
        },
        tank: {
            health: 10,
            speed: 1,
            damage: 15,
            color: '#8e44ad',
            emoji: '👾'
        },
        boss: {
            health: 20,
            speed: 1,
            damage: 25,
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
            color: type.color,
            emoji: type.emoji
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENEMY_CONFIG;
}
