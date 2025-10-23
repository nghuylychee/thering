// Game State
let gameState = {
    score: 0,
    wave: 1,
    castleHealth: 100,
    maxCastleHealth: 100,
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
    currentResources: 0,
    resourceDiceRolled: false,
    availablePowerups: [],
    gameLoopRunning: false
};

// DOM Elements
const elements = {
    score: document.getElementById('score'),
    wave: document.getElementById('wave'),
    castleHealth: document.getElementById('castleHealth'),
    healthFill: document.getElementById('healthFill'),
    enemyCount: document.getElementById('enemyCount'),
    enemyRemaining: document.getElementById('enemyRemaining'),
    rollButton: document.getElementById('rollButton'),
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
    updateUI();
    setupEventListeners();
    updateDiceSlots(); // Ensure dice colors are set correctly from start
    gameState.gameLoopRunning = true;
    startWave(1);
    gameLoop();
}

// Start Wave
function startWave(waveNumber) {
    console.log('startWave called with wave:', waveNumber);
    gameState.wave = waveNumber;
    gameState.waveInProgress = true;
    gameState.enemiesSpawned = 0;
    
    // Get wave config using WAVE_MANAGER
    gameState.currentWaveConfig = WAVE_MANAGER.getWaveConfig(waveNumber);
    gameState.enemiesToSpawn = gameState.currentWaveConfig.enemies;
    gameState.enemiesRemaining = gameState.currentWaveConfig.enemies; // Initialize remaining count
    gameState.enemySpawnInterval = gameState.currentWaveConfig.spawnInterval;
    
    // Show wave popup
    showWavePopup(waveNumber, gameState.currentWaveConfig);
    
    // Start spawning enemies after popup
    setTimeout(() => {
        gameState.enemySpawnTimer = 0;
    }, 2000);
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
            ${description}<br>
            Enemies: ${config.enemies}<br>
            Type: ${config.enemyType}<br>
            HP: ${enemyStats.health} | Speed: ${enemyStats.speed}x | Dmg: ${enemyStats.damage}
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
        hideUpgradePhase();
        
        // Start next wave after a short delay to ensure UI is updated
        setTimeout(() => {
            startWave(gameState.wave + 1);
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
                    diceElement.classList.remove('unrollable');
                    diceElement.classList.add('rollable');
                } else {
                    diceElement.classList.remove('rollable');
                    diceElement.classList.add('unrollable');
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
            diceData.isRollable = false; // Set to unrollable after rolling
            
            // Set cooldown timer based on dice type
            const diceConfig = DICE_CONFIG.getDiceConfig(diceData.type);
            diceData.cooldownTimer = diceConfig.cooldownTime / 16; // Convert ms to frames (60fps)
            
            // Shoot bullets based on dice value
            shootBullets(slotIndex, newValue, diceData.type);
        });
        
        updateDiceSlots(); // Update UI immediately to show unrollable state
        
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
    
    for (let i = 0; i < bulletCount; i++) {
        setTimeout(() => {
            createBullet(diceX, diceConfig.bulletSpeed);
        }, i * 100); // Stagger bullet creation
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
        speed: bulletSpeed,
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
            // Enemy reached castle border
            gameState.castleHealth -= enemy.damage;
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

// Update Bullets
function updateBullets() {
    gameState.bullets.forEach((bullet, bulletIndex) => {
        // Find nearest enemy only once when bullet is created (no retargeting)
        if (!bullet.targetEnemy) {
            bullet.targetEnemy = findNearestEnemy(bullet.x, bullet.y);
        }
        
        // Move bullet towards target enemy
        if (bullet.targetEnemy && gameState.enemies.includes(bullet.targetEnemy)) {
            const dx = bullet.targetEnemy.x - bullet.x;
            const dy = bullet.targetEnemy.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Normalize direction and move
                const moveX = (dx / distance) * bullet.speed;
                const moveY = (dy / distance) * bullet.speed;
                
                // Store direction for when target is destroyed
                bullet.direction = { x: moveX, y: moveY };
                
                bullet.x += moveX;
                bullet.y += moveY;
                
                bullet.element.style.left = bullet.x + 'px';
                bullet.element.style.top = bullet.y + 'px';
            }
        } else if (bullet.direction) {
            // Target destroyed, continue in the stored direction
            bullet.x += bullet.direction.x;
            bullet.y += bullet.direction.y;
            
            bullet.element.style.left = bullet.x + 'px';
            bullet.element.style.top = bullet.y + 'px';
        } else {
            // No target, continue moving in a random direction
            if (!bullet.direction) {
                // Set random direction if not set
                const angle = Math.random() * Math.PI * 2; // Random angle 0-2π
                bullet.direction = {
                    x: Math.cos(angle) * bullet.speed,
                    y: Math.sin(angle) * bullet.speed
                };
            }
            
            bullet.x += bullet.direction.x;
            bullet.y += bullet.direction.y;
            
            bullet.element.style.left = bullet.x + 'px';
            bullet.element.style.top = bullet.y + 'px';
        }
        
        // Check collision with enemies
        gameState.enemies.forEach((enemy, enemyIndex) => {
            const distance = Math.sqrt(
                Math.pow(enemy.x - bullet.x, 2) + 
                Math.pow(enemy.y - bullet.y, 2)
            );
            
            if (distance < 20) { // Collision radius
                // Hit!
                enemy.health--;
                bullet.element.remove();
                gameState.bullets.splice(bulletIndex, 1);
                
                if (enemy.health <= 0) {
                    enemy.element.remove();
                    gameState.enemies.splice(enemyIndex, 1);
                    gameState.enemiesRemaining--; // Decrease remaining count
                    gameState.score += 10;
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
    if (!gameState.gameRunning) {
        console.log('Game loop paused - gameRunning:', gameState.gameRunning);
        // Don't continue the loop when game is paused
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
    
    requestAnimationFrame(gameLoop);
}

// Update Dice Cooldowns
function updateDiceCooldowns() {
    gameState.diceSlots.forEach((diceData, index) => {
        if (diceData && !diceData.isRollable) {
            diceData.cooldownTimer--;
            
            if (diceData.cooldownTimer <= 0) {
                diceData.isRollable = true;
                diceData.cooldownTimer = 0;
                
                // Update UI to show dice is rollable again with cooldown effect
                const diceElement = elements.diceSlots[index].querySelector('.dice');
                if (diceElement) {
                    // Add cooldown animation class
                    diceElement.classList.add('cooldown-active');
                    
                    // After animation completes, update to rollable state
                    setTimeout(() => {
                        diceElement.classList.remove('unrollable', 'cooldown-active');
                        diceElement.classList.add('rollable');
                        diceElement.draggable = true;
                    }, 1000); // Match animation duration
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

// Update UI
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.wave.textContent = gameState.wave;
    elements.castleHealth.textContent = `${gameState.castleHealth}/${gameState.maxCastleHealth}`;
    elements.enemyCount.textContent = gameState.enemies.length;
    
    // Update enemy remaining count
    elements.enemyRemaining.textContent = `${gameState.enemiesRemaining}/${gameState.enemiesToSpawn}`;
    
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
    alert(`Game Over! Final Score: ${gameState.score}`);
    
    // Reset game
    setTimeout(() => {
        resetGame();
    }, 1000);
}

// Reset Game
function resetGame() {
    gameState = {
        score: 0,
        wave: 1,
        castleHealth: 100,
        maxCastleHealth: 100,
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
        currentResources: 0,
        resourceDiceRolled: false,
        availablePowerups: [],
        gameLoopRunning: false
    };
    
    // Clear all enemies and bullets
    elements.enemyArea.innerHTML = '';
    updateDiceSlots();
    updateUI();
    
    // Hide upgrade phase if visible
    hideUpgradePhase();
    
    // Start first wave
    gameState.gameLoopRunning = true;
    startWave(1);
    gameLoop();
}

// Upgrade System Functions
function showUpgradePhase() {
    gameState.upgradePhase = true;
    gameState.gameRunning = false;
    
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
    console.log('hideUpgradePhase called');
    gameState.upgradePhase = false;
    gameState.gameRunning = true;
    elements.upgradePhase.style.display = 'none';
    
    console.log('Game state after hideUpgradePhase:', {
        upgradePhase: gameState.upgradePhase,
        gameRunning: gameState.gameRunning,
        gameLoopRunning: gameState.gameLoopRunning
    });
    
    // Always restart game loop when exiting upgrade phase
    console.log('Restarting game loop');
    gameState.gameLoopRunning = true;
    gameLoop();
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
        setTimeout(() => {
            hideUpgradePhase();
            startWave(gameState.wave + 1);
        }, 1000);
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
            
        // Add more power-up effects later
        default:
            console.log('Power-up effect not implemented:', powerup.effect);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initGame);
