// Home Screen Manager
// Quản lý home screen, upgrade system và gold system

const HOME_MANAGER = {
    // Player persistent data
    playerData: {
        totalGold: 0,
        upgrades: {
            castleHP: { level: 0, cost: 50 },
            damage: { level: 0, cost: 25 },
            speed: { level: 0, cost: 30 },
            critChance: { level: 0, cost: 100 },
            critMultiplier: { level: 0, cost: 150 },
            defense: { level: 0, cost: 75 }
        },
        stats: {
            maxWave: 0,
            totalEnemiesKilled: 0,
            totalGoldEarned: 0
        }
    },

    // Upgrade costs scaling - More aggressive scaling for hardcore feel
    upgradeCostScaling: {
        castleHP: 1.4,
        damage: 1.25,
        speed: 1.3,
        critChance: 1.5,
        critMultiplier: 1.6,
        defense: 1.35
    },

    // Initialize home manager
    init: function() {
        this.loadPlayerData();
        this.setupEventListeners();
        this.updateUI();
        this.showHomeScreen();
    },

    // Load player data from localStorage
    loadPlayerData: function() {
        const saved = localStorage.getItem('diceDefendPlayerData');
        if (saved) {
            this.playerData = { ...this.playerData, ...JSON.parse(saved) };
        }
    },

    // Save player data to localStorage
    savePlayerData: function() {
        localStorage.setItem('diceDefendPlayerData', JSON.stringify(this.playerData));
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Home screen buttons
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('upgradesBtn').addEventListener('click', () => {
            this.showUpgradesScreen();
        });

        document.getElementById('resetProgressBtn').addEventListener('click', () => {
            this.resetProgress();
        });

        // Upgrades screen buttons
        document.getElementById('backToHomeBtn').addEventListener('click', () => {
            this.showHomeScreen();
        });

        // Game screen buttons
        document.getElementById('backToHomeFromGameBtn').addEventListener('click', () => {
            this.exitGame();
        });

        // Upgrade buttons
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeType = e.target.dataset.upgrade;
                this.purchaseUpgrade(upgradeType);
            });
        });

        // Game summary popup
        document.getElementById('returnHomeBtn').addEventListener('click', () => {
            this.returnToHome();
        });
    },

    // Show home screen
    showHomeScreen: function() {
        document.getElementById('homeScreen').style.display = 'flex';
        document.getElementById('upgradesScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameSummaryPopup').style.display = 'none';
        this.updateUI();
    },

    // Show upgrades screen
    showUpgradesScreen: function() {
        document.getElementById('homeScreen').style.display = 'none';
        document.getElementById('upgradesScreen').style.display = 'flex';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameSummaryPopup').style.display = 'none';
        this.updateUpgradesUI();
        this.setupDragScroll();
    },

    // Show game screen
    showGameScreen: function() {
        document.getElementById('homeScreen').style.display = 'none';
        document.getElementById('upgradesScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex';
        document.getElementById('gameSummaryPopup').style.display = 'none';
    },

    // Start game
    startGame: function() {
        this.showGameScreen();
        
        // Reset game state first
        if (typeof resetGame === 'function') {
            resetGame();
        }
        
        // Initialize game with player upgrades
        if (typeof initGame === 'function') {
            initGame();
        }
    },

    // Update UI
    updateUI: function() {
        // Update gold display
        document.getElementById('totalGold').textContent = this.playerData.totalGold;
        document.getElementById('upgradeGold').textContent = this.playerData.totalGold;
        document.getElementById('gameGold').textContent = '0'; // Reset game gold

        // Get current player upgrades
        const upgrades = this.getPlayerUpgrades();

        // Update quick stats
        document.getElementById('homeCastleHP').textContent = upgrades.castleHP;
        document.getElementById('homeDamage').textContent = upgrades.damage;
        document.getElementById('homeSpeed').textContent = upgrades.speed.toFixed(1) + 'x';
        
        // Update extended stats
        document.getElementById('homeCritChance').textContent = (upgrades.critChance * 100).toFixed(0) + '%';
        document.getElementById('homeCritMultiplier').textContent = upgrades.critMultiplier.toFixed(1) + 'x';
        document.getElementById('homeDefense').textContent = upgrades.defense;
        document.getElementById('homeMaxWave').textContent = this.playerData.stats.maxWave;
    },

    // Update upgrades UI
    updateUpgradesUI: function() {
        Object.keys(this.playerData.upgrades).forEach(upgradeType => {
            const upgrade = this.playerData.upgrades[upgradeType];
            
            // Update level display
            const levelElement = document.getElementById(upgradeType + 'Level');
            if (levelElement) {
                levelElement.textContent = upgrade.level;
            }

            // Update cost display
            const costElement = document.getElementById(upgradeType + 'Cost');
            if (costElement) {
                costElement.textContent = upgrade.cost;
            }

            // Update button state
            const buttonElement = document.querySelector(`[data-upgrade="${upgradeType}"]`);
            if (buttonElement) {
                buttonElement.disabled = this.playerData.totalGold < upgrade.cost;
            }
        });
    },

    // Purchase upgrade
    purchaseUpgrade: function(upgradeType) {
        const upgrade = this.playerData.upgrades[upgradeType];
        
        if (this.playerData.totalGold >= upgrade.cost) {
            // Deduct gold
            this.playerData.totalGold -= upgrade.cost;
            
            // Increase level
            upgrade.level++;
            
            // Calculate new cost
            const scaling = this.upgradeCostScaling[upgradeType];
            upgrade.cost = Math.floor(upgrade.cost * scaling);
            
            // Save data
            this.savePlayerData();
            
            // Update UI
            this.updateUI();
            this.updateUpgradesUI();
            
            // Show feedback
            this.showUpgradeFeedback(upgradeType);
        }
    },

    // Show upgrade feedback
    showUpgradeFeedback: function(upgradeType) {
        const button = document.querySelector(`[data-upgrade="${upgradeType}"]`);
        const originalText = button.textContent;
        
        button.textContent = '✓ Upgraded!';
        button.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 1000);
    },

    // Add gold (called from game)
    addGold: function(amount) {
        this.playerData.totalGold += amount;
        this.playerData.stats.totalGoldEarned += amount;
        this.savePlayerData();
        this.updateUI();
    },

    // Show game summary
    showGameSummary: function(gameStats) {
        // Update summary stats
        document.getElementById('summaryMaxWave').textContent = gameStats.maxWave;
        document.getElementById('summaryGoldEarned').textContent = gameStats.goldEarned;
        document.getElementById('summaryEnemiesKilled').textContent = gameStats.enemiesKilled;
        document.getElementById('summaryTotalGold').textContent = gameStats.goldEarned;

        // Update player stats
        this.playerData.stats.maxWave = Math.max(this.playerData.stats.maxWave, gameStats.maxWave);
        this.playerData.stats.totalEnemiesKilled += gameStats.enemiesKilled;
        
        // Add gold to player account
        this.playerData.totalGold += gameStats.goldEarned;
        this.playerData.stats.totalGoldEarned += gameStats.goldEarned;
        
        this.savePlayerData();

        // Update UI to reflect new stats
        this.updateUI();

        // Show popup
        document.getElementById('gameSummaryPopup').style.display = 'flex';
    },

    // Return to home from game summary
    returnToHome: function() {
        this.showHomeScreen();
    },

    // Exit game and return to home
    exitGame: function() {
        // Stop game loop if running
        if (typeof gameState !== 'undefined') {
            gameState.gameRunning = false;
            gameState.gameLoopRunning = false;
        }
        
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to exit the game? Your progress will be lost.');
        if (confirmed) {
            this.showHomeScreen();
        } else {
            // Resume game if user cancels
            if (typeof gameState !== 'undefined') {
                gameState.gameRunning = true;
                gameState.gameLoopRunning = true;
                if (typeof gameLoop === 'function') {
                    gameLoop();
                }
            }
        }
    },

    // Setup drag scroll for upgrades screen
    setupDragScroll: function() {
        const container = document.querySelector('.upgrades-container');
        if (!container) return;
        
        let isDragging = false;
        let startY = 0;
        let scrollTop = 0;
        
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.pageY - container.offsetTop;
            scrollTop = container.scrollTop;
            container.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        container.addEventListener('mouseleave', () => {
            isDragging = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mouseup', () => {
            isDragging = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const y = e.pageY - container.offsetTop;
            const walk = (y - startY) * 2; // Scroll speed multiplier
            container.scrollTop = scrollTop - walk;
        });
        
        // Touch events for mobile
        container.addEventListener('touchstart', (e) => {
            isDragging = true;
            startY = e.touches[0].pageY - container.offsetTop;
            scrollTop = container.scrollTop;
        });
        
        container.addEventListener('touchend', () => {
            isDragging = false;
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const y = e.touches[0].pageY - container.offsetTop;
            const walk = (y - startY) * 2;
            container.scrollTop = scrollTop - walk;
        });
        
        // Set initial cursor
        container.style.cursor = 'grab';
    },


    // Get player upgrades for game
        getPlayerUpgrades: function() {
            return {
                castleHP: 20 + (this.playerData.upgrades.castleHP.level * 20), // Base 20 + 20 per level
                damage: 1 + this.playerData.upgrades.damage.level,
                speed: 1 + (this.playerData.upgrades.speed.level * 0.1),
                critChance: this.playerData.upgrades.critChance.level * 0.05, // 5% per level
                critMultiplier: 1.2 + (this.playerData.upgrades.critMultiplier.level * 0.5), // +0.5x per level
                defense: this.playerData.upgrades.defense.level
            };
        },

    // Create gold particle animation
    createGoldParticle: function(x, y, amount) {
        const particle = document.createElement('div');
        particle.className = 'gold-particle';
        particle.textContent = '💰';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        document.body.appendChild(particle);
        
        // Calculate target position (gold display in game header)
        const gameGoldElement = document.getElementById('gameGold');
        let targetX = x;
        let targetY = y;
        
        if (gameGoldElement) {
            const goldDisplayRect = gameGoldElement.getBoundingClientRect();
            targetX = goldDisplayRect.left + goldDisplayRect.width / 2;
            targetY = goldDisplayRect.top + goldDisplayRect.height / 2;
        }
        
        // Calculate movement direction
        const deltaX = targetX - x;
        const deltaY = targetY - y;
        
        // Start animation
        setTimeout(() => {
            particle.classList.add('flying-to-ui');
            
            // Move particle towards target during animation
            const animationDuration = 1200; // 1.2s
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                
                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                const currentX = x + (deltaX * easeOut);
                const currentY = y + (deltaY * easeOut);
                
                particle.style.left = currentX + 'px';
                particle.style.top = currentY + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        }, 100);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                
                // Add visual feedback when gold reaches destination
                if (gameGoldElement) {
                    gameGoldElement.style.transform = 'scale(1.2)';
                    gameGoldElement.style.color = '#ffd700';
                    gameGoldElement.style.textShadow = '0 0 10px #ffd700';
                    
                    setTimeout(() => {
                        gameGoldElement.style.transform = 'scale(1)';
                        gameGoldElement.style.color = '';
                        gameGoldElement.style.textShadow = '';
                    }, 200);
                }
            }
        }, 1300);
    },
    
    // Reset all progress
    resetProgress: function() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.clear();
            this.loadPlayerData(); // Reload default data
            this.updateUI();
            alert('Progress reset! Please refresh the page.');
        }
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    HOME_MANAGER.init();
});
