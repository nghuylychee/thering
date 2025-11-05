// DiceBound Game Logic

// Objective Types Configuration
const OBJECTIVE_TYPES = {
    'defeat_all': {
        icon: '🎯',
        text: 'Defeat all enemies'
    },
    // Future objective types can be added here
    // 'collect_items': { icon: '💎', text: 'Collect all items' },
    // 'reach_value': { icon: '📈', text: 'Reach value X' },
    // 'survive_turns': { icon: '⏱️', text: 'Survive N turns' }
};

// Game State
let gameState = {
    grid: [],
    gridWidth: CONFIG.GRID_W,
    gridHeight: CONFIG.GRID_H,
    level: 1,
    objective: {
        type: 'defeat_all', // 'defeat_all' | 'collect_items' | 'reach_value' | etc.
        target: null // Optional target value for specific objectives
    },
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
    endTurnButton: document.getElementById('endTurnButton'),
    diceVisual: document.getElementById('diceVisual'),
    diceFace: document.getElementById('diceFace'),
    diceLabel: document.getElementById('diceLabel'),
    levelValue: document.getElementById('levelValue'),
    objectiveIcon: document.getElementById('objectiveIcon'),
    objectiveText: document.getElementById('objectiveText'),
    gridContainer: document.querySelector('.grid-container')
};

// Initialize Game
function initGame(levelNumber = 1) {
    console.log(`Initializing DiceBound - Level ${levelNumber}...`);
    
    // Get level config
    const levelConfig = getLevelConfig(levelNumber);
    
    // Reset game state
    gameState = {
        grid: [],
        gridWidth: CONFIG.GRID_W,
        gridHeight: CONFIG.GRID_H,
        level: levelNumber,
        levelConfig: levelConfig,
        objective: {
            type: 'defeat_all',
            target: null
        },
        player: {
            x: 0,
            y: 0,
            value: levelConfig.playerStartValue,
            lastValue: levelConfig.playerStartValue
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
    spawnSpecialGrids();
    
    // Render grid
    renderGrid();
    
    // Update UI
    updateUI();
    
    // Enable roll button
    elements.rollButton.disabled = false;
    elements.diceLabel.textContent = 'Roll to start';
    elements.diceFace.textContent = '?';
    
    console.log(`Level ${levelNumber} - ${levelConfig.name}: ${levelConfig.description}`);
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
                item: null,
                specialGrid: null // 'box' | 'lava' | 'swamp' | 'canon' | null
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

// Select Enemy Type based on distribution
function selectEnemyTypeByDistribution(distribution) {
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    for (const [typeName, percentage] of Object.entries(distribution)) {
        cumulative += percentage;
        if (rand <= cumulative) {
            return CONFIG.ENEMY_TYPES.find(et => et.name === typeName);
        }
    }
    
    // Fallback to Weak
    return CONFIG.ENEMY_TYPES[0];
}

// Spawn Enemies
function spawnEnemies() {
    gameState.enemies = [];
    const levelConfig = gameState.levelConfig;
    let attempts = 0;
    
    while (gameState.enemies.length < levelConfig.enemyCount && attempts < 100) {
        const x = Math.floor(Math.random() * gameState.gridWidth);
        const y = Math.floor(Math.random() * gameState.gridHeight);
        
        // Don't spawn on player or existing enemies
        if (x === 0 && y === 0) continue;
        if (gameState.grid[y][x].enemy !== null) continue;
        
        // Select enemy type based on level distribution
        const enemyType = selectEnemyTypeByDistribution(levelConfig.enemyDistribution);
        if (!enemyType) {
            console.error('Enemy type not found!');
            continue;
        }
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
    const levelConfig = gameState.levelConfig;
    let attempts = 0;
    
    while (gameState.items.length < levelConfig.itemCount && attempts < 100) {
        const x = Math.floor(Math.random() * gameState.gridWidth);
        const y = Math.floor(Math.random() * gameState.gridHeight);
        
        // Don't spawn on player, enemies, or existing items
        if (x === 0 && y === 0) continue;
        if (gameState.grid[y][x].enemy !== null) continue;
        if (gameState.grid[y][x].item !== null) continue;
        
        // Randomly select item type
        const randomIndex = Math.floor(Math.random() * CONFIG.ITEM_TYPES.length);
        const itemType = CONFIG.ITEM_TYPES[randomIndex];
        if (!itemType) {
            console.error('Item type not found! Random index:', randomIndex, 'ITEM_TYPES length:', CONFIG.ITEM_TYPES.length);
            continue;
        }
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

// Spawn Special Grids
function spawnSpecialGrids() {
    const levelConfig = gameState.levelConfig;
    const specialGridCount = levelConfig.specialGridCount || 0;
    const specialGridTypes = levelConfig.specialGridTypes || [];
    
    if (specialGridCount === 0 || specialGridTypes.length === 0) {
        return; // No special grids for this level
    }
    
    let attempts = 0;
    let spawned = 0;
    
    while (spawned < specialGridCount && attempts < 200) {
        const x = Math.floor(Math.random() * gameState.gridWidth);
        const y = Math.floor(Math.random() * gameState.gridHeight);
        
        // Don't spawn on player, enemies, items, or existing special grids
        if (x === 0 && y === 0) { attempts++; continue; }
        if (gameState.grid[y][x].enemy !== null) { attempts++; continue; }
        if (gameState.grid[y][x].item !== null) { attempts++; continue; }
        if (gameState.grid[y][x].specialGrid !== null) { attempts++; continue; }
        
        // Randomly select special grid type from allowed types
        const gridType = specialGridTypes[Math.floor(Math.random() * specialGridTypes.length)];
        
        if (CONFIG.SPECIAL_GRID_TYPES[gridType]) {
            gameState.grid[y][x].specialGrid = gridType;
            spawned++;
        }
        
        attempts++;
    }
    
    console.log(`Spawned ${spawned} special grids`);
}

// Render Grid
function renderGrid() {
    elements.gameGrid.innerHTML = '';
    
    // Calculate reachable cells if player has remaining steps
    const showReachableCells = gameState.playerRemainingSteps > 0 && !gameState.isMoving && gameState.currentTurn === 'player';
    const reachableCells = showReachableCells ? calculateReachableCells(gameState.player.x, gameState.player.y, gameState.playerRemainingSteps) : new Set();
    
    for (let y = 0; y < gameState.gridHeight; y++) {
        for (let x = 0; x < gameState.gridWidth; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            const cellData = gameState.grid[y][x];
            let content = '';
            let isReachableCell = false;
            let hasReachableEnemy = false;
            let hasReachableItem = false;
            
            // Check if this cell is reachable
            if (showReachableCells && !cellData.player) {
                const cellKey = `${x},${y}`;
                if (reachableCells.has(cellKey)) {
                    isReachableCell = true;
                    cell.classList.add('reachable-cell');
                    cell.style.cursor = 'pointer';
                    
                    // Check if this reachable cell has enemy (combat)
                    if (cellData.enemy !== null) {
                        hasReachableEnemy = true;
                        cell.classList.add('reachable-combat');
                    }
                    
                    // Check if this reachable cell has item (collect)
                    if (cellData.item !== null) {
                        hasReachableItem = true;
                        cell.classList.add('reachable-item');
                    }
                    
                    // Add click listener to move to this cell
                    cell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        
                        if (!gameState.isMoving && gameState.playerRemainingSteps > 0) {
                            movePlayerToCell(x, y);
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
            
            // Add enemy (always show, even if reachable)
            if (cellData.enemy !== null) {
                const enemy = gameState.enemies.find(e => e.id === cellData.enemy);
                if (enemy) {
                    cell.classList.add('enemy');
                    content += enemy.emoji || '👹';
                } else {
                    // Enemy was removed but grid still has reference - clean it up
                    gameState.grid[y][x].enemy = null;
                }
            }
            
            // Add item (always show, even if reachable)
            if (cellData.item !== null) {
                cell.classList.add('item');
                const item = gameState.items.find(i => i.id === cellData.item);
                content += item?.emoji || '💎';
            }
            
            // Add special grid (always show)
            if (cellData.specialGrid !== null) {
                const specialGridType = CONFIG.SPECIAL_GRID_TYPES[cellData.specialGrid];
                if (specialGridType) {
                    cell.classList.add('special-grid');
                    cell.classList.add(`special-grid-${cellData.specialGrid}`);
                    // Add special grid icon as overlay - centered and larger
                    // Always show icon, even if there's player/enemy/item on the cell
                    const specialGridIcon = document.createElement('div');
                    specialGridIcon.className = 'special-grid-icon';
                    specialGridIcon.textContent = specialGridType.emoji;
                    specialGridIcon.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 32px;
                        z-index: 1;
                        pointer-events: none;
                        line-height: 1;
                    `;
                    cell.appendChild(specialGridIcon);
                }
            }
            
            // Set content first
            if (content) {
                const contentSpan = document.createElement('span');
                contentSpan.textContent = content;
                contentSpan.style.lineHeight = '1';
                // Ensure content doesn't block pointer events for reachable cells
                if (isReachableCell) {
                    contentSpan.style.pointerEvents = 'none';
                }
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
                const enemy = gameState.enemies.find(e => e.id === cellData.enemy);
                if (enemy) {
                    const valueBadge = document.createElement('div');
                    valueBadge.className = 'value-badge enemy-value';
                    valueBadge.textContent = enemy.value;
                    // Ensure value badge doesn't block pointer events for reachable cells
                    if (isReachableCell) {
                        valueBadge.style.pointerEvents = 'none';
                    }
                    cell.appendChild(valueBadge);
                }
                // If enemy not found, grid cell will be cleaned up above
            }
            
            if (cellData.item !== null) {
                const item = gameState.items.find(i => i.id === cellData.item);
                const valueBadge = document.createElement('div');
                valueBadge.className = 'value-badge item-value';
                valueBadge.textContent = item?.value || '?';
                // Ensure value badge doesn't block pointer events for reachable cells
                if (isReachableCell) {
                    valueBadge.style.pointerEvents = 'none';
                }
                cell.appendChild(valueBadge);
            }
            
            // Add value badge for special grids (if they have value)
            if (cellData.specialGrid !== null) {
                const specialGridType = CONFIG.SPECIAL_GRID_TYPES[cellData.specialGrid];
                if (specialGridType && specialGridType.value !== undefined) {
                    const valueBadge = document.createElement('div');
                    valueBadge.className = 'value-badge special-grid-value';
                    valueBadge.textContent = specialGridType.value;
                    // Ensure value badge doesn't block pointer events for reachable cells
                    if (isReachableCell) {
                        valueBadge.style.pointerEvents = 'none';
                    }
                    cell.appendChild(valueBadge);
                }
            }
            
            elements.gameGrid.appendChild(cell);
        }
    }
    
    // Event listeners are already attached when cells are created
}

// Get Objective Display Info
function getObjectiveDisplay() {
    const objType = gameState.objective.type;
    const objConfig = OBJECTIVE_TYPES[objType];
    
    if (objConfig) {
        return {
            icon: objConfig.icon,
            text: objConfig.text
        };
    }
    
    // Fallback
    return {
        icon: '🎯',
        text: 'Complete objective'
    };
}

// Update UI
function updateUI() {
    // Update Level
    elements.levelValue.textContent = gameState.level;
    
    // Update Objective
    const objectiveDisplay = getObjectiveDisplay();
    elements.objectiveIcon.textContent = objectiveDisplay.icon;
    elements.objectiveText.textContent = objectiveDisplay.text;
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
        updateDiceDisplay();
        elements.rollButton.disabled = true;
        elements.endTurnButton.style.display = 'inline-block';
        
        // Show reachable cells (will be rendered in renderGrid)
        renderGrid();
        
        console.log(`Player rolled: ${roll}`);
    }, 500);
}

// End Player Turn
function endPlayerTurnManually() {
    if (!gameState.gameRunning || gameState.isMoving || gameState.currentTurn !== 'player') {
        return;
    }
    
    gameState.playerRemainingSteps = 0;
    updateDiceDisplay();
    endPlayerTurn();
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

// Calculate all reachable cells with remaining steps (BFS)
function calculateReachableCells(startX, startY, maxSteps) {
    const reachable = new Set();
    const queue = [{ x: startX, y: startY, steps: 0 }];
    const visited = new Set();
    visited.add(`${startX},${startY}`);
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        // Add current cell to reachable if it's not the start position
        if (current.steps > 0) {
            const cellData = gameState.grid[current.y][current.x];
            // Only add empty cells or cells with items here (not enemies)
            // Enemies will be added separately below
            if (cellData.enemy === null) {
                reachable.add(`${current.x},${current.y}`);
            }
        }
        
        if (current.steps >= maxSteps) {
            continue;
        }
        
        const directions = getValidDirections(current.x, current.y);
        for (const dir of directions) {
            const newPos = getNewPosition(current.x, current.y, dir);
            const key = `${newPos.x},${newPos.y}`;
            
            // Skip if already visited
            if (!visited.has(key)) {
                const cellData = gameState.grid[newPos.y][newPos.x];
                // Check if cell has box (obstacle) - cannot walk through
                if (cellData.specialGrid === 'box') {
                    continue; // Skip box cells
                }
                // Allow moving through cells with enemies (we can reach them for combat)
                // But we don't add enemy cells to reachable in the main loop
                // Enemy cells will be checked separately below
                if (cellData.enemy === null || cellData.player) {
                    visited.add(key);
                    queue.push({ x: newPos.x, y: newPos.y, steps: current.steps + 1 });
                } else if (cellData.enemy !== null) {
                    // This cell has an enemy - we can still pass through it in BFS
                    // but we'll check if we can reach it separately
                    // Still check for box
                    if (cellData.specialGrid !== 'box') {
                        visited.add(key);
                        queue.push({ x: newPos.x, y: newPos.y, steps: current.steps + 1 });
                    }
                }
            }
        }
    }
    
    // Also check and add cells with enemies that are reachable (for combat)
    // We need to verify we can actually reach these enemy positions
    for (let y = 0; y < gameState.gridHeight; y++) {
        for (let x = 0; x < gameState.gridWidth; x++) {
            if (x === startX && y === startY) continue;
            
            const cellData = gameState.grid[y][x];
            if (cellData.enemy !== null) {
                // Check if this enemy cell is reachable by finding a path
                const path = findPath(startX, startY, x, y, maxSteps);
                if (path && path.length > 0 && path.length <= maxSteps) {
                    reachable.add(`${x},${y}`);
                }
            }
        }
    }
    
    return reachable;
}

// Find path from start to target using BFS
function findPath(startX, startY, targetX, targetY, maxSteps) {
    const queue = [{ x: startX, y: startY, steps: 0, path: [] }];
    const visited = new Set();
    visited.add(`${startX},${startY}`);
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        if (current.x === targetX && current.y === targetY) {
            return current.path;
        }
        
        if (current.steps >= maxSteps) {
            continue;
        }
        
        const directions = getValidDirections(current.x, current.y);
        for (const dir of directions) {
            const newPos = getNewPosition(current.x, current.y, dir);
            const key = `${newPos.x},${newPos.y}`;
            
            if (!visited.has(key)) {
                const cellData = gameState.grid[newPos.y][newPos.x];
                // Cannot move through box (obstacle)
                if (cellData.specialGrid === 'box') {
                    continue;
                }
                // Allow moving to cells with enemies (for combat)
                if (cellData.enemy === null || (newPos.x === targetX && newPos.y === targetY)) {
                    visited.add(key);
                    queue.push({
                        x: newPos.x,
                        y: newPos.y,
                        steps: current.steps + 1,
                        path: [...current.path, dir]
                    });
                }
            }
        }
    }
    
    return null; // No path found
}

// Move Player to Target Cell
async function movePlayerToCell(targetX, targetY) {
    if (!gameState.gameRunning || gameState.isMoving || gameState.playerRemainingSteps <= 0) {
        return;
    }
    
    // Find path to target cell
    const path = findPath(gameState.player.x, gameState.player.y, targetX, targetY, gameState.playerRemainingSteps);
    
    if (!path || path.length === 0) {
        console.log('No path found to target cell');
        return;
    }
    
    if (path.length > gameState.playerRemainingSteps) {
        console.log('Path too long for remaining steps');
        return;
    }
    
    gameState.isMoving = true;
    
    // Move step by step following the path
    for (let i = 0; i < path.length && gameState.gameRunning; i++) {
        const direction = path[i];
        const newPos = getNewPosition(gameState.player.x, gameState.player.y, direction);
        
        // Check if can move
        if (newPos.x < 0 || newPos.x >= gameState.gridWidth || 
            newPos.y < 0 || newPos.y >= gameState.gridHeight) {
            break; // Hit wall
        }
        
        // Check for enemy (combat)
        if (gameState.grid[newPos.y][newPos.x].enemy !== null) {
            // Move to enemy position first
            gameState.grid[gameState.player.y][gameState.player.x].player = false;
            gameState.player.x = newPos.x;
            gameState.player.y = newPos.y;
            gameState.grid[gameState.player.y][gameState.player.x].player = true;
            
            // Update remaining steps
            gameState.playerRemainingSteps -= (i + 1);
            updateDiceDisplay();
            
            // Render and combat
            renderGrid();
            await sleep(100);
            await performCombat(newPos.x, newPos.y);
            break; // Stop after combat
        }
        
        // Move player
        gameState.grid[gameState.player.y][gameState.player.x].player = false;
        gameState.player.x = newPos.x;
        gameState.player.y = newPos.y;
        gameState.grid[gameState.player.y][gameState.player.x].player = true;
        
        // Update remaining steps
        gameState.playerRemainingSteps--;
        updateDiceDisplay();
        
        // Check for item
        if (gameState.grid[gameState.player.y][gameState.player.x].item !== null) {
            await collectItem(gameState.player.x, gameState.player.y);
        }
        
        // Check for special grid effects
        const specialGrid = gameState.grid[gameState.player.y][gameState.player.x].specialGrid;
        if (specialGrid) {
            const handled = await handleSpecialGrid(specialGrid, gameState.player.x, gameState.player.y);
            if (!handled) {
                // Special grid prevented further movement (e.g., canon teleport)
                break;
            }
        }
        
        // Render and wait
        renderGrid();
        await sleep(300);
        
        // Check if game over
        if (!gameState.gameRunning) break;
    }
    
    gameState.isMoving = false;
    
    // If no more steps, end turn
    if (gameState.playerRemainingSteps <= 0 && gameState.gameRunning) {
        endPlayerTurn();
    } else if (gameState.gameRunning) {
        // Re-render to update reachable cells
        renderGrid();
    }
}

// Update Dice Display
function updateDiceDisplay() {
    if (gameState.playerRemainingSteps > 0) {
        elements.diceFace.textContent = gameState.playerRemainingSteps;
        elements.diceLabel.textContent = `${gameState.playerRemainingSteps} step${gameState.playerRemainingSteps > 1 ? 's' : ''} remaining`;
        elements.endTurnButton.style.display = 'inline-block';
    } else {
        elements.diceFace.textContent = '?';
        elements.diceLabel.textContent = 'Your turn';
        elements.endTurnButton.style.display = 'none';
    }
}

// Handle Special Grid Effects
async function handleSpecialGrid(specialGridType, x, y) {
    const gridConfig = CONFIG.SPECIAL_GRID_TYPES[specialGridType];
    if (!gridConfig) return true;
    
    switch (specialGridType) {
        case 'lava':
            // Lava: Take 1 damage
            if (gameState.player.value > 1) {
                gameState.player.value -= gridConfig.damage;
                showValueLossAnimation(x, y, gridConfig.damage);
                updateUI();
                renderGrid();
                await sleep(300);
                console.log(`Player stepped on Lava! Lost ${gridConfig.damage} value.`);
            } else {
                // Player dies if value reaches 0
                console.log('Player died from Lava!');
                gameOver(false);
                return false;
            }
            return true;
            
        case 'swamp':
            // Swamp: Take 2 damage (auto, no trap)
            const swampDamage = gridConfig.damage || 2;
            
            if (gameState.player.value > swampDamage) {
                gameState.player.value -= swampDamage;
                showValueLossAnimation(x, y, swampDamage);
                updateUI();
                renderGrid();
                await sleep(300);
                console.log(`Player stepped on Swamp! Lost ${swampDamage} value.`);
            } else {
                // Player dies if value reaches 0
                console.log('Player died from Swamp!');
                gameOver(false);
                return false;
            }
            return true;
            
        case 'canon':
            // Canon: Teleport player to chosen cell
            // Stop movement first
            gameState.isMoving = false;
            
            // Show canon activation effect
            const canonCell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
            if (canonCell) {
                canonCell.classList.add('canon-activating');
                await sleep(500);
            }
            
            // Show message to select target
            await showCanonTargetSelection(x, y);
            return false; // Movement handled by canon teleport
            
        default:
            return true;
    }
}

// Show Canon Target Selection
async function showCanonTargetSelection(canonX, canonY) {
    // Show message
    const message = document.createElement('div');
    message.className = 'canon-message';
    message.textContent = '💣 Select target cell!';
    message.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: bold;
        color: #f1c40f;
        text-shadow: 0 0 20px rgba(241, 196, 15, 1);
        z-index: 10000;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px 30px;
        border-radius: 10px;
        pointer-events: none;
    `;
    document.body.appendChild(message);
    
    // Make all cells clickable (except box)
    const allCells = elements.gameGrid.querySelectorAll('.grid-cell');
    const clickHandlers = [];
    
    allCells.forEach(cell => {
        const cellX = parseInt(cell.dataset.x);
        const cellY = parseInt(cell.dataset.y);
        const cellData = gameState.grid[cellY][cellX];
        
        // Allow clicking on any cell except box
        if (cellData.specialGrid !== 'box') {
            cell.classList.add('canon-target');
            cell.style.cursor = 'pointer';
            
            const clickHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // Remove message
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
                
                // Remove all click handlers and classes
                allCells.forEach((c, idx) => {
                    c.classList.remove('canon-target');
                    c.style.cursor = '';
                    if (clickHandlers[idx]) {
                        c.removeEventListener('click', clickHandlers[idx]);
                    }
                });
                
                // Teleport player
                teleportPlayerToCell(cellX, cellY);
            };
            
            clickHandlers.push(clickHandler);
            cell.addEventListener('click', clickHandler);
        } else {
            clickHandlers.push(null);
        }
    });
}

// Teleport Player to Target Cell
async function teleportPlayerToCell(targetX, targetY) {
    const oldX = gameState.player.x;
    const oldY = gameState.player.y;
    
    // Move player
    gameState.grid[oldY][oldX].player = false;
    gameState.player.x = targetX;
    gameState.player.y = targetY;
    gameState.grid[targetY][targetX].player = true;
    
    // Show teleport animation
    const targetCell = elements.gameGrid.querySelector(`[data-x="${targetX}"][data-y="${targetY}"]`);
    if (targetCell) {
        targetCell.classList.add('canon-teleport');
    }
    
    renderGrid();
    await sleep(500);
    
    if (targetCell) {
        targetCell.classList.remove('canon-teleport');
    }
    
    // Check for item at new position
    if (gameState.grid[targetY][targetX].item !== null) {
        await collectItem(targetX, targetY);
    }
    
    // Check for enemy at new position
    if (gameState.grid[targetY][targetX].enemy !== null) {
        await performCombat(targetX, targetY);
    }
    
    // End turn after canon teleport
    endPlayerTurn();
}

// Show Value Loss Animation
function showValueLossAnimation(x, y, amount) {
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cell) return;
    
    const lossText = document.createElement('div');
    lossText.className = 'value-loss-animation';
    lossText.textContent = `-${amount}`;
    lossText.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #e74c3c;
        font-size: 20px;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(231, 76, 60, 0.8);
        pointer-events: none;
        z-index: 1000;
    `;
    
    cell.style.position = 'relative';
    cell.appendChild(lossText);
    
    setTimeout(() => {
        lossText.style.transition = 'all 0.8s ease-out';
        lossText.style.transform = 'translate(-50%, -150%)';
        lossText.style.opacity = '0';
        
        setTimeout(() => {
            if (lossText.parentNode) {
                lossText.parentNode.removeChild(lossText);
            }
        }, 800);
    }, 100);
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
    
    // Check instant win first, then impossible win after collecting item
    if (!checkInstantWin()) {
        checkImpossibleWin();
    }
}

// Perform Combat
async function performCombat(x, y) {
    const enemyId = gameState.grid[y][x].enemy;
    if (enemyId === null) return;
    
    const enemy = gameState.enemies.find(e => e.id === enemyId);
    if (!enemy) return;
    
    console.log(`Combat: Player (${gameState.player.value}) vs Enemy (${enemy.value})`);
    
    // Stop movement and clear remaining steps (hide direction buttons)
    gameState.isMoving = false;
    gameState.playerRemainingSteps = 0;
    gameState.playerDirection = null;
    
    // Move player to enemy position first (both icons in same cell)
    gameState.grid[gameState.player.y][gameState.player.x].player = false;
    gameState.player.x = x;
    gameState.player.y = y;
    gameState.grid[gameState.player.y][gameState.player.x].player = true;
    
    // Render grid to show both player and enemy in same cell
    renderGrid();
    await sleep(100);
    
    // Get the cell after render
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cell) {
        console.error('Cell not found for combat');
        return;
    }
    
    // Add combat class for animation (both icons visible in same cell)
    cell.classList.add('combat');
    
    // Wait for animation - both icons visible together
    await sleep(600);
    
    // Remove combat class before proceeding
    cell.classList.remove('combat');
    
    // Compare values - Player wins if value >= enemy
    if (gameState.player.value >= enemy.value) {
        const oldValue = gameState.player.value;
        const enemyValue = enemy.value;
        
        // Player wins - absorb enemy value
        gameState.player.value += enemy.value;
        
        // Remove enemy
        gameState.grid[y][x].enemy = null;
        gameState.enemies = gameState.enemies.filter(e => e.id !== enemyId);
        
        // Player stays in the position (already moved there)
        
        // Re-render grid to show updated state
        renderGrid();
        await sleep(100);
        
        // Show value gain animation (after re-render)
        const updatedCell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (updatedCell) {
            showValueGainAnimation(x, y, enemyValue);
        }
        
        updateUI();
        await sleep(300);
        
        console.log(`Player won! Absorbed ${enemyValue}. Value: ${oldValue} → ${gameState.player.value}`);
        
        // Check win condition
        if (gameState.enemies.length === 0) {
            checkLevelComplete();
            return;
        }
        
        // Check instant win after defeating enemy
        if (checkInstantWin()) {
            return; // Instant win triggered
        }
    } else {
        // Player loses - Game Over (enemy value > player value)
        console.log(`Player lost! Enemy value (${enemy.value}) > Player value (${gameState.player.value}). Game Over.`);
        gameOver(false);
        return;
    }
}

// ========== AI HELPER FUNCTIONS ==========

// Calculate Manhattan distance between two points
function calculateManhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

// Calculate final position after moving in a direction for maxSteps
function calculateFinalPosition(startX, startY, direction, maxSteps) {
    let x = startX;
    let y = startY;
    let steps = 0;
    
    while (steps < maxSteps) {
        const newPos = getNewPosition(x, y, direction);
        
        // Check boundaries
        if (newPos.x < 0 || newPos.x >= gameState.gridWidth ||
            newPos.y < 0 || newPos.y >= gameState.gridHeight) {
            break; // Hit wall
        }
        
        // Check for box (obstacle)
        if (gameState.grid[newPos.y][newPos.x].specialGrid === 'box') {
            break; // Hit box
        }
        
        // Check for other enemies (but allow player position)
        if (gameState.grid[newPos.y][newPos.x].enemy !== null &&
            !gameState.grid[newPos.y][newPos.x].player) {
            break; // Hit another enemy
        }
        
        x = newPos.x;
        y = newPos.y;
        steps++;
        
        // Stop if hit player (combat will happen)
        if (gameState.grid[y][x].player) {
            break;
        }
    }
    
    return { x, y, steps };
}

// Find path to player - check if we can reach player in this turn
function findPathToPlayer(enemy, direction, maxSteps) {
    // Simulate movement step by step to see if we can reach player
    let x = enemy.x;
    let y = enemy.y;
    let steps = 0;
    
    while (steps < maxSteps) {
        const newPos = getNewPosition(x, y, direction);
        
        // Check boundaries
        if (newPos.x < 0 || newPos.x >= gameState.gridWidth ||
            newPos.y < 0 || newPos.y >= gameState.gridHeight) {
            break; // Hit wall
        }
        
        // Check for box (obstacle)
        if (gameState.grid[newPos.y][newPos.x].specialGrid === 'box') {
            break; // Hit box
        }
        
        // Check for other enemies (but allow player position)
        if (gameState.grid[newPos.y][newPos.x].enemy !== null &&
            !gameState.grid[newPos.y][newPos.x].player) {
            break; // Hit another enemy
        }
        
        x = newPos.x;
        y = newPos.y;
        steps++;
        
        // Check if we reached player
        if (x === gameState.player.x && y === gameState.player.y) {
            return { reachable: true, distance: 0, finalPos: { x, y, steps } };
        }
    }
    
    // Calculate distance from final position to player
    const distance = calculateManhattanDistance(x, y, gameState.player.x, gameState.player.y);
    return { reachable: false, distance, finalPos: { x, y, steps } };
}

// Find nearest item in a direction
function findNearestItemInDirection(enemy, direction, maxSteps) {
    const finalPos = calculateFinalPosition(enemy.x, enemy.y, direction, maxSteps);
    
    let nearestItem = null;
    let minDistance = Infinity;
    
    for (const item of gameState.items) {
        const distance = calculateManhattanDistance(
            finalPos.x, finalPos.y,
            item.x, item.y
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestItem = {
                item: item,
                distance: distance,
                reachable: distance <= maxSteps
            };
        }
    }
    
    return nearestItem;
}

// Evaluate position quality (avoid corners, avoid other enemies)
function evaluatePosition(enemy, direction, maxSteps) {
    const finalPos = calculateFinalPosition(enemy.x, enemy.y, direction, maxSteps);
    let score = 0;
    
    // Avoid corners (bad positions)
    const isCorner = (finalPos.x === 0 && finalPos.y === 0) ||
                     (finalPos.x === 0 && finalPos.y === gameState.gridHeight - 1) ||
                     (finalPos.x === gameState.gridWidth - 1 && finalPos.y === 0) ||
                     (finalPos.x === gameState.gridWidth - 1 && finalPos.y === gameState.gridHeight - 1);
    
    if (isCorner) {
        score -= 20;
    }
    
    // Prefer center positions
    const centerX = gameState.gridWidth / 2;
    const centerY = gameState.gridHeight / 2;
    const distanceFromCenter = calculateManhattanDistance(
        finalPos.x, finalPos.y, centerX, centerY
    );
    score += 10 - distanceFromCenter * 0.5;
    
    // Check if position is blocked by other enemies
    if (gameState.grid[finalPos.y][finalPos.x].enemy !== null &&
        gameState.grid[finalPos.y][finalPos.x].player === false) {
        score -= 50;
    }
    
    return score;
}

// Choose best target cell for enemy using AI (returns target cell coordinates)
function chooseBestTargetCell(enemy, roll) {
    // Only chase player if enemy is STRICTLY stronger (value > player value)
    // If equal or weaker, enemy should seek items to come back
    const isStronger = enemy.value > gameState.player.value;
    
    if (isStronger) {
        // Strong enemy: Chase player
        const playerPos = { x: gameState.player.x, y: gameState.player.y };
        const reachableCells = calculateReachableCells(enemy.x, enemy.y, roll);
        
        // Find closest reachable cell to player
        let bestCell = null;
        let minDistance = Infinity;
        
        for (const cellKey of reachableCells) {
            const [x, y] = cellKey.split(',').map(Number);
            const distance = calculateManhattanDistance(x, y, playerPos.x, playerPos.y);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestCell = { x, y };
            }
        }
        
        // If can reach player directly, target player
        const playerKey = `${playerPos.x},${playerPos.y}`;
        if (reachableCells.has(playerKey)) {
            return playerPos;
        }
        
        return bestCell || { x: enemy.x, y: enemy.y };
    } else {
        // Weak enemy: ALWAYS prioritize finding items to come back
        // Find items first (prioritize highest value items), then escape if no items
        const reachableCells = calculateReachableCells(enemy.x, enemy.y, roll);
        
        // Find best item in reachable cells (prioritize value, then distance)
        let bestItem = null;
        let bestItemScore = -1;
        
        for (const item of gameState.items) {
            const itemKey = `${item.x},${item.y}`;
            if (reachableCells.has(itemKey)) {
                const distance = calculateManhattanDistance(enemy.x, enemy.y, item.x, item.y);
                // Score: prioritize higher value items, then closer items
                // Higher value = more important, closer = easier to get
                const score = item.value * 100 - distance;
                
                if (score > bestItemScore) {
                    bestItemScore = score;
                    bestItem = { x: item.x, y: item.y };
                }
            }
        }
        
        // If found an item, always go for it (no matter what)
        if (bestItem) {
            return bestItem;
        }
        
        // No items available in reachable cells: Try to find path to nearest item
        // Even if not directly reachable, try to get closer to items
        if (gameState.items.length > 0) {
            let nearestItem = null;
            let minItemDistance = Infinity;
            
            for (const item of gameState.items) {
                const distance = calculateManhattanDistance(enemy.x, enemy.y, item.x, item.y);
                if (distance < minItemDistance) {
                    minItemDistance = distance;
                    nearestItem = item;
                }
            }
            
            if (nearestItem) {
                // Try to move closer to the nearest item
                let bestCell = null;
                let minDistanceToItem = Infinity;
                
                for (const cellKey of reachableCells) {
                    const [x, y] = cellKey.split(',').map(Number);
                    // Skip box cells
                    if (gameState.grid[y][x].specialGrid === 'box') {
                        continue;
                    }
                    const distanceToItem = calculateManhattanDistance(x, y, nearestItem.x, nearestItem.y);
                    
                    if (distanceToItem < minDistanceToItem) {
                        minDistanceToItem = distanceToItem;
                        bestCell = { x, y };
                    }
                }
                
                if (bestCell) {
                    return bestCell;
                }
            }
        }
        
        // No items available at all: Escape from player
        let bestCell = null;
        let maxDistance = -1;
        
        for (const cellKey of reachableCells) {
            const [x, y] = cellKey.split(',').map(Number);
            // Skip box cells
            if (gameState.grid[y][x].specialGrid === 'box') {
                continue;
            }
            const distance = calculateManhattanDistance(x, y, gameState.player.x, gameState.player.y);
            
            if (distance > maxDistance) {
                maxDistance = distance;
                bestCell = { x, y };
            }
        }
        
        return bestCell || { x: enemy.x, y: enemy.y };
    }
}


// End Player Turn
function endPlayerTurn() {
    gameState.currentTurn = 'enemy';
    elements.diceLabel.textContent = 'Enemy turn...';
    elements.diceFace.textContent = '...';
    
    // Enemy turn (movements already calculated and displayed)
    setTimeout(() => {
        enemyTurn();
    }, 500);
}

// Show Enemy Dice Roll
async function showEnemyDiceRoll(enemy, roll) {
    // Get enemy cell
    const cell = elements.gameGrid.querySelector(`[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
    if (!cell) return;
    
    // Create dice display element
    const diceDisplay = document.createElement('div');
    diceDisplay.className = 'enemy-dice-display rolling';
    diceDisplay.textContent = '?';
    cell.appendChild(diceDisplay);
    
    // Wait for rolling animation
    await sleep(500);
    
    // Update to show roll result
    diceDisplay.textContent = roll;
    diceDisplay.classList.remove('rolling');
    
    // Wait a bit to show result
    await sleep(400);
    
    // Remove dice display
    if (diceDisplay.parentNode) {
        diceDisplay.parentNode.removeChild(diceDisplay);
    }
}

// Enemy Turn - Process enemies one by one
async function enemyTurn() {
    if (!gameState.gameRunning) return;
    
    console.log('Enemy turn started');
    
    // Process each enemy one by one (sequentially)
    for (const enemy of [...gameState.enemies]) {
        if (!gameState.gameRunning) break;
        
        // Skip if enemy was removed
        if (!gameState.enemies.find(e => e.id === enemy.id)) continue;
        
        // Roll dice for enemy
        const roll = rollDice();
        console.log(`Enemy ${enemy.id} rolled: ${roll}`);
        
        // Show dice roll animation on enemy cell
        await showEnemyDiceRoll(enemy, roll);
        
        // Render grid to ensure enemy is visible
        renderGrid();
        await sleep(100);
        
        // Choose best target cell using AI
        const targetCell = chooseBestTargetCell(enemy, roll);
        console.log(`Enemy ${enemy.id} targeting: (${targetCell.x}, ${targetCell.y})`);
        
        // Find path to target
        const path = findPath(enemy.x, enemy.y, targetCell.x, targetCell.y, roll);
        
        if (!path || path.length === 0) {
            console.log(`Enemy ${enemy.id} has no path to target`);
            continue;
        }
        
        // Move enemy step by step following the path
        for (let i = 0; i < path.length && i < roll && gameState.gameRunning; i++) {
            const direction = path[i];
            const newPos = getNewPosition(enemy.x, enemy.y, direction);
            
            // Check if can move (wall)
            if (newPos.x < 0 || newPos.x >= gameState.gridWidth || 
                newPos.y < 0 || newPos.y >= gameState.gridHeight) {
                break; // Hit wall
            }
            
            // Check for box (obstacle)
            if (gameState.grid[newPos.y][newPos.x].specialGrid === 'box') {
                break; // Hit box
            }
            
            // Check for other enemies
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
                
                // Render and combat
                renderGrid();
                await sleep(100);
                await performEnemyCombat(enemy, newPos.x, newPos.y);
                break;
            }
            
            // Move enemy
            gameState.grid[enemy.y][enemy.x].enemy = null;
            enemy.x = newPos.x;
            enemy.y = newPos.y;
            gameState.grid[enemy.y][enemy.x].enemy = enemy.id;
            
            // Check for special grid effects (enemy can take damage from lava and swamp)
            const specialGrid = gameState.grid[enemy.y][enemy.x].specialGrid;
            if (specialGrid === 'lava') {
                // Enemy takes damage from lava
                const lavaDamage = CONFIG.SPECIAL_GRID_TYPES.lava.damage;
                if (enemy.value > lavaDamage) {
                    enemy.value -= lavaDamage;
                    console.log(`Enemy ${enemy.id} stepped on Lava! Lost ${lavaDamage} value.`);
                } else {
                    // Enemy dies from lava
                    console.log(`Enemy ${enemy.id} died from Lava!`);
                    gameState.grid[enemy.y][enemy.x].enemy = null;
                    gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
                    continue; // Skip to next enemy
                }
            } else if (specialGrid === 'swamp') {
                // Enemy takes damage from swamp
                const swampDamage = CONFIG.SPECIAL_GRID_TYPES.swamp.damage;
                if (enemy.value > swampDamage) {
                    enemy.value -= swampDamage;
                    console.log(`Enemy ${enemy.id} stepped on Swamp! Lost ${swampDamage} value.`);
                } else {
                    // Enemy dies from swamp
                    console.log(`Enemy ${enemy.id} died from Swamp!`);
                    gameState.grid[enemy.y][enemy.x].enemy = null;
                    gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
                    continue; // Skip to next enemy
                }
            }
            
            // Check for item
            if (gameState.grid[enemy.y][enemy.x].item !== null) {
                await enemyCollectItem(enemy, enemy.x, enemy.y);
            }
            
            renderGrid();
            await sleep(200);
        }
    }
    
    // End enemy turn
    if (gameState.gameRunning) {
        // Check instant win first, then impossible win after enemy turn
        if (!checkInstantWin()) {
            checkImpossibleWin();
        }
        
        if (gameState.gameRunning) {
            gameState.currentTurn = 'player';
            elements.diceLabel.textContent = 'Your turn';
            elements.diceFace.textContent = '?';
            elements.rollButton.disabled = false;
            elements.endTurnButton.style.display = 'none';
        }
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
    
    // Check instant win first, then impossible win after enemy collects item
    if (!checkInstantWin()) {
        checkImpossibleWin();
    }
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
    
    // Compare values - Player wins if value >= enemy
    // Enemy wins if value > player
    if (gameState.player.value >= enemy.value) {
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
            checkLevelComplete();
            return;
        }
        
        // Check instant win after defeating enemy
        if (checkInstantWin()) {
            return; // Instant win triggered
        }
    } else {
        // Enemy wins - Player loses (enemy value > player value)
        console.log(`Player lost! Enemy ${enemy.id} value (${enemy.value}) > Player value (${gameState.player.value}). Game Over.`);
        gameOver(false);
        return;
    }
}

// Check if player can instant win (player value >= all enemy values AND no items left)
function checkInstantWin() {
    if (!gameState.gameRunning || gameState.enemies.length === 0) {
        return false; // Game already over or won
    }
    
    // Check if there are no items left (enemies can't collect items to increase value)
    if (gameState.items.length > 0) {
        return false; // Still have items, enemies might collect them
    }
    
    // Check if player can defeat all enemies
    const canDefeatAll = gameState.enemies.every(enemy => gameState.player.value >= enemy.value);
    
    if (canDefeatAll) {
        console.log('Instant Win triggered! Player can defeat all enemies and no items left!');
        instantWin();
        return true;
    }
    
    return false;
}

// Instant Win - Player defeats all enemies with special animation
async function instantWin() {
    // Prevent further actions
    gameState.gameRunning = false;
    gameState.isMoving = true;
    
    console.log('🎉 INSTANT WIN! Player value:', gameState.player.value);
    
    // Delay before showing instant win message
    await sleep(800);
    
    // Show instant win message
    const instantWinMessage = document.createElement('div');
    instantWinMessage.className = 'instant-win-message';
    instantWinMessage.textContent = 'INSTANT WIN!';
    instantWinMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        font-weight: bold;
        color: #f1c40f;
        text-shadow: 0 0 20px rgba(241, 196, 15, 1), 0 0 40px rgba(241, 196, 15, 0.8);
        z-index: 10000;
        animation: instantWinPulse 1s ease-in-out infinite;
        pointer-events: none;
    `;
    document.body.appendChild(instantWinMessage);
    
    await sleep(1200);
    
    // Get all enemies sorted by distance from player
    const enemiesToDefeat = [...gameState.enemies].sort((a, b) => {
        const distA = calculateManhattanDistance(gameState.player.x, gameState.player.y, a.x, a.y);
        const distB = calculateManhattanDistance(gameState.player.x, gameState.player.y, b.x, b.y);
        return distA - distB;
    });
    
    // Defeat each enemy with animation
    for (const enemy of enemiesToDefeat) {
        if (!gameState.enemies.find(e => e.id === enemy.id)) continue; // Enemy already removed
        
        // Move player to enemy position (visual effect)
        const oldPlayerX = gameState.player.x;
        const oldPlayerY = gameState.player.y;
        
        // Temporarily move player to enemy position for animation
        gameState.grid[oldPlayerY][oldPlayerX].player = false;
        gameState.player.x = enemy.x;
        gameState.player.y = enemy.y;
        gameState.grid[enemy.y][enemy.x].player = true;
        
        renderGrid();
        await sleep(200);
        
        // Show combat effect on enemy cell
        const enemyCell = elements.gameGrid.querySelector(`[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
        if (enemyCell) {
            enemyCell.classList.add('combat');
            enemyCell.classList.add('instant-win-combat');
            
            // Create instant win effect
            const instantWinEffect = document.createElement('div');
            instantWinEffect.className = 'instant-win-effect';
            instantWinEffect.textContent = '⚡';
            instantWinEffect.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 60px;
                color: #f1c40f;
                text-shadow: 0 0 20px rgba(241, 196, 15, 1);
                z-index: 1000;
                animation: instantWinFlash 0.5s ease-out;
                pointer-events: none;
            `;
            enemyCell.style.position = 'relative';
            enemyCell.appendChild(instantWinEffect);
        }
        
        await sleep(300);
        
        // Absorb enemy value
        const enemyValue = enemy.value;
        gameState.player.value += enemyValue;
        
        // Remove enemy
        gameState.grid[enemy.y][enemy.x].enemy = null;
        gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
        
        // Show value gain animation
        if (enemyCell) {
            showValueGainAnimation(enemy.x, enemy.y, enemyValue);
            enemyCell.classList.remove('combat', 'instant-win-combat');
            
            // Remove effect after animation
            setTimeout(() => {
                const effect = enemyCell.querySelector('.instant-win-effect');
                if (effect) effect.remove();
            }, 500);
        }
        
        renderGrid();
        updateUI();
        await sleep(400);
    }
    
    // Move player back to original position (or keep at last enemy position)
    // Actually, let's keep player at the last enemy position
    
    // Remove instant win message
    if (instantWinMessage.parentNode) {
        instantWinMessage.parentNode.removeChild(instantWinMessage);
    }
    
    await sleep(500);
    
    // Show level complete
    checkLevelComplete();
}

// Check if player can still win (impossible win condition)
function checkImpossibleWin() {
    if (!gameState.gameRunning || gameState.enemies.length === 0) {
        return; // Game already over or won
    }
    
    // First check for instant win
    if (checkInstantWin()) {
        return; // Instant win triggered, don't check impossible win
    }
    
    // Calculate total possible player value (current + all remaining items)
    const totalItemValue = gameState.items.reduce((sum, item) => sum + item.value, 0);
    
    // Find enemies that player can currently defeat (with items)
    const currentMaxValue = gameState.player.value + totalItemValue;
    const defeatableEnemies = gameState.enemies.filter(enemy => currentMaxValue >= enemy.value);
    const undefeatableEnemies = gameState.enemies.filter(enemy => currentMaxValue < enemy.value);
    
    // If player cannot defeat any enemy even with all items, it's impossible
    if (defeatableEnemies.length === 0) {
        const strongestEnemy = gameState.enemies.reduce((max, e) => e.value > max.value ? e : max, gameState.enemies[0]);
        console.log(`Impossible win! Max possible value (${currentMaxValue}) cannot defeat any enemy. Strongest: ${strongestEnemy.value}. Game Over.`);
        gameOver(false);
        return;
    }
    
    // Calculate max possible value if player defeats all defeatable enemies
    const totalValueFromDefeatableEnemies = defeatableEnemies.reduce((sum, enemy) => sum + enemy.value, 0);
    const maxPossibleValueAfterDefeatingAll = currentMaxValue + totalValueFromDefeatableEnemies;
    
    // Check if even after defeating all defeatable enemies, player still can't beat remaining enemies
    if (undefeatableEnemies.length > 0) {
        const strongestUndefeatable = undefeatableEnemies.reduce((max, e) => e.value > max.value ? e : max, undefeatableEnemies[0]);
        
        if (maxPossibleValueAfterDefeatingAll < strongestUndefeatable.value) {
            console.log(`Impossible win! Even after defeating all defeatable enemies, max value (${maxPossibleValueAfterDefeatingAll}) cannot defeat strongest enemy (${strongestUndefeatable.value}). Game Over.`);
            gameOver(false);
            return;
        }
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

// Check Level Complete
function checkLevelComplete() {
    gameState.gameRunning = false;
    
    const levelConfig = gameState.levelConfig;
    const nextLevel = gameState.level + 1;
    const isLastLevel = nextLevel > CONFIG.LEVELS.length;
    
    if (isLastLevel) {
        // Game completed!
        gameOver(true, true);
    } else {
        // Level complete - show next level screen
        showLevelComplete(nextLevel);
    }
}

// Show Level Complete Screen
function showLevelComplete(nextLevel) {
    const levelConfig = gameState.levelConfig;
    const nextLevelConfig = getLevelConfig(nextLevel);
    
    const title = `Level ${gameState.level} Complete!`;
    const message = `You defeated all enemies!`;
    const stats = `Final value: ${gameState.player.value}\nNext: Level ${nextLevel} - ${nextLevelConfig.name}`;
    
    if (typeof HOME_MANAGER !== 'undefined' && HOME_MANAGER.showLevelComplete) {
        HOME_MANAGER.showLevelComplete(title, message, stats, nextLevel);
    } else {
        // Fallback: use gameOver screen
        setTimeout(() => {
            initGame(nextLevel);
        }, 2000);
    }
}

// Game Over
function gameOver(won, gameCompleted = false) {
    gameState.gameRunning = false;
    
    const levelConfig = gameState.levelConfig;
    const title = gameCompleted ? '🎉 Game Completed! 🎉' : (won ? 'Victory!' : 'Game Over!');
    const message = gameCompleted
        ? `Congratulations! You completed all ${CONFIG.LEVELS.length} levels!\nFinal value: ${gameState.player.value}`
        : won 
            ? `You defeated all enemies in Level ${gameState.level}!\nFinal value: ${gameState.player.value}`
            : `You were defeated in Level ${gameState.level}!\nYour value: ${gameState.player.value}`;
    const stats = `Level ${gameState.level}: ${levelConfig.name}\nEnemies defeated: ${levelConfig.enemyCount - gameState.enemies.length}/${levelConfig.enemyCount}`;
    
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

elements.endTurnButton.addEventListener('click', () => {
    endPlayerTurnManually();
});

// Reachable cells are handled in renderGrid() when cells are created

