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
    isMoving: false,
    // Run stats (persist across levels)
    runStats: {
        minRoll: 1,        // Minimum dice roll
        maxRoll: 2,        // Maximum dice roll (default 1-2)
        startValueBoost: 0 // Bonus to starting value
    },
    initialEnemyCount: 0,
    // Power-up system
    availablePowerups: [],
    currentResources: 0,
    resourceDiceRolled: false,
    nextLevel: null,
    // Gold system
    currentGold: 0,        // Gold collected in current run
    goldBags: [],           // Array of gold bag positions that have been collected
    // Combat system
    combatState: {
        active: false,
        playerHP: 0,
        enemyHP: 0,
        maxPlayerHP: 0,
        maxEnemyHP: 0,
        currentCombatTurn: 'player',
        enemyId: null,
        enemyEmoji: '👹',
        enemyName: 'Enemy'
    },
    // Item Spawn system
    pendingSpawns: []
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
    gridContainer: document.querySelector('.grid-container'),
    runStatsDisplay: document.getElementById('runStatsDisplay'),
    goldDisplay: document.getElementById('goldDisplay'),
    goldValue: document.getElementById('goldValue'),
    powerupScreen: document.getElementById('powerupScreen'),
    powerupCards: document.getElementById('powerupCards'),
    resourceDice: document.getElementById('resourceDice'),
    rollResourceDice: document.getElementById('rollResourceDice'),
    skipPowerup: document.getElementById('skipPowerup'),
    // Combat screen elements
    combatScreen: document.getElementById('combatScreen'),
    combatPlayerEmoji: document.getElementById('combatPlayerEmoji'),
    combatPlayerDice: document.getElementById('combatPlayerDice'),
    combatPlayerHPText: document.getElementById('combatPlayerHPText'),
    combatPlayerHPBar: document.getElementById('combatPlayerHPBar'),
    combatEnemyEmoji: document.getElementById('combatEnemyEmoji'),
    combatEnemyDice: document.getElementById('combatEnemyDice'),
    combatEnemyHPText: document.getElementById('combatEnemyHPText'),
    combatEnemyHPBar: document.getElementById('combatEnemyHPBar'),
    combatEnemyName: document.getElementById('combatEnemyName'),
    combatTurnText: document.getElementById('combatTurnText'),
    combatPlayerArea: document.getElementById('combatPlayerArea'),
    combatEnemyArea: document.getElementById('combatEnemyArea'),
    combatPlayerDamage: document.getElementById('combatPlayerDamage'),
    combatEnemyDamage: document.getElementById('combatEnemyDamage'),
    combatContainer: document.querySelector('.combat-container'),
    combatPlayerDiceRange: document.getElementById('combatPlayerDiceRange'),
    combatEnemyDiceRange: document.getElementById('combatEnemyDiceRange')
};

// Initialize Game
function initGame(levelNumber = 1) {
    console.log(`Initializing DiceBound - Level ${levelNumber}...`);
    
    // Get level config
    const levelConfig = getLevelConfig(levelNumber);
    
    // Get grid dimensions from layout if available, otherwise use default
    const gridWidth = levelConfig.layout ? levelConfig.layout[0].length : CONFIG.GRID_W;
    const gridHeight = levelConfig.layout ? levelConfig.layout.length : CONFIG.GRID_H;
    
    // Reset runStats if starting a new run (level 1)
    let currentRunStats;
    let playerStats;
    
    if (levelNumber === 1) {
        // New run - get base stats from upgrades
        let baseMinRoll = 1;
        let baseMaxRoll = 2;
        let baseStartValueBoost = 0;
        
        // Apply base upgrades from home screen
        if (typeof HOME_MANAGER !== 'undefined') {
            const baseUpgrades = HOME_MANAGER.getBaseUpgrades();
            baseMinRoll = 1 + baseUpgrades.minRoll;
            baseMaxRoll = 2 + baseUpgrades.maxRoll;
            baseStartValueBoost = baseUpgrades.startValueBoost;
            
            // Initialize player stats from upgrades
            // HP = starting value + HP upgrades
            const baseHP = levelConfig.playerStartValue + baseStartValueBoost + baseUpgrades.hp;
            // DMG: min=1 + dmgMin upgrades, max=starting value + dmgMax upgrades
            const baseDMGMin = 1 + baseUpgrades.dmgMin;
            const baseDMGMax = levelConfig.playerStartValue + baseStartValueBoost + baseUpgrades.dmgMax;
            // SPD: min=1 + spdMin upgrades, max=2 + spdMax upgrades (replaces minRoll-maxRoll)
            const baseSPDMin = 1 + baseUpgrades.spdMin;
            const baseSPDMax = 2 + baseUpgrades.spdMax;
            // INT: min=1 + intMin upgrades, max=2 + intMax upgrades
            const baseINTMin = 1 + baseUpgrades.intMin;
            const baseINTMax = 2 + baseUpgrades.intMax;
            
            playerStats = {
                hp: { current: baseHP, max: baseHP },
                dmg: { min: baseDMGMin, max: baseDMGMax },
                spd: { min: baseSPDMin, max: baseSPDMax },
                int: { min: baseINTMin, max: baseINTMax }
            };
        } else {
            // Fallback if HOME_MANAGER not available
            const baseHP = levelConfig.playerStartValue + baseStartValueBoost;
            playerStats = {
                hp: { current: baseHP, max: baseHP },
                dmg: { min: 1, max: baseHP },
                spd: { min: 1, max: 2 },
                int: { min: 1, max: 2 }
            };
        }
        
        currentRunStats = {
            minRoll: baseMinRoll,
            maxRoll: baseMaxRoll,
            startValueBoost: baseStartValueBoost
        };
        console.log(`Starting new run - base stats: min=${currentRunStats.minRoll}, max=${currentRunStats.maxRoll}, startBoost=${currentRunStats.startValueBoost}`);
        console.log(`Player stats: HP=${playerStats.hp.current}/${playerStats.hp.max}, DMG=${playerStats.dmg.min}-${playerStats.dmg.max}, SPD=${playerStats.spd.min}-${playerStats.spd.max}, INT=${playerStats.int.min}-${playerStats.int.max}`);
    } else {
        // Continue run - preserve stats
        currentRunStats = gameState.runStats || {
            minRoll: 1,
            maxRoll: 2,
            startValueBoost: 0
        };
        
        // Preserve player stats from previous level
        if (gameState.playerStats) {
            playerStats = { 
                ...gameState.playerStats,
                hp: { ...gameState.playerStats.hp } // Preserve current/max structure
            };
            // Keep current HP from previous level (don't reset to max)
        } else {
            // Fallback if playerStats doesn't exist
            const baseHP = levelConfig.playerStartValue + currentRunStats.startValueBoost;
            playerStats = {
                hp: { current: baseHP, max: baseHP },
                dmg: { min: 1, max: baseHP },
                spd: { min: currentRunStats.minRoll, max: currentRunStats.maxRoll },
                int: { min: 1, max: 2 }
            };
        }
        console.log(`Continuing run - stats: min=${currentRunStats.minRoll}, max=${currentRunStats.maxRoll}, startBoost=${currentRunStats.startValueBoost}`);
    }
    
    // Calculate starting value with boost
    const startingValue = levelConfig.playerStartValue + currentRunStats.startValueBoost;
    // Ensure HP max matches starting value (if new run, also set current)
    if (levelNumber === 1) {
        playerStats.hp.max = startingValue;
        playerStats.hp.current = startingValue;
    } else {
        // Preserve current HP, only update max if needed
        if (playerStats.hp.max < startingValue) {
            playerStats.hp.max = startingValue;
        }
    }
    
    gameState = {
        grid: [],
        gridWidth: gridWidth,
        gridHeight: gridHeight,
        level: levelNumber,
        levelConfig: levelConfig,
        objective: {
            type: 'defeat_all',
            target: null
        },
        player: {
            x: 0,
            y: 0,
            value: startingValue,
            lastValue: startingValue
        },
        playerStats: playerStats, // Player stats: HP, DMG, SPD, INT
        enemies: [],
        items: [],
        initialEnemyCount: 0, // Track initial enemy count for stats
        totalItemsSpawned: 0, // Track total items spawned in this level (for maxItems limit)
        currentTurn: 'player',
        playerRoll: null,
        playerRemainingSteps: 0,
        playerDirection: null,
        gameRunning: true,
        isMoving: false,
        runStats: currentRunStats, // Preserve run stats across levels
        // Preserve gold across levels in run
        currentGold: (levelNumber === 1) ? 0 : (gameState.currentGold || 0),
        goldBags: [], // Reset gold bags per level
        // Combat system
        combatState: {
            active: false,
            playerHP: 0,
            enemyHP: 0,
            maxPlayerHP: 0,
            maxEnemyHP: 0,
            currentCombatTurn: 'player',
            enemyId: null,
            enemyEmoji: '👹',
            enemyName: 'Enemy'
        },
        // Item Spawn system
        pendingSpawns: [],
        totalItemsSpawned: 0 // Reset counter for new level
    };

    // Initialize grid
    initializeGrid();
    
    // Load level from layout if available, otherwise use old random spawn
    if (levelConfig.layout) {
        loadLevelFromLayout(levelConfig);
    } else {
        // Fallback to old random spawn system
        spawnPlayer();
        spawnEnemies();
        spawnItems();
        spawnSpecialGrids();
    }
    
    // Render grid
    renderGrid();
    
    // Update UI
    updateUI();
    
    // Enable roll button
    elements.rollButton.disabled = false;
    // Use playerStats.spd for display
    let rollRange;
    if (gameState.playerStats && gameState.playerStats.spd) {
        rollRange = `${gameState.playerStats.spd.min}-${gameState.playerStats.spd.max}`;
    } else {
        rollRange = `${gameState.runStats.minRoll}-${gameState.runStats.maxRoll}`;
    }
    elements.diceLabel.textContent = `Roll to start (SPD: ${rollRange})`;
    elements.diceFace.textContent = '?';
    
    console.log(`Level ${levelNumber} - ${levelConfig.name}: ${levelConfig.description}`);
    console.log(`Run Stats - Min Roll: ${gameState.runStats.minRoll}, Max Roll: ${gameState.runStats.maxRoll}, Start Value Boost: +${gameState.runStats.startValueBoost}`);
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
                specialGrid: null, // 'box' | 'lava' | 'swamp' | 'canon' | null
                gold: false,       // Gold bag present
                goldAmount: 0,     // Gold amount in bag
                goldCollected: false // Whether gold has been collected
            };
        }
    }
}

// Find Enemy Type by Value
function findEnemyTypeByValue(value) {
    // Find exact match first
    let enemyType = CONFIG.ENEMY_TYPES.find(et => et.value === value);
    
    // If no exact match, find closest (lower or equal)
    if (!enemyType) {
        // Sort by value descending and find first that is <= value
        const sortedTypes = [...CONFIG.ENEMY_TYPES].sort((a, b) => b.value - a.value);
        enemyType = sortedTypes.find(et => et.value <= value);
    }
    
    // Fallback to first type if still not found
    return enemyType || CONFIG.ENEMY_TYPES[0];
}

// Find Item Type by Value
function findItemTypeByValue(value) {
    // Find exact match first
    let itemType = CONFIG.ITEM_TYPES.find(it => it.value === value);
    
    // If no exact match, find closest (lower or equal)
    if (!itemType) {
        // Sort by value descending and find first that is <= value
        const sortedTypes = [...CONFIG.ITEM_TYPES].sort((a, b) => b.value - a.value);
        itemType = sortedTypes.find(it => it.value <= value);
    }
    
    // Fallback to first type if still not found
    return itemType || CONFIG.ITEM_TYPES[0];
}

// Load Level from Layout Matrix
function loadLevelFromLayout(levelConfig) {
    const layout = levelConfig.layout;
    
    // Validate layout dimensions
    if (layout.length !== gameState.gridHeight) {
        console.warn(`Layout height (${layout.length}) doesn't match grid height (${gameState.gridHeight})`);
    }
    
    // Parse layout matrix
    for (let y = 0; y < layout.length && y < gameState.gridHeight; y++) {
        const row = layout[y];
        for (let x = 0; x < row.length && x < gameState.gridWidth; x++) {
            const cell = row[x];
            
            // Check if cell is a number (enemy or item)
            const cellNumber = typeof cell === 'number' ? cell : (typeof cell === 'string' && !isNaN(parseInt(cell)) ? parseInt(cell) : null);
            
            if (cellNumber !== null) {
                // Number cell: negative = enemy, positive = item
                if (cellNumber < 0) {
                    // Enemy: value = abs(negative number)
                    const enemyValue = Math.abs(cellNumber);
                    const enemyType = findEnemyTypeByValue(enemyValue);
                    
                    // Enemy stats based on value - HP equals value, DMG and SPD roll from 1 to value (like player)
                    const enemyHP = enemyValue; // HP always equals value
                    
                    const enemy = {
                        id: gameState.enemies.length,
                        x: x,
                        y: y,
                        value: enemyValue,
                        initialValue: enemyValue, // Store initial value for dice rolling
                        type: enemyType.name,
                        emoji: enemyType.emoji,
                        hp: { current: enemyHP, max: enemyHP },
                        dmg: { min: 1, max: enemyValue }, // DMG rolls from 1 to value (like player)
                        spd: { min: 1, max: enemyValue } // SPD rolls from 1 to value (like player)
                    };
                    gameState.enemies.push(enemy);
                    gameState.grid[y][x].enemy = enemy.id;
                } else if (cellNumber > 0) {
                    // Item: value = positive number
                    const itemValue = cellNumber;
                    const itemType = findItemTypeByValue(itemValue);
                    
                    const item = {
                        id: gameState.items.length,
                        x: x,
                        y: y,
                        value: itemValue,
                        type: itemType.name,
                        emoji: itemType.emoji
                    };
                    gameState.items.push(item);
                    gameState.grid[y][x].item = item.id;
                    // Increment total items spawned counter (for maxItems limit)
                    gameState.totalItemsSpawned++;
                }
                // cellNumber === 0 is treated as empty, continue to default case
            } else {
                // String cell: special markers
                switch (cell) {
                    case 'P':
                        // Player starting position
                        gameState.player.x = x;
                        gameState.player.y = y;
                        gameState.grid[y][x].player = true;
                        break;
                        
                    case 'B':
                        // Box (obstacle)
                        gameState.grid[y][x].specialGrid = 'box';
                        break;
                        
                    case 'L':
                        // Lava
                        gameState.grid[y][x].specialGrid = 'lava';
                        break;
                        
                    case 'S':
                        // Swamp
                        gameState.grid[y][x].specialGrid = 'swamp';
                        break;
                        
                    case 'C':
                        // Canon
                        gameState.grid[y][x].specialGrid = 'canon';
                        break;
                        
                    case 'G':
                        // Gold bag
                        gameState.grid[y][x].gold = true;
                        gameState.grid[y][x].goldAmount = levelConfig.goldPerBag || 5;
                        break;
                        
                    case '.':
                    case ' ':
                    case 0:
                        // Empty cell
                        break;
                        
                    default:
                        // Unknown cell type - try to parse as legacy format
                        if (cell === 'E' || cell === 'I') {
                            console.warn(`Legacy format '${cell}' detected at (${x}, ${y}). Please use numeric values: negative for enemies, positive for items.`);
                        } else {
                            console.warn(`Unknown cell type '${cell}' at position (${x}, ${y})`);
                        }
                        break;
                }
            }
        }
    }
    
    // Store initial enemy count for stats
    gameState.initialEnemyCount = gameState.enemies.length;
    
    console.log(`Loaded level from layout: ${gameState.enemies.length} enemies, ${gameState.items.length} items`);
}

// Spawn Player (fallback for old system)
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

// Spawn Enemies (fallback for old system)
function spawnEnemies() {
    gameState.enemies = [];
    const levelConfig = gameState.levelConfig;
    const enemyCount = levelConfig.enemyCount || 0;
    let attempts = 0;
    
    while (gameState.enemies.length < enemyCount && attempts < 100) {
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
            // Enemy stats based on value - HP equals value, DMG and SPD roll from 1 to value (like player)
            const enemyHP = enemyType.value; // HP always equals value
            
            const enemy = {
                id: gameState.enemies.length,
                x: x,
                y: y,
                value: enemyType.value,
                initialValue: enemyType.value, // Store initial value for dice rolling
                type: enemyType.name,
                emoji: enemyType.emoji,
                hp: { current: enemyHP, max: enemyHP },
                dmg: { min: 1, max: enemyType.value }, // DMG rolls from 1 to value (like player)
                spd: { min: 1, max: enemyType.value } // SPD rolls from 1 to value (like player)
            };
        
        gameState.enemies.push(enemy);
        gameState.grid[y][x].enemy = enemy.id;
        attempts++;
    }
    
    // Store initial enemy count for stats
    gameState.initialEnemyCount = gameState.enemies.length;
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
        
        // Filter item types by current level - item value must not exceed level
        const currentLevel = gameState.level;
        const availableItemTypes = CONFIG.ITEM_TYPES.filter(itemType => itemType.value <= currentLevel);
        
        if (availableItemTypes.length === 0) {
            // Fallback to smallest item if no items available for this level
            const smallestItem = CONFIG.ITEM_TYPES[0];
            const item = {
                id: gameState.items.length,
                x: x,
                y: y,
                value: smallestItem.value,
                type: smallestItem.name,
                emoji: smallestItem.emoji
            };
            gameState.items.push(item);
            gameState.grid[y][x].item = item.id;
            // Increment total items spawned counter (for maxItems limit)
            gameState.totalItemsSpawned++;
            attempts++;
            continue;
        }
        
        // Randomly select item type from available types
        const randomIndex = Math.floor(Math.random() * availableItemTypes.length);
        const itemType = availableItemTypes[randomIndex];
        if (!itemType) {
            console.error('Item type not found! Random index:', randomIndex, 'availableItemTypes length:', availableItemTypes.length);
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
        // Increment total items spawned counter (for maxItems limit)
        gameState.totalItemsSpawned++;
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
            
            // Add gold bag (always show if not collected)
            if (cellData.gold && !cellData.goldCollected) {
                cell.classList.add('gold-bag');
                cell.classList.add('special-grid');
                
                // Add gold icon as overlay - centered and larger (similar to special grid)
                const goldIcon = document.createElement('div');
                goldIcon.className = 'gold-icon-overlay';
                goldIcon.textContent = '💰';
                goldIcon.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 32px;
                    z-index: 1;
                    pointer-events: none;
                    line-height: 1;
                `;
                cell.appendChild(goldIcon);
                
                // Add gold amount display (top right corner of cell)
                const goldAmountDisplay = document.createElement('div');
                goldAmountDisplay.className = 'gold-amount-display';
                goldAmountDisplay.textContent = cellData.goldAmount || 0;
                goldAmountDisplay.style.cssText = `
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    background: rgba(241, 196, 15, 0.9);
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                    padding: 2px 4px;
                    border-radius: 4px;
                    z-index: 10;
                    pointer-events: none;
                    line-height: 1;
                `;
                cell.appendChild(goldAmountDisplay);
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
                // Display current HP instead of player.value
                const currentHP = gameState.playerStats ? gameState.playerStats.hp.current : gameState.player.value;
                valueBadge.textContent = currentHP;
                // Track last displayed HP for animation
                if (!gameState.player.lastHP) gameState.player.lastHP = currentHP;
                if (currentHP !== gameState.player.lastHP) {
                    valueBadge.classList.add('value-updated');
                    gameState.player.lastHP = currentHP;
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
                // Only show value badge if item exists and has a valid value
                if (item && item.value !== undefined && item.value !== null) {
                    const valueBadge = document.createElement('div');
                    valueBadge.className = 'value-badge item-value';
                    valueBadge.textContent = item.value;
                    // Ensure value badge doesn't block pointer events for reachable cells
                    if (isReachableCell) {
                        valueBadge.style.pointerEvents = 'none';
                    }
                    cell.appendChild(valueBadge);
                } else {
                    // Item reference exists in grid but item not found in items array - clean up
                    console.warn(`Item ${cellData.item} referenced in grid but not found in items array. Cleaning up.`);
                    cellData.item = null;
                }
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
    
    // Re-render pending spawn previews (always recreate after grid re-render)
    gameState.pendingSpawns.forEach(spawn => {
        const cell = elements.gameGrid.querySelector(`[data-x="${spawn.x}"][data-y="${spawn.y}"]`);
        if (!cell) return; // Cell not found, skip
        
        // Remove old preview if it exists (it's been destroyed by innerHTML = '')
        // We need to always recreate since grid was just re-rendered
        const itemType = findItemTypeByValue(spawn.value);
        const previewContainer = document.createElement('div');
        previewContainer.className = 'item-spawn-preview';
        previewContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 5;
            pointer-events: none;
        `;
        
        const itemEmoji = document.createElement('div');
        itemEmoji.className = 'item-spawn-emoji';
        itemEmoji.textContent = itemType.emoji;
        itemEmoji.style.cssText = `
            font-size: 32px;
            opacity: 0.4;
            filter: blur(1px);
            animation: itemSpawnPulse 1.5s ease-in-out infinite;
        `;
        
        const countdownContainer = document.createElement('div');
        countdownContainer.className = 'item-spawn-countdown';
        countdownContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 4px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            font-weight: bold;
        `;
        
        const clockIcon = document.createElement('span');
        clockIcon.textContent = '⏱️';
        clockIcon.style.fontSize = '12px';
        
        const countdownText = document.createElement('span');
        countdownText.className = 'item-spawn-turns';
        countdownText.textContent = spawn.turnsRemaining;
        
        countdownContainer.appendChild(clockIcon);
        countdownContainer.appendChild(countdownText);
        
        previewContainer.appendChild(itemEmoji);
        previewContainer.appendChild(countdownContainer);
        
        cell.style.position = 'relative';
        cell.appendChild(previewContainer);
        
        // Update references to new elements
        spawn.previewElement = previewContainer;
        spawn.countdownText = countdownText;
    });
    
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

// Sync HP max with player.value (for backward compatibility, but HP is now independent)
function syncHP() {
    // HP is now independent, but we can sync max if needed
    // This function is kept for compatibility but may not be needed
}

// Update UI
function updateUI() {
    // Update Level
    elements.levelValue.textContent = gameState.level;
    
    // Update Objective
    const objectiveDisplay = getObjectiveDisplay();
    elements.objectiveIcon.textContent = objectiveDisplay.icon;
    elements.objectiveText.textContent = objectiveDisplay.text;
    
    // Update Run Stats Display - show all 4 stats with icons
    if (elements.runStatsDisplay) {
        if (gameState.playerStats) {
            elements.runStatsDisplay.innerHTML = `
                <div class="stat-item">
                    <span class="stat-icon">❤️</span>
                    <span class="stat-label">HP:</span>
                    <span class="stat-value">${gameState.playerStats.hp.current}/${gameState.playerStats.hp.max}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">⚔️</span>
                    <span class="stat-label">DMG:</span>
                    <span class="stat-value">${gameState.playerStats.dmg.min}-${gameState.playerStats.dmg.max}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🏃</span>
                    <span class="stat-label">SPD:</span>
                    <span class="stat-value">${gameState.playerStats.spd.min}-${gameState.playerStats.spd.max}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🧠</span>
                    <span class="stat-label">INT:</span>
                    <span class="stat-value">${gameState.playerStats.int.min}-${gameState.playerStats.int.max}</span>
                </div>
            `;
        } else {
            // Fallback to old system
            elements.runStatsDisplay.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Dice:</span>
                    <span class="stat-value">${gameState.runStats.minRoll}-${gameState.runStats.maxRoll}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Base Power:</span>
                    <span class="stat-value">${2 + gameState.runStats.startValueBoost}</span>
                </div>
            `;
        }
    }
    
    // Update Gold Display
    if (elements.goldValue) {
        elements.goldValue.textContent = gameState.currentGold || 0;
    }
}

// Roll Dice - uses min/max from run stats (for player)
function rollDice() {
    // Use playerStats.spd for movement (replaces minRoll-maxRoll)
    if (gameState.playerStats && gameState.playerStats.spd) {
        const min = gameState.playerStats.spd.min;
        const max = gameState.playerStats.spd.max;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        // Fallback to old system
        const min = gameState.runStats.minRoll;
        const max = gameState.runStats.maxRoll;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// Roll Dice for Enemy - uses enemy.spd.max (based on initialValue)
// This function accepts either an enemy object or a number (for backward compatibility)
function rollEnemyDice(enemy) {
    // If enemy is an object, use spd stats
    if (enemy && typeof enemy === 'object' && enemy.spd) {
        return Math.floor(Math.random() * (enemy.spd.max - enemy.spd.min + 1)) + enemy.spd.min;
    } else {
        // Fallback: treat as old enemyValue number
        const enemyValue = typeof enemy === 'number' ? enemy : (enemy?.initialValue || enemy?.value || 1);
        return Math.floor(Math.random() * enemyValue) + 1;
    }
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
        
        // Check for gold bag
        const cellData = gameState.grid[gameState.player.y][gameState.player.x];
        if (cellData.gold && !cellData.goldCollected) {
            await collectGold(gameState.player.x, gameState.player.y);
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
    // Use playerStats.spd for display (replaces minRoll-maxRoll)
    let rollRange;
    if (gameState.playerStats && gameState.playerStats.spd) {
        rollRange = `${gameState.playerStats.spd.min}-${gameState.playerStats.spd.max}`;
    } else {
        // Fallback to old system
        rollRange = `${gameState.runStats.minRoll}-${gameState.runStats.maxRoll}`;
    }
    
    if (gameState.playerRemainingSteps > 0) {
        elements.diceFace.textContent = gameState.playerRemainingSteps;
        elements.diceLabel.textContent = `${gameState.playerRemainingSteps} step${gameState.playerRemainingSteps > 1 ? 's' : ''} remaining (SPD: ${rollRange})`;
        elements.endTurnButton.style.display = 'inline-block';
    } else {
        elements.diceFace.textContent = '?';
        elements.diceLabel.textContent = `Your turn (SPD: ${rollRange})`;
        elements.endTurnButton.style.display = 'none';
    }
}

// Handle Special Grid Effects
async function handleSpecialGrid(specialGridType, x, y) {
    const gridConfig = CONFIG.SPECIAL_GRID_TYPES[specialGridType];
    if (!gridConfig) return true;
    
    switch (specialGridType) {
        case 'lava':
            // Lava: Take damage to HP
            if (gameState.playerStats && gameState.playerStats.hp.current > gridConfig.damage) {
                gameState.playerStats.hp.current -= gridConfig.damage;
                showValueLossAnimation(x, y, gridConfig.damage);
                updateUI();
                renderGrid();
                await sleep(300);
                console.log(`Player stepped on Lava! Lost ${gridConfig.damage} HP.`);
            } else {
                // Player dies if HP reaches 0
                if (gameState.playerStats) {
                    gameState.playerStats.hp.current = 0;
                }
                console.log('Player died from Lava!');
                gameOver(false);
                return false;
            }
            return true;
            
        case 'swamp':
            // Swamp: Take damage to HP
            const swampDamage = gridConfig.damage || 2;
            if (gameState.playerStats && gameState.playerStats.hp.current > swampDamage) {
                gameState.playerStats.hp.current -= swampDamage;
                showValueLossAnimation(x, y, swampDamage);
                updateUI();
                renderGrid();
                await sleep(300);
                console.log(`Player stepped on Swamp! Lost ${swampDamage} HP.`);
            } else {
                // Player dies if HP reaches 0
                if (gameState.playerStats) {
                    gameState.playerStats.hp.current = 0;
                }
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
    
    // Check for gold bag at new position
    const cellData = gameState.grid[targetY][targetX];
    if (cellData.gold && !cellData.goldCollected) {
        await collectGold(targetX, targetY);
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
    
    // Get item type for emoji
    const itemType = findItemTypeByValue(item.value);
    const itemEmoji = itemType ? itemType.emoji : '⭐';
    
    // Remove item from grid first
    gameState.grid[y][x].item = null;
    gameState.items = gameState.items.filter(i => i.id !== itemId);
    
    // Animation
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (cell) {
        cell.classList.add('collecting');
        setTimeout(() => cell.classList.remove('collecting'), 500);
    }
    
    // Show pop-up for user to choose stat
    const selectedStat = await showItemStatSelection(item.value, itemEmoji);
    
    // Apply stat boost based on user selection
    if (selectedStat) {
        applyItemStatBoost(selectedStat, item.value, x, y);
    }
    
    // Check item spawn after collecting item
    checkItemSpawn();
}

// Show Item Stat Selection Pop-up
function showItemStatSelection(itemValue, itemEmoji) {
    return new Promise((resolve) => {
        const popup = document.getElementById('itemStatSelection');
        if (!popup) {
            resolve(null);
            return;
        }
        
        // Update pop-up content
        const emojiElement = document.getElementById('itemStatEmoji');
        const valueElement = document.getElementById('itemStatValue');
        if (emojiElement) emojiElement.textContent = itemEmoji;
        if (valueElement) valueElement.textContent = `+${itemValue}`;
        
        // Update current stat values
        if (gameState.playerStats) {
            const hpElement = document.getElementById('statOptionHP');
            const dmgElement = document.getElementById('statOptionDMG');
            const spdElement = document.getElementById('statOptionSPD');
            const intElement = document.getElementById('statOptionINT');
            
            if (hpElement) hpElement.textContent = `${gameState.playerStats.hp.current}/${gameState.playerStats.hp.max}`;
            if (dmgElement) dmgElement.textContent = gameState.playerStats.dmg.max;
            if (spdElement) spdElement.textContent = gameState.playerStats.spd.max;
            if (intElement) intElement.textContent = gameState.playerStats.int.max;
        }
        
        // Setup button handlers
        const buttons = popup.querySelectorAll('.stat-option-btn');
        const handleClick = (e) => {
            const stat = e.currentTarget.dataset.stat;
            // DON'T close pop-up here - let applyItemStatBoost() handle it after animation
            // Just remove listeners to prevent multiple clicks
            buttons.forEach(btn => {
                btn.removeEventListener('click', handleClick);
            });
            resolve(stat);
        };
        
        buttons.forEach(btn => {
            btn.addEventListener('click', handleClick);
        });
        
        // Show pop-up
        popup.style.display = 'flex';
    });
}

// Hide Item Stat Selection Pop-up
function hideItemStatSelection() {
    const popup = document.getElementById('itemStatSelection');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Apply Item Stat Boost
async function applyItemStatBoost(stat, value, x, y) {
    if (!gameState.playerStats) return;
    
    let statChange = '';
    let oldStatValue = 0;
    let newStatValue = 0;
    let statElement = null;
    
    switch (stat) {
        case 'hp':
            // HP: Heal current HP (cap at max), don't increase max
            oldStatValue = gameState.playerStats.hp.current;
            gameState.playerStats.hp.current = Math.min(gameState.playerStats.hp.current + value, gameState.playerStats.hp.max);
            newStatValue = gameState.playerStats.hp.current;
            statElement = document.getElementById('statOptionHP');
            statChange = `HP Healed +${newStatValue - oldStatValue}`;
            break;
            
        case 'dmg':
            // DMG: Increase DMG max only
            oldStatValue = gameState.playerStats.dmg.max;
            gameState.playerStats.dmg.max += value;
            newStatValue = gameState.playerStats.dmg.max;
            statElement = document.getElementById('statOptionDMG');
            statChange = `DMG Max +${value}`;
            break;
            
        case 'spd':
            // SPD: Increase SPD max only
            oldStatValue = gameState.playerStats.spd.max;
            gameState.playerStats.spd.max += value;
            newStatValue = gameState.playerStats.spd.max;
            statElement = document.getElementById('statOptionSPD');
            statChange = `SPD Max +${value}`;
            break;
            
        case 'int':
            // INT: Increase INT max only
            oldStatValue = gameState.playerStats.int.max;
            gameState.playerStats.int.max += value;
            newStatValue = gameState.playerStats.int.max;
            statElement = document.getElementById('statOptionINT');
            statChange = `INT Max +${value}`;
            break;
            
        default:
            console.warn(`Unknown stat: ${stat}`);
            return;
    }
    
    // Animate number incrementing in pop-up FIRST - this is the main animation
    // Don't update UI below until animation in pop-up is complete
    if (statElement) {
        await animateStatIncrement(statElement, oldStatValue, newStatValue, stat === 'hp');
    }
    
    // Wait a short moment to let user see the final value in pop-up
    await sleep(400);
    
    // NOW close the pop-up
    hideItemStatSelection();
    
    // After pop-up closes, update UI and show grid animations
    showValueGainAnimation(x, y, value);
    updateUI();
    renderGrid();
    
    console.log(`Applied item to ${stat}. ${statChange}`);
}

// Animate stat increment in pop-up
function animateStatIncrement(element, oldValue, newValue, isHP = false) {
    return new Promise((resolve) => {
        if (!element) {
            resolve();
            return;
        }
        
        // If no change, just resolve immediately
        if (oldValue === newValue) {
            resolve();
            return;
        }
        
        const duration = 600; // ms - smooth animation duration
        const steps = 25; // Steps for smooth animation
        const increment = (newValue - oldValue) / steps;
        let currentStep = 0;
        
        // Set transition for smooth animation
        element.style.transition = 'all 0.3s ease';
        
        const interval = setInterval(() => {
            currentStep++;
            const currentValue = Math.round(oldValue + (increment * currentStep));
            const displayValue = isHP ? `${currentValue}/${gameState.playerStats.hp.max}` : currentValue;
            element.textContent = displayValue;
            
            // Calculate progress (0 to 1)
            const progress = currentStep / steps;
            
            // Scale up and change to green simultaneously
            const scale = 1 + (progress * 0.4); // Scale from 1 to 1.4
            element.style.transform = `scale(${scale})`;
            
            // Change to green color as it scales up
            element.style.color = '#2ecc71'; // Green color
            element.style.fontWeight = 'bold';
            element.style.textShadow = `0 0 ${8 + progress * 4}px rgba(46, 204, 113, ${0.3 + progress * 0.5})`;
            
            if (currentStep >= steps) {
                clearInterval(interval);
                element.textContent = isHP ? `${newValue}/${gameState.playerStats.hp.max}` : newValue;
                // Final state: green and scaled
                element.style.transform = 'scale(1.4)';
                element.style.color = '#2ecc71';
                element.style.textShadow = '0 0 12px rgba(46, 204, 113, 0.8)';
                
                // Keep green highlight for a moment, then reset
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    element.style.color = '';
                    element.style.fontWeight = '';
                    element.style.textShadow = '';
                    element.style.transition = '';
                    setTimeout(resolve, 200);
                }, 400);
            }
        }, duration / steps);
    });
}

// Collect Gold
async function collectGold(x, y) {
    const cellData = gameState.grid[y][x];
    if (!cellData.gold || cellData.goldCollected) return;
    
    const goldAmount = cellData.goldAmount || 0;
    if (goldAmount <= 0) return;
    
    // Mark as collected
    cellData.goldCollected = true;
    gameState.currentGold += goldAmount;
    
    // Add to collected bags
    gameState.goldBags.push(`${x},${y}`);
    
    // Animation
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (cell) {
        cell.classList.add('collecting');
        setTimeout(() => cell.classList.remove('collecting'), 500);
    }
    
    // Show gold animation flying to top corner
    showGoldAnimation(x, y, goldAmount);
    
    updateUI();
    renderGrid(); // Re-render to remove gold
    await sleep(300);
    
    console.log(`Collected ${goldAmount} gold! Total gold: ${gameState.currentGold}`);
}

// Show Gold Animation (flying to top corner)
function showGoldAnimation(x, y, amount) {
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cell) return;
    
    const goldText = document.createElement('div');
    goldText.className = 'gold-animation';
    goldText.textContent = `💰 +${amount}`;
    goldText.style.position = 'fixed';
    goldText.style.left = cell.getBoundingClientRect().left + cell.offsetWidth / 2 + 'px';
    goldText.style.top = cell.getBoundingClientRect().top + cell.offsetHeight / 2 + 'px';
    goldText.style.transform = 'translate(-50%, -50%)';
    goldText.style.color = '#f1c40f';
    goldText.style.fontSize = '18px';
    goldText.style.fontWeight = 'bold';
    goldText.style.textShadow = '0 0 10px rgba(241, 196, 15, 0.8)';
    goldText.style.pointerEvents = 'none';
    goldText.style.zIndex = '10000';
    goldText.style.transition = 'all 1.2s ease-out';
    
    document.body.appendChild(goldText);
    
    // Get target position (top right corner of game header)
    const gameScreen = document.getElementById('gameScreen');
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
        const targetX = gameHeader.getBoundingClientRect().right - 60;
        const targetY = gameHeader.getBoundingClientRect().top + gameHeader.offsetHeight / 2;
        
        // Animate to top corner
        setTimeout(() => {
            goldText.style.left = targetX + 'px';
            goldText.style.top = targetY + 'px';
            goldText.style.transform = 'translate(-50%, -50%) scale(0.8)';
            goldText.style.opacity = '0';
            
            setTimeout(() => {
                if (goldText.parentNode) {
                    goldText.parentNode.removeChild(goldText);
                }
            }, 1200);
        }, 100);
    }
}

// ========== COMBAT SYSTEM ==========

// Show Combat Screen
function showCombatScreen(playerValue, enemyValue, enemyEmoji, enemyName, enemyId) {
    // Set combat state - use playerStats.hp.current and hp.max
    const playerHP = gameState.playerStats ? gameState.playerStats.hp.current : playerValue;
    const maxPlayerHP = gameState.playerStats ? gameState.playerStats.hp.max : playerValue;
    
    // Get enemy stats
    const enemy = gameState.enemies.find(e => e.id === enemyId);
    const enemyHP = enemy && enemy.hp ? enemy.hp.current : enemyValue;
    const maxEnemyHP = enemy && enemy.hp ? enemy.hp.max : enemyValue;
    
    gameState.combatState.active = true;
    gameState.combatState.playerHP = playerHP; // Use current HP
    gameState.combatState.enemyHP = enemyHP;
    gameState.combatState.maxPlayerHP = maxPlayerHP;
    gameState.combatState.maxEnemyHP = maxEnemyHP;
    gameState.combatState.currentCombatTurn = 'player';
    gameState.combatState.enemyId = enemyId;
    gameState.combatState.enemyEmoji = enemyEmoji;
    gameState.combatState.enemyName = enemyName || 'Enemy';
    
    // Update UI
    if (elements.combatPlayerEmoji) elements.combatPlayerEmoji.textContent = '🧙';
    if (elements.combatEnemyEmoji) elements.combatEnemyEmoji.textContent = enemyEmoji;
    if (elements.combatEnemyName) elements.combatEnemyName.textContent = enemyName || 'Enemy';
    
    // Update dice ranges (Damage: DMG min-max)
    if (elements.combatPlayerDiceRange) {
        // Player damage range from playerStats.dmg
        if (gameState.playerStats && gameState.playerStats.dmg) {
            elements.combatPlayerDiceRange.textContent = `${gameState.playerStats.dmg.min}-${gameState.playerStats.dmg.max}`;
        } else {
            // Fallback to old system
            const playerValue = gameState.player.value;
            elements.combatPlayerDiceRange.textContent = `1-${playerValue}`;
        }
    }
    if (elements.combatEnemyDiceRange) {
        // Enemy damage range is 1 to enemy.value
        elements.combatEnemyDiceRange.textContent = `1-${enemyValue}`;
    }
    
    // Update HP bars
    updateCombatHPBars();
    
    // Reset dice displays
    if (elements.combatPlayerDice) {
        elements.combatPlayerDice.textContent = '';
        elements.combatPlayerDice.classList.remove('visible', 'rolling');
    }
    if (elements.combatEnemyDice) {
        elements.combatEnemyDice.textContent = '';
        elements.combatEnemyDice.classList.remove('visible', 'rolling');
    }
    
    // Reset character states
    if (elements.combatPlayerArea) {
        elements.combatPlayerArea.classList.remove('attacking', 'defending');
    }
    if (elements.combatEnemyArea) {
        elements.combatEnemyArea.classList.remove('attacking', 'defending');
    }
    
    // Show combat screen
    if (elements.combatScreen) {
        elements.combatScreen.style.display = 'flex';
    }
    
    // Update turn indicator
    updateCombatTurnIndicator();
}

// Hide Combat Screen
function hideCombatScreen() {
    gameState.combatState.active = false;
    
    if (elements.combatScreen) {
        elements.combatScreen.style.display = 'none';
    }
    
    // Clear combat state
    gameState.combatState.playerHP = 0;
    gameState.combatState.enemyHP = 0;
    gameState.combatState.maxPlayerHP = 0;
    gameState.combatState.maxEnemyHP = 0;
    gameState.combatState.currentCombatTurn = 'player';
    gameState.combatState.enemyId = null;
}

// Update Combat HP Bars
function updateCombatHPBars() {
    const state = gameState.combatState;
    
    // Player HP
    const playerHPPercent = state.maxPlayerHP > 0 ? (state.playerHP / state.maxPlayerHP) * 100 : 0;
    if (elements.combatPlayerHPBar) {
        elements.combatPlayerHPBar.style.width = `${Math.max(0, playerHPPercent)}%`;
    }
    if (elements.combatPlayerHPText) {
        elements.combatPlayerHPText.textContent = `${state.playerHP}/${state.maxPlayerHP}`;
    }
    
    // Enemy HP
    const enemyHPPercent = state.maxEnemyHP > 0 ? (state.enemyHP / state.maxEnemyHP) * 100 : 0;
    if (elements.combatEnemyHPBar) {
        elements.combatEnemyHPBar.style.width = `${Math.max(0, enemyHPPercent)}%`;
    }
    if (elements.combatEnemyHPText) {
        elements.combatEnemyHPText.textContent = `${state.enemyHP}/${state.maxEnemyHP}`;
    }
}

// Update Combat Turn Indicator
function updateCombatTurnIndicator() {
    if (elements.combatTurnText) {
        const turn = gameState.combatState.currentCombatTurn;
        elements.combatTurnText.textContent = turn === 'player' ? 'Player Turn' : 'Enemy Turn';
    }
}

// Animate Dice Roll
async function animateDiceRoll(character, diceValue) {
    const diceElement = character === 'player' ? elements.combatPlayerDice : elements.combatEnemyDice;
    
    if (!diceElement) return;
    
    // Show dice
    diceElement.textContent = '?';
    diceElement.classList.add('visible', 'rolling');
    
    // Wait for rolling animation
    await sleep(500);
    
    // Show result
    diceElement.textContent = diceValue;
    diceElement.classList.remove('rolling');
    
    // Wait a bit to show result
    await sleep(400);
}

// Animate Attack
async function animateAttack(attacker, defender) {
    const attackerArea = attacker === 'player' ? elements.combatPlayerArea : elements.combatEnemyArea;
    const defenderArea = defender === 'player' ? elements.combatPlayerArea : elements.combatEnemyArea;
    
    if (!attackerArea || !defenderArea) return;
    
    // Add attacking class
    attackerArea.classList.add('attacking');
    defenderArea.classList.add('defending');
    
    // Wait for attack animation
    await sleep(600);
    
    // Remove classes
    attackerArea.classList.remove('attacking');
    defenderArea.classList.remove('defending');
}

// Animate Hit Effect
async function animateHitEffect(target, damage) {
    const damageElement = target === 'player' ? elements.combatPlayerDamage : elements.combatEnemyDamage;
    
    if (!damageElement) return;
    
    // Show damage number
    damageElement.textContent = `-${damage}`;
    damageElement.classList.add('show');
    
    // Add screen shake for significant damage
    if (damage >= 3 && elements.combatContainer) {
        elements.combatContainer.classList.add('shaking');
    }
    
    // Wait for animation
    await sleep(1000);
    
    // Remove classes
    damageElement.classList.remove('show');
    if (elements.combatContainer) {
        elements.combatContainer.classList.remove('shaking');
    }
    
    // Clear damage text
    damageElement.textContent = '';
}

// Animate HP Bar Update
async function animateHPBarUpdate(character, newHP) {
    const hpBar = character === 'player' ? elements.combatPlayerHPBar : elements.combatEnemyHPBar;
    
    if (!hpBar) return;
    
    // Add damaging class for flash effect
    hpBar.classList.add('damaging');
    
    // Update HP bar
    updateCombatHPBars();
    
    // Wait for flash
    await sleep(300);
    
    // Remove damaging class
    hpBar.classList.remove('damaging');
}

// Perform Combat Turn
async function performCombatTurn(turn) {
    const state = gameState.combatState;
    
    if (!state.active) return;
    
    // Update turn indicator
    state.currentCombatTurn = turn;
    updateCombatTurnIndicator();
    
    await sleep(300);
    
    // Roll dice
    let diceValue;
    if (turn === 'player') {
        // Player rolls from playerStats.dmg.min to playerStats.dmg.max
        if (gameState.playerStats && gameState.playerStats.dmg) {
            const dmgMin = gameState.playerStats.dmg.min;
            const dmgMax = gameState.playerStats.dmg.max;
            diceValue = Math.floor(Math.random() * (dmgMax - dmgMin + 1)) + dmgMin;
        } else {
            // Fallback to old system
            const maxPlayerRoll = gameState.player.value;
            diceValue = Math.floor(Math.random() * maxPlayerRoll) + 1;
        }
    } else {
        // Enemy rolls from enemy.dmg.min to enemy.dmg.max (like player)
        const enemy = gameState.enemies.find(e => e.id === state.enemyId);
        if (enemy && enemy.dmg) {
            const dmgMin = enemy.dmg.min;
            const dmgMax = enemy.dmg.max;
            diceValue = Math.floor(Math.random() * (dmgMax - dmgMin + 1)) + dmgMin;
        } else {
            // Fallback to old system
            const maxEnemyRoll = enemy ? enemy.value : state.maxEnemyHP;
            diceValue = Math.floor(Math.random() * maxEnemyRoll) + 1;
        }
    }
    
    // Animate dice roll
    await animateDiceRoll(turn, diceValue);
    
    // Animate attack
    const defender = turn === 'player' ? 'enemy' : 'player';
    await animateAttack(turn, defender);
    
    // Apply damage
    if (turn === 'player') {
        state.enemyHP = Math.max(0, state.enemyHP - diceValue);
        // Update enemy hp.current if enemy exists
        const enemy = gameState.enemies.find(e => e.id === state.enemyId);
        if (enemy && enemy.hp) {
            enemy.hp.current = state.enemyHP;
        }
    } else {
        state.playerHP = Math.max(0, state.playerHP - diceValue);
        // Update playerStats.hp.current
        if (gameState.playerStats) {
            gameState.playerStats.hp.current = state.playerHP;
        }
    }
    
    // Animate hit effect and HP bar update
    await Promise.all([
        animateHitEffect(defender, diceValue),
        animateHPBarUpdate(defender, turn === 'player' ? state.enemyHP : state.playerHP)
    ]);
    
    // Check if combat ended
    await checkCombatEnd();
}

// Check Combat End
async function checkCombatEnd() {
    const state = gameState.combatState;
    
    if (!state.active) return;
    
    // Check if someone died
    if (state.playerHP <= 0) {
        // Player lost - update HP
        if (gameState.playerStats) {
            gameState.playerStats.hp.current = 0;
        }
        await sleep(500);
        await resolveCombatResult(false);
        return;
    }
    
    if (state.enemyHP <= 0) {
        // Player won - update HP (no HP gain, just keep current)
        if (gameState.playerStats) {
            gameState.playerStats.hp.current = state.playerHP;
        }
        await sleep(500);
        await resolveCombatResult(true);
        return;
    }
    
    // Continue to next turn
    const nextTurn = state.currentCombatTurn === 'player' ? 'enemy' : 'player';
    await performCombatTurn(nextTurn);
}

// Resolve Combat Result
async function resolveCombatResult(playerWon) {
    const state = gameState.combatState;
    const enemyId = state.enemyId;
    
    // Hide combat screen
    hideCombatScreen();
    
    if (playerWon) {
        // Player wins - find and remove enemy
        const enemy = gameState.enemies.find(e => e.id === enemyId);
        if (enemy) {
            // Remove enemy - no HP gain, no stat changes
            // Just remove the enemy from the game
            
            // Remove enemy from grid
            for (let y = 0; y < gameState.gridHeight; y++) {
                for (let x = 0; x < gameState.gridWidth; x++) {
                    if (gameState.grid[y][x].enemy === enemyId) {
                        gameState.grid[y][x].enemy = null;
                    }
                }
            }
            
            // Remove enemy from array
            gameState.enemies = gameState.enemies.filter(e => e.id !== enemyId);
            
            // Re-render grid
            renderGrid();
            await sleep(100);
            
            updateUI();
            await sleep(300);
            
            console.log(`Player won combat! Enemy defeated.`);
            
            // Check win condition
            if (gameState.enemies.length === 0) {
                checkLevelComplete();
                return;
            }
            
            // Check item spawn after defeating enemy
            checkItemSpawn();
        }
    } else {
        // Player loses - Game Over
        console.log(`Player lost combat! Game Over.`);
        
        gameOver(false);
        return;
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
    
    // Show combat screen and start combat
    showCombatScreen(
        gameState.player.value,
        enemy.value,
        enemy.emoji || '👹',
        enemy.type || 'Enemy',
        enemyId
    );
    
    // Start combat with player turn
    await performCombatTurn('player');
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
    
    // Check item spawn after player turn (updatePendingSpawns is now called at start of turn)
    checkItemSpawn();
    
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
        
        // Check if enemy value equals player value - if so, attack immediately
        const playerValue = gameState.playerStats ? gameState.playerStats.hp.max : gameState.player.value;
        if (enemy.value === playerValue) {
            // Check if enemy is adjacent to player or can reach player
            const playerX = gameState.player.x;
            const playerY = gameState.player.y;
            const distance = Math.abs(enemy.x - playerX) + Math.abs(enemy.y - playerY);
            
            // If adjacent (distance = 1) or can reach in 1 step, attack immediately
            if (distance <= 1) {
                console.log(`Enemy ${enemy.id} (value ${enemy.value}) equals player value (${playerValue}) - attacking immediately!`);
                
                // Move enemy to player position if not already there
                if (distance === 1) {
                    gameState.grid[enemy.y][enemy.x].enemy = null;
                    enemy.x = playerX;
                    enemy.y = playerY;
                    gameState.grid[enemy.y][enemy.x].enemy = enemy.id;
                    renderGrid();
                    await sleep(200);
                }
                
                // Start combat immediately
                await performEnemyCombat(enemy, playerX, playerY);
                continue; // Skip movement for this enemy
            }
        }
        
        // Roll dice for enemy - max dice = enemy initial value (fixed at spawn)
        const roll = rollEnemyDice(enemy);
        const spdRange = enemy.spd ? `${enemy.spd.min}-${enemy.spd.max}` : `1-${enemy.initialValue}`;
        console.log(`Enemy ${enemy.id} (current value ${enemy.value}, initial value ${enemy.initialValue}) rolled: ${roll} (SPD range: ${spdRange})`);
        
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
                    // Sync enemy stats (HP, DMG, SPD) with new value
                    syncEnemyStats(enemy);
                    console.log(`Enemy ${enemy.id} stepped on Lava! Lost ${lavaDamage} value. New value: ${enemy.value}, HP: ${enemy.hp.current}/${enemy.hp.max}`);
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
                    // Sync enemy stats (HP, DMG, SPD) with new value
                    syncEnemyStats(enemy);
                    console.log(`Enemy ${enemy.id} stepped on Swamp! Lost ${swampDamage} value. New value: ${enemy.value}, HP: ${enemy.hp.current}/${enemy.hp.max}`);
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
        // Check item spawn after enemy turn (but don't update pending spawns - only player turn counts)
        checkItemSpawn();
        
        if (gameState.gameRunning) {
            gameState.currentTurn = 'player';
            
            // Check item spawn at the START of player turn (before player can roll)
            // This happens immediately when turn switches to player, before any player action
            await updatePendingSpawns();
            checkItemSpawn();
            
            elements.diceLabel.textContent = 'Your turn';
            elements.diceFace.textContent = '?';
            elements.rollButton.disabled = false;
            elements.endTurnButton.style.display = 'none';
        }
    }
}

// Sync Enemy Stats when value changes
function syncEnemyStats(enemy) {
    // Get old values before update
    const oldMaxHP = enemy.hp ? enemy.hp.max : enemy.value;
    const oldCurrentHP = enemy.hp ? enemy.hp.current : enemy.value;
    
    // Update max HP to match new value
    const newMaxHP = enemy.value;
    
    // Calculate value change
    const valueChange = enemy.value - oldMaxHP;
    
    // Update current HP: add the value change directly to current HP
    // If value increased by X, current HP increases by X
    // If value decreased by X, current HP decreases by X
    let newCurrentHP = oldCurrentHP + valueChange;
    
    // Ensure current HP doesn't exceed max
    newCurrentHP = Math.min(newCurrentHP, newMaxHP);
    // Ensure current HP is at least 1 if enemy is alive (value > 0)
    if (enemy.value > 0 && newCurrentHP <= 0) {
        newCurrentHP = 1;
    }
    // Ensure current HP doesn't go below 0
    newCurrentHP = Math.max(newCurrentHP, 0);
    
    // Update enemy stats
    enemy.hp = {
        current: newCurrentHP,
        max: newMaxHP
    };
    enemy.dmg = {
        min: 1,
        max: enemy.value
    };
    enemy.spd = {
        min: 1,
        max: enemy.value
    };
    
    console.log(`Enemy ${enemy.id} stats synced: value=${enemy.value}, HP=${newCurrentHP}/${newMaxHP} (was ${oldCurrentHP}/${oldMaxHP}, change=${valueChange})`);
}

// Enemy Collect Item
async function enemyCollectItem(enemy, x, y) {
    const itemId = gameState.grid[y][x].item;
    if (itemId === null) return;
    
    const item = gameState.items.find(i => i.id === itemId);
    if (!item) return;
    
    // Enemy gets value
    enemy.value += item.value;
    
    // Sync enemy stats (HP, DMG, SPD) with new value
    syncEnemyStats(enemy);
    
    // Remove item
    gameState.grid[y][x].item = null;
    gameState.items = gameState.items.filter(i => i.id !== itemId);
    
    // Render grid to update enemy value badge display
    renderGrid();
    updateUI();
    console.log(`Enemy ${enemy.id} collected item worth ${item.value}. New value: ${enemy.value}, HP: ${enemy.hp.current}/${enemy.hp.max}`);
    
    // Check item spawn after enemy collects item
    checkItemSpawn();
}

// Perform Enemy Combat (when enemy hits player)
async function performEnemyCombat(enemy, x, y) {
    console.log(`Enemy ${enemy.id} hit player! Combat: Player (${gameState.player.value}) vs Enemy (${enemy.value})`);
    
    // Stop any ongoing movement
    gameState.isMoving = false;
    
    // Ensure grid is rendered first
    renderGrid();
    await sleep(100);
    
    // Show combat screen and start combat (player always goes first)
    showCombatScreen(
        gameState.player.value,
        enemy.value,
        enemy.emoji || '👹',
        enemy.type || 'Enemy',
        enemy.id
    );
    
    // Start combat with player turn (player always goes first)
    await performCombatTurn('player');
}

// Item Spawn System

// Check if items need to be spawned
function checkItemSpawn() {
    if (!gameState.gameRunning) return;
    
    const levelConfig = getLevelConfig(gameState.level);
    const minItems = levelConfig.minItems || 3;
    const maxItems = levelConfig.maxItems || gameState.level; // Default to level number
    
    // Count both existing items and pending spawns (items that are already in spawn process)
    const currentItemCount = gameState.items.length + gameState.pendingSpawns.length;
    
    // Check if we need to spawn more items
    // IMPORTANT: Check totalItemsSpawned (total items ever spawned in this level) against maxItems
    // This prevents spawning too many items even if items are collected
    if (currentItemCount < minItems && gameState.totalItemsSpawned < maxItems) {
        // Calculate how many items we can still spawn (limited by maxItems)
        const remainingSpawnSlots = maxItems - gameState.totalItemsSpawned;
        const itemsNeeded = minItems - currentItemCount;
        const itemsToSpawn = Math.min(itemsNeeded, remainingSpawnSlots);
        
        for (let i = 0; i < itemsToSpawn; i++) {
            // Double check before each spawn to ensure we don't exceed maxItems
            if (gameState.totalItemsSpawned < maxItems) {
                initiateItemSpawn(levelConfig);
            }
        }
    }
}

// Initiate item spawn - find empty cell and create preview
function initiateItemSpawn(levelConfig) {
    // Check if we've reached maxItems limit
    const maxItems = levelConfig.maxItems || gameState.level;
    if (gameState.totalItemsSpawned >= maxItems) {
        console.log(`Max items limit reached (${maxItems}). Cannot spawn more items.`);
        return;
    }
    
    const spawnTurns = levelConfig.spawnTurns || 3;
    
    // Find all empty cells
    const emptyCells = [];
    for (let y = 0; y < gameState.gridHeight; y++) {
        for (let x = 0; x < gameState.gridWidth; x++) {
            const cell = gameState.grid[y][x];
            // Check if cell is empty (no player, enemy, item, special grid, gold, or pending spawn)
            if (!cell.player && 
                cell.enemy === null && 
                cell.item === null && 
                cell.specialGrid === null &&
                !cell.gold &&
                !gameState.pendingSpawns.find(spawn => spawn.x === x && spawn.y === y)) {
                emptyCells.push({ x, y });
            }
        }
    }
    
    if (emptyCells.length === 0) {
        console.log('No empty cells available for item spawn');
        return;
    }
    
    // Random select an empty cell
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // Filter item types by current level - item value must not exceed level
    const currentLevel = gameState.level;
    const availableItemTypes = CONFIG.ITEM_TYPES.filter(itemType => itemType.value <= currentLevel);
    
    if (availableItemTypes.length === 0) {
        console.log(`No available item types for level ${currentLevel} - using smallest item`);
        // Fallback to smallest item if no items available for this level
        const smallestItem = CONFIG.ITEM_TYPES[0];
        // Continue with spawn using smallest item
        const spawnValue = smallestItem.value;
        // Create preview element
        const cell = elements.gameGrid.querySelector(`[data-x="${randomCell.x}"][data-y="${randomCell.y}"]`);
        if (!cell) return;
        
        const previewContainer = document.createElement('div');
        previewContainer.className = 'item-spawn-preview';
        previewContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 5;
            pointer-events: none;
        `;
        
        const emoji = document.createElement('div');
        emoji.className = 'item-spawn-emoji';
        emoji.textContent = smallestItem.emoji;
        
        const countdown = document.createElement('div');
        countdown.className = 'item-spawn-countdown';
        const clockIcon = document.createElement('span');
        clockIcon.textContent = '⏰';
        const turnsText = document.createElement('span');
        turnsText.className = 'item-spawn-turns';
        turnsText.textContent = spawnTurns;
        countdown.appendChild(clockIcon);
        countdown.appendChild(turnsText);
        
        previewContainer.appendChild(emoji);
        previewContainer.appendChild(countdown);
        cell.appendChild(previewContainer);
        
        // Add to pending spawns
        gameState.pendingSpawns.push({
            x: randomCell.x,
            y: randomCell.y,
            value: spawnValue,
            turnsRemaining: spawnTurns,
            previewElement: previewContainer,
            countdownText: turnsText
        });
        
        console.log(`Item spawn initiated at (${randomCell.x}, ${randomCell.y}), will spawn in ${spawnTurns} turns (fallback to smallest item)`);
        return;
    }
    
    // Random select item value (weighted towards smaller items)
    const weights = [0.4, 0.3, 0.2, 0.1].slice(0, availableItemTypes.length); // Adjust weights to match available items
    // Normalize weights
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    let random = Math.random();
    let selectedItem = availableItemTypes[0];
    let cumulativeWeight = 0;
    for (let i = 0; i < availableItemTypes.length; i++) {
        cumulativeWeight += normalizedWeights[i];
        if (random <= cumulativeWeight) {
            selectedItem = availableItemTypes[i];
            break;
        }
    }
    
    // Create preview element
    const cell = elements.gameGrid.querySelector(`[data-x="${randomCell.x}"][data-y="${randomCell.y}"]`);
    if (!cell) return;
    
    const previewContainer = document.createElement('div');
    previewContainer.className = 'item-spawn-preview';
    previewContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 5;
        pointer-events: none;
    `;
    
    const itemEmoji = document.createElement('div');
    itemEmoji.className = 'item-spawn-emoji';
    itemEmoji.textContent = selectedItem.emoji;
    itemEmoji.style.cssText = `
        font-size: 32px;
        opacity: 0.4;
        filter: blur(1px);
        animation: itemSpawnPulse 1.5s ease-in-out infinite;
    `;
    
    const countdownContainer = document.createElement('div');
    countdownContainer.className = 'item-spawn-countdown';
    countdownContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        font-weight: bold;
    `;
    
    const clockIcon = document.createElement('span');
    clockIcon.textContent = '⏱️';
    clockIcon.style.fontSize = '12px';
    
    const countdownText = document.createElement('span');
    countdownText.className = 'item-spawn-turns';
    countdownText.textContent = spawnTurns;
    
    countdownContainer.appendChild(clockIcon);
    countdownContainer.appendChild(countdownText);
    
    previewContainer.appendChild(itemEmoji);
    previewContainer.appendChild(countdownContainer);
    
    cell.style.position = 'relative';
    cell.appendChild(previewContainer);
    
    // Add to pending spawns
    gameState.pendingSpawns.push({
        x: randomCell.x,
        y: randomCell.y,
        value: selectedItem.value,
        turnsRemaining: spawnTurns,
        previewElement: previewContainer,
        countdownText: countdownText
    });
    
    console.log(`Item spawn initiated at (${randomCell.x}, ${randomCell.y}), will spawn in ${spawnTurns} turns`);
}

// Update pending spawns - decrease turns and spawn when ready
// This should only be called at the START of player turn (not enemy turn)
async function updatePendingSpawns() {
    if (!gameState.gameRunning) return;
    
    let needsRender = false;
    const spawnsToProcess = [...gameState.pendingSpawns];
    
    for (const spawn of spawnsToProcess) {
        spawn.turnsRemaining--;
        
        // If turns reached 0, spawn the item
        if (spawn.turnsRemaining <= 0) {
            await spawnItemAtPosition(spawn.x, spawn.y, spawn.value);
            
            // Remove preview if it still exists
            if (spawn.previewElement && spawn.previewElement.parentNode) {
                spawn.previewElement.parentNode.removeChild(spawn.previewElement);
            }
            
            // Clear references
            spawn.previewElement = null;
            spawn.countdownText = null;
            
            // Remove from pending spawns
            gameState.pendingSpawns = gameState.pendingSpawns.filter(s => s !== spawn);
            
            needsRender = true; // Item was spawned, need to render
        } else {
            // Countdown updated, need to re-render to update preview display
            needsRender = true;
        }
    }
    
    // Re-render grid to ensure previews are visible with updated countdown
    // This will recreate all previews with the new turnsRemaining values
    if (needsRender) {
        renderGrid();
    }
}

// Spawn item at position
async function spawnItemAtPosition(x, y, value) {
    // Check if cell is still empty (except player/enemy - they can collect immediately)
    const cell = gameState.grid[y][x];
    if (cell.item !== null || cell.specialGrid !== null) {
        console.log(`Cannot spawn item at (${x}, ${y}) - cell is not empty`);
        return;
    }
    
    // Find item type
    const itemType = findItemTypeByValue(value);
    
    // Create item
    const item = {
        id: gameState.items.length,
        x: x,
        y: y,
        value: value,
        type: itemType.name,
        emoji: itemType.emoji
    };
    
    // Add to game state
    gameState.items.push(item);
    gameState.grid[y][x].item = item.id;
    
    // Increment total items spawned counter (for maxItems limit)
    gameState.totalItemsSpawned++;
    
    // Check if player or enemy is on this cell - collect immediately
    if (cell.player) {
        // Player is on this cell - collect immediately
        console.log(`Item spawned at (${x}, ${y}) and player immediately collects it!`);
        await collectItem(x, y);
        return;
    }
    
    if (cell.enemy !== null) {
        // Enemy is on this cell - enemy collects immediately
        const enemy = gameState.enemies.find(e => e.id === cell.enemy);
        if (enemy) {
            console.log(`Item spawned at (${x}, ${y}) and enemy ${enemy.id} immediately collects it!`);
            await enemyCollectItem(enemy, x, y);
            return;
        }
    }
    
    // Don't render here - renderGrid() will be called by updatePendingSpawns() after spawning
    console.log(`Item spawned at (${x}, ${y}) with value ${value}`);
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
    
    // Award gold for completing level
    const levelGold = levelConfig.goldPerLevel || 0;
    if (levelGold > 0) {
        gameState.currentGold += levelGold;
        console.log(`Level complete! Awarded ${levelGold} gold. Total gold: ${gameState.currentGold}`);
        updateUI();
    }
    
    // Get total levels from LEVEL_DESIGN or CONFIG
    const totalLevels = (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) 
        ? LEVEL_DESIGN.LEVELS.length 
        : (CONFIG.LEVELS ? CONFIG.LEVELS.length : 0);
    const isLastLevel = nextLevel > totalLevels;
    
    if (isLastLevel) {
        // Game completed! Save total gold
        saveTotalGold();
        gameOver(true, true);
    } else {
        // Level complete - show power-up selection screen
        showPowerupSelection(nextLevel);
    }
}

// Show Power-up Selection Screen
function showPowerupSelection(nextLevel) {
    // Generate random power-ups
    gameState.availablePowerups = POWERUP_CONFIG.getRandomPowerups(3);
    gameState.currentResources = 0;
    gameState.resourceDiceRolled = false;
    gameState.nextLevel = nextLevel;
    
    // Show power-up screen
    if (elements.powerupScreen) {
        elements.powerupScreen.style.display = 'flex';
    }
    
    // Update current INT range display
    const powerupDiceRange = document.getElementById('powerupDiceRange');
    if (powerupDiceRange) {
        if (gameState.playerStats && gameState.playerStats.int) {
            powerupDiceRange.textContent = `${gameState.playerStats.int.min}-${gameState.playerStats.int.max}`;
        } else if (gameState.runStats) {
            // Fallback to old system
            powerupDiceRange.textContent = `${gameState.runStats.minRoll}-${gameState.runStats.maxRoll}`;
        }
    }
    
    // Generate power-up cards
    generatePowerupCards();
    
    // Reset resource dice
    if (elements.resourceDice) {
        elements.resourceDice.textContent = '?';
    }
    if (elements.rollResourceDice) {
        elements.rollResourceDice.disabled = false;
    }
}

// Hide Power-up Selection Screen
function hidePowerupSelection() {
    if (elements.powerupScreen) {
        elements.powerupScreen.style.display = 'none';
    }
    
    // Reset resources
    gameState.currentResources = 0;
    gameState.resourceDiceRolled = false;
    gameState.availablePowerups = [];
    
    // Proceed to next level
    if (gameState.nextLevel) {
        initGame(gameState.nextLevel);
    }
}

// Generate Power-up Cards
function generatePowerupCards() {
    if (!elements.powerupCards) return;
    
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

// Update Power-up Cards Affordability
function updatePowerupCardsAffordability() {
    if (!elements.powerupCards) return;
    
    const cards = elements.powerupCards.querySelectorAll('.powerup-card');
    
    cards.forEach(card => {
        // Skip cards that are already selected
        if (card.classList.contains('selected')) {
            return;
        }
        
        const powerupId = card.dataset.powerupId;
        const powerup = POWERUP_CONFIG.getPowerup(powerupId);
        if (!powerup) return;
        
        const costElement = card.querySelector('.powerup-cost');
        
        if (gameState.currentResources >= powerup.diceRequired) {
            card.classList.remove('unaffordable');
            card.classList.add('affordable');
            if (costElement) costElement.classList.add('affordable');
        } else {
            card.classList.remove('affordable');
            card.classList.add('unaffordable');
            if (costElement) costElement.classList.remove('affordable');
        }
    });
}

// Roll Resource Dice - uses min/max from run stats
function rollResourceDice() {
    if (gameState.resourceDiceRolled || !elements.resourceDice) return;
    
    // Add rolling animation
    elements.resourceDice.classList.add('rolling');
    
    // Roll using INT stat (replaces minRoll-maxRoll)
    setTimeout(() => {
        let min, max;
        if (gameState.playerStats && gameState.playerStats.int) {
            min = gameState.playerStats.int.min;
            max = gameState.playerStats.int.max;
        } else {
            // Fallback to old system
            min = gameState.runStats.minRoll;
            max = gameState.runStats.maxRoll;
        }
        const rollResult = Math.floor(Math.random() * (max - min + 1)) + min;
        
        elements.resourceDice.textContent = rollResult;
        elements.resourceDice.classList.remove('rolling');
        if (elements.rollResourceDice) {
            elements.rollResourceDice.disabled = true;
        }
        gameState.resourceDiceRolled = true;
        gameState.currentResources = rollResult;
        
        // Update power-up cards affordability
        updatePowerupCardsAffordability();
    }, 1000);
}

// Select Power-up
function selectPowerup(powerupId) {
    const powerup = POWERUP_CONFIG.getPowerup(powerupId);
    
    if (!powerup || gameState.currentResources < powerup.diceRequired) {
        return; // Can't afford
    }
    
    // Mark power-up as selected
    const card = elements.powerupCards.querySelector(`[data-powerup-id="${powerupId}"]`);
    if (card) {
        card.classList.add('selected');
        card.classList.remove('affordable', 'unaffordable');
    }
    
    // Subtract resources
    gameState.currentResources -= powerup.diceRequired;
    
    // Update dice display
    if (elements.resourceDice) {
        elements.resourceDice.textContent = gameState.currentResources;
    }
    
    // Apply power-up effect
    applyPowerupEffect(powerup);
    
    // Update power-up cards affordability
    updatePowerupCardsAffordability();
    
    // Check if user can still afford any power-ups
    const canAffordAny = gameState.availablePowerups.some(p => 
        gameState.currentResources >= p.diceRequired && 
        !elements.powerupCards.querySelector(`[data-powerup-id="${p.id}"].selected`)
    );
    
    if (!canAffordAny) {
        // No more affordable power-ups, proceed to next level
        setTimeout(() => {
            hidePowerupSelection();
        }, 1000);
    }
}

// Apply Power-up Effect
function applyPowerupEffect(powerup) {
    if (!gameState.playerStats) {
        console.warn('playerStats not initialized, cannot apply power-up effect');
        return;
    }
    
    switch (powerup.effect) {
        case 'increase_min_roll':
            // Legacy: increase SPD min (replaces minRoll)
            gameState.runStats.minRoll += powerup.value;
            gameState.playerStats.spd.min += powerup.value;
            console.log(`SPD min increased to ${gameState.playerStats.spd.min}`);
            break;
            
        case 'increase_max_roll':
            // Legacy: increase SPD max (replaces maxRoll)
            gameState.runStats.maxRoll += powerup.value;
            gameState.playerStats.spd.max += powerup.value;
            console.log(`SPD max increased to ${gameState.playerStats.spd.max}`);
            break;
            
        case 'increase_start_value':
            gameState.runStats.startValueBoost += powerup.value;
            console.log(`Start value boost increased to +${gameState.runStats.startValueBoost}`);
            break;
            
        case 'increase_hp':
            // Increase max HP only (not current)
            gameState.playerStats.hp.max += powerup.value;
            console.log(`HP max increased to ${gameState.playerStats.hp.max}`);
            break;
            
        case 'heal_hp_1':
            // Heal +1 HP
            gameState.playerStats.hp.current = Math.min(
                gameState.playerStats.hp.current + 1,
                gameState.playerStats.hp.max
            );
            console.log(`Player healed +1 HP! HP: ${gameState.playerStats.hp.current}/${gameState.playerStats.hp.max}`);
            break;
        case 'heal_hp_2':
            // Heal +2 HP
            gameState.playerStats.hp.current = Math.min(
                gameState.playerStats.hp.current + 2,
                gameState.playerStats.hp.max
            );
            console.log(`Player healed +2 HP! HP: ${gameState.playerStats.hp.current}/${gameState.playerStats.hp.max}`);
            break;
            
        case 'increase_dmg_min':
            gameState.playerStats.dmg.min += powerup.value;
            console.log(`DMG min increased to ${gameState.playerStats.dmg.min}`);
            break;
            
        case 'increase_dmg_max':
            gameState.playerStats.dmg.max += powerup.value;
            console.log(`DMG max increased to ${gameState.playerStats.dmg.max}`);
            break;
            
        case 'increase_spd_min':
            gameState.playerStats.spd.min += powerup.value;
            gameState.runStats.minRoll += powerup.value; // Keep legacy in sync
            console.log(`SPD min increased to ${gameState.playerStats.spd.min}`);
            break;
            
        case 'increase_spd_max':
            gameState.playerStats.spd.max += powerup.value;
            gameState.runStats.maxRoll += powerup.value; // Keep legacy in sync
            console.log(`SPD max increased to ${gameState.playerStats.spd.max}`);
            break;
            
        case 'increase_int_min':
            gameState.playerStats.int.min += powerup.value;
            console.log(`INT min increased to ${gameState.playerStats.int.min}`);
            break;
            
        case 'increase_int_max':
            gameState.playerStats.int.max += powerup.value;
            console.log(`INT max increased to ${gameState.playerStats.int.max}`);
            break;
            
        default:
            console.log('Power-up effect not implemented:', powerup.effect);
            break;
    }
    
    // Update UI to reflect new stats
    updateUI();
}

// Show Level Complete Screen (fallback, not used when power-ups are active)
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

// Save Total Gold to localStorage (also sync to HOME_MANAGER)
function saveTotalGold() {
    // Always get the most up-to-date gold from HOME_MANAGER first
    let totalGold = 0;
    if (typeof HOME_MANAGER !== 'undefined' && HOME_MANAGER.playerData) {
        totalGold = HOME_MANAGER.playerData.totalGold;
    } else {
        // Fallback to old system
        const saved = localStorage.getItem('diceBoundTotalGold');
        totalGold = saved ? parseInt(saved, 10) : 0;
    }
    
    const newTotal = totalGold + gameState.currentGold;
    
    // Save to both systems
    localStorage.setItem('diceBoundTotalGold', newTotal.toString());
    
    // Sync to HOME_MANAGER playerData
    if (typeof HOME_MANAGER !== 'undefined') {
        HOME_MANAGER.playerData.totalGold = newTotal;
        HOME_MANAGER.savePlayerData();
    }
    
    console.log(`Saved ${gameState.currentGold} gold to total. New total: ${newTotal}`);
}

// Load Total Gold from localStorage (prefer HOME_MANAGER if available)
function loadTotalGold() {
    // Try to get from HOME_MANAGER first (most reliable source)
    if (typeof HOME_MANAGER !== 'undefined' && HOME_MANAGER.playerData) {
        // Sync to old system if different
        const playerGold = HOME_MANAGER.playerData.totalGold;
        const oldGold = localStorage.getItem('diceBoundTotalGold');
        const oldGoldValue = oldGold ? parseInt(oldGold, 10) : 0;
        
        if (playerGold !== oldGoldValue && playerGold > oldGoldValue) {
            // Sync playerData to old system if playerData is higher
            localStorage.setItem('diceBoundTotalGold', playerGold.toString());
        }
        
        return playerGold;
    }
    
    // Fallback to old system
    const saved = localStorage.getItem('diceBoundTotalGold');
    return saved ? parseInt(saved, 10) : 0;
}

// Game Over
function gameOver(won, gameCompleted = false) {
    gameState.gameRunning = false;
    
    // Save gold only when game ends (win or completed)
    if (gameState.currentGold > 0 && won) {
        saveTotalGold();
    }
    
    const levelConfig = gameState.levelConfig;
    // Get total levels from LEVEL_DESIGN or CONFIG
    const totalLevels = (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) 
        ? LEVEL_DESIGN.LEVELS.length 
        : (CONFIG.LEVELS ? CONFIG.LEVELS.length : 0);
    
    const title = gameCompleted ? '🎉 Game Completed! 🎉' : (won ? 'Victory!' : 'Game Over!');
    const message = gameCompleted
        ? `Congratulations! You completed all ${totalLevels} levels!\nFinal value: ${gameState.player.value}`
        : won 
            ? `You defeated all enemies in Level ${gameState.level}!\nFinal value: ${gameState.player.value}`
            : `You were defeated in Level ${gameState.level}!\nYour value: ${gameState.player.value}`;
    // Calculate enemies defeated from initial count
    const totalEnemies = gameState.initialEnemyCount || gameState.enemies.length;
    const enemiesDefeated = totalEnemies - gameState.enemies.length;
    const stats = `Level ${gameState.level}: ${levelConfig.name}\nEnemies defeated: ${enemiesDefeated}/${totalEnemies}`;
    
    // Show run summary when lost
    const runSummary = !won ? {
        level: gameState.level,
        gold: gameState.currentGold
    } : null;
    
    if (typeof HOME_MANAGER !== 'undefined' && HOME_MANAGER.showGameOver) {
        HOME_MANAGER.showGameOver(title, message, stats, runSummary);
    }
}

// Exit Game (no rewards, no save)
function exitGame() {
    // Confirm exit
    const confirmed = confirm('Exit game? You will not receive any gold or rewards from this run.');
    if (!confirmed) {
        return;
    }
    
    // Stop game
    gameState.gameRunning = false;
    
    // Reset current gold (don't save)
    gameState.currentGold = 0;
    
    // Return to home screen
    if (typeof HOME_MANAGER !== 'undefined' && HOME_MANAGER.showHomeScreen) {
        HOME_MANAGER.showHomeScreen();
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

// Power-up screen event listeners
if (elements.rollResourceDice) {
    elements.rollResourceDice.addEventListener('click', () => {
        rollResourceDice();
    });
}

if (elements.skipPowerup) {
    elements.skipPowerup.addEventListener('click', () => {
        hidePowerupSelection();
    });
}

// Exit game button
const exitGameBtn = document.getElementById('exitGameBtn');
if (exitGameBtn) {
    exitGameBtn.addEventListener('click', () => {
        exitGame();
    });
}

// Reachable cells are handled in renderGrid() when cells are created

