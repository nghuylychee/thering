// Game Scaling System
const GAME_SCALE = {
    // Base dimensions for scaling calculations (mobile portrait reference)
    baseWidth: 400,
    baseHeight: 600,
    
    // Get current scale factor
    getScaleFactor: function() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return 1;
        
        const currentWidth = gameContainer.offsetWidth;
        const currentHeight = gameContainer.offsetHeight;
        
        // Use the smaller scale factor to maintain aspect ratio
        const scaleX = currentWidth / this.baseWidth;
        const scaleY = currentHeight / this.baseHeight;
        const scaleFactor = Math.min(scaleX, scaleY);
        
        // Debug logging for different resolutions
        console.log(`Screen: ${window.screen.width}x${window.screen.height}, Container: ${currentWidth}x${currentHeight}, Scale: ${scaleFactor.toFixed(3)}`);
        
        return scaleFactor;
    },
    
    // Scale speed values based on screen size
    // This ensures consistent game speed across all resolutions
    scaleSpeed: function(speed) {
        const scaleFactor = this.getScaleFactor();
        const scaledSpeed = speed * scaleFactor;
        
        // Debug logging for speed scaling
        console.log(`Speed scaling: ${speed} -> ${scaledSpeed.toFixed(3)} (factor: ${scaleFactor.toFixed(3)})`);
        
        return scaledSpeed;
    },
    
    // Get resolution info for debugging
    getResolutionInfo: function() {
        return {
            screen: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            container: `${document.querySelector('.game-container')?.offsetWidth}x${document.querySelector('.game-container')?.offsetHeight}`,
            scaleFactor: this.getScaleFactor()
        };
    }
};

// Game State
let gameState = {
    wave: 1,
    castleHealth: 20,
    maxCastleHealth: 20,
    enemies: [],
    bullets: [],
    diceSlots: [
        { type: 'D2', value: 1, isRollable: true, cooldownTimer: 0 },
        null,
        null,
        null,
        null,
        null
    ],
    isRolling: false,
    enemySpawnTimer: 0,
    enemySpawnInterval: 200, // 0.2 giây spawn 1 enemy
    gameRunning: true,
    waveInProgress: false,
    enemiesSpawned: 0,
    enemiesToSpawn: 0,
    enemiesRemaining: 0, // Track enemies remaining in wave
    currentWaveConfig: null,
    draggedDice: null,
    // Upgrade system
    upgradePhase: false,
    upgradePhaseSkipped: false,
    currentResources: 0,
    resourceDiceRolled: false,
    availablePowerups: [],
    gameLoopRunning: false,
    
    // Game stats for summary
    gameStats: {
        maxWave: 1,
        goldEarned: 0,
        enemiesKilled: 0
    },
    
    // Power-up effects
    powerupEffects: {
        damageBoost: 0,           // Additional damage per bullet
        criticalChance: 0,        // Chance for critical hit (0-1)
        bulletSpeedMultiplier: 1, // Multiplier for bullet speed
        cooldownReduction: 0,     // Cooldown reduction percentage (0-1)
        defensePoints: 0,         // Defense points (reduces damage by 1 per point)
        multiShot: 0,             // Additional bullets per dice
        piercing: false           // Bullets pierce through enemies
    }
};

// DOM Elements
const elements = {
    wave: document.getElementById('wave'),
    castleHealth: document.getElementById('castleHealth'),
    healthFill: document.getElementById('healthFill'),
    enemyCount: document.getElementById('enemyCount'),
    rollButton: document.getElementById('rollButton'),
    // Stats display elements
    bulletSpeed: document.getElementById('bulletSpeed'),
    bulletDamage: document.getElementById('bulletDamage'),
    criticalChance: document.getElementById('criticalChance'),
    defensePoints: document.getElementById('defensePoints'),
    enemyArea: document.getElementById('enemyArea'),
    diceSlots: document.querySelectorAll('.dice-slot'),
    // Upgrade phase elements
    upgradePhase: document.getElementById('upgradePhase'),
    resourceDice: document.getElementById('resourceDice'),
    rollResourceDice: document.getElementById('rollResourceDice'),
    powerupCards: document.getElementById('powerupCards'),
    skipUpgrade: document.getElementById('skipUpgrade')
};

// Initialize Game
function initGame() {
    console.log('initGame called, current wave:', gameState.wave, 'gameLoopRunning:', gameState.gameLoopRunning);
    // Log resolution info for debugging
    console.log('Game initialized with resolution info:', GAME_SCALE.getResolutionInfo());
    
    // Ensure no game loop is running before starting
    gameState.gameLoopRunning = false;
    
    // Apply player upgrades
    applyPlayerUpgrades();
    
    // Reset game stats
    gameState.gameStats = {
        maxWave: 1,
        goldEarned: 0,
        enemiesKilled: 0
    };
    
    updateUI();
    setupEventListeners();
    updateDiceSlots(); // Ensure dice colors are set correctly from start
    startWave(1);
    // gameLoop() will be called by startWave() after popup
}

// Apply player upgrades from home screen
function applyPlayerUpgrades() {
    if (typeof HOME_MANAGER !== 'undefined') {
        const upgrades = HOME_MANAGER.getPlayerUpgrades();
        
        console.log('Applying player upgrades:', upgrades);
        
        // Apply castle HP
        gameState.maxCastleHealth = upgrades.castleHP;
        gameState.castleHealth = upgrades.castleHP;
        
        // Apply damage boost
        gameState.powerupEffects.damageBoost = upgrades.damage - 1; // -1 because base damage is 1
        
        // Apply speed multiplier
        gameState.powerupEffects.bulletSpeedMultiplier = upgrades.speed;
        
        // Apply crit chance
        gameState.powerupEffects.criticalChance = upgrades.critChance;
        
        // Apply crit multiplier (will be used in damage calculation)
        gameState.powerupEffects.critMultiplier = upgrades.critMultiplier;
        
        // Apply defense points
        gameState.powerupEffects.defensePoints = upgrades.defense;
        
        console.log('Powerup effects after applying upgrades:', gameState.powerupEffects);
    }
}

// Start Wave
function startWave(waveNumber) {
    console.log('startWave called with wave:', waveNumber, 'current wave:', gameState.wave, 'gameLoopRunning:', gameState.gameLoopRunning);
    
    // Ensure previous game loop is completely stopped
    gameState.gameLoopRunning = false;
    
    gameState.wave = waveNumber;
    gameState.waveInProgress = true;
    gameState.enemiesSpawned = 0;
    
    // Get wave config using WAVE_MANAGER
    gameState.currentWaveConfig = WAVE_MANAGER.getWaveConfig(waveNumber);
    gameState.enemiesToSpawn = gameState.currentWaveConfig.enemies;
    gameState.enemiesRemaining = gameState.currentWaveConfig.enemies; // Initialize remaining count
    gameState.enemySpawnInterval = gameState.currentWaveConfig.spawnInterval;
    
    console.log('Wave config:', gameState.currentWaveConfig);
    
    // Show wave popup
    showWavePopup(waveNumber, gameState.currentWaveConfig);
    
    // Start spawning enemies immediately
    gameState.enemySpawnTimer = 0;
    // Force restart game loop for new wave
    console.log('Restarting game loop for wave:', waveNumber);
    gameState.gameLoopRunning = true;
    gameLoop();
}

// Show Wave Popup
function showWavePopup(waveNumber, config) {
    const popup = document.createElement('div');
    popup.className = 'wave-popup';
    
    const enemyStats = WAVE_MANAGER.getEnemyStats(waveNumber);
    const description = WAVE_MANAGER.getWaveDescription(waveNumber);
    
    popup.innerHTML = `
        <div class="wave-number">WAVE ${waveNumber}</div>
        <div class="wave-info">
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Remove popup after animation (tăng từ 2s lên 3s)
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 3000);
}

// Setup Event Listeners
function setupEventListeners() {
    // Roll Button
    elements.rollButton.addEventListener('click', rollDice);
    
    // Drag & Drop Events
    setupDragAndDrop();
    
    // Upgrade Phase Events
    elements.rollResourceDice.addEventListener('click', rollResourceDice);
    elements.skipUpgrade.addEventListener('click', () => {
        console.log('Skip upgrade clicked, current wave:', gameState.wave);
        const nextWave = gameState.wave + 1;
        // Set flag to prevent auto-transition from selectPowerup
        gameState.upgradePhaseSkipped = true;
        hideUpgradePhase();
        
        // Start next wave after a short delay to ensure UI is updated
        setTimeout(() => {
            console.log('Starting next wave after skip:', nextWave);
            startWave(nextWave);
        }, 100);
    });
}

// Setup Drag and Drop
function setupDragAndDrop() {
    // Add drag events to all dice
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
}

// Drag and Drop Handlers
function handleDragStart(e) {
    if (!e.target.classList.contains('dice')) return;
    
    const diceElement = e.target;
    const slotIndex = parseInt(diceElement.parentElement.dataset.lane);
    
    gameState.draggedDice = {
        element: diceElement,
        slotIndex: slotIndex,
        diceData: gameState.diceSlots[slotIndex]
    };
    
    diceElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    if (!e.target.classList.contains('dice')) return;
    
    e.target.classList.remove('dragging');
    gameState.draggedDice = null;
    
    // Remove drag-over class from all slots
    elements.diceSlots.forEach(slot => {
        slot.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const slot = e.target.closest('.dice-slot');
    if (slot) {
        slot.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    // Only handle dragleave for dice-slot elements
    if (!e.target.classList.contains('dice-slot')) return;
    
    // Use a small delay to prevent flickering when moving between child elements
    setTimeout(() => {
        const slot = e.target;
        const rect = slot.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        // If mouse is outside slot bounds, remove drag-over class
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            slot.classList.remove('drag-over');
        }
    }, 10);
}

function handleDrop(e) {
    e.preventDefault();
    
    const targetSlot = e.target.closest('.dice-slot');
    if (!targetSlot || !gameState.draggedDice) return;
    
    const targetSlotIndex = parseInt(targetSlot.dataset.lane);
    const sourceSlotIndex = gameState.draggedDice.slotIndex;
    
    if (targetSlotIndex === sourceSlotIndex) return; // Same slot
    
    // Swap dice
    swapDice(sourceSlotIndex, targetSlotIndex);
    
    targetSlot.classList.remove('drag-over');
}

// Swap Dice between slots
function swapDice(sourceIndex, targetIndex) {
    const sourceDice = gameState.diceSlots[sourceIndex];
    const targetDice = gameState.diceSlots[targetIndex];
    
    // Swap the dice data
    gameState.diceSlots[sourceIndex] = targetDice;
    gameState.diceSlots[targetIndex] = sourceDice;
    
    // Update UI
    updateDiceSlots();
}

// Update Dice Slots UI
function updateDiceSlots() {
    elements.diceSlots.forEach((slot, index) => {
        const diceData = gameState.diceSlots[index];
        const diceElement = slot.querySelector('.dice');
        
        if (diceData !== null) {
            slot.classList.add('has-dice');
            
            if (diceElement) {
                // Update existing dice
                diceElement.textContent = diceData.value;
                diceElement.dataset.diceType = diceData.type;
                diceElement.draggable = diceData.isRollable;
                
                // Update dice appearance based on type and state
                const diceConfig = DICE_CONFIG.getDiceConfig(diceData.type);
                diceElement.style.backgroundColor = diceConfig.color;
                
                // Ensure dice has correct color even when rollable
                if (diceData.isRollable) {
                    diceElement.style.backgroundColor = diceConfig.color;
                }
                
                // Update rollable state
                if (diceData.isRollable) {
                    diceElement.classList.remove('unrollable', 'cooldown-active');
                    diceElement.classList.add('rollable');
                    // Clear any cooldown animation properties
                    diceElement.style.removeProperty('--cooldown-duration');
                    diceElement.style.removeProperty('--cooldown-delay');
                } else {
                    diceElement.classList.remove('rollable');
                    diceElement.classList.add('unrollable');
                    
                    // Start cooldown animation with correct progress if dice is unrollable
                    if (diceData.cooldownTimer > 0) {
                        diceElement.classList.add('cooldown-active');
                        
                        // Calculate remaining cooldown progress
                        const diceConfig = DICE_CONFIG.getDiceConfig(diceData.type);
                        const totalCooldownFrames = diceConfig.cooldownTime / 16; // Convert ms to frames
                        const remainingFrames = diceData.cooldownTimer;
                        const progressRatio = remainingFrames / totalCooldownFrames;
                        
                        // Set animation duration and delay to preserve progress
                        const animationDuration = diceConfig.cooldownTime / 1000; // Convert ms to seconds
                        const animationDelay = -(animationDuration * (1 - progressRatio)); // Negative delay to start from current progress
                        
                        diceElement.style.setProperty('--cooldown-duration', `${animationDuration}s`);
                        diceElement.style.setProperty('--cooldown-delay', `${animationDelay}s`);
                    }
                }
                
                // Always allow dragging regardless of rollable state
                diceElement.draggable = true;
            } else {
                // Create new dice element
                const newDice = document.createElement('div');
                newDice.className = 'dice';
                newDice.textContent = diceData.value;
                newDice.dataset.diceType = diceData.type;
                newDice.draggable = diceData.isRollable;
                
                const diceConfig = DICE_CONFIG.getDiceConfig(diceData.type);
                newDice.style.backgroundColor = diceConfig.color;
                
                // Ensure correct color for rollable state
                if (diceData.isRollable) {
                    newDice.style.backgroundColor = diceConfig.color;
                }
                
                if (diceData.isRollable) {
                    newDice.classList.add('rollable');
                } else {
                    newDice.classList.add('unrollable');
                    
                    // Start cooldown animation with correct progress if dice is unrollable
                    if (diceData.cooldownTimer > 0) {
                        newDice.classList.add('cooldown-active');
                        
                        // Calculate remaining cooldown progress
                        const diceConfig = DICE_CONFIG.getDiceConfig(diceData.type);
                        const totalCooldownFrames = diceConfig.cooldownTime / 16; // Convert ms to frames
                        const remainingFrames = diceData.cooldownTimer;
                        const progressRatio = remainingFrames / totalCooldownFrames;
                        
                        // Set animation duration and delay to preserve progress
                        const animationDuration = diceConfig.cooldownTime / 1000; // Convert ms to seconds
                        const animationDelay = -(animationDuration * (1 - progressRatio)); // Negative delay to start from current progress
                        
                        newDice.style.setProperty('--cooldown-duration', `${animationDuration}s`);
                        newDice.style.setProperty('--cooldown-delay', `${animationDelay}s`);
                    }
                }
                
                // Always allow dragging regardless of rollable state
                newDice.draggable = true;
                
                slot.appendChild(newDice);
            }
        } else {
            slot.classList.remove('has-dice');
            if (diceElement) {
                diceElement.remove();
            }
        }
    });
}

// Roll Dice
function rollDice() {
    if (gameState.isRolling || !gameState.gameRunning) return;
    
    gameState.isRolling = true;
    elements.rollButton.disabled = true;
    
    // Find all rollable dice
    const rollableDice = [];
    gameState.diceSlots.forEach((diceData, index) => {
        if (diceData && diceData.isRollable) {
            rollableDice.push({ diceData, slotIndex: index });
        }
    });
    
    if (rollableDice.length === 0) {
        gameState.isRolling = false;
        elements.rollButton.disabled = false;
        return;
    }
    
    // Animate dice rolling
    rollableDice.forEach(({ slotIndex }) => {
        const diceElement = elements.diceSlots[slotIndex].querySelector('.dice');
        if (diceElement) {
            diceElement.classList.add('rolling');
        }
    });
    
    setTimeout(() => {
        // Roll all rollable dice
        rollableDice.forEach(({ diceData, slotIndex }) => {
            const newValue = DICE_CONFIG.rollDice(diceData.type);
            diceData.value = newValue;
            
            // Set cooldown timer based on dice type with cooldown reduction
            const diceConfig = DICE_CONFIG.getDiceConfig(diceData.type);
            const baseCooldown = diceConfig.cooldownTime / 16; // Convert ms to frames (60fps)
            const cooldownReduction = gameState.powerupEffects.cooldownReduction;
            diceData.cooldownTimer = Math.max(1, baseCooldown * (1 - cooldownReduction)); // Minimum 1 frame
            
            // Start cooldown animation immediately with correct duration
            const diceElement = elements.diceSlots[slotIndex].querySelector('.dice');
            if (diceElement) {
                diceElement.classList.add('cooldown-active');
                // Set animation duration based on actual cooldown time
                const animationDuration = diceConfig.cooldownTime / 1000; // Convert ms to seconds
                diceElement.style.setProperty('--cooldown-duration', `${animationDuration}s`);
            }
            
            // Shoot bullets based on dice value
            shootBullets(slotIndex, newValue, diceData.type);
            
            // Set to unrollable immediately after shooting
            diceData.isRollable = false;
        });
        
        updateDiceSlots(); // Update UI immediately to show unrollable state and start cooldown animation
        
        // Remove rolling animation
        rollableDice.forEach(({ slotIndex }) => {
            const diceElement = elements.diceSlots[slotIndex].querySelector('.dice');
            if (diceElement) {
                diceElement.classList.remove('rolling');
            }
        });
        
        gameState.isRolling = false;
        elements.rollButton.disabled = false;
    }, 500);
}

// Shoot Bullets
function shootBullets(laneIndex, bulletCount, diceType) {
    const diceConfig = DICE_CONFIG.getDiceConfig(diceType);
    
    // Calculate dice position
    const laneWidth = elements.enemyArea.offsetWidth / 6;
    const diceX = laneWidth * laneIndex + laneWidth / 2;
    
    // Apply multi-shot effect
    const totalBullets = bulletCount + gameState.powerupEffects.multiShot;
    
    for (let i = 0; i < totalBullets; i++) {
        setTimeout(() => {
            createBullet(diceX, diceConfig.bulletSpeed);
        }, i * 500); // Stagger bullet creation
    }
}

// Create Bullet
function createBullet(x, bulletSpeed = 3) {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    
    // Calculate exact dice position - dice slots are in castle area
    const gameFieldHeight = elements.enemyArea.parentElement.offsetHeight;
    const enemyAreaHeight = elements.enemyArea.offsetHeight;
    const castleAreaHeight = gameFieldHeight * 0.2; // Castle is 20% of game field
    const castlePadding = 10; // Castle padding top
    const diceSlotsMargin = 5; // Dice slots margin-top
    const diceSlotsY = enemyAreaHeight + castlePadding + diceSlotsMargin + 100; // Lower position, closer to dice
    
    console.log('Bullet spawn debug:');
    console.log('- gameFieldHeight:', gameFieldHeight);
    console.log('- enemyAreaHeight:', enemyAreaHeight);
    console.log('- castleAreaHeight:', castleAreaHeight);
    console.log('- diceSlotsY:', diceSlotsY);
    console.log('- bullet x:', x, 'y:', diceSlotsY);
    
    bullet.style.left = x + 'px';
    bullet.style.top = diceSlotsY + 'px';
    elements.enemyArea.appendChild(bullet);
    
    gameState.bullets.push({
        element: bullet,
        x: x,
        y: diceSlotsY,
        speed: GAME_SCALE.scaleSpeed(bulletSpeed * gameState.powerupEffects.bulletSpeedMultiplier),
        targetEnemy: null, // Will be set when bullet finds a target
        direction: null // Will be set if no target
    });
    
    console.log('Bullet created, total bullets:', gameState.bullets.length);
}

// Spawn Enemy
function spawnEnemy() {
    if (!gameState.gameRunning || !gameState.waveInProgress || !gameState.currentWaveConfig) return;
    
    // Check if we've spawned all enemies for this wave
    if (gameState.enemiesSpawned >= gameState.enemiesToSpawn) {
        return;
    }
    
    // Choose lane from available lanes in current wave
    const availableLanes = gameState.currentWaveConfig.lanes;
    const laneIndex = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    
    const laneWidth = elements.enemyArea.offsetWidth / 6;
    const enemyX = laneWidth * laneIndex + laneWidth / 2;
    
    // Get enemy stats using ENEMY_CONFIG
    const enemyStats = WAVE_MANAGER.getEnemyStats(gameState.wave);
    
    // Debug log for enemy speed
    console.log(`Wave ${gameState.wave} - Enemy type: ${gameState.currentWaveConfig.enemyType}, Speed: ${enemyStats.speed}`);
    
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = enemyX + 'px';
    enemy.style.backgroundColor = enemyStats.color;
    elements.enemyArea.appendChild(enemy);
    
    gameState.enemies.push({
        element: enemy,
        x: enemyX,
        y: 10,
        lane: laneIndex,
        health: enemyStats.health,
        maxHealth: enemyStats.health,
        speed: enemyStats.speed,
        damage: enemyStats.damage,
        type: gameState.currentWaveConfig.enemyType
    });
    
    gameState.enemiesSpawned++;
}

// Update Enemies
function updateEnemies() {
    gameState.enemies.forEach((enemy, enemyIndex) => {
        enemy.y += enemy.speed;
        enemy.element.style.top = enemy.y + 'px';
        
        // Check if enemy reached castle - castle starts at 80% of game field height
        const gameFieldHeight = elements.enemyArea.parentElement.offsetHeight;
        const castleStartY = gameFieldHeight * 0.8; // Castle starts at 80% of game field height
        
        if (enemy.y >= castleStartY) {
        // Enemy reached castle border - apply defense points
        const defensePoints = gameState.powerupEffects.defensePoints;
        const actualDamage = Math.max(1, enemy.damage - defensePoints);
            gameState.castleHealth -= actualDamage;
            gameState.enemiesRemaining--; // Decrease remaining count
            enemy.element.remove();
            gameState.enemies.splice(enemyIndex, 1);
            
            if (gameState.castleHealth <= 0) {
                gameOver();
            }
        }
    });
}

// Find Nearest Enemy
function findNearestEnemy(bulletX, bulletY) {
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    gameState.enemies.forEach(enemy => {
        const distance = Math.sqrt(
            Math.pow(enemy.x - bulletX, 2) + 
            Math.pow(enemy.y - bulletY, 2)
        );
        
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestEnemy = enemy;
        }
    });
    
    return nearestEnemy;
}

// Show Damage Popup
function showDamagePopup(x, y, damage) {
    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.textContent = `${damage}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    elements.enemyArea.appendChild(popup);
    
    // Remove popup after animation
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 1000);
}

// Update Bullets
function updateBullets() {
    gameState.bullets.forEach((bullet, bulletIndex) => {
        // Set direction towards nearest enemy when bullet is created, then fly in fixed direction
        if (!bullet.direction) {
            // Find nearest enemy to aim at
            const nearestEnemy = findNearestEnemy(bullet.x, bullet.y);
            
            if (nearestEnemy) {
                // Calculate direction towards enemy
                const dx = nearestEnemy.x - bullet.x;
                const dy = nearestEnemy.y - bullet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Normalize direction and set fixed movement
                    bullet.direction = {
                        x: (dx / distance) * bullet.speed,
                        y: (dy / distance) * bullet.speed
                    };
                } else {
                    // Fallback: random direction if enemy is at same position
                    const angle = Math.random() * Math.PI * 2;
                    bullet.direction = {
                        x: Math.cos(angle) * bullet.speed,
                        y: Math.sin(angle) * bullet.speed
                    };
                }
            } else {
                // No enemy found, use random direction
                const angle = Math.random() * Math.PI * 2;
                bullet.direction = {
                    x: Math.cos(angle) * bullet.speed,
                    y: Math.sin(angle) * bullet.speed
                };
            }
        }
        
        // Move bullet in fixed direction (no more target tracking)
        bullet.x += bullet.direction.x;
        bullet.y += bullet.direction.y;
        
        bullet.element.style.left = bullet.x + 'px';
        bullet.element.style.top = bullet.y + 'px';
        
        // Check collision with enemies
        gameState.enemies.forEach((enemy, enemyIndex) => {
            const distance = Math.sqrt(
                Math.pow(enemy.x - bullet.x, 2) + 
                Math.pow(enemy.y - bullet.y, 2)
            );
            
            if (distance < 20) { // Collision radius
                // Hit! Calculate damage with power-up effects
                let damage = 1 + gameState.powerupEffects.damageBoost;
                
                // Check for critical hit
                if (Math.random() < gameState.powerupEffects.criticalChance) {
                    damage *= 2; // Double damage on critical hit
                }
                
                enemy.health -= damage;
                
                // Show damage popup
                showDamagePopup(bullet.x, bullet.y, Math.floor(damage));
                
                // Remove bullet unless piercing
                if (!gameState.powerupEffects.piercing) {
                    bullet.element.remove();
                    gameState.bullets.splice(bulletIndex, 1);
                }
                
                if (enemy.health <= 0) {
                    // Award gold for killing enemy
                    const goldReward = getEnemyGoldReward(enemy.type, gameState.wave);
                    awardGold(enemy.x, enemy.y, goldReward);
                    
                    enemy.element.remove();
                    gameState.enemies.splice(enemyIndex, 1);
                    gameState.enemiesRemaining--; // Decrease remaining count
                    gameState.gameStats.enemiesKilled++;
                }
            }
        });
        
        // Remove bullets that are off screen
        if (bullet.y < 0 || bullet.y > elements.enemyArea.parentElement.offsetHeight) {
            bullet.element.remove();
            gameState.bullets.splice(bulletIndex, 1);
        }
    });
}

// Game Loop
function gameLoop() {
    console.log('Game loop iteration - gameRunning:', gameState.gameRunning, 'gameLoopRunning:', gameState.gameLoopRunning, 'wave:', gameState.wave);
    
    // Check if game loop should continue
    if (!gameState.gameRunning || !gameState.gameLoopRunning) {
        console.log('Game loop stopped - gameRunning:', gameState.gameRunning, 'gameLoopRunning:', gameState.gameLoopRunning);
        return;
    }
    
    // Update dice cooldowns
    updateDiceCooldowns();
    
    // Spawn enemies
    gameState.enemySpawnTimer++;
    if (gameState.enemySpawnTimer >= gameState.enemySpawnInterval) {
        spawnEnemy();
        gameState.enemySpawnTimer = 0;
    }
    
    // Check wave completion
    checkWaveCompletion();
    
    // Update game objects
    updateEnemies();
    updateBullets();
    updateUI();
    
    // Continue game loop
    if (gameState.gameLoopRunning && gameState.gameRunning) {
        requestAnimationFrame(gameLoop);
    } else {
        console.log('Game loop stopped - gameLoopRunning:', gameState.gameLoopRunning, 'gameRunning:', gameState.gameRunning);
    }
}

// Update Dice Cooldowns
function updateDiceCooldowns() {
    gameState.diceSlots.forEach((diceData, index) => {
        if (diceData && !diceData.isRollable) {
            diceData.cooldownTimer--;
            
            if (diceData.cooldownTimer <= 0) {
                diceData.isRollable = true;
                diceData.cooldownTimer = 0;
                
                // Update UI to show dice is rollable again
                const diceElement = elements.diceSlots[index].querySelector('.dice');
                if (diceElement) {
                    // Remove cooldown classes and add rollable class
                    diceElement.classList.remove('unrollable', 'cooldown-active');
                    diceElement.classList.add('rollable');
                    diceElement.draggable = true;
                    
                    // Ensure correct color is restored
                    const diceConfig = DICE_CONFIG.getDiceConfig(diceData.type);
                    diceElement.style.backgroundColor = diceConfig.color;
                }
            }
        }
    });
}

// Check Wave Completion
function checkWaveCompletion() {
    // Wave is complete when all enemies are spawned and no enemies remain on screen
    if (gameState.waveInProgress && 
        gameState.enemiesSpawned >= gameState.enemiesToSpawn && 
        gameState.enemies.length === 0) {
        
        gameState.waveInProgress = false;
        
        // Show upgrade phase instead of immediately starting next wave
        setTimeout(() => {
            showUpgradePhase();
        }, 2000);
    }
}

// Update Stats Display
function updateStatsDisplay() {
    // Update bullet speed multiplier
    elements.bulletSpeed.textContent = gameState.powerupEffects.bulletSpeedMultiplier.toFixed(1) + 'x';
    
    // Update bullet damage (base damage + boost)
    const totalDamage = 1 + gameState.powerupEffects.damageBoost;
    elements.bulletDamage.textContent = totalDamage.toString();
    
    // Update critical chance percentage
    const critPercent = Math.round(gameState.powerupEffects.criticalChance * 100);
    elements.criticalChance.textContent = critPercent + '%';
    
    // Update defense points
    elements.defensePoints.textContent = gameState.powerupEffects.defensePoints;
}

// Update UI
function updateUI() {
    elements.wave.textContent = gameState.wave;
    elements.castleHealth.textContent = `${gameState.castleHealth}/${gameState.maxCastleHealth}`;
    elements.enemyCount.textContent = `${gameState.enemiesRemaining}/${gameState.enemiesToSpawn}`;
    
    // Update stats display
    updateStatsDisplay();
    
    // Update health bar
    const healthPercentage = (gameState.castleHealth / gameState.maxCastleHealth) * 100;
    elements.healthFill.style.width = healthPercentage + '%';
    
    // Change health bar color based on health level
    if (healthPercentage > 60) {
        elements.healthFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
    } else if (healthPercentage > 30) {
        elements.healthFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
    } else {
        elements.healthFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
    }
}

// Game Over
function gameOver() {
    gameState.gameRunning = false;
    
    // Update max wave
    gameState.gameStats.maxWave = gameState.wave;
    
    // Show game summary popup
    if (typeof HOME_MANAGER !== 'undefined') {
        HOME_MANAGER.showGameSummary(gameState.gameStats);
    } else {
        // Fallback to alert if HOME_MANAGER not available
        alert(`Game Over! Reached Wave: ${gameState.wave}\nGold Earned: ${gameState.gameStats.goldEarned}\nEnemies Killed: ${gameState.gameStats.enemiesKilled}`);
    }
}

// Reset Game
function resetGame() {
    console.log('resetGame called, current wave:', gameState.wave, 'gameLoopRunning:', gameState.gameLoopRunning);
    // Stop current game loop
    if (typeof gameState !== 'undefined') {
        gameState.gameRunning = false;
        gameState.gameLoopRunning = false;
    }
    
    // Clear all enemies and bullets from screen
    if (typeof elements !== 'undefined' && elements.enemyArea) {
        elements.enemyArea.innerHTML = '';
    }
    
    gameState = {
        wave: 1,
        castleHealth: 20,
        maxCastleHealth: 20,
        enemies: [],
        bullets: [],
        diceSlots: [
            { type: 'D2', value: 1, isRollable: true, cooldownTimer: 0 },
            null,
            null,
            null,
            null,
            null
        ],
        isRolling: false,
        enemySpawnTimer: 0,
        enemySpawnInterval: 200,
        gameRunning: true,
        waveInProgress: false,
        enemiesSpawned: 0,
        enemiesToSpawn: 0,
        enemiesRemaining: 0,
        currentWaveConfig: null,
        draggedDice: null,
        // Upgrade system
        upgradePhase: false,
        upgradePhaseSkipped: false,
        currentResources: 0,
        resourceDiceRolled: false,
        availablePowerups: [],
        gameLoopRunning: false,
        
        // Power-up effects (will be overridden by applyPlayerUpgrades)
        powerupEffects: {
            damageBoost: 0,           // Additional damage per bullet
            criticalChance: 0,        // Chance for critical hit (0-1)
            bulletSpeedMultiplier: 1, // Multiplier for bullet speed
            cooldownReduction: 0,     // Cooldown reduction percentage (0-1)
            defensePoints: 0,         // Defense points (reduces damage by 1 per point)
            multiShot: 0,             // Additional bullets per dice
            piercing: false           // Bullets pierce through enemies
        }
    };
    
    // Update UI
    updateDiceSlots();
    updateUI();
    
    // Hide upgrade phase if visible
    hideUpgradePhase();
}

// Upgrade System Functions
function showUpgradePhase() {
    gameState.upgradePhase = true;
    gameState.upgradePhaseSkipped = false; // Reset skip flag
    gameState.gameRunning = false;
    gameState.gameLoopRunning = false; // Stop game loop during upgrade phase
    
    // Generate random power-ups
    gameState.availablePowerups = POWERUP_CONFIG.getRandomPowerups(3);
    
    // Show upgrade UI
    elements.upgradePhase.style.display = 'flex';
    
    // Generate power-up cards
    generatePowerupCards();
    
    // Reset resource dice
    elements.resourceDice.textContent = '?';
    elements.rollResourceDice.disabled = false;
    gameState.resourceDiceRolled = false;
}

function hideUpgradePhase() {
    console.log('hideUpgradePhase called, current wave:', gameState.wave);
    gameState.upgradePhase = false;
    gameState.gameRunning = true;
    gameState.gameLoopRunning = false; // Stop current game loop
    elements.upgradePhase.style.display = 'none';
    
    // Reset resources for next upgrade phase
    gameState.currentResources = 0;
    gameState.resourceDiceRolled = false;
    
    console.log('Game state after hideUpgradePhase:', {
        upgradePhase: gameState.upgradePhase,
        gameRunning: gameState.gameRunning,
        gameLoopRunning: gameState.gameLoopRunning,
        wave: gameState.wave,
        upgradePhaseSkipped: gameState.upgradePhaseSkipped
    });
    
    // Don't restart game loop here - let the caller handle it
    // This prevents conflicts when startWave() is called after hideUpgradePhase()
}

function generatePowerupCards() {
    elements.powerupCards.innerHTML = '';
    
    gameState.availablePowerups.forEach(powerup => {
        const card = document.createElement('div');
        card.className = 'powerup-card';
        card.dataset.powerupId = powerup.id;
        
        card.innerHTML = `
            <div class="powerup-cost">🎲 ${powerup.diceRequired}</div>
            <div class="powerup-name">${powerup.name}</div>
            <div class="powerup-description">${powerup.description}</div>
        `;
        
        // Add click event
        card.addEventListener('click', () => selectPowerup(powerup.id));
        
        elements.powerupCards.appendChild(card);
    });
    
    updatePowerupCardsAffordability();
}

function updatePowerupCardsAffordability() {
    const cards = elements.powerupCards.querySelectorAll('.powerup-card');
    
    cards.forEach(card => {
        // Skip cards that are already selected
        if (card.classList.contains('selected')) {
            return;
        }
        
        const powerupId = card.dataset.powerupId;
        const powerup = POWERUP_CONFIG.getPowerup(powerupId);
        const costElement = card.querySelector('.powerup-cost');
        
        if (gameState.currentResources >= powerup.diceRequired) {
            card.classList.remove('unaffordable');
            card.classList.add('affordable');
            costElement.classList.add('affordable');
        } else {
            card.classList.remove('affordable');
            card.classList.add('unaffordable');
            costElement.classList.remove('affordable');
        }
    });
}

function rollResourceDice() {
    if (gameState.resourceDiceRolled) return;
    
    // Add rolling animation
    elements.resourceDice.classList.add('rolling');
    
    // Roll D6 for resources after animation
    setTimeout(() => {
        const rollResult = Math.floor(Math.random() * 6) + 1;
        
        elements.resourceDice.textContent = rollResult;
        elements.resourceDice.classList.remove('rolling');
        elements.rollResourceDice.disabled = true;
        gameState.resourceDiceRolled = true;
        gameState.currentResources = rollResult;
        
        // Update power-up cards affordability
        updatePowerupCardsAffordability();
    }, 1000); // Wait for animation to complete
}

function animateDiceSubtract() {
    const diceElement = elements.resourceDice;
    diceElement.classList.add('dice-animation');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        diceElement.classList.remove('dice-animation');
    }, 500);
}

function selectPowerup(powerupId) {
    console.log('selectPowerup called with powerupId:', powerupId);
    const powerup = POWERUP_CONFIG.getPowerup(powerupId);
    
    if (!powerup || gameState.currentResources < powerup.diceRequired) {
        console.log('Cannot afford powerup or powerup not found');
        return; // Can't afford
    }
    
    console.log('Applying powerup:', powerup.name);
    
    // Mark power-up as selected
    const card = elements.powerupCards.querySelector(`[data-powerup-id="${powerupId}"]`);
    if (card) {
        card.classList.add('selected');
        card.classList.remove('affordable', 'unaffordable');
    }
    
    // Subtract resources and add animation
    gameState.currentResources -= powerup.diceRequired;
    
    // Update dice display immediately
    elements.resourceDice.textContent = gameState.currentResources;
    
    animateDiceSubtract();
    
    // Apply power-up effect
    applyPowerupEffect(powerup);
    
    // Update power-up cards affordability
    updatePowerupCardsAffordability();
    
    // Check if user can still afford any power-ups
    const canAffordAny = gameState.availablePowerups.some(p => gameState.currentResources >= p.diceRequired);
    
    if (!canAffordAny) {
        // No more affordable power-ups, proceed to next wave
        const nextWave = gameState.wave + 1;
        console.log('No more affordable powerups, scheduling wave transition to:', nextWave);
        setTimeout(() => {
            // Check if upgrade phase is still active (not skipped)
            if (gameState.upgradePhase && !gameState.upgradePhaseSkipped) {
                console.log('Auto-transitioning to wave:', nextWave, 'current wave:', gameState.wave);
                hideUpgradePhase();
                startWave(nextWave);
            } else {
                console.log('Upgrade phase already ended or skipped, skipping auto-transition');
            }
        }, 1000);
    } else {
        console.log('Still can afford powerups, staying in upgrade phase');
    }
}

function applyPowerupEffect(powerup) {
    switch (powerup.effect) {
        case 'add_dice':
            // Add new D2 dice to first empty slot
            for (let i = 0; i < gameState.diceSlots.length; i++) {
                if (gameState.diceSlots[i] === null) {
                    gameState.diceSlots[i] = { type: 'D2', value: 1, isRollable: true, cooldownTimer: 0 };
                    break;
                }
            }
            updateDiceSlots();
            break;
            
        case 'upgrade_dice':
            // Upgrade first dice to next level
            for (let i = 0; i < gameState.diceSlots.length; i++) {
                if (gameState.diceSlots[i] !== null) {
                    const currentType = gameState.diceSlots[i].type;
                    const diceTypes = ['D2', 'D3', 'D4', 'D5', 'D6'];
                    const currentIndex = diceTypes.indexOf(currentType);
                    if (currentIndex < diceTypes.length - 1) {
                        const newType = diceTypes[currentIndex + 1];
                        gameState.diceSlots[i].type = newType;
                        gameState.diceSlots[i].value = 1;
                        break;
                    }
                }
            }
            updateDiceSlots();
            break;
            
        case 'heal_castle':
            gameState.castleHealth = Math.min(gameState.castleHealth + powerup.value, gameState.maxCastleHealth);
            break;
            
        case 'increase_damage':
            gameState.powerupEffects.damageBoost += powerup.value;
            break;
            
        case 'critical_chance':
            gameState.powerupEffects.criticalChance += powerup.value;
            break;
            
        case 'increase_bullet_speed':
            gameState.powerupEffects.bulletSpeedMultiplier += powerup.value;
            break;
            
        case 'reduce_cooldown':
            gameState.powerupEffects.cooldownReduction += powerup.value;
            break;
            
        case 'defense_points':
            gameState.powerupEffects.defensePoints += powerup.value;
            break;
            
        case 'multi_shot':
            gameState.powerupEffects.multiShot += powerup.value;
            break;
            
        case 'piercing':
            gameState.powerupEffects.piercing = true;
            break;
            
        default:
            console.log('Power-up effect not implemented:', powerup.effect);
    }
}

// Get gold reward for enemy type and wave
function getEnemyGoldReward(enemyType, wave) {
    // Get base gold reward from enemy config
    const enemyStats = ENEMY_CONFIG.getEnemyStats(wave, enemyType);
    const baseReward = enemyStats.goldReward;
    
    // Apply wave multiplier (every 5 waves increase reward)
    const waveMultiplier = 1;
    
    return baseReward * waveMultiplier;
}

// Award gold with animation
function awardGold(x, y, amount) {
    // Add to game stats
    gameState.gameStats.goldEarned += amount;
    
    // Update game gold display
    const gameGoldElement = document.getElementById('gameGold');
    if (gameGoldElement) {
        const currentGold = parseInt(gameGoldElement.textContent) || 0;
        gameGoldElement.textContent = currentGold + amount;
    }
    
    // Create gold particle animation
    if (typeof HOME_MANAGER !== 'undefined') {
        HOME_MANAGER.createGoldParticle(x, y, amount);
    }
}

// Test function to compare speeds across resolutions
function testSpeedScaling() {
    console.log('=== SPEED SCALING TEST ===');
    console.log('Resolution Info:', GAME_SCALE.getResolutionInfo());
    
    const testSpeeds = [0.5, 1.0, 2.0, 3.0];
    testSpeeds.forEach(speed => {
        const scaledSpeed = GAME_SCALE.scaleSpeed(speed);
        console.log(`Base speed: ${speed} -> Scaled speed: ${scaledSpeed.toFixed(3)}`);
    });
    
    console.log('=== END TEST ===');
}

// Initialize when page loads - only run speed test, don't start game
document.addEventListener('DOMContentLoaded', () => {
    // Run speed test after a short delay to ensure everything is loaded
    setTimeout(() => {
        testSpeedScaling();
    }, 1000);
});
