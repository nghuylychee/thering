// Wave Configuration
// Định nghĩa các wave và cách spawn enemy

const WAVE_CONFIG = [
    // Wave 1-5: Tutorial waves
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
    
    // Wave 6-10: Intermediate waves
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
    
    // Wave 11+: Advanced waves (boss waves every 5 waves)
    { 
        enemies: 35, 
        lanes: [0, 1, 2, 3, 4, 5], 
        spawnInterval: 200, 
        enemyType: 'boss',
        description: 'Advanced - Boss wave!'
    }
];

// Wave management functions
const WAVE_MANAGER = {
    // Get wave config (repeat last config if wave exceeds available configs)
    getWaveConfig: function(waveNumber) {
        const configIndex = Math.min(waveNumber - 1, WAVE_CONFIG.length - 1);
        return WAVE_CONFIG[configIndex];
    },
    
    // Get enemy stats for current wave
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
