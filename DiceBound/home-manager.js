// Home Screen Manager for DiceBound

const HOME_MANAGER = {
    // Player persistent data
    playerData: {
        totalGold: 0,
        upgrades: {
            // Legacy upgrades (kept for backward compatibility, will be migrated to new stats)
            minRoll: { level: 0, cost: 50 },
            maxRoll: { level: 0, cost: 50 },
            startValueBoost: { level: 0, cost: 75 },
            // New stat upgrades
            hp: { level: 0, cost: 75 },
            dmgMin: { level: 0, cost: 50 },
            dmgMax: { level: 0, cost: 50 },
            spdMin: { level: 0, cost: 50 },
            spdMax: { level: 0, cost: 50 },
            intMin: { level: 0, cost: 50 },
            intMax: { level: 0, cost: 50 }
        }
    },

    // Upgrade costs scaling
    upgradeCostScaling: {
        minRoll: 1.3,
        maxRoll: 1.3,
        startValueBoost: 1.4,
        hp: 1.4,
        dmgMin: 1.3,
        dmgMax: 1.3,
        spdMin: 1.3,
        spdMax: 1.3,
        intMin: 1.3,
        intMax: 1.3
    },

    // Initialize home manager
    init: function() {
        this.loadPlayerData();
        this.setupEventListeners();
        this.updateHomeStats();
        this.showHomeScreen();
    },

    // Load player data from localStorage
    loadPlayerData: function() {
        const saved = localStorage.getItem('diceBoundPlayerData');
        if (saved) {
            const loadedData = JSON.parse(saved);
            // Merge with default upgrades to ensure new upgrades exist
            this.playerData = { 
                ...this.playerData, 
                ...loadedData,
                upgrades: {
                    ...this.playerData.upgrades,
                    ...(loadedData.upgrades || {})
                }
            };
        }
        
        // Sync gold: prefer playerData over old system, but sync both ways
        const oldGold = localStorage.getItem('diceBoundTotalGold');
        if (oldGold) {
            const oldGoldValue = parseInt(oldGold, 10);
            // Use the higher value (in case of sync issues)
            if (oldGoldValue > this.playerData.totalGold) {
                this.playerData.totalGold = oldGoldValue;
                this.savePlayerData();
            } else if (this.playerData.totalGold > oldGoldValue) {
                // Sync playerData to old system if playerData is higher
                localStorage.setItem('diceBoundTotalGold', this.playerData.totalGold.toString());
            }
        } else {
            // If old system doesn't exist, create it from playerData
            localStorage.setItem('diceBoundTotalGold', this.playerData.totalGold.toString());
        }
    },

    // Save player data to localStorage
    savePlayerData: function() {
        localStorage.setItem('diceBoundPlayerData', JSON.stringify(this.playerData));
    },

    // Get base upgrades (for game initialization)
    getBaseUpgrades: function() {
        return {
            // Legacy upgrades (for backward compatibility)
            minRoll: this.playerData.upgrades.minRoll.level,
            maxRoll: this.playerData.upgrades.maxRoll.level,
            startValueBoost: this.playerData.upgrades.startValueBoost.level,
            // New stat upgrades
            hp: this.playerData.upgrades.hp.level,
            dmgMin: this.playerData.upgrades.dmgMin.level,
            dmgMax: this.playerData.upgrades.dmgMax.level,
            spdMin: this.playerData.upgrades.spdMin.level,
            spdMax: this.playerData.upgrades.spdMax.level,
            intMin: this.playerData.upgrades.intMin.level,
            intMax: this.playerData.upgrades.intMax.level
        };
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

        document.getElementById('backToHubBtn').addEventListener('click', () => {
            this.backToHub();
        });

        // Upgrades screen buttons
        const backToHomeBtn = document.getElementById('backToHomeBtn');
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => {
                this.showHomeScreen();
            });
        }

        // Upgrade buttons (setup will be done in showUpgradesScreen)
        // Store reference to handler for cleanup
        this.handleUpgradeClick = (e) => {
            const upgradeType = e.target.dataset.upgrade;
            this.purchaseUpgrade(upgradeType);
        };

        // Game over screen buttons
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    },

    // Show home screen
    showHomeScreen: function() {
        document.getElementById('homeScreen').style.display = 'flex';
        document.getElementById('upgradesScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Hide power-up screen if exists
        const powerupScreen = document.getElementById('powerupScreen');
        if (powerupScreen) {
            powerupScreen.style.display = 'none';
        }
        
        // Reload player data to ensure sync (especially after coming back from hub)
        this.loadPlayerData();
        
        // Update home stats
        this.updateHomeStats();
        
        // Reset game if it exists
        if (typeof resetGame === 'function') {
            resetGame();
        }
    },

    // Show upgrades screen
    showUpgradesScreen: function() {
        document.getElementById('homeScreen').style.display = 'none';
        document.getElementById('upgradesScreen').style.display = 'flex';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Re-setup upgrade buttons (in case DOM was updated)
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.removeEventListener('click', this.handleUpgradeClick);
            btn.addEventListener('click', this.handleUpgradeClick);
        });
        
        this.updateUpgradesUI();
    },

    // Handle upgrade button click
    handleUpgradeClick: function(e) {
        const upgradeType = e.target.dataset.upgrade;
        HOME_MANAGER.purchaseUpgrade(upgradeType);
    },
    
    // Update home stats display
    updateHomeStats: function() {
        // Update gold display (use playerData.totalGold)
        const homeTotalGold = document.getElementById('homeTotalGold');
        if (homeTotalGold) {
            homeTotalGold.textContent = this.playerData.totalGold;
        }
        
        // Get base upgrades
        const upgrades = this.getBaseUpgrades();
        
        // Calculate base stats
        const baseHP = 2 + upgrades.startValueBoost + upgrades.hp;
        const baseDMGMin = 1 + upgrades.dmgMin;
        const baseDMGMax = 2 + upgrades.startValueBoost + upgrades.dmgMax;
        const baseSPDMin = 1 + upgrades.spdMin;
        const baseSPDMax = 2 + upgrades.spdMax;
        const baseINTMin = 1 + upgrades.intMin;
        const baseINTMax = 2 + upgrades.intMax;
        
        // Update home stats display
        const homeHP = document.getElementById('homeHP');
        const homeDMG = document.getElementById('homeDMG');
        const homeSPD = document.getElementById('homeSPD');
        const homeINT = document.getElementById('homeINT');
        if (homeHP) homeHP.textContent = baseHP;
        if (homeDMG) homeDMG.textContent = `${baseDMGMin}-${baseDMGMax}`;
        if (homeSPD) homeSPD.textContent = `${baseSPDMin}-${baseSPDMax}`;
        if (homeINT) homeINT.textContent = `${baseINTMin}-${baseINTMax}`;
    },

    // Update upgrades UI
    updateUpgradesUI: function() {
        // Update gold display
        const upgradeGold = document.getElementById('upgradeGold');
        if (upgradeGold) {
            upgradeGold.textContent = this.playerData.totalGold;
        }
        
        // Update stats display
        const upgrades = this.getBaseUpgrades();
        const baseHP = 2 + upgrades.startValueBoost + upgrades.hp;
        const baseDMGMin = 1 + upgrades.dmgMin;
        const baseDMGMax = 2 + upgrades.startValueBoost + upgrades.dmgMax;
        const baseSPDMin = 1 + upgrades.spdMin;
        const baseSPDMax = 2 + upgrades.spdMax;
        const baseINTMin = 1 + upgrades.intMin;
        const baseINTMax = 2 + upgrades.intMax;
        
        // Update stat displays
        const upgradeHP = document.getElementById('upgradeHP');
        const upgradeDMGMin = document.getElementById('upgradeDMGMin');
        const upgradeDMGMax = document.getElementById('upgradeDMGMax');
        const upgradeSPDMin = document.getElementById('upgradeSPDMin');
        const upgradeSPDMax = document.getElementById('upgradeSPDMax');
        const upgradeINTMin = document.getElementById('upgradeINTMin');
        const upgradeINTMax = document.getElementById('upgradeINTMax');
        
        if (upgradeHP) upgradeHP.textContent = baseHP;
        if (upgradeDMGMin) upgradeDMGMin.textContent = baseDMGMin;
        if (upgradeDMGMax) upgradeDMGMax.textContent = baseDMGMax;
        if (upgradeSPDMin) upgradeSPDMin.textContent = baseSPDMin;
        if (upgradeSPDMax) upgradeSPDMax.textContent = baseSPDMax;
        if (upgradeINTMin) upgradeINTMin.textContent = baseINTMin;
        if (upgradeINTMax) upgradeINTMax.textContent = baseINTMax;
        
        // Update each upgrade card
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
            // Get old values for animation (BEFORE upgrade)
            const oldUpgrades = this.getBaseUpgrades();
            const oldMinRoll = 1 + oldUpgrades.minRoll;
            const oldMaxRoll = 2 + oldUpgrades.maxRoll;
            // Base Power = starting value (2) + upgrades
            const oldStartValue = 2 + oldUpgrades.startValueBoost;
            
            // Deduct gold
            this.playerData.totalGold -= upgrade.cost;
            
            // Increase level
            upgrade.level++;
            
            // Calculate new cost
            const scaling = this.upgradeCostScaling[upgradeType];
            upgrade.cost = Math.floor(upgrade.cost * scaling);
            
            // Save data (both playerData and sync to old system)
            this.savePlayerData();
            
            // Sync gold to old system to prevent reset bug
            localStorage.setItem('diceBoundTotalGold', this.playerData.totalGold.toString());
            
            // Update UI
            this.updateUI();
            this.updateUpgradesUI();
            
            // Animate stat increase (with old values)
            this.animateStatIncrease(upgradeType, {
                oldMinRoll,
                oldMaxRoll,
                oldStartValue
            });
            
            // Show feedback
            this.showUpgradeFeedback(upgradeType);
        }
    },

    // Animate stat increase
    animateStatIncrease: function(upgradeType, oldValues) {
        const upgrades = this.getBaseUpgrades();
        const newMinRoll = 1 + upgrades.minRoll;
        const newMaxRoll = 2 + upgrades.maxRoll;
        // Base Power = starting value (2) + upgrades
        const newStartValue = 2 + upgrades.startValueBoost;
        
        if (upgradeType === 'minRoll') {
            this.animateNumber('upgradeMinRoll', oldValues.oldMinRoll, newMinRoll);
        } else if (upgradeType === 'maxRoll') {
            this.animateNumber('upgradeMaxRoll', oldValues.oldMaxRoll, newMaxRoll);
        } else if (upgradeType === 'startValueBoost') {
            this.animateNumber('upgradeStartValue', oldValues.oldStartValue, newStartValue);
        }
    },

    // Animate number change
    animateNumber: function(elementId, oldValue, newValue, isBonus = false) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Add animation class
        element.classList.add('stat-increase-animation');
        
        // Update value
        element.textContent = newValue;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('stat-increase-animation');
        }, 600);
    },

    // Show upgrade feedback
    showUpgradeFeedback: function(upgradeType) {
        const button = document.querySelector(`[data-upgrade="${upgradeType}"]`);
        if (!button) return;
        
        const originalText = button.textContent;
        
        button.textContent = '✓ Upgraded!';
        button.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 1000);
    },

    // Update UI (general)
    updateUI: function() {
        this.updateHomeStats();
    },

    // Start game
    startGame: function() {
        document.getElementById('homeScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Hide power-up screen if exists
        const powerupScreen = document.getElementById('powerupScreen');
        if (powerupScreen) {
            powerupScreen.style.display = 'none';
        }
        
        // Initialize game
        if (typeof initGame === 'function') {
            initGame();
        }
    },

    // Restart game (now goes to home screen) - Claim button
    restartGame: function() {
        // Get old gold value before saving
        const oldGold = this.playerData.totalGold;
        let goldToAdd = 0;
        
        // Save gold if there's any current gold from the run
        if (typeof gameState !== 'undefined' && gameState.currentGold > 0) {
            goldToAdd = gameState.currentGold;
            if (typeof saveTotalGold === 'function') {
                saveTotalGold();
            }
        }
        
        // Show home screen first
        this.showHomeScreen();
        
        // Animate gold increase if gold was added
        if (goldToAdd > 0) {
            // Wait a bit for home screen to render, then animate
            setTimeout(() => {
                // Reload to get the latest gold value
                this.loadPlayerData();
                const newGold = this.playerData.totalGold;
                this.animateGoldIncrease(oldGold, newGold);
            }, 150);
        }
    },
    
    // Animate gold increase
    animateGoldIncrease: function(oldGold, newGold) {
        const goldElement = document.getElementById('homeTotalGold');
        if (!goldElement) return;
        
        // Set initial value to old gold
        goldElement.textContent = oldGold;
        
        // Add animation class
        goldElement.classList.add('gold-increase-animation');
        
        // Animate the number change
        const goldIncrease = newGold - oldGold;
        if (goldIncrease > 0) {
            // Show the increase with animation
            let currentGold = oldGold;
            const increment = Math.max(1, Math.ceil(goldIncrease / 30)); // Smooth increment
            const interval = setInterval(() => {
                currentGold += increment;
                if (currentGold >= newGold) {
                    currentGold = newGold;
                    clearInterval(interval);
                    // Remove animation class after animation completes
                    setTimeout(() => {
                        goldElement.classList.remove('gold-increase-animation');
                    }, 300);
                }
                goldElement.textContent = currentGold;
            }, 15);
        } else {
            // Just update and remove animation
            goldElement.textContent = newGold;
            setTimeout(() => {
                goldElement.classList.remove('gold-increase-animation');
            }, 300);
        }
    },

    // Show game over screen
    showGameOver: function(title, message, stats, runSummary = null) {
        document.getElementById('gameOverTitle').textContent = title;
        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('gameOverStats').textContent = stats;
        document.getElementById('gameOverScreen').style.display = 'flex';
        
        // Hide next level button if game over (not level complete)
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        if (nextLevelBtn) {
            nextLevelBtn.style.display = 'none';
        }
        
        // Show run summary if lost (runSummary provided)
        const runSummaryDiv = document.getElementById('runSummary');
        if (runSummaryDiv) {
            if (runSummary) {
                runSummaryDiv.style.display = 'block';
                document.getElementById('runSummaryLevel').textContent = `Level ${runSummary.level}`;
                document.getElementById('runSummaryGold').textContent = runSummary.gold;
            } else {
                runSummaryDiv.style.display = 'none';
            }
        }
    },

    // Show level complete screen
    showLevelComplete: function(title, message, stats, nextLevel) {
        document.getElementById('gameOverTitle').textContent = title;
        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('gameOverStats').textContent = stats;
        document.getElementById('gameOverScreen').style.display = 'flex';
        
        // Show next level button
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        if (nextLevelBtn) {
            nextLevelBtn.style.display = 'block';
            nextLevelBtn.onclick = () => {
                this.startNextLevel(nextLevel);
            };
        }
    },

    // Start next level
    startNextLevel: function(levelNumber) {
        document.getElementById('homeScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Initialize game with next level
        if (typeof initGame === 'function') {
            initGame(levelNumber);
        }
    },

    // Back to main hub
    backToHub: function() {
        window.location.href = '../index.html';
    },

    // Reset progress
    resetProgress: function() {
        const confirmed = confirm('Are you sure you want to reset all progress?\n\nThis will:\n- Reset all upgrades to level 0\n- Reset total gold to 0\n- Clear all saved data\n\nThis cannot be undone!');
        if (!confirmed) {
            return;
        }
        
        // Reset player data to defaults
        this.playerData = {
            totalGold: 0,
            upgrades: {
                minRoll: { level: 0, cost: 50 },
                maxRoll: { level: 0, cost: 50 },
                startValueBoost: { level: 0, cost: 75 }
            }
        };
        
        // Clear localStorage
        localStorage.removeItem('diceBoundPlayerData');
        localStorage.removeItem('diceBoundTotalGold');
        
        // Save default data
        this.savePlayerData();
        localStorage.setItem('diceBoundTotalGold', '0');
        
        // Update UI
        this.updateHomeStats();
        this.updateUpgradesUI();
        
        alert('Progress reset successfully!');
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    HOME_MANAGER.init();
});



