// DiceBound Game Logic

// Game State
let gameState = {
    grid: [],
    gridWidth: CONFIG.GRID_W,
    gridHeight: CONFIG.GRID_H,
        player: {
            x: 0,
            y: 0,
            value: CONFIG.PLAYER_START_VALUE,
            lastValue: CONFIG.PLAYER_START_VALUE
        },
    enemies: [],
    items: [],
    currentTurn: 'player', // 'player' or 'enemy'
    playerRoll: null,
    playerRemainingSteps: 0,
    playerDirection: null,
    gameRunning: false,
    isMoving: false
};

// DOM Elements
const elements = {
    gameGrid: document.getElementById('gameGrid'),
    rollButton: document.getElementById('rollButton'),
    diceVisual: document.getElementById('diceVisual'),
    diceFace: document.getElementById('diceFace'),
    diceLabel: document.getElementById('diceLabel'),
    playerValue: document.getElementById('playerValue'),
    enemyCount: document.getElementById('enemyCount'),
    itemCount: document.getElementById('itemCount'),
    gridContainer: document.querySelector('.grid-container')
};

// Initialize Game
function initGame() {
    console.log('Initializing DiceBound...');
    
    // Reset game state
    gameState = {
        grid: [],
        gridWidth: CONFIG.GRID_W,
        gridHeight: CONFIG.GRID_H,
        player: {
            x: 0,
            y: 0,
            value: CONFIG.PLAYER_START_VALUE,
            lastValue: CONFIG.PLAYER_START_VALUE
        },
        enemies: [],
        items: [],
        currentTurn: 'player',
        playerRoll: null,
        playerRemainingSteps: 0,
        playerDirection: null,
        gameRunning: true,
        isMoving: false
    };

    // Initialize grid
    initializeGrid();
    
    // Spawn entities
    spawnPlayer();
    spawnEnemies();
    spawnItems();
    
    // Render grid
    renderGrid();
    
    // Update UI
    updateUI();
    
    // Enable roll button
    elements.rollButton.disabled = false;
    elements.diceLabel.textContent = 'Roll to start';
    elements.diceFace.textContent = '?';
}

// Reset Game
function resetGame() {
    gameState.gameRunning = false;
    gameState.isMoving = false;
}

// Initialize Grid
function initializeGrid() {
    gameState.grid = [];
    for (let y = 0; y < gameState.gridHeight; y++) {
        gameState.grid[y] = [];
        for (let x = 0; x < gameState.gridWidth; x++) {
            gameState.grid[y][x] = {
                player: false,
                enemy: null,
                item: null
            };
        }
    }
}

// Spawn Player
function spawnPlayer() {
    // Spawn at top-left corner
    gameState.player.x = 0;
    gameState.player.y = 0;
    gameState.grid[0][0].player = true;
}

// Spawn Enemies
function spawnEnemies() {
    gameState.enemies = [];
    let attempts = 0;
    
    while (gameState.enemies.length < CONFIG.ENEMY_COUNT && attempts < 100) {
        const x = Math.floor(Math.random() * gameState.gridWidth);
        const y = Math.floor(Math.random() * gameState.gridHeight);
        
        // Don't spawn on player or existing enemies
        if (x === 0 && y === 0) continue;
        if (gameState.grid[y][x].enemy !== null) continue;
        
        // Randomly select enemy type
        const enemyType = CONFIG.ENEMY_TYPES[Math.floor(Math.random() * CONFIG.ENEMY_TYPES.length)];
        const enemy = {
            id: gameState.enemies.length,
            x: x,
            y: y,
            value: enemyType.value,
            type: enemyType.name,
            emoji: enemyType.emoji
        };
        
        gameState.enemies.push(enemy);
        gameState.grid[y][x].enemy = enemy.id;
        attempts++;
    }
}

// Spawn Items
function spawnItems() {
    gameState.items = [];
    let attempts = 0;
    
    while (gameState.items.length < CONFIG.ITEM_COUNT && attempts < 100) {
        const x = Math.floor(Math.random() * gameState.gridWidth);
        const y = Math.floor(Math.random() * gameState.gridHeight);
        
        // Don't spawn on player, enemies, or existing items
        if (x === 0 && y === 0) continue;
        if (gameState.grid[y][x].enemy !== null) continue;
        if (gameState.grid[y][x].item !== null) continue;
        
        // Randomly select item type
        const itemType = CONFIG.ITEM_TYPES[Math.floor(Math.random() * CONFIG.ITEM_TYPES.length)];
        const item = {
            id: gameState.items.length,
            x: x,
            y: y,
            value: itemType.value,
            type: itemType.name,
            emoji: itemType.emoji
        };
        
        gameState.items.push(item);
        gameState.grid[y][x].item = item.id;
        attempts++;
    }
}

// Render Grid
function renderGrid() {
    elements.gameGrid.innerHTML = '';
    
    // Check if we should show direction buttons
    const showDirections = gameState.playerRemainingSteps > 0 && !gameState.isMoving && gameState.currentTurn === 'player';
    const validDirs = showDirections ? getValidDirections(gameState.player.x, gameState.player.y) : [];
    
    for (let y = 0; y < gameState.gridHeight; y++) {
        for (let x = 0; x < gameState.gridWidth; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            const cellData = gameState.grid[y][x];
            let content = '';
            let isDirectionCell = false;
            let direction = null;
            
            // Check if this cell should show direction button
            if (showDirections && cellData.player === false && cellData.enemy === null) {
                // Check if this cell is adjacent to player
                const dx = x - gameState.player.x;
                const dy = y - gameState.player.y;
                
                if ((dx === 0 && dy === -1 && validDirs.includes('up')) ||
                    (dx === 0 && dy === 1 && validDirs.includes('down')) ||
                    (dx === -1 && dy === 0 && validDirs.includes('left')) ||
                    (dx === 1 && dy === 0 && validDirs.includes('right'))) {
                    isDirectionCell = true;
                    if (dx === 0 && dy === -1) direction = 'up';
                    else if (dx === 0 && dy === 1) direction = 'down';
                    else if (dx === -1 && dy === 0) direction = 'left';
                    else if (dx === 1 && dy === 0) direction = 'right';
                    
                    cell.classList.add('direction-cell');
                    cell.dataset.direction = direction;
                    
                    // Add click listener directly when creating the cell
                    cell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        
                        const dir = e.currentTarget.dataset.direction;
                        if (dir && !gameState.isMoving && gameState.playerRemainingSteps > 0) {
                            movePlayer(dir);
                        }
                    });
                }
            }
            
            // Check for combat (player and enemy on same cell)
            if (cellData.player && cellData.enemy !== null) {
                cell.classList.add('combat');
            }
            
            // Add player
            if (cellData.player) {
                cell.classList.add('player');
                content += '🧙';
            }
            
            // Add enemy
            if (cellData.enemy !== null) {
                cell.classList.add('enemy');
                const enemy = gameState.enemies[cellData.enemy];
                content += enemy.emoji || '👹';
            }
            
            // Add item (only if not a direction cell to avoid overlap)
            if (cellData.item !== null && !isDirectionCell) {
                cell.classList.add('item');
                const item = gameState.items.find(i => i.id === cellData.item);
                content += item?.emoji || '💎';
            }
            
            // Add direction indicator
            if (isDirectionCell) {
                const dirSymbol = direction === 'up' ? '↑' : direction === 'down' ? '↓' : direction === 'left' ? '←' : '→';
                content = dirSymbol;
            }
            
            // Set content first
            if (content) {
                const contentSpan = document.createElement('span');
                contentSpan.textContent = content;
                contentSpan.style.lineHeight = '1';
                cell.appendChild(contentSpan);
            }
            
            // Add value badges after content
            if (cellData.player) {
                const valueBadge = document.createElement('div');
                valueBadge.className = 'value-badge player-value';
                valueBadge.textContent = gameState.player.value;
                if (gameState.player.value !== gameState.player.lastValue) {
                    valueBadge.classList.add('value-updated');
                    gameState.player.lastValue = gameState.player.value;
                }
                cell.appendChild(valueBadge);
            }
            
            if (cellData.enemy !== null) {
                const enemy = gameState.enemies[cellData.enemy];
                const valueBadge = document.createElement('div');
                valueBadge.className = 'value-badge enemy-value';
                valueBadge.textContent = enemy.value;
                cell.appendChild(valueBadge);
            }
            
            if (cellData.item !== null && !isDirectionCell) {
                const item = gameState.items.find(i => i.id === cellData.item);
                const valueBadge = document.createElement('div');
                valueBadge.className = 'value-badge item-value';
                valueBadge.textContent = item?.value || '?';
                cell.appendChild(valueBadge);
            }
            
            elements.gameGrid.appendChild(cell);
        }
    }
    
    // Event listeners are already attached when cells are created
}

// Update UI
function updateUI() {
    elements.playerValue.textContent = gameState.player.value;
    elements.enemyCount.textContent = gameState.enemies.length;
    elements.itemCount.textContent = gameState.items.length;
}

// Roll Dice
function rollDice() {
    return Math.floor(Math.random() * CONFIG.DICE_SIDES) + 1;
}

// Player Roll
function playerRoll() {
    if (!gameState.gameRunning || gameState.isMoving || gameState.currentTurn !== 'player') {
        return;
    }
    
    // Roll animation
    elements.diceVisual.classList.add('rolling');
    elements.diceFace.textContent = '?';
    
    setTimeout(() => {
        const roll = rollDice();
        gameState.playerRoll = roll;
        gameState.playerRemainingSteps = roll;
        
        // Update UI
        elements.diceVisual.classList.remove('rolling');
        elements.diceFace.textContent = roll;
        elements.diceLabel.textContent = `Move ${roll} steps`;
        elements.rollButton.disabled = true;
        
        // Show direction buttons at player position (will be rendered in renderGrid)
        renderGrid();
        
        console.log(`Player rolled: ${roll}`);
    }, 500);
}

// Show Direction Buttons at Player Position
function showDirectionButtonsAtPlayer() {
    // Direction buttons will be rendered in renderGrid()
    renderGrid();
}

// Hide Direction Buttons
function hideDirectionButtons() {
    // Direction buttons will be hidden in renderGrid()
    renderGrid();
}

// Get Valid Directions
function getValidDirections(x, y) {
    const directions = [];
    
    if (y > 0) directions.push('up');
    if (y < gameState.gridHeight - 1) directions.push('down');
    if (x > 0) directions.push('left');
    if (x < gameState.gridWidth - 1) directions.push('right');
    
    return directions;
}

// Move Player
async function movePlayer(direction) {
    if (!gameState.gameRunning || gameState.isMoving || gameState.playerRemainingSteps <= 0) {
        return;
    }
    
    gameState.playerDirection = direction;
    gameState.isMoving = true;
    // Direction buttons will be hidden in next renderGrid()
    
    // Move step by step
    while (gameState.playerRemainingSteps > 0 && gameState.gameRunning) {
        const newPos = getNewPosition(gameState.player.x, gameState.player.y, direction);
        
        // Check if can move
        if (newPos.x < 0 || newPos.x >= gameState.gridWidth || 
            newPos.y < 0 || newPos.y >= gameState.gridHeight) {
            break; // Hit wall
        }
        
        // Check for enemy (combat)
        if (gameState.grid[newPos.y][newPos.x].enemy !== null) {
            // Stop and combat
            await performCombat(newPos.x, newPos.y);
            break; // Stop after combat
        }
        
        // Move player
        gameState.grid[gameState.player.y][gameState.player.x].player = false;
        gameState.player.x = newPos.x;
        gameState.player.y = newPos.y;
        gameState.grid[gameState.player.y][gameState.player.x].player = true;
        
        // Check for item
        if (gameState.grid[gameState.player.y][gameState.player.x].item !== null) {
            await collectItem(gameState.player.x, gameState.player.y);
            // Continue moving after collecting item
        }
        
        gameState.playerRemainingSteps--;
        
        // Render and wait
        renderGrid();
        await sleep(300);
        
        // Check if game over
        if (!gameState.gameRunning) break;
    }
    
    gameState.isMoving = false;
    gameState.playerRemainingSteps = 0;
    gameState.playerDirection = null;
    
    // End player turn
    if (gameState.gameRunning) {
        endPlayerTurn();
    }
}

// Get New Position
function getNewPosition(x, y, direction) {
    switch (direction) {
        case 'up': return { x: x, y: y - 1 };
        case 'down': return { x: x, y: y + 1 };
        case 'left': return { x: x - 1, y: y };
        case 'right': return { x: x + 1, y: y };
        default: return { x: x, y: y };
    }
}

// Collect Item
async function collectItem(x, y) {
    const itemId = gameState.grid[y][x].item;
    if (itemId === null) return;
    
    const item = gameState.items.find(i => i.id === itemId);
    if (!item) return;
    
    const oldValue = gameState.player.value;
    
    // Add value
    gameState.player.value += item.value;
    
    // Remove item
    gameState.grid[y][x].item = null;
    gameState.items = gameState.items.filter(i => i.id !== itemId);
    
    // Animation
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (cell) {
        cell.classList.add('collecting');
        setTimeout(() => cell.classList.remove('collecting'), 500);
    }
    
    // Show value gain animation
    showValueGainAnimation(x, y, item.value);
    
    updateUI();
    renderGrid(); // Re-render to show updated value
    await sleep(300);
    
    console.log(`Collected item worth ${item.value}. Value: ${oldValue} → ${gameState.player.value}`);
}

// Perform Combat
async function performCombat(x, y) {
    const enemyId = gameState.grid[y][x].enemy;
    if (enemyId === null) return;
    
    const enemy = gameState.enemies.find(e => e.id === enemyId);
    if (!enemy) return;
    
    console.log(`Combat: Player (${gameState.player.value}) vs Enemy (${enemy.value})`);
    
    // Stop movement
    gameState.isMoving = false;
    
    // Ensure grid is rendered first
    renderGrid();
    await sleep(100);
    
    // Get the cell after render
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cell) {
        console.error('Cell not found for combat');
        return;
    }
    
    // Add combat class for animation
    cell.classList.add('combat');
    
    // Wait for animation
    await sleep(600);
    
    // Remove combat class before proceeding
    cell.classList.remove('combat');
    
    // Compare values - Player wins only if value > enemy (not >=)
    if (gameState.player.value > enemy.value) {
        const oldValue = gameState.player.value;
        
        // Player wins - absorb enemy value
        gameState.player.value += enemy.value;
        
        // Remove enemy
        gameState.grid[y][x].enemy = null;
        gameState.enemies = gameState.enemies.filter(e => e.id !== enemyId);
        
        // Move player to enemy position
        gameState.grid[gameState.player.y][gameState.player.x].player = false;
        gameState.player.x = x;
        gameState.player.y = y;
        gameState.grid[gameState.player.y][gameState.player.x].player = true;
        
        // Re-render grid
        renderGrid();
        await sleep(100);
        
        // Show value gain animation (after re-render)
        const updatedCell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (updatedCell) {
            showValueGainAnimation(x, y, enemy.value);
        }
        
        updateUI();
        await sleep(300);
        
        console.log(`Player won! Absorbed ${enemy.value}. Value: ${oldValue} → ${gameState.player.value}`);
        
        // Check win condition
        if (gameState.enemies.length === 0) {
            gameOver(true);
            return;
        }
    } else {
        // Player loses - Game Over
        console.log(`Player lost! Game Over.`);
        gameOver(false);
        return;
    }
}

// End Player Turn
function endPlayerTurn() {
    gameState.currentTurn = 'enemy';
    elements.diceLabel.textContent = 'Enemy turn...';
    elements.diceFace.textContent = '...';
    
    // Enemy turn
    setTimeout(() => {
        enemyTurn();
    }, 500);
}

// Enemy Turn
async function enemyTurn() {
    if (!gameState.gameRunning) return;
    
    console.log('Enemy turn started');
    
    // Process each enemy
    for (const enemy of [...gameState.enemies]) {
        if (!gameState.gameRunning) break;
        
        // Skip if enemy was removed
        if (!gameState.enemies.find(e => e.id === enemy.id)) continue;
        
        // Roll dice for enemy
        const roll = rollDice();
        console.log(`Enemy ${enemy.id} rolled: ${roll}`);
        
        // Get valid directions
        const validDirs = getValidDirections(enemy.x, enemy.y);
        
        // Filter out directions with other enemies
        const availableDirs = validDirs.filter(dir => {
            const newPos = getNewPosition(enemy.x, enemy.y, dir);
            return gameState.grid[newPos.y][newPos.x].enemy === null;
        });
        
        if (availableDirs.length === 0) {
            // No valid moves
            continue;
        }
        
        // Choose ONE direction for the entire movement
        const direction = availableDirs[Math.floor(Math.random() * availableDirs.length)];
        
        // Move enemy step by step in the chosen direction
        for (let step = 0; step < roll; step++) {
            if (!gameState.gameRunning) break;
            
            const newPos = getNewPosition(enemy.x, enemy.y, direction);
            
            // Check if can move (wall or enemy)
            if (newPos.x < 0 || newPos.x >= gameState.gridWidth || 
                newPos.y < 0 || newPos.y >= gameState.gridHeight) {
                break; // Hit wall
            }
            
            if (gameState.grid[newPos.y][newPos.x].enemy !== null) {
                break; // Hit another enemy
            }
            
            // Check for player (combat)
            if (gameState.grid[newPos.y][newPos.x].player) {
                // Enemy hits player - move enemy to player position first, then combat
                gameState.grid[enemy.y][enemy.x].enemy = null;
                enemy.x = newPos.x;
                enemy.y = newPos.y;
                gameState.grid[enemy.y][enemy.x].enemy = enemy.id;
                
                // Now perform combat
                await performEnemyCombat(enemy, newPos.x, newPos.y);
                break;
            }
            
            // Check for item
            if (gameState.grid[newPos.y][newPos.x].item !== null) {
                // Enemy collects item
                await enemyCollectItem(enemy, newPos.x, newPos.y);
            }
            
            // Move enemy
            gameState.grid[enemy.y][enemy.x].enemy = null;
            enemy.x = newPos.x;
            enemy.y = newPos.y;
            gameState.grid[enemy.y][enemy.x].enemy = enemy.id;
            
            renderGrid();
            await sleep(200);
        }
    }
    
    // End enemy turn
    if (gameState.gameRunning) {
        gameState.currentTurn = 'player';
        elements.diceLabel.textContent = 'Your turn';
        elements.diceFace.textContent = '?';
        elements.rollButton.disabled = false;
        renderGrid();
    }
}

// Enemy Collect Item
async function enemyCollectItem(enemy, x, y) {
    const itemId = gameState.grid[y][x].item;
    if (itemId === null) return;
    
    const item = gameState.items.find(i => i.id === itemId);
    if (!item) return;
    
    // Enemy gets value
    enemy.value += item.value;
    
    // Remove item
    gameState.grid[y][x].item = null;
    gameState.items = gameState.items.filter(i => i.id !== itemId);
    
    updateUI();
    console.log(`Enemy ${enemy.id} collected item worth ${item.value}`);
}

// Perform Enemy Combat (when enemy hits player)
async function performEnemyCombat(enemy, x, y) {
    console.log(`Enemy ${enemy.id} hit player! Combat: Player (${gameState.player.value}) vs Enemy (${enemy.value})`);
    
    // Stop any ongoing movement
    gameState.isMoving = false;
    
    // Ensure grid is rendered first
    renderGrid();
    await sleep(100);
    
    // Get the cell after render
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cell) {
        console.error('Cell not found for combat');
        return;
    }
    
    // Add combat class for animation
    cell.classList.add('combat');
    
    // Wait for animation
    await sleep(600);
    
    // Remove combat class before proceeding
    cell.classList.remove('combat');
    
    // Compare values - Player wins if value > enemy (not >=)
    // Enemy wins if value >= player
    if (gameState.player.value > enemy.value) {
        // Player wins - enemy thua
        const oldValue = gameState.player.value;
        const enemyValue = enemy.value;
        
        // Player absorbs enemy value
        gameState.player.value += enemy.value;
        
        // Remove enemy from grid and array
        gameState.grid[y][x].enemy = null;
        gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
        
        // Re-render grid to show updated state
        renderGrid();
        await sleep(100);
        
        // Show value gain animation
        const updatedCell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (updatedCell) {
            showValueGainAnimation(x, y, enemyValue);
        }
        
        updateUI();
        await sleep(300);
        
        console.log(`Player won! Enemy ${enemy.id} defeated. Absorbed ${enemyValue}. Value: ${oldValue} → ${gameState.player.value}`);
        
        // Check win condition
        if (gameState.enemies.length === 0) {
            gameOver(true);
            return;
        }
    } else {
        // Enemy wins - Player loses (enemy value >= player value)
        console.log(`Player lost! Enemy ${enemy.id} value (${enemy.value}) >= Player value (${gameState.player.value}). Game Over.`);
        gameOver(false);
        return;
    }
}

// Show Value Gain Animation
function showValueGainAnimation(x, y, amount) {
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cell) return;
    
    const gainText = document.createElement('div');
    gainText.className = 'value-gain-animation';
    gainText.textContent = `+${amount}`;
    gainText.style.position = 'absolute';
    gainText.style.left = '50%';
    gainText.style.top = '50%';
    gainText.style.transform = 'translate(-50%, -50%)';
    gainText.style.color = '#2ecc71';
    gainText.style.fontSize = '20px';
    gainText.style.fontWeight = 'bold';
    gainText.style.textShadow = '0 0 10px rgba(46, 204, 113, 0.8)';
    gainText.style.pointerEvents = 'none';
    gainText.style.zIndex = '1000';
    
    cell.style.position = 'relative';
    cell.appendChild(gainText);
    
    // Animate
    setTimeout(() => {
        gainText.style.transition = 'all 0.8s ease-out';
        gainText.style.transform = 'translate(-50%, -150%)';
        gainText.style.opacity = '0';
        
        setTimeout(() => {
            if (gainText.parentNode) {
                gainText.parentNode.removeChild(gainText);
            }
        }, 800);
    }, 100);
}

// Game Over
function gameOver(won) {
    gameState.gameRunning = false;
    
    const title = won ? 'Victory!' : 'Game Over!';
    const message = won 
        ? `You defeated all enemies! Final value: ${gameState.player.value}`
        : `You were defeated! Your value: ${gameState.player.value}`;
    const stats = `Enemies defeated: ${CONFIG.ENEMY_COUNT - gameState.enemies.length}/${CONFIG.ENEMY_COUNT}`;
    
    if (typeof HOME_MANAGER !== 'undefined' && HOME_MANAGER.showGameOver) {
        HOME_MANAGER.showGameOver(title, message, stats);
    }
}

// Utility: Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
elements.rollButton.addEventListener('click', () => {
    playerRoll();
});

// Direction buttons are handled in renderGrid() when cells are created

