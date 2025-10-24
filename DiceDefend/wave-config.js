// Wave Configuration
// Định nghĩa các wave và cách spawn enemy (không thay đổi stats của enemy)

const WAVE_CONFIG = [
    // Wave 1-5: Tutorial waves - Tăng số lượng enemy và lanes
    { 
        enemies: 3, 
        lanes: [0, 1, 2], 
        spawnInterval: 200, 
        enemyType: 'basic',
        description: 'Tutorial - Basic enemies'
    },
    { 
        enemies: 5, 
        lanes: [0, 1, 2, 3], 
        spawnInterval: 200, 
        enemyType: 'basic',
        description: 'Tutorial - More lanes'
    },
    { 
        enemies: 7, 
        lanes: [0, 1, 2, 3, 4], 
        spawnInterval: 200, 
        enemyType: 'basic',
        description: 'Tutorial - Almost all lanes'
    },
    { 
        enemies: 10, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 200, 
        enemyType: 'basic',
        description: 'Tutorial - All lanes'
    },
    { 
        enemies: 12, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 200, 
        enemyType: 'basic',
        description: 'Tutorial - More enemies'
    },
    
    // Wave 6-10: Intermediate waves - Thay đổi loại enemy
    { 
        enemies: 15, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 200, 
        enemyType: 'fast',
        description: 'Intermediate - Fast enemies'
    },
    { 
        enemies: 18, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 200, 
        enemyType: 'fast',
        description: 'Intermediate - More fast enemies'
    },
    { 
        enemies: 20, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 200, 
        enemyType: 'tank',
        description: 'Intermediate - Tank enemies'
    },
    { 
        enemies: 25, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 200, 
        enemyType: 'tank',
        description: 'Intermediate - More tank enemies'
    },
    { 
        enemies: 30, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 200, 
        enemyType: 'tank',
        description: 'Intermediate - Many tank enemies'
    },
    
    // Wave 11-15: Advanced waves - Boss enemies
    { 
        enemies: 35, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 200, 
        enemyType: 'boss',
        description: 'Advanced - Boss wave!'
    },
    { 
        enemies: 40, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 180, 
        enemyType: 'boss',
        description: 'Advanced - More bosses!'
    },
    { 
        enemies: 45, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 180, 
        enemyType: 'boss',
        description: 'Advanced - Boss swarm!'
    },
    { 
        enemies: 50, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 160, 
        enemyType: 'boss',
        description: 'Advanced - Boss army!'
    },
    { 
        enemies: 60, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 160, 
        enemyType: 'boss',
        description: 'Advanced - Boss legion!'
    },
    
    // Wave 16+: Nightmare waves - Mixed enemies với spawn rate cao
    { 
        enemies: 70, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 150, 
        enemyType: 'basic',
        description: 'Nightmare - Basic swarm!'
    },
    { 
        enemies: 80, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 140, 
        enemyType: 'fast',
        description: 'Nightmare - Fast swarm!'
    },
    { 
        enemies: 90, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 130, 
        enemyType: 'tank',
        description: 'Nightmare - Tank swarm!'
    },
    { 
        enemies: 100, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 120, 
        enemyType: 'boss',
        description: 'Nightmare - Boss swarm!'
    },
    { 
        enemies: 120, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 100, 
        enemyType: 'boss',
        description: 'Nightmare - Boss legion!'
    }
];

// Wave management functions
const WAVE_MANAGER = {
    // Get wave config (repeat last config if wave exceeds available configs)
    getWaveConfig: function(waveNumber) {
        const configIndex = Math.min(waveNumber - 1, WAVE_CONFIG.length - 1);
        return WAVE_CONFIG[configIndex];
    },
    
    // Get enemy stats for current wave (stats không thay đổi theo wave)
    getEnemyStats: function(waveNumber) {
        const waveConfig = this.getWaveConfig(waveNumber);
        return ENEMY_CONFIG.getEnemyStats(waveNumber, waveConfig.enemyType);
    },
    
    // Check if wave is a boss wave
    isBossWave: function(waveNumber) {
        return waveNumber % 5 === 0 || waveNumber >= 11;
    },
    
    // Get wave description
    getWaveDescription: function(waveNumber) {
        const config = this.getWaveConfig(waveNumber);
        return config.description;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WAVE_CONFIG, WAVE_MANAGER };
}
