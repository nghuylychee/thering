// Enemy Configuration
// Định nghĩa các thuộc tính cơ bản của enemy

const ENEMY_CONFIG = {
    // Base enemy stats
    baseHealth: 1,
    baseSpeed: 0.5,
    baseDamage: 10,
    
    // Enemy scaling per wave
    healthScaling: 0.2,    // Mỗi wave tăng 0.2 health
    speedScaling: 0.1,     // Mỗi wave tăng 0.1 speed
    damageScaling: 2,      // Mỗi wave tăng 2 damage
    
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
    
    // Calculate enemy stats based on wave
    getEnemyStats: function(waveNumber, enemyType = 'basic') {
        const type = this.types[enemyType];
        const waveMultiplier = Math.floor(waveNumber / 5); // Mỗi 5 wave tăng difficulty
        
        // Calculate base speed with scaling
        const baseSpeed = Math.min(2.0, type.speed + (waveMultiplier * this.speedScaling));
        
        // Apply game scale factor to ensure consistent speed across resolutions
        let scaledSpeed = baseSpeed;
        if (typeof GAME_SCALE !== 'undefined') {
            scaledSpeed = GAME_SCALE.scaleSpeed(baseSpeed);
        }
        
        return {
            health: Math.max(1, Math.floor(type.health + (waveMultiplier * this.healthScaling))),
            speed: scaledSpeed,
            damage: type.damage + (waveMultiplier * this.damageScaling),
            color: type.color,
            emoji: type.emoji
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENEMY_CONFIG;
}
