// DiceRogue Game Logic

// Objective Types Configuration
const OBJECTIVE_TYPES = {
    'defeat_all': {
        icon: '👸',
        text: 'Rescue the princess'
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
    isCanonSelecting: false, // Flag to disable normal movement when selecting canon target
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
    pendingSpawns: [],
    // Princess Rescue system
    princessRescued: false,
    princess: { x: -1, y: -1, rescued: false },
    portal: { x: -1, y: -1, active: false },
    // Cheat mode (for debugging/viewing full map)
    cheatMode: false,
    // Day/Night Cycle system
    dayNightCycle: {
        currentDay: 1,           // Current day (1-3)
        currentNight: 0,         // Current night (0-3)
        isDay: true,             // true = day, false = night
        dayTurnCount: 0,         // Turns in current day
        nightTurnCount: 0,       // Turns in current night
        maxDayTurns: 50,         // Max moves per day (configurable)
        maxNightTurns: 30,       // Max moves per night (configurable)
        visionRadius: 5,         // Day vision (5 cells)
        nightVisionRadius: 3,    // Night vision (3 cells)
        currentWeek: 1           // Current week (1 week = 3 days + 3 nights)
    },
    // Boss System
    bossState: {
        currentBossIndex: 0,          // Which boss in the run (0, 1, 2...)
        bossesDefeated: 0,            // Number of bosses defeated
        bossActive: false,            // Is boss fight currently active
        currentBoss: null,            // Current boss data
        bossSpawnWeek: 1              // Week when boss should spawn
    }
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
    console.log(`Initializing DiceRogue - Level ${levelNumber}...`);
    
    // Generate procedural dungeon
    const dungeonConfig = CONFIG.DUNGEON_CONFIG;
    const roomCount = Math.floor(Math.random() * (dungeonConfig.roomCountMax - dungeonConfig.roomCountMin + 1)) + dungeonConfig.roomCountMin;
    const dungeon = generateDungeon(
        dungeonConfig.mapWidth,
        dungeonConfig.mapHeight,
        roomCount,
        dungeonConfig.minRoomSize,
        dungeonConfig.maxRoomSize
    );
    
    const gridWidth = dungeonConfig.mapWidth;
    const gridHeight = dungeonConfig.mapHeight;
    
    // Create a minimal levelConfig for compatibility
    const levelConfig = {
        level: levelNumber,
        name: `Dungeon Floor ${levelNumber}`,
        playerStartValue: 2,
        description: 'Procedurally generated dungeon',
        enemyCount: Math.floor((gridWidth * gridHeight) / 15),
        itemCount: Math.floor((gridWidth * gridHeight) / 20),
        specialGridCount: Math.floor((gridWidth * gridHeight) / 25)
    };
    
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
    
    // Calculate starting value with boost (for backward compatibility, but HP max is now independent)
    const startingValue = levelConfig.playerStartValue + currentRunStats.startValueBoost;
    // HP max is already set correctly from baseHP (includes HP upgrades) for level 1
    // For other levels, only update max if it's lower than starting value (shouldn't happen, but safety check)
    if (levelNumber !== 1) {
        // Preserve current HP, only update max if needed (but this shouldn't happen as HP upgrades are applied at level 1)
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
        isCanonSelecting: false, // Flag to disable normal movement when selecting canon target
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
            enemyName: 'Enemy',
            isBoss: false,
            bossData: null
        },
        // Item Spawn system
        pendingSpawns: [],
        totalItemsSpawned: 0, // Reset counter for new level
        // Princess Rescue system
        princessRescued: false,
        princess: { x: -1, y: -1, rescued: false },
        portal: { x: -1, y: -1, active: false },
        // Fog of War system
        discoveredCells: new Set(), // Set of cell keys "x,y" that have been seen
        visibleCells: new Set(), // Set of cell keys "x,y" currently in vision range
        // Day/Night Cycle system
        dayNightCycle: (levelNumber === 1) ? {
            currentDay: 1,
            currentNight: 0,
            isDay: true,
            dayTurnCount: 0,
            nightTurnCount: 0,
            maxDayTurns: CONFIG.DAY_NIGHT_CONFIG.maxDayTurns,
            maxNightTurns: CONFIG.DAY_NIGHT_CONFIG.maxNightTurns,
            visionRadius: CONFIG.DAY_NIGHT_CONFIG.dayVisionRadius,
            nightVisionRadius: CONFIG.DAY_NIGHT_CONFIG.nightVisionRadius,
            currentWeek: 1
        } : (gameState.dayNightCycle || {
            currentDay: 1,
            currentNight: 0,
            isDay: true,
            dayTurnCount: 0,
            nightTurnCount: 0,
            maxDayTurns: CONFIG.DAY_NIGHT_CONFIG.maxDayTurns,
            maxNightTurns: CONFIG.DAY_NIGHT_CONFIG.maxNightTurns,
            visionRadius: CONFIG.DAY_NIGHT_CONFIG.dayVisionRadius,
            nightVisionRadius: CONFIG.DAY_NIGHT_CONFIG.nightVisionRadius,
            currentWeek: 1
        }),
        // Boss System
        bossState: (levelNumber === 1) ? {
            currentBossIndex: 0,
            bossesDefeated: 0,
            bossActive: false,
            currentBoss: null,
            bossSpawnWeek: CONFIG.BOSS_CONFIG.spawnAfterWeeks
        } : (gameState.bossState || {
            currentBossIndex: 0,
            bossesDefeated: 0,
            bossActive: false,
            currentBoss: null,
            bossSpawnWeek: CONFIG.BOSS_CONFIG.spawnAfterWeeks
        }),
        // POI System
        visitedPOIs: new Set(), // Set of POI positions "x,y" that have been used
        poiData: {} // Object to store POI-specific data
    };

    // Initialize grid from dungeon
    initializeGridFromDungeon(dungeon, gridWidth, gridHeight);
    
    // Initialize camera system
    if (typeof CAMERA !== 'undefined') {
        CAMERA.init();
    }
    
    // Initialize day/night cycle (reset when starting new run)
    initDayNightCycle(levelNumber === 1);
    
    // Place entities from dungeon
    const entities = placeEntities(dungeon, levelConfig);
    loadDungeonEntities(entities, dungeon.playerStart);
    
    // Initialize fog of war - discover starting room
    // updateFogOfWar(); // TEMPORARILY DISABLED
    
    // Show cheat button when game starts
    if (cheatViewMapBtn) {
        cheatViewMapBtn.style.display = 'flex';
    }
    if (cheatNormalViewBtn) {
        cheatNormalViewBtn.style.display = 'flex'; // Show button to open full map view
    }
    // Reset cheat mode when starting new game
    gameState.cheatMode = false;
    
    // Reset UI state
    if (elements.rollButton) {
        elements.rollButton.disabled = false;
    }
    if (elements.endTurnButton) {
        elements.endTurnButton.style.display = 'none';
    }
    if (elements.diceLabel) {
        elements.diceLabel.textContent = 'Roll to start';
    }
    if (elements.diceFace) {
        elements.diceFace.textContent = '?';
    }
    
    // Hide combat screen if it's showing
    if (elements.combatScreen) {
        elements.combatScreen.style.display = 'none';
    }
    gameState.combatState.active = false;
    gameState.combatState.isBoss = false;
    gameState.combatState.bossData = null;
    
    // Hide powerup screen if it's showing
    const powerupScreen = document.getElementById('powerupScreen');
    if (powerupScreen) {
        powerupScreen.style.display = 'none';
    }
    
    // Render grid
    renderGrid();
    
    // Update UI
    updateUI();
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
                princess: false,  // Princess present
                portal: false,    // Portal present
                goldAmount: 0,     // Gold amount in bag
                goldCollected: false // Whether gold has been collected
            };
        }
    }
}

// Initialize Grid from Dungeon
function initializeGridFromDungeon(dungeon, gridWidth, gridHeight) {
    gameState.grid = [];
    const dungeonGrid = dungeon.grid;
    
    for (let y = 0; y < gridHeight; y++) {
        gameState.grid[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            const cellValue = dungeonGrid[y] && dungeonGrid[y][x];
            
            // 0 = wall, 1 = floor (obstacles are now handled as specialGrids, not grid values)
            const isFloor = cellValue === 1;
            
            // Random grid asset variant for this cell (0-3 for 4 variants)
            const gridAssetIndex = isFloor && typeof assetManager !== 'undefined' 
                ? assetManager.getRandomGridVariantIndex() 
                : -1;
            
            gameState.grid[y][x] = {
                player: false,
                enemy: null,
                item: null,
                specialGrid: null,
                gold: false,
                princess: false,
                portal: false,
                goldAmount: 0,
                goldCollected: false,
                isFloor: isFloor, // Mark if cell is walkable (floor)
                gridAssetIndex: gridAssetIndex // Random grid asset variant (0-3)
            };
        }
    }
}

// Load Dungeon Entities into Grid
function loadDungeonEntities(entities, playerStart) {
    // Place player - MUST be on a walkable cell (isFloor === true)
    // Verify playerStart is walkable
    const playerCell = gameState.grid[playerStart.y] && gameState.grid[playerStart.y][playerStart.x];
    if (!playerCell || playerCell.isFloor !== true) {
        // Find nearest walkable cell if playerStart is not walkable
        console.warn(`Player start position (${playerStart.x}, ${playerStart.y}) is not walkable! Finding nearest walkable cell...`);
        let foundWalkable = false;
        for (let radius = 1; radius < Math.max(gameState.gridWidth, gameState.gridHeight) && !foundWalkable; radius++) {
            for (let dy = -radius; dy <= radius && !foundWalkable; dy++) {
                for (let dx = -radius; dx <= radius && !foundWalkable; dx++) {
                    const checkX = playerStart.x + dx;
                    const checkY = playerStart.y + dy;
                    if (checkX >= 0 && checkX < gameState.gridWidth && 
                        checkY >= 0 && checkY < gameState.gridHeight) {
                        const cell = gameState.grid[checkY] && gameState.grid[checkY][checkX];
                        if (cell && cell.isFloor === true) {
                            playerStart.x = checkX;
                            playerStart.y = checkY;
                            foundWalkable = true;
                            console.log(`Found walkable cell at (${checkX}, ${checkY})`);
                        }
                    }
                }
            }
        }
        if (!foundWalkable) {
            console.error('ERROR: Could not find any walkable cell for player spawn!');
        }
    }
    
    gameState.player.x = playerStart.x;
    gameState.player.y = playerStart.y;
    gameState.grid[playerStart.y][playerStart.x].player = true;
    
    // Place enemies
    entities.enemies.forEach((enemyData, index) => {
        const enemy = {
            id: gameState.enemies.length,
            x: enemyData.x,
            y: enemyData.y,
            value: enemyData.value,
            type: enemyData.type,
            emoji: enemyData.emoji
        };
        gameState.enemies.push(enemy);
        gameState.grid[enemyData.y][enemyData.x].enemy = enemy.id;
    });
    gameState.initialEnemyCount = gameState.enemies.length;
    
    // Place items
    entities.items.forEach((itemData, index) => {
        const item = {
            id: gameState.items.length,
            x: itemData.x,
            y: itemData.y,
            value: itemData.value,
            type: itemData.type,
            emoji: itemData.emoji
        };
        gameState.items.push(item);
        gameState.grid[itemData.y][itemData.x].item = item.id;
    });
    gameState.totalItemsSpawned = gameState.items.length;
    
    // Place special grids
    entities.specialGrids.forEach(specialData => {
        gameState.grid[specialData.y][specialData.x].specialGrid = specialData.type;
    });
    
    // Place princess
    if (entities.princess) {
        gameState.princess.x = entities.princess.x;
        gameState.princess.y = entities.princess.y;
        gameState.grid[entities.princess.y][entities.princess.x].princess = true;
    }
    
    // Portal will be spawned after princess rescue (handled elsewhere)
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

// ==================== DAY/NIGHT CYCLE SYSTEM ====================

// Initialize Day/Night Cycle
function initDayNightCycle(reset = false) {
    if (!gameState.dayNightCycle || reset) {
        gameState.dayNightCycle = {
            currentDay: 1,
            currentNight: 0,
            isDay: true,
            dayTurnCount: 0,
            nightTurnCount: 0,
            maxDayTurns: CONFIG.DAY_NIGHT_CONFIG.maxDayTurns,
            maxNightTurns: CONFIG.DAY_NIGHT_CONFIG.maxNightTurns,
            visionRadius: CONFIG.DAY_NIGHT_CONFIG.dayVisionRadius,
            nightVisionRadius: CONFIG.DAY_NIGHT_CONFIG.nightVisionRadius,
            currentWeek: 1
        };
    }
    updateDayNightUI();
}

// Get current vision radius based on day/night
function getVisionRadius() {
    if (!gameState.dayNightCycle) return 5; // Default day vision
    return gameState.dayNightCycle.isDay 
        ? gameState.dayNightCycle.visionRadius 
        : gameState.dayNightCycle.nightVisionRadius;
}

// Update Day/Night Cycle (called after each player turn)
function updateDayNightCycle() {
    if (!gameState.dayNightCycle) {
        initDayNightCycle();
        return;
    }
    
    const cycle = gameState.dayNightCycle;
    
    if (cycle.isDay) {
        cycle.dayTurnCount++;
        
        // Check if day is complete
        if (cycle.dayTurnCount >= cycle.maxDayTurns) {
            transitionToNight();
        }
    } else {
        cycle.nightTurnCount++;
        
        // Check if night is complete
        if (cycle.nightTurnCount >= cycle.maxNightTurns) {
            transitionToDay();
        }
    }
    
    updateDayNightUI();
}

// Transition from Day to Night
function transitionToNight() {
    const cycle = gameState.dayNightCycle;
    cycle.isDay = false;
    cycle.dayTurnCount = 0;
    // Night number equals current day number (Day 1 → Night 1, Day 2 → Night 2, etc.)
    cycle.currentNight = cycle.currentDay;
    
    console.log(`Night ${cycle.currentNight} (of Day ${cycle.currentDay}) begins! Vision radius: ${cycle.nightVisionRadius}`);
    
    updateDayNightUI();
    renderGrid(); // Update vision
    
    // Check if week is complete (3 days + 3 nights) after transition
    if (cycle.currentDay >= CONFIG.DAY_NIGHT_CONFIG.daysPerWeek && 
        cycle.currentNight >= CONFIG.DAY_NIGHT_CONFIG.nightsPerWeek) {
        completeWeek();
    }
}

// Transition from Night to Day
function transitionToDay() {
    const cycle = gameState.dayNightCycle;
    cycle.isDay = true;
    cycle.nightTurnCount = 0;
    cycle.currentDay++;
    
    console.log(`Day ${cycle.currentDay} begins! Vision radius: ${cycle.visionRadius}`);
    
    updateDayNightUI();
    renderGrid(); // Update vision
    
    // Check if week is complete (3 days + 3 nights) after transition
    if (cycle.currentDay >= CONFIG.DAY_NIGHT_CONFIG.daysPerWeek && 
        cycle.currentNight >= CONFIG.DAY_NIGHT_CONFIG.nightsPerWeek) {
        completeWeek();
    }
}

// Complete Week (3 days + 3 nights)
function completeWeek() {
    const cycle = gameState.dayNightCycle;
    
    // Only complete week if we've finished both 3 days and 3 nights
    if (cycle.currentDay >= CONFIG.DAY_NIGHT_CONFIG.daysPerWeek && 
        cycle.currentNight >= CONFIG.DAY_NIGHT_CONFIG.nightsPerWeek) {
        cycle.currentWeek++;
        cycle.currentDay = 1;
        cycle.currentNight = 0;
        cycle.isDay = true;
        cycle.dayTurnCount = 0;
        cycle.nightTurnCount = 0;
        
        console.log(`Week ${cycle.currentWeek} begins!`);
        
        // Check if boss should spawn
        if (shouldSpawnBoss()) {
            spawnBoss();
        }
        
        updateDayNightUI();
    }
}

// Update Day/Night UI
function updateDayNightUI() {
    if (!gameState.dayNightCycle) return;
    
    const cycle = gameState.dayNightCycle;
    const weekIndicator = document.getElementById('weekIndicator');
    const progressSegments = document.getElementById('progressSegments');
    const progressMarker = document.getElementById('progressMarker');
    
    // Update week indicator
    if (weekIndicator) {
        weekIndicator.textContent = `Week ${cycle.currentWeek}`;
    }
    
    // Calculate total segments (3 days + 3 nights = 6 segments)
    const totalSegments = CONFIG.DAY_NIGHT_CONFIG.daysPerWeek + CONFIG.DAY_NIGHT_CONFIG.nightsPerWeek;
    const segmentsPerDay = cycle.maxDayTurns;
    const segmentsPerNight = cycle.maxNightTurns;
    const totalTurns = (CONFIG.DAY_NIGHT_CONFIG.daysPerWeek * segmentsPerDay) + 
                       (CONFIG.DAY_NIGHT_CONFIG.nightsPerWeek * segmentsPerNight);
    
    // Calculate current progress
    let currentTurn = 0;
    let currentSegment = 0;
    
    // Count completed days
    for (let d = 1; d < cycle.currentDay; d++) {
        currentTurn += segmentsPerDay;
        currentSegment++;
    }
    
    // Count current day progress
    if (cycle.isDay) {
        currentTurn += cycle.dayTurnCount;
        // Calculate segment position within current day
        const dayProgress = cycle.dayTurnCount / segmentsPerDay;
        currentSegment += dayProgress;
    } else {
        // Day is complete
        currentTurn += segmentsPerDay;
        currentSegment++;
        
        // Count completed nights
        for (let n = 1; n < cycle.currentNight; n++) {
            currentTurn += segmentsPerNight;
            currentSegment++;
        }
        
        // Count current night progress
        const nightProgress = cycle.nightTurnCount / segmentsPerNight;
        currentSegment += nightProgress;
    }
    
    // Update progress bar
    // Structure: Day1-Night1-Day2-Night2-Day3-Night3 (alternating)
    if (progressSegments) {
        progressSegments.innerHTML = '';
        
        // Create segments alternating: day-night-day-night-day-night
        for (let day = 1; day <= CONFIG.DAY_NIGHT_CONFIG.daysPerWeek; day++) {
            // Day segment
            const daySegment = document.createElement('div');
            daySegment.className = 'progress-segment day-segment';
            
            if (day < cycle.currentDay) {
                // Day is completed
                daySegment.classList.add('completed');
            } else if (day === cycle.currentDay && cycle.isDay) {
                // Current day (active)
                daySegment.classList.add('active');
            }
            
            progressSegments.appendChild(daySegment);
            
            // Night segment (for this day)
            const nightSegment = document.createElement('div');
            nightSegment.className = 'progress-segment night-segment';
            
            if (day < cycle.currentDay) {
                // Night is completed (day is done, so night is done)
                nightSegment.classList.add('completed');
            } else if (day === cycle.currentDay && !cycle.isDay) {
                // Current night (active) - night number equals day number
                nightSegment.classList.add('active');
            }
            // If still in day, night segment remains empty/inactive
            
            progressSegments.appendChild(nightSegment);
        }
    }
    
    // Update progress marker position
    // Structure: Day1-Night1-Day2-Night2-Day3-Night3
    if (progressMarker) {
        let currentSegmentProgress = 0;
        
        // Calculate current segment progress (0 to totalSegments)
        // Each day has 2 segments: day + night
        if (cycle.isDay) {
            // In a day: (completed day-night pairs * 2) + day progress
            const completedPairs = cycle.currentDay - 1;
            currentSegmentProgress = (completedPairs * 2) + (cycle.dayTurnCount / cycle.maxDayTurns);
        } else {
            // In a night: (completed day-night pairs * 2) + 1 (day done) + night progress
            const completedPairs = cycle.currentDay - 1;
            currentSegmentProgress = (completedPairs * 2) + 1 + (cycle.nightTurnCount / cycle.maxNightTurns);
        }
        
        // Calculate percentage (0 to 100%)
        const progressPercent = Math.min((currentSegmentProgress / totalSegments) * 100, 100);
        progressMarker.style.left = `${progressPercent}%`;
        
        // Show marker if we have progress and haven't completed the week
        if (currentSegmentProgress > 0 && currentSegmentProgress < totalSegments) {
            progressMarker.style.display = 'block';
        } else {
            progressMarker.style.display = 'none';
        }
    }
    
    // Update icon states
    updateDayNightIcons();
}

// Update Day/Night Icons
// Icons are positioned above segments: Day1-Night1-Day2-Night2-Day3-Night3-Boss
function updateDayNightIcons() {
    if (!gameState.dayNightCycle) return;
    
    const cycle = gameState.dayNightCycle;
    
    // Update day icons (Day1, Day2, Day3)
    for (let i = 1; i <= CONFIG.DAY_NIGHT_CONFIG.daysPerWeek; i++) {
        const icon = document.getElementById(`dayIcon${i}`);
        if (icon) {
            if (i < cycle.currentDay) {
                icon.classList.add('completed');
                icon.classList.remove('active');
            } else if (i === cycle.currentDay && cycle.isDay) {
                icon.classList.add('active');
                icon.classList.remove('completed');
            } else {
                icon.classList.remove('completed', 'active');
            }
        }
    }
    
    // Update night icons (Night1, Night2, Night3)
    for (let i = 1; i <= CONFIG.DAY_NIGHT_CONFIG.nightsPerWeek; i++) {
        const icon = document.getElementById(`nightIcon${i}`);
        if (icon) {
            // Night is completed if its corresponding day is completed
            // Night number equals day number (Day 1 → Night 1, Day 2 → Night 2, etc.)
            if (i < cycle.currentDay) {
                icon.classList.add('completed');
                icon.classList.remove('active');
            } else if (i === cycle.currentDay && !cycle.isDay) {
                // Current night (active) - night number equals day number
                icon.classList.add('active');
                icon.classList.remove('completed');
            } else {
                icon.classList.remove('completed', 'active');
            }
        }
    }
    
    // Update boss icon (show if boss should spawn this week)
    const bossIcon = document.getElementById('bossIcon');
    if (bossIcon) {
        if (shouldSpawnBoss()) {
            bossIcon.classList.add('ready');
        } else {
            bossIcon.classList.remove('ready');
        }
    }
}

// ==================== BOSS SYSTEM ====================

// Generate Boss Data with Scaling
function generateBossData(bossIndex, week) {
    const bossConfig = CONFIG.BOSS_CONFIG;
    
    // Calculate scaled boss value
    const bossValue = Math.floor(
        bossConfig.baseBossValue * 
        Math.pow(bossConfig.bossScalingFactor, bossIndex)
    );
    
    // Calculate boss stats
    const bossHP = bossValue * bossConfig.bossHPMultiplier;
    const bossDMGMax = Math.floor(bossValue * bossConfig.bossDamageMultiplier);
    const bossSPDMax = Math.floor(bossValue * bossConfig.bossSpeedMultiplier);
    
    // Boss names (can be expanded)
    const bossNames = [
        'Ancient Dragon',
        'Shadow Lord',
        'Chaos Demon',
        'Void Titan',
        'Eternal Guardian'
    ];
    
    const bossName = bossNames[Math.min(bossIndex, bossNames.length - 1)] || `Boss ${bossIndex + 1}`;
    
    return {
        id: `boss_${bossIndex + 1}`,
        name: bossName,
        emoji: '🐉',
        value: bossValue,
        initialValue: bossValue,
        hp: { current: bossHP, max: bossHP },
        dmg: { min: 1, max: bossDMGMax },
        spd: { min: 1, max: bossSPDMax },
        week: week,
        bossIndex: bossIndex,
        isBoss: true
    };
}

// Check if boss should spawn
function shouldSpawnBoss() {
    const bossState = gameState.bossState;
    const cycle = gameState.dayNightCycle;
    
    // Check if we've defeated all bosses
    if (bossState.bossesDefeated >= CONFIG.BOSS_CONFIG.bossesPerRun) {
        return false;
    }
    
    // Check if boss should spawn this week
    if (cycle.currentWeek >= bossState.bossSpawnWeek) {
        return true;
    }
    
    return false;
}

// Spawn Boss (enter combat mode directly)
async function spawnBoss() {
    if (gameState.bossState.bossActive) {
        console.log('Boss fight already active!');
        return;
    }
    
    const bossState = gameState.bossState;
    const cycle = gameState.dayNightCycle;
    
    // Generate boss data
    const bossData = generateBossData(bossState.currentBossIndex, cycle.currentWeek);
    
    // Set boss as active
    bossState.bossActive = true;
    bossState.currentBoss = bossData;
    
    console.log(`Boss ${bossData.name} (Value: ${bossData.value}, HP: ${bossData.hp.max}) appears!`);
    
    // Show boss notification
    showBossNotification(bossData);
    
    // Wait a bit for notification
    await sleep(2000);
    
    // Enter boss combat mode directly
    enterBossCombat(bossData);
}

// Show Boss Notification
function showBossNotification(bossData) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'boss-notification';
    notification.innerHTML = `
        <div class="boss-notification-content">
            <div class="boss-notification-icon">${bossData.emoji}</div>
            <div class="boss-notification-title">BOSS APPEARS!</div>
            <div class="boss-notification-name">${bossData.name}</div>
            <div class="boss-notification-stats">
                <span>HP: ${bossData.hp.max}</span>
                <span>DMG: ${bossData.dmg.min}-${bossData.dmg.max}</span>
                <span>SPD: ${bossData.spd.min}-${bossData.spd.max}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after animation
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// Enter Boss Combat Mode
async function enterBossCombat(bossData) {
    // Stop any ongoing movement
    gameState.isMoving = false;
    gameState.playerRemainingSteps = 0;
    
    // Hide game grid
    if (elements.gameGrid) {
        elements.gameGrid.style.display = 'none';
    }
    
    // Set boss data in combat state BEFORE showing combat screen
    gameState.combatState.enemyId = null; // Boss doesn't have enemy ID
    gameState.combatState.enemyHP = bossData.hp.current;
    gameState.combatState.maxEnemyHP = bossData.hp.max;
    gameState.combatState.isBoss = true;
    gameState.combatState.bossData = bossData;
    
    // Show combat screen with boss data
    showCombatScreen(
        gameState.playerStats ? gameState.playerStats.hp.max : gameState.player.value,
        bossData.value,
        bossData.emoji,
        bossData.name,
        null // No enemy ID for boss (boss is not in enemies array)
    );
    
    // Ensure boss data is still set (showCombatScreen might reset some fields)
    gameState.combatState.isBoss = true;
    gameState.combatState.bossData = bossData;
    gameState.combatState.enemyHP = bossData.hp.current;
    gameState.combatState.maxEnemyHP = bossData.hp.max;
    
    // Start combat with player turn
    await performCombatTurn('player');
}

// Handle Boss Defeat
// Calculate Gold Reward for Boss
function calculateBossGoldReward(bossData) {
    if (!CONFIG.GOLD_REWARD) {
        // Fallback: 10 gold per boss value
        return bossData.value * 10;
    }
    
    const config = CONFIG.GOLD_REWARD;
    let gold = bossData.value * (config.perValue || config.baseMultiplier || 5);
    
    // Apply boss multiplier
    if (config.bossMultiplier) {
        gold = gold * config.bossMultiplier;
    }
    
    // Apply min/max limits
    if (config.minGold && gold < config.minGold) {
        gold = config.minGold;
    }
    if (config.maxGold && gold > config.maxGold) {
        gold = config.maxGold;
    }
    
    return Math.floor(gold);
}

async function handleBossDefeat(bossData) {
    const bossState = gameState.bossState;
    
    // Calculate gold reward for boss
    const goldReward = calculateBossGoldReward(bossData);
    gameState.currentGold += goldReward;
    
    // Update boss state
    bossState.bossesDefeated++;
    bossState.currentBossIndex++;
    bossState.bossActive = false;
    bossState.currentBoss = null;
    
    // Calculate next boss spawn week
    bossState.bossSpawnWeek = gameState.dayNightCycle.currentWeek + CONFIG.BOSS_CONFIG.spawnAfterWeeks;
    
    console.log(`Boss ${bossData.name} defeated! Bosses defeated: ${bossState.bossesDefeated}/${CONFIG.BOSS_CONFIG.bossesPerRun}. Received ${goldReward} gold.`);
    
    // Update UI to show gold
    updateUI();
    
    // Show reward notification
    showBossRewardNotification(bossData, goldReward);
    
    // Wait a bit
    await sleep(2000);
    
    // Return to map (hide combat screen, show game grid)
    if (elements.combatScreen) {
        elements.combatScreen.style.display = 'none';
    }
    if (elements.gameGrid) {
        elements.gameGrid.style.display = 'grid';
    }
    
    // Clear boss data from combat state
    if (gameState.combatState) {
        gameState.combatState.isBoss = false;
        gameState.combatState.bossData = null;
    }
    
    // Render grid
    renderGrid();
    
    // Continue game (don't end run)
    console.log('Returning to map after boss defeat...');
}

// Show Boss Reward Notification
function showBossRewardNotification(bossData, goldReward) {
    const notification = document.createElement('div');
    notification.className = 'boss-reward-notification';
    notification.innerHTML = `
        <div class="boss-reward-content">
            <div class="boss-reward-icon">🎉</div>
            <div class="boss-reward-title">BOSS DEFEATED!</div>
            <div class="boss-reward-name">${bossData.name}</div>
            <div class="boss-reward-gold">+${goldReward}💰 Gold</div>
            <div class="boss-reward-message">Continue your journey...</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// ==================== FOG OF WAR SYSTEM ====================

/**
 * Calculate vision range based on INT stat
 * @returns {number} Vision range (INT.max)
 */
function calculateVisionRange() {
    if (gameState.playerStats && gameState.playerStats.int) {
        return gameState.playerStats.int.max;
    }
    return 2; // Default fallback
}

/**
 * Get all visible cells from player position using Chebyshev distance
 * @param {number} playerX - Player X position
 * @param {number} playerY - Player Y position
 * @param {number} visionRange - Vision range
 * @returns {Set<string>} Set of visible cell keys "x,y"
 */
function getVisibleCells(playerX, playerY, visionRange) {
    const visible = new Set();
    
    // Use Chebyshev distance (square vision range)
    for (let y = playerY - visionRange; y <= playerY + visionRange; y++) {
        for (let x = playerX - visionRange; x <= playerX + visionRange; x++) {
            // Check bounds
            if (x >= 0 && x < gameState.gridWidth && y >= 0 && y < gameState.gridHeight) {
                // Check if cell exists and is walkable (floor)
                if (gameState.grid[y] && gameState.grid[y][x]) {
                    const cell = gameState.grid[y][x];
                    // Only show floor cells (skip walls)
                    // In dungeon system, isFloor indicates walkable cells
                    // For backward compatibility, if isFloor is undefined, assume all cells are walkable
                    if (cell.isFloor !== false) {
                        const cellKey = `${x},${y}`;
                        visible.add(cellKey);
                    }
                }
            }
        }
    }
    
    return visible;
}

/**
 * Update fog of war - mark discovered cells and update visible cells
 */
function updateFogOfWar() {
    if (!gameState.player) return;
    
    const visionRange = calculateVisionRange();
    const newVisibleCells = getVisibleCells(gameState.player.x, gameState.player.y, visionRange);
    
    // Mark all visible cells as discovered
    newVisibleCells.forEach(cellKey => {
        gameState.discoveredCells.add(cellKey);
    });
    
    // Update visible cells
    gameState.visibleCells = newVisibleCells;
}

/**
 * Check if a cell is currently visible
 * @param {number} x - Cell X position
 * @param {number} y - Cell Y position
 * @returns {boolean} True if cell is visible
 */
function isCellVisible(x, y) {
    // TEMPORARILY DISABLED - All cells are always visible
    // But use day/night vision radius for future fog of war
    if (gameState.cheatMode) return true;
    
    // Use day/night vision radius
    const visionRadius = getVisionRadius();
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;
    const distance = Math.abs(x - playerX) + Math.abs(y - playerY);
    
    return distance <= visionRadius;
}

/**
 * Check if a cell has been discovered (ever seen)
 * @param {number} x - Cell X position
 * @param {number} y - Cell Y position
 * @returns {boolean} True if cell has been discovered
 */
function isCellDiscovered(x, y) {
    // TEMPORARILY DISABLED - All cells are always discovered
    return true;
    // In cheat mode, all cells are discovered
    // if (gameState.cheatMode) return true;
    // const cellKey = `${x},${y}`;
    // return gameState.discoveredCells.has(cellKey);
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
                        
                    case 'R':
                        // Princess
                        gameState.princess.x = x;
                        gameState.princess.y = y;
                        gameState.grid[y][x].princess = true;
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
    // Reuse enemy Spine containers from pool so they don't reload/flicker on every move
    if (typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.beforeGridClear) {
        SpineEnemyIntegration.beforeGridClear(elements.gameGrid);
    }
    // Move player Spine layer out of grid before clear so it isn't destroyed (same fix as enemy pool)
    var playerLayer = document.getElementById('spine-player-layer');
    var gridParent = elements.gameGrid && elements.gameGrid.parentElement;
    if (playerLayer && gridParent && elements.gameGrid.contains(playerLayer)) {
        playerLayer.parentNode.removeChild(playerLayer);
        gridParent.appendChild(playerLayer);
    }
    elements.gameGrid.innerHTML = '';
    
    // Update camera to follow player
    if (typeof CAMERA !== 'undefined') {
        CAMERA.updateCameraPosition();
    }
    
    // Update fog of war before rendering
    // updateFogOfWar(); // TEMPORARILY DISABLED
    
    // Calculate reachable cells if player has remaining steps
    // Disable normal reachable cells when in canon selection mode
    const showReachableCells = gameState.playerRemainingSteps > 0 && !gameState.isMoving && 
                                gameState.currentTurn === 'player' && !gameState.isCanonSelecting;
    const reachableCells = showReachableCells ? calculateReachableCells(gameState.player.x, gameState.player.y, gameState.playerRemainingSteps) : new Map();
    
    // Get viewport bounds if camera system is available
    let viewportBounds = null;
    if (typeof CAMERA !== 'undefined' && (CAMERA.viewportWidth < gameState.gridWidth || CAMERA.viewportHeight < gameState.gridHeight)) {
        viewportBounds = CAMERA.getViewportBounds();
    }
    
    // Render only cells in viewport (8x10) or all cells if map is smaller than viewport
    const startY = viewportBounds ? viewportBounds.startY : 0;
    const endY = viewportBounds ? viewportBounds.endY : gameState.gridHeight;
    const startX = viewportBounds ? viewportBounds.startX : 0;
    const endX = viewportBounds ? viewportBounds.endX : gameState.gridWidth;
    
    // Always create a full 8x10 grid structure to prevent layout issues
    // Create cells in row-major order (top to bottom, left to right)
    const viewportWidth = endX - startX;
    const viewportHeight = endY - startY;
    
    for (let viewportY = 0; viewportY < viewportHeight; viewportY++) {
        for (let viewportX = 0; viewportX < viewportWidth; viewportX++) {
            // Convert viewport coordinates to world coordinates
            const worldX = startX + viewportX;
            const worldY = startY + viewportY;
            
            // Get cell data from world coordinates
            const cellData = gameState.grid[worldY] && gameState.grid[worldY][worldX];
            
            // Create cell element (always create, even for walls)
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = worldX;
            cell.dataset.y = worldY;
            
            // If cell doesn't exist or is a wall, display as river and skip to next
            if (!cellData || cellData.isFloor === false) {
                // Display river for all wall cells (non-walkable areas)
                if (typeof assetManager !== 'undefined') {
                    const riverImage = assetManager.getRiverImage();
                    if (riverImage) {
                        cell.style.backgroundImage = `url(${riverImage.src})`;
                        cell.style.backgroundSize = 'cover';
                        cell.style.backgroundPosition = 'center';
                        cell.style.backgroundRepeat = 'no-repeat';
                    } else if (assetManager.config.settings.fallbackToEmoji) {
                        // Fallback to emoji if image not available
                        cell.textContent = assetManager.getRiverEmoji();
                    }
                }
                // Wall cells are displayed as rivers
                cell.classList.add('wall-cell');
                elements.gameGrid.appendChild(cell);
                continue;
            }
            
            // Fog of war tắt: không áp class tối, toàn bộ grid hiển thị bình thường
            // (Giữ isVisible/isDiscovered cho logic nếu cần sau này)
            
            // Set random grid asset background for floor cells
            if (cellData.isFloor && typeof assetManager !== 'undefined' && cellData.gridAssetIndex >= 0) {
                const gridImage = assetManager.getGridCellImage(cellData.gridAssetIndex);
                if (gridImage) {
                    cell.style.backgroundImage = `url(${gridImage.src})`;
                    cell.style.backgroundSize = 'cover';
                    cell.style.backgroundPosition = 'center';
                    cell.style.backgroundRepeat = 'no-repeat';
                }
            }
            let content = '';
            let isReachableCell = false;
            let hasReachableEnemy = false;
            let hasReachableItem = false;
            
            // Fog of war tắt: luôn hiển thị nội dung ô
            const shouldShowContent = true;
            
            // Check if this cell is reachable
            if (showReachableCells && !cellData.player) {
                const cellKey = `${worldX},${worldY}`;
                if (reachableCells.has(cellKey)) {
                    isReachableCell = true;
                    cell.classList.add('reachable-cell');
                    cell.style.cursor = 'pointer';
                    
                    // Get steps needed to reach this cell
                    const stepsNeeded = reachableCells.get(cellKey);
                    
                    // Add step indicator (faded, centered)
                    const stepIndicator = document.createElement('div');
                    stepIndicator.className = 'step-indicator';
                    stepIndicator.textContent = stepsNeeded;
                    stepIndicator.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 24px;
                        font-weight: bold;
                        color: rgba(255, 255, 255, 0.4);
                        z-index: 1;
                        pointer-events: none;
                        line-height: 1;
                    `;
                    cell.appendChild(stepIndicator);
                    
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
                            movePlayerToCell(worldX, worldY);
                        }
                    });
                }
            }
            
            // Check for combat (player and enemy on same cell)
            if (cellData.player && cellData.enemy !== null) {
                cell.classList.add('combat');
            }
            
            // Add player (Spine Assassin or image/emoji fallback)
            if (cellData.player) {
                cell.classList.add('player');
                const useSpine = typeof SpinePlayerIntegration !== 'undefined' && SpinePlayerIntegration.isEnabled && SpinePlayerIntegration.isEnabled();
                if (!useSpine) {
                    if (typeof renderPlayer !== 'undefined') {
                        const playerContainer = document.createElement('div');
                        playerContainer.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: absolute; top: 0; left: 0;';
                        renderPlayer(playerContainer, true);
                        cell.appendChild(playerContainer);
                    } else {
                        content += '🧙';
                    }
                }
            }
            
            // Add enemy (Spine Monster_Lv1-5 or image/emoji fallback)
            if (cellData.enemy !== null && shouldShowContent) {
                const enemy = gameState.enemies.find(e => e.id === cellData.enemy);
                if (enemy) {
                    cell.classList.add('enemy');
                    const hasEnemySpineConfig = typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.getConfig && SpineEnemyIntegration.getConfig(enemy.type);
                    const useEnemySpine = typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.isEnabled && SpineEnemyIntegration.isEnabled() && enemy.type && hasEnemySpineConfig;
                    if (useEnemySpine) {
                        let enemySpineContainer = typeof SpineEnemyIntegration.getPooledContainer === 'function' ? SpineEnemyIntegration.getPooledContainer(enemy.type) : null;
                        if (!enemySpineContainer) {
                            enemySpineContainer = document.createElement('div');
                            enemySpineContainer.className = 'enemy-spine-container';
                            enemySpineContainer.setAttribute('data-enemy-type', enemy.type);
                            enemySpineContainer.setAttribute('data-emoji', enemy.emoji || '👹');
                        } else {
                            enemySpineContainer.setAttribute('data-emoji', enemy.emoji || '👹');
                        }
                        cell.appendChild(enemySpineContainer);
                    } else if (typeof renderEnemy !== 'undefined' && enemy.type) {
                        const enemyContainer = document.createElement('div');
                        enemyContainer.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: absolute; top: 0; left: 0;';
                        renderEnemy(enemyContainer, enemy.type, true);
                        cell.appendChild(enemyContainer);
                    } else {
                        content += enemy.emoji || '👹';
                    }
                } else {
                    // Enemy was removed but grid still has reference - clean it up
                    gameState.grid[y][x].enemy = null;
                }
            }
            
            // Add item (only show if visible or discovered)
            if (cellData.item !== null && shouldShowContent) {
                cell.classList.add('item');
                const item = gameState.items.find(i => i.id === cellData.item);
                // Use asset system if available, otherwise fallback to emoji
                if (typeof renderItem !== 'undefined' && item?.type) {
                    const itemContainer = document.createElement('div');
                    itemContainer.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: absolute; top: 0; left: 0;';
                    renderItem(itemContainer, item.type, true); // true = inGrid
                    cell.appendChild(itemContainer);
                } else {
                    content += item?.emoji || '💎';
                }
            }
            
            // Add special grid (only show if visible or discovered)
            if (cellData.specialGrid !== null && shouldShowContent) {
                const specialGridType = CONFIG.SPECIAL_GRID_TYPES[cellData.specialGrid];
                if (specialGridType) {
                    // Check if POI is visited
                    const poiKey = `${worldX},${worldY}`;
                    const isPOI = (cellData.specialGrid === 'shop' || 
                                cellData.specialGrid === 'stat_check' || 
                                cellData.specialGrid === 'healer');
                    const isPOIVisited = isPOI && gameState.visitedPOIs.has(poiKey);
                    
                    // Don't render visited POIs
                    if (!isPOIVisited) {
                        cell.classList.add('special-grid');
                        cell.classList.add(`special-grid-${cellData.specialGrid}`);
                        if (isPOI) {
                            cell.classList.add('poi-cell');
                        }
                        // Add special grid asset as overlay - centered and larger
                        // Always show asset, even if there's player/enemy/item on the cell
                        const specialGridIcon = document.createElement('div');
                        specialGridIcon.className = 'special-grid-icon';
                        if (isPOI) {
                            specialGridIcon.classList.add('poi-icon');
                        }
                        specialGridIcon.style.cssText = `
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            z-index: 1;
                            pointer-events: none;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        `;
                        // POI: tạm thời luôn dùng emoji từ config (chưa có icon riêng)
                        if (isPOI) {
                            specialGridIcon.textContent = specialGridType.emoji;
                            specialGridIcon.style.fontSize = '32px';
                            specialGridIcon.style.lineHeight = '1';
                        } else if (typeof renderSpecialGrid !== 'undefined') {
                            renderSpecialGrid(specialGridIcon, cellData.specialGrid, true);
                        } else {
                            if (typeof assetManager !== 'undefined') {
                                const image = assetManager.getSpecialGridImage(cellData.specialGrid);
                                const emoji = assetManager.getSpecialGridEmoji(cellData.specialGrid);
                                if (image) {
                                    const img = document.createElement('img');
                                    img.src = image.src;
                                    img.className = 'special-grid-asset';
                                    img.style.maxWidth = '70%';
                                    img.style.maxHeight = '70%';
                                    img.style.objectFit = 'contain';
                                    specialGridIcon.appendChild(img);
                                } else {
                                    specialGridIcon.textContent = emoji;
                                    specialGridIcon.style.fontSize = '32px';
                                    specialGridIcon.style.lineHeight = '1';
                                }
                            } else {
                                specialGridIcon.textContent = specialGridType.emoji;
                                specialGridIcon.style.fontSize = '32px';
                                specialGridIcon.style.lineHeight = '1';
                            }
                        }
                        cell.appendChild(specialGridIcon);
                    }
                    
                    // If player is on this special grid cell and it's a canon, make it clickable
                    // Player can activate canon when standing on it, regardless of remaining steps
                    if (cellData.player && cellData.specialGrid === 'canon' && 
                        gameState.currentTurn === 'player' && !gameState.isMoving) {
                        cell.style.cursor = 'pointer';
                        cell.classList.add('canon-activatable');
                        
                        // Add click listener to activate canon
                        cell.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            
                            if (!gameState.isMoving) {
                                await handleSpecialGrid('canon', worldX, worldY);
                            }
                        });
                    }
                }
            }
            
            // Add gold bag (always show if not collected)
            if (cellData.gold && !cellData.goldCollected && shouldShowContent) {
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
            
            // Add princess (only show if visible or discovered and not rescued)
            // If enemy is on same cell, adjust positioning to avoid overlap
            if (cellData.princess && !gameState.princessRescued && shouldShowContent) {
                cell.classList.add('princess');
                const princessContainer = document.createElement('div');
                princessContainer.className = 'princess-on-grid';
                
                // Use asset system if available, otherwise fallback to emoji
                // Render princess with same size as player (80% of grid cell)
                if (typeof renderUIIcon !== 'undefined' && typeof normalizeAssetForGrid !== 'undefined') {
                    renderUIIcon(princessContainer, 'princess');
                    // Apply same size normalization as player
                    const princessElement = princessContainer.querySelector('img, span');
                    if (princessElement) {
                        normalizeAssetForGrid(princessElement, 'player');
                    }
                } else {
                    const princessIcon = document.createElement('span');
                    princessIcon.textContent = '👸';
                    princessIcon.className = 'princess-asset';
                    princessContainer.appendChild(princessIcon);
                    // Apply same size normalization as player
                    if (typeof normalizeAssetForGrid !== 'undefined') {
                        normalizeAssetForGrid(princessIcon, 'player');
                    } else {
                        princessIcon.style.fontSize = 'clamp(20px, 70%, 40px)';
                    }
                }
                
                // If enemy is on same cell, position princess slightly offset to avoid overlap
                if (cellData.enemy !== null) {
                    princessContainer.style.cssText = `
                        position: absolute;
                        top: 10%;
                        left: 10%;
                        z-index: 2;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;
                } else {
                    princessContainer.style.cssText = `
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;
                }
                cell.appendChild(princessContainer);
            }
            
            // Add portal (only show if visible or discovered and active)
            if (cellData.portal && gameState.portal.active && shouldShowContent) {
                cell.classList.add('portal');
                const portalIcon = document.createElement('span');
                portalIcon.className = 'portal-icon';
                portalIcon.textContent = '🚪';
                portalIcon.style.cssText = `
                    font-size: 32px;
                    line-height: 1;
                `;
                cell.appendChild(portalIcon);
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
                
                // Add princess icon if rescued (top-left corner)
                if (gameState.princessRescued) {
                    const princessIcon = document.createElement('div');
                    princessIcon.className = 'princess-carried';
                    princessIcon.textContent = '👸';
                    princessIcon.style.cssText = `
                        position: absolute;
                        top: 2px;
                        left: 2px;
                        font-size: 24px;
                        z-index: 10;
                        pointer-events: none;
                        line-height: 1;
                    `;
                    cell.appendChild(princessIcon);
                }
            }
            
            if (cellData.enemy !== null && shouldShowContent) {
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
            
            if (cellData.item !== null && shouldShowContent) {
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
            
            // Append cell directly (cells are already in correct order: row by row, left to right)
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
    
    // If in canon selection mode, restore canon target selection highlights
    if (gameState.isCanonSelecting) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            restoreCanonTargetSelection();
        }, 0);
    }

    // Spine: position player layer over player cell and init if needed
    if (typeof SpinePlayerIntegration !== 'undefined' && gameState.gameRunning && gameState.player) {
        if (SpinePlayerIntegration.isEnabled && SpinePlayerIntegration.isEnabled()) {
            const layer = document.getElementById('spine-player-layer');
            const container = document.getElementById('spine-player-container');
            if (layer && container && !SpinePlayerIntegration.getInstance()) {
                SpinePlayerIntegration.init(container);
            }
            SpinePlayerIntegration.positionOverPlayerCell();
            SpinePlayerIntegration.setVisible(true);
        }
    } else if (typeof SpinePlayerIntegration !== 'undefined' && SpinePlayerIntegration.setVisible) {
        SpinePlayerIntegration.setVisible(false);
    }

    // Spine: init enemy Spine in all enemy cells after layout (so container has non-zero size)
    if (typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.initAllInGrid) {
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                if (typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.initAllInGrid) {
                    SpineEnemyIntegration.initAllInGrid();
                }
            });
        });
    }
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
// Returns a Map with cell key as key and steps as value
function calculateReachableCells(startX, startY, maxSteps) {
    const reachable = new Map(); // Changed to Map to store steps
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
                const cellKey = `${current.x},${current.y}`;
                reachable.set(cellKey, current.steps);
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
                // Check if cell is walkable (isFloor)
                if (!cellData || cellData.isFloor === false) {
                    continue; // Skip wall cells
                }
                // Check if cell has box (obstacle) - cannot walk through
                if (cellData.specialGrid === 'box') {
                    continue; // Skip box cells
                }
                // Canon cells are walkable for player (they can enter to activate teleport)
                // Note: Enemies are blocked from canon in their movement logic
                // Allow moving through cells with enemies (we can reach them for combat)
                // But we don't add enemy cells to reachable in the main loop
                // Enemy cells will be checked separately below
                if (cellData.enemy === null || cellData.player) {
                    visited.add(key);
                    queue.push({ x: newPos.x, y: newPos.y, steps: current.steps + 1 });
                } else if (cellData.enemy !== null) {
                    // This cell has an enemy - we can still pass through it in BFS
                    // but we'll check if we can reach it separately
                    // Still check for box (but allow canon for player)
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
                    reachable.set(`${x},${y}`, path.length);
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
                // Cannot move through wall cells (isFloor === false)
                if (!cellData || cellData.isFloor === false) {
                    continue; // Skip wall cells
                }
                // Cannot move through box (obstacle)
                if (cellData.specialGrid === 'box') {
                    continue; // Skip box cells
                }
                // Canon cells are walkable for player (they can enter to activate teleport)
                // Note: Enemies are blocked from canon in their movement logic
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
    // Disable normal movement when in canon selection mode
    if (!gameState.gameRunning || gameState.isMoving || gameState.playerRemainingSteps <= 0 || gameState.isCanonSelecting) {
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
    if (typeof SpinePlayerIntegration !== 'undefined' && SpinePlayerIntegration.play) {
        SpinePlayerIntegration.play('AssassinPyramid_Walk_01', true);
    }
    
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
        
        // Check for princess rescue
        if (cellData.princess && !gameState.princessRescued) {
            // Rescue princess
            gameState.princessRescued = true;
            gameState.princess.rescued = true;
            gameState.grid[gameState.player.y][gameState.player.x].princess = false;
            // Spawn portal
            spawnPortal();
            renderGrid();
            await sleep(300);
            console.log('Princess rescued! Portal spawned.');
        }
        
        // Check for portal (win condition)
        if (cellData.portal && gameState.portal.active) {
            if (gameState.princessRescued) {
                // Win condition met - complete level
                gameState.gameRunning = false;
                checkLevelComplete();
                break;
            } else {
                // Portal not accessible yet - princess must be rescued first
                console.log('Portal requires princess to be rescued first!');
            }
        }
        
        // Check for special grid effects (including POIs)
        const specialGrid = gameState.grid[gameState.player.y][gameState.player.x].specialGrid;
        if (specialGrid) {
            // Check if this is a POI that can be interacted with
            const poiKey = `${gameState.player.x},${gameState.player.y}`;
            if ((specialGrid === 'shop' || specialGrid === 'stat_check' || specialGrid === 'healer') && 
                !gameState.visitedPOIs.has(poiKey)) {
                // POI interaction - handled separately, don't continue movement
                await handleSpecialGrid(specialGrid, gameState.player.x, gameState.player.y);
                break;
            }
            const handled = await handleSpecialGrid(specialGrid, gameState.player.x, gameState.player.y);
            if (!handled) {
                // Special grid prevented further movement (e.g., canon teleport)
                break;
            }
        }
        
        // Update fog of war after movement
        // updateFogOfWar(); // TEMPORARILY DISABLED
        
        // Render and wait
        renderGrid();
        await sleep(300);
        
        // Check if game over
        if (!gameState.gameRunning) break;
    }
    
    gameState.isMoving = false;
    if (typeof SpinePlayerIntegration !== 'undefined' && SpinePlayerIntegration.play) {
        var idleAnim = (window.SPINE_CONFIG && window.SPINE_CONFIG.combatPlayerIdle) ? window.SPINE_CONFIG.combatPlayerIdle : 'AssassinPyramid_Idle_01';
        SpinePlayerIntegration.play(idleAnim, true);
    }
    
    // Fog of war tắt: không cập nhật fog
    
    // If no more steps, end turn
    if (gameState.playerRemainingSteps <= 0 && gameState.gameRunning) {
        endPlayerTurn();
    } else if (gameState.gameRunning) {
        // Re-render to update reachable cells and fog
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
            // Stop movement first and disable normal movement
            gameState.isMoving = false;
            gameState.isCanonSelecting = true; // Set flag to disable normal movement
            
            // Show canon activation effect
            const canonCell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
            if (canonCell) {
                canonCell.classList.add('canon-activating');
                await sleep(500);
            }
            
            // Show message to select target (this will disable normal reachable cells)
            await showCanonTargetSelection(x, y);
            return false; // Movement handled by canon teleport
            
        case 'shop':
            // Shop: Show shop UI with dice-roll upgrade system
            const shopKey = `${x},${y}`;
            if (gameState.visitedPOIs.has(shopKey)) {
                // Shop already visited
                return true;
            }
            gameState.isMoving = false;
            await showShopPOI(x, y);
            return false; // Interaction handled by shop UI
            
        case 'stat_check':
            // Stat Check: Show stat check challenge UI
            const statCheckKey = `${x},${y}`;
            if (gameState.visitedPOIs.has(statCheckKey)) {
                // Stat check already attempted
                return true;
            }
            gameState.isMoving = false;
            await showStatCheckPOI(x, y);
            return false; // Interaction handled by stat check UI
            
        case 'healer':
            // Healer: Show dialogue and heal player
            const healerKey = `${x},${y}`;
            if (gameState.visitedPOIs.has(healerKey)) {
                // Healer already used
                return true;
            }
            gameState.isMoving = false;
            await showHealerPOI(x, y);
            return false; // Interaction handled by healer UI
            
        default:
            return true;
    }
}

// Get all walkable cells (cells that can be walked on, excluding boxes and canons)
function getAllWalkableCells() {
    const walkableCells = [];
    for (let y = 0; y < gameState.gridHeight; y++) {
        for (let x = 0; x < gameState.gridWidth; x++) {
            const cellData = gameState.grid[y][x];
            // Walkable if not box and not canon (canon is walkable but we don't want to teleport to another canon)
            if (cellData.specialGrid !== 'box' && cellData.specialGrid !== 'canon') {
                walkableCells.push({ x, y });
            }
        }
    }
    return walkableCells;
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
    
    // Get all walkable cells
    const walkableCells = getAllWalkableCells();
    
    // Make only walkable cells clickable and highlight them
    const allCells = elements.gameGrid.querySelectorAll('.grid-cell');
    const clickHandlers = [];
    
    allCells.forEach(cell => {
        const cellX = parseInt(cell.dataset.x);
        const cellY = parseInt(cell.dataset.y);
        
        // Check if this cell is walkable
        const isWalkable = walkableCells.some(w => w.x === cellX && w.y === cellY);
        
        if (isWalkable) {
            // Highlight walkable cells with blue color and infinity symbol
            cell.classList.add('canon-target');
            cell.style.backgroundColor = 'rgba(52, 152, 219, 0.5)';
            cell.style.cursor = 'pointer';
            
            // Add infinity symbol
            const infinitySymbol = document.createElement('div');
            infinitySymbol.className = 'canon-infinity';
            infinitySymbol.textContent = '∞';
            infinitySymbol.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 32px;
                font-weight: bold;
                color: #3498db;
                z-index: 10;
                pointer-events: none;
                text-shadow: 0 0 10px rgba(52, 152, 219, 0.8);
            `;
            cell.appendChild(infinitySymbol);
            
            const clickHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // Remove message
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
                
                // Remove all click handlers, classes, and infinity symbols
                allCells.forEach((c, idx) => {
                    c.classList.remove('canon-target');
                    c.style.backgroundColor = '';
                    c.style.cursor = '';
                    const infinity = c.querySelector('.canon-infinity');
                    if (infinity) {
                        infinity.remove();
                    }
                    if (clickHandlers[idx]) {
                        c.removeEventListener('click', clickHandlers[idx]);
                    }
                });
                
                // Clear canon selection flag to re-enable normal movement
                gameState.isCanonSelecting = false;
                
                // Move player to target with animation
                movePlayerToCellWithAnimation(cellX, cellY);
            };
            
            clickHandlers.push(clickHandler);
            cell.addEventListener('click', clickHandler);
        } else {
            clickHandlers.push(null);
        }
    });
    
    // Store message and clickHandlers for potential re-render
    window.canonSelectionState = {
        message: message,
        clickHandlers: clickHandlers,
        allCells: allCells
    };
}

// Restore canon target selection after grid re-render
function restoreCanonTargetSelection() {
    if (!gameState.isCanonSelecting || !window.canonSelectionState) {
        return;
    }
    
    const { message, clickHandlers, allCells: oldCells } = window.canonSelectionState;
    
    // Create a map of old cell coordinates to click handlers
    const handlerMap = new Map();
    oldCells.forEach((oldCell, idx) => {
        if (clickHandlers[idx]) {
            const cellX = parseInt(oldCell.dataset.x);
            const cellY = parseInt(oldCell.dataset.y);
            handlerMap.set(`${cellX},${cellY}`, clickHandlers[idx]);
        }
    });
    
    // Re-query cells after re-render
    const currentCells = elements.gameGrid.querySelectorAll('.grid-cell');
    const walkableCells = getAllWalkableCells();
    
    // Re-apply highlights and click handlers using coordinate matching
    currentCells.forEach((cell) => {
        const cellX = parseInt(cell.dataset.x);
        const cellY = parseInt(cell.dataset.y);
        const cellKey = `${cellX},${cellY}`;
        
        const isWalkable = walkableCells.some(w => w.x === cellX && w.y === cellY);
        const clickHandler = handlerMap.get(cellKey);
        
        if (isWalkable && clickHandler) {
            // Highlight walkable cells with blue color and infinity symbol
            cell.classList.add('canon-target');
            cell.style.backgroundColor = 'rgba(52, 152, 219, 0.5)';
            cell.style.cursor = 'pointer';
            
            // Add infinity symbol
            const infinitySymbol = document.createElement('div');
            infinitySymbol.className = 'canon-infinity';
            infinitySymbol.textContent = '∞';
            infinitySymbol.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 32px;
                font-weight: bold;
                color: #3498db;
                z-index: 10;
                pointer-events: none;
                text-shadow: 0 0 10px rgba(52, 152, 219, 0.8);
            `;
            cell.appendChild(infinitySymbol);
            
            // Re-attach click handler
            cell.addEventListener('click', clickHandler);
        }
    });
}

// Move Player to Target Cell with Animation (for canon teleport)
async function movePlayerToCellWithAnimation(targetX, targetY) {
    const oldX = gameState.player.x;
    const oldY = gameState.player.y;
    
    // Find path from current position to target
    const path = findPath(oldX, oldY, targetX, targetY, 999); // Use large maxSteps for canon teleport
    
    if (!path || path.length === 0) {
        // If no path found, just teleport directly
        gameState.grid[oldY][oldX].player = false;
        gameState.player.x = targetX;
        gameState.player.y = targetY;
        gameState.grid[targetY][targetX].player = true;
        renderGrid();
    } else {
        // Move step by step following the path with animation
        gameState.isMoving = true;
        if (typeof SpinePlayerIntegration !== 'undefined' && SpinePlayerIntegration.play) {
            SpinePlayerIntegration.play('AssassinPyramid_Walk_01', true);
        }
        for (let i = 0; i < path.length && gameState.gameRunning; i++) {
            const direction = path[i];
            const newPos = getNewPosition(gameState.player.x, gameState.player.y, direction);
            
            // Move player
            gameState.grid[gameState.player.y][gameState.player.x].player = false;
            gameState.player.x = newPos.x;
            gameState.player.y = newPos.y;
            gameState.grid[gameState.player.y][gameState.player.x].player = true;
            
            // Render and wait for animation
            renderGrid();
            await sleep(150); // Animation speed
        }
        gameState.isMoving = false;
        if (typeof SpinePlayerIntegration !== 'undefined' && SpinePlayerIntegration.play) {
            var pyramidIdle = (window.SPINE_CONFIG && window.SPINE_CONFIG.combatPlayerIdle) ? window.SPINE_CONFIG.combatPlayerIdle : 'AssassinPyramid_Idle_01';
            SpinePlayerIntegration.play(pyramidIdle, true);
        }
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
        // performCombat may end the turn, so check if game is still running
        if (!gameState.gameRunning || gameState.currentTurn !== 'player') {
            return; // Turn already ended
        }
    }
    
    // End turn after canon teleport (only if still player's turn)
    if (gameState.currentTurn === 'player' && gameState.gameRunning) {
        endPlayerTurn();
    }
}

// Teleport Player to Target Cell (kept for backward compatibility)
async function teleportPlayerToCell(targetX, targetY) {
    await movePlayerToCellWithAnimation(targetX, targetY);
}

// Handle Enemy Canon Teleport
async function handleEnemyCanon(enemy, canonX, canonY) {
    // Show canon activation effect
    const canonCell = elements.gameGrid.querySelector(`[data-x="${canonX}"][data-y="${canonY}"]`);
    if (canonCell) {
        canonCell.classList.add('canon-activating');
        await sleep(500);
    }
    
    // Get all walkable cells
    const walkableCells = getAllWalkableCells();
    
    // Enemy AI: Choose best target cell (closest to player)
    const playerPos = { x: gameState.player.x, y: gameState.player.y };
    let bestCell = null;
    let minDistance = Infinity;
    
    for (const cell of walkableCells) {
        const distance = calculateManhattanDistance(cell.x, cell.y, playerPos.x, playerPos.y);
        if (distance < minDistance) {
            minDistance = distance;
            bestCell = cell;
        }
    }
    
    // If no best cell found, use first walkable cell
    if (!bestCell && walkableCells.length > 0) {
        bestCell = walkableCells[0];
    }
    
    if (bestCell) {
        // Move enemy to target with animation
        await moveEnemyToCellWithAnimation(enemy, bestCell.x, bestCell.y);
    }
}

// Move Enemy to Target Cell with Animation (for canon teleport)
async function moveEnemyToCellWithAnimation(enemy, targetX, targetY) {
    const oldX = enemy.x;
    const oldY = enemy.y;
    
    // Find path from current position to target
    const path = findPath(oldX, oldY, targetX, targetY, 999); // Use large maxSteps for canon teleport
    
    if (!path || path.length === 0) {
        // If no path found, just teleport directly
        gameState.grid[oldY][oldX].enemy = null;
        enemy.x = targetX;
        enemy.y = targetY;
        gameState.grid[targetY][targetX].enemy = enemy.id;
        renderGrid();
    } else {
        // Move step by step following the path with animation
        for (let i = 0; i < path.length && gameState.gameRunning; i++) {
            const direction = path[i];
            const newPos = getNewPosition(enemy.x, enemy.y, direction);
            
            // Move enemy
            gameState.grid[enemy.y][enemy.x].enemy = null;
            enemy.x = newPos.x;
            enemy.y = newPos.y;
            gameState.grid[enemy.y][enemy.x].enemy = enemy.id;
            
            // Render and wait for animation
            renderGrid();
            await sleep(150); // Animation speed
        }
    }
    
    // Check for item at new position
    if (gameState.grid[targetY][targetX].item !== null) {
        await enemyCollectItem(enemy, targetX, targetY);
    }
    
    // Check for player at new position (combat)
    if (gameState.grid[targetY][targetX].player) {
        await performEnemyCombat(enemy, targetX, targetY);
        // performEnemyCombat may end the game or change turn, so return
        // Enemy turn will continue with next enemy if game is still running
        return;
    }
    
    // After canon teleport, enemy's turn for this enemy is complete
    // The enemyTurn() loop will continue with next enemy
}

// Calculate Gold Reward for Enemy
function calculateEnemyGoldReward(enemy) {
    if (!CONFIG.GOLD_REWARD) {
        // Fallback: 5 gold per enemy value
        return enemy.value * 5;
    }
    
    const config = CONFIG.GOLD_REWARD;
    let gold = enemy.value * (config.perValue || config.baseMultiplier || 5);
    
    // Apply min/max limits
    if (config.minGold && gold < config.minGold) {
        gold = config.minGold;
    }
    if (config.maxGold && gold > config.maxGold) {
        gold = config.maxGold;
    }
    
    return Math.floor(gold);
}

// Show Gold Reward Animation
async function showGoldRewardAnimation(x, y, goldAmount) {
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cell) return;
    
    const goldText = document.createElement('div');
    goldText.className = 'gold-reward-animation';
    goldText.textContent = `+${goldAmount}💰`;
    goldText.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #f1c40f;
        font-size: 18px;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(241, 196, 15, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8);
        pointer-events: none;
        z-index: 1000;
        animation: goldRewardFloat 1.5s ease-out forwards;
    `;
    
    // Add animation keyframes if not already added
    if (!document.getElementById('goldRewardAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'goldRewardAnimationStyle';
        style.textContent = `
            @keyframes goldRewardFloat {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) translateY(-40px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    cell.style.position = 'relative';
    cell.appendChild(goldText);
    
    // Remove after animation
    setTimeout(() => {
        if (goldText.parentNode) {
            goldText.parentNode.removeChild(goldText);
        }
    }, 1500);
    
    await sleep(100);
}

// Show Value Loss Animation
// Calculate Gold Reward for Enemy
function calculateEnemyGoldReward(enemy) {
    if (!CONFIG.GOLD_REWARD) {
        // Fallback: 5 gold per enemy value
        return enemy.value * 5;
    }
    
    const config = CONFIG.GOLD_REWARD;
    let gold = enemy.value * (config.perValue || config.baseMultiplier || 5);
    
    // Apply min/max limits
    if (config.minGold && gold < config.minGold) {
        gold = config.minGold;
    }
    if (config.maxGold && gold > config.maxGold) {
        gold = config.maxGold;
    }
    
    return Math.floor(gold);
}

// Show Gold Reward Animation
async function showGoldRewardAnimation(x, y, goldAmount) {
    const cell = elements.gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cell) return;
    
    const goldText = document.createElement('div');
    goldText.className = 'gold-reward-animation';
    goldText.textContent = `+${goldAmount}💰`;
    goldText.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #f1c40f;
        font-size: 18px;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(241, 196, 15, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8);
        pointer-events: none;
        z-index: 1000;
        animation: goldRewardFloat 1.5s ease-out forwards;
    `;
    
    // Add animation keyframes if not already added
    if (!document.getElementById('goldRewardAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'goldRewardAnimationStyle';
        style.textContent = `
            @keyframes goldRewardFloat {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) translateY(-40px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    cell.style.position = 'relative';
    cell.appendChild(goldText);
    
    // Remove after animation
    setTimeout(() => {
        if (goldText.parentNode) {
            goldText.parentNode.removeChild(goldText);
        }
    }, 1500);
    
    await sleep(100);
}

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
    
    // Apply stat boost based on user selection (await to ensure pop-up closes before continuing)
    if (selectedStat) {
        await applyItemStatBoost(selectedStat, item.value, x, y);
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
    let oldCurrentHP = 0; // Store old current HP for HP animation
    
    switch (stat) {
        case 'hp':
            // HP: Increase max HP and maintain currentHP/maxHP ratio (heal player proportionally)
            oldCurrentHP = gameState.playerStats.hp.current;
            const oldMaxHP = gameState.playerStats.hp.max;
            
            // Calculate current HP ratio
            const hpRatio = oldMaxHP > 0 ? oldCurrentHP / oldMaxHP : 1;
            
            // Increase max HP
            gameState.playerStats.hp.max += value;
            
            // Calculate new current HP based on ratio (round up to benefit player)
            const newCurrentHP = Math.ceil(gameState.playerStats.hp.max * hpRatio);
            gameState.playerStats.hp.current = Math.min(newCurrentHP, gameState.playerStats.hp.max);
            
            // For animation: animate both current and max HP
            oldStatValue = oldCurrentHP; // Start with old current HP
            newStatValue = gameState.playerStats.hp.current; // End with new current HP
            
            statElement = document.getElementById('statOptionHP');
            const hpHealed = gameState.playerStats.hp.current - oldCurrentHP;
            statChange = `HP Max +${value}${hpHealed > 0 ? `, Healed +${hpHealed}` : ''}`;
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
        if (stat === 'hp') {
            // For HP, animate both current and max HP
            // oldStatValue = oldCurrentHP, newStatValue = newCurrentHP
            const oldMaxHP = gameState.playerStats.hp.max - value; // Calculate old max HP
            const newMaxHP = gameState.playerStats.hp.max;
            await animateStatIncrement(statElement, oldStatValue, newStatValue, true, oldMaxHP, newMaxHP);
        } else {
            await animateStatIncrement(statElement, oldStatValue, newStatValue, false);
        }
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
function animateStatIncrement(element, oldValue, newValue, isHP = false, oldMaxHP = null, newMaxHP = null) {
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
            const animatedValue = Math.round(oldValue + (increment * currentStep));
            // For HP, animate both current and max HP
            if (isHP && oldMaxHP !== null && newMaxHP !== null) {
                // Animate current HP from oldValue to newValue
                const animatedCurrentHP = animatedValue;
                // Animate max HP from oldMaxHP to newMaxHP
                const maxHPIncrement = (newMaxHP - oldMaxHP) / steps;
                const animatedMaxHP = Math.round(oldMaxHP + (maxHPIncrement * currentStep));
                const displayValue = `${animatedCurrentHP}/${animatedMaxHP}`;
                element.textContent = displayValue;
            } else {
                // For non-HP stats, just display the animated value
                element.textContent = animatedValue;
            }
            
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
                // For HP, display final currentHP/newMaxHP
                if (isHP && newMaxHP !== null) {
                    element.textContent = `${newValue}/${newMaxHP}`;
                } else {
                    element.textContent = newValue;
                }
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
    
    // Get enemy/boss stats
    let enemyHP, maxEnemyHP;
    if (gameState.combatState.isBoss && gameState.combatState.bossData) {
        // Boss combat - use boss stats
        const bossData = gameState.combatState.bossData;
        enemyHP = bossData.hp.current;
        maxEnemyHP = bossData.hp.max;
    } else {
        // Regular enemy combat
        const enemy = gameState.enemies.find(e => e.id === enemyId);
        enemyHP = enemy && enemy.hp ? enemy.hp.current : enemyValue;
        maxEnemyHP = enemy && enemy.hp ? enemy.hp.max : enemyValue;
    }
    
    gameState.combatState.active = true;
    gameState.combatState.playerHP = playerHP; // Use current HP
    gameState.combatState.enemyHP = enemyHP;
    gameState.combatState.maxPlayerHP = maxPlayerHP;
    gameState.combatState.maxEnemyHP = maxEnemyHP;
    gameState.combatState.currentCombatTurn = 'player';
    gameState.combatState.enemyId = enemyId;
    gameState.combatState.enemyEmoji = enemyEmoji;
    gameState.combatState.enemyName = enemyName || 'Enemy';
    // Initialize boss flags (will be set by enterBossCombat if boss)
    if (!gameState.combatState.isBoss) {
        gameState.combatState.isBoss = false;
        gameState.combatState.bossData = null;
    }
    
    // Update UI - Spine for combat or asset/emoji fallback
    if (elements.combatPlayerEmoji) {
        const useCombatSpinePlayer = typeof SpinePlayerIntegration !== 'undefined' && SpinePlayerIntegration.isEnabled && SpinePlayerIntegration.isEnabled();
        if (useCombatSpinePlayer && SpinePlayerIntegration.initCombatPlayer) {
            elements.combatPlayerEmoji.innerHTML = '';
            const playerSpineWrap = document.createElement('div');
            playerSpineWrap.className = 'combat-player-spine-wrap';
            playerSpineWrap.style.cssText = 'width:100%;height:100%;position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;background:transparent;';
            elements.combatPlayerEmoji.appendChild(playerSpineWrap);
            SpinePlayerIntegration.initCombatPlayer(playerSpineWrap);
        } else if (typeof renderPlayer !== 'undefined') {
            renderPlayer(elements.combatPlayerEmoji, false);
        } else {
            elements.combatPlayerEmoji.textContent = '🧙';
        }
    }
    if (elements.combatEnemyEmoji) {
        const hasEnemySpineConfig = typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.getConfig && SpineEnemyIntegration.getConfig(enemyName);
        const useCombatSpineEnemy = typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.isEnabled && SpineEnemyIntegration.isEnabled() && enemyName && hasEnemySpineConfig;
        if (useCombatSpineEnemy && SpineEnemyIntegration.initEnemy) {
            elements.combatEnemyEmoji.innerHTML = '';
            const enemySpineWrap = document.createElement('div');
            enemySpineWrap.className = 'combat-enemy-spine-wrap';
            enemySpineWrap.style.cssText = 'width:100%;height:100%;position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;background:transparent;';
            elements.combatEnemyEmoji.appendChild(enemySpineWrap);
            const enemySpineInner = document.createElement('div');
            enemySpineInner.setAttribute('data-emoji', enemyEmoji || '👹');
            enemySpineWrap.appendChild(enemySpineInner);
            SpineEnemyIntegration.initEnemy(enemySpineInner, enemyName);
        } else if (typeof renderEnemy !== 'undefined' && enemyName) {
            renderEnemy(elements.combatEnemyEmoji, enemyName, false);
        } else {
            elements.combatEnemyEmoji.textContent = enemyEmoji;
        }
    }
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
        // Enemy/Boss damage range
        if (gameState.combatState.isBoss && gameState.combatState.bossData) {
            // Boss combat - use boss stats
            const bossData = gameState.combatState.bossData;
            elements.combatEnemyDiceRange.textContent = `${bossData.dmg.min}-${bossData.dmg.max}`;
        } else {
            // Regular enemy - damage range is 1 to enemy.value
            elements.combatEnemyDiceRange.textContent = `1-${enemyValue}`;
        }
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
    
    // Spine: player uses AssassinPyramid_Attack_01 when attacking
    if (attacker === 'player' && typeof SpinePlayerIntegration !== 'undefined' && SpinePlayerIntegration.playCombatPlayerAnimation) {
        const attackAnim = (window.SPINE_CONFIG && window.SPINE_CONFIG.combatPlayerAttack) || 'AssassinPyramid_Attack_01';
        SpinePlayerIntegration.playCombatPlayerAnimation(attackAnim, false);
    }
    
    // Add attacking class
    attackerArea.classList.add('attacking');
    defenderArea.classList.add('defending');
    
    // Wait for attack animation
    await sleep(600);
    
    // Spine: switch combat player back to idle
    if (attacker === 'player' && typeof SpinePlayerIntegration !== 'undefined' && SpinePlayerIntegration.combatPlayerBackToIdle) {
        SpinePlayerIntegration.combatPlayerBackToIdle();
    }
    
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
        // Enemy/Boss rolls
        // Check if this is a boss fight
        if (state.isBoss && state.bossData) {
            // Boss combat - use boss stats
            const bossData = state.bossData;
            diceValue = Math.floor(Math.random() * (bossData.dmg.max - bossData.dmg.min + 1)) + bossData.dmg.min;
        } else {
            // Regular enemy combat
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
    }
    
    // Animate dice roll
    await animateDiceRoll(turn, diceValue);
    
    // Animate attack
    const defender = turn === 'player' ? 'enemy' : 'player';
    await animateAttack(turn, defender);
    
    // Apply damage
    if (turn === 'player') {
        state.enemyHP = Math.max(0, state.enemyHP - diceValue);
        // Update enemy/boss hp.current
        if (state.isBoss && state.bossData) {
            // Boss combat - update boss HP
            state.bossData.hp.current = state.enemyHP;
        } else {
            // Regular enemy combat
            const enemy = gameState.enemies.find(e => e.id === state.enemyId);
            if (enemy && enemy.hp) {
                enemy.hp.current = state.enemyHP;
            }
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
    
    // Check if this is a boss fight
    if (state.isBoss && state.bossData) {
        if (playerWon) {
            // Boss defeated
            await handleBossDefeat(state.bossData);
        } else {
            // Player lost to boss - Game Over
            console.log(`Player lost to boss! Game Over.`);
            hideCombatScreen();
            gameOver(false);
        }
        return;
    }
    
    // Hide combat screen
    hideCombatScreen();
    
    if (playerWon) {
        // Player wins - find and remove enemy
        const enemy = gameState.enemies.find(e => e.id === enemyId);
        if (enemy) {
            // Calculate gold reward based on enemy value
            const goldReward = calculateEnemyGoldReward(enemy);
            
            // Add gold to player
            gameState.currentGold += goldReward;
            
            // Show gold reward animation
            await showGoldRewardAnimation(enemy.x, enemy.y, goldReward);
            
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
            
            console.log(`Player won combat! Enemy defeated. Received ${goldReward} gold.`);
            
            // Note: Win condition is now reaching portal after rescuing princess, not defeating all enemies
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
    
    // Start combat with player turn (player moved into enemy, so player attacks first)
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
        
        // Check if cell is walkable (isFloor)
        const cellData = gameState.grid[newPos.y][newPos.x];
        if (!cellData || cellData.isFloor === false) {
            break; // Hit wall (not walkable)
        }
        
        // Check for box (obstacle)
        if (cellData.specialGrid === 'box') {
            break; // Hit box
        }
        
        // Check for other enemies (but allow player position)
        if (cellData.enemy !== null &&
            !cellData.player) {
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
        
        // Check if cell is walkable (isFloor)
        const cellData = gameState.grid[newPos.y][newPos.x];
        if (!cellData || cellData.isFloor === false) {
            break; // Hit wall (not walkable)
        }
        
        // Check for box (obstacle)
        if (cellData.specialGrid === 'box') {
            break; // Hit box
        }
        
        // Check for other enemies (but allow player position)
        if (cellData.enemy !== null &&
            !cellData.player) {
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
    // Phase 2: If princess is rescued, ALL enemies target player
    if (gameState.princessRescued) {
        // All enemies chase player in Phase 2
        const playerPos = { x: gameState.player.x, y: gameState.player.y };
        const reachableCells = calculateReachableCells(enemy.x, enemy.y, roll);
        
        // Find closest reachable cell to player
        let bestCell = null;
        let minDistance = Infinity;
        
        for (const cellKey of reachableCells.keys()) {
            const [x, y] = cellKey.split(',').map(Number);
            // Canon cells are walkable for enemies (they can enter to activate teleport)
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
    }
    
    // Phase 1: Original logic - only chase player if enemy is STRICTLY stronger (value > player value)
    // If equal or weaker, enemy should seek items to come back
    const isStronger = enemy.value > gameState.player.value;
    
    if (isStronger) {
        // Strong enemy: Chase player
        const playerPos = { x: gameState.player.x, y: gameState.player.y };
        const reachableCells = calculateReachableCells(enemy.x, enemy.y, roll);
        
        // Find closest reachable cell to player
        let bestCell = null;
        let minDistance = Infinity;
        
        for (const cellKey of reachableCells.keys()) {
            const [x, y] = cellKey.split(',').map(Number);
            // Canon cells are walkable for enemies (they can enter to activate teleport)
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
                
                for (const cellKey of reachableCells.keys()) {
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
        
        for (const cellKey of reachableCells.keys()) {
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
    
    // Update day/night cycle (track player turn)
    updateDayNightCycle();
    
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

// Show dice roll animation for all enemies at once (parallel mode)
async function showAllEnemiesDiceRoll(entries) {
    const diceDisplays = [];
    for (const entry of entries) {
        const enemy = entry.enemy;
        const cell = elements.gameGrid && elements.gameGrid.querySelector(`[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
        if (!cell) continue;
        const diceDisplay = document.createElement('div');
        diceDisplay.className = 'enemy-dice-display rolling';
        diceDisplay.textContent = '?';
        cell.appendChild(diceDisplay);
        diceDisplays.push({ diceDisplay, roll: entry.roll });
    }
    await sleep(500);
    for (const { diceDisplay, roll } of diceDisplays) {
        diceDisplay.textContent = roll;
        diceDisplay.classList.remove('rolling');
    }
    await sleep(400);
    for (const { diceDisplay } of diceDisplays) {
        if (diceDisplay.parentNode) diceDisplay.parentNode.removeChild(diceDisplay);
    }
}

// Enemy Turn (parallel) - when > 3 enemies in viewport: roll all, move all step-by-step together
async function enemyTurnParallel(enemiesInViewport) {
    if (!gameState.gameRunning) return;
    
    const entries = [];
    for (const enemy of enemiesInViewport) {
        if (!gameState.enemies.find(e => e.id === enemy.id)) continue;
        const roll = rollEnemyDice(enemy);
        const targetCell = chooseBestTargetCell(enemy, roll);
        const path = findPath(enemy.x, enemy.y, targetCell.x, targetCell.y, roll);
        if (!path || path.length === 0) continue;
        entries.push({ enemy, roll, path, curX: enemy.x, curY: enemy.y });
    }
    
    if (entries.length === 0) {
        await endEnemyTurn();
        return;
    }
    
    entries.sort((a, b) => String(a.enemy.id || '').localeCompare(String(b.enemy.id || '')));
    
    // Show roll animation for all enemies at once
    await showAllEnemiesDiceRoll(entries);
    if (!gameState.gameRunning) return;
    renderGrid();
    await sleep(100);
    
    const maxSteps = Math.max(...entries.map(e => Math.min(e.roll, e.path.length)));
    
    for (let step = 0; step < maxSteps && gameState.gameRunning; step++) {
        if (typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.isEnabled && SpineEnemyIntegration.isEnabled()) {
            for (var ei = 0; ei < entries.length; ei++) {
                var e = entries[ei];
                if (step >= e.path.length) continue;
                var c = elements.gameGrid.querySelector('[data-x="' + e.curX + '"][data-y="' + e.curY + '"]');
                if (c && e.enemy.type) {
                    var jumpAnim = SpineEnemyIntegration.getJumpAnimation ? SpineEnemyIntegration.getJumpAnimation(e.enemy.type) : 'Monster1_Jump_01';
                    SpineEnemyIntegration.playAnimationInCell(c, jumpAnim, false);
                }
            }
        }
        const taken = new Set();
        const moves = [];
        
        for (const entry of entries) {
            if (!gameState.enemies.find(e => e.id === entry.enemy.id)) continue;
            if (step >= entry.path.length) continue;
            const direction = entry.path[step];
            const newPos = getNewPosition(entry.curX, entry.curY, direction);
            
            if (newPos.x < 0 || newPos.x >= gameState.gridWidth || newPos.y < 0 || newPos.y >= gameState.gridHeight) continue;
            const cellData = gameState.grid[newPos.y] && gameState.grid[newPos.y][newPos.x];
            if (!cellData || cellData.isFloor === false || cellData.specialGrid === 'box') continue;
            
            const key = `${newPos.x},${newPos.y}`;
            if (taken.has(key)) continue;
            
            if (gameState.grid[newPos.y][newPos.x].player) {
                taken.add(key);
                moves.push({ entry, newX: newPos.x, newY: newPos.y, combat: true });
                break;
            }
            if (gameState.grid[newPos.y][newPos.x].enemy !== null) continue;
            
            taken.add(key);
            moves.push({ entry, newX: newPos.x, newY: newPos.y, combat: false });
        }
        
        // Clear all old positions first so we don't overwrite an enemy that moved into another's cell
        for (const { entry, newX, newY } of moves) {
            if (!gameState.enemies.find(e => e.id === entry.enemy.id)) continue;
            const enemy = entry.enemy;
            gameState.grid[enemy.y][enemy.x].enemy = null;
        }
        for (const { entry, newX, newY, combat } of moves) {
            if (!gameState.enemies.find(e => e.id === entry.enemy.id)) continue;
            const enemy = entry.enemy;
            enemy.x = newX;
            enemy.y = newY;
            gameState.grid[newY][newX].enemy = enemy.id;
            entry.curX = newX;
            entry.curY = newY;
            
            if (combat) {
                renderGrid();
                await sleep(100);
                await performEnemyCombat(enemy, newX, newY);
                await endEnemyTurn();
                return;
            }
        }
        
        for (const { entry } of moves) {
            if (!gameState.enemies.find(e => e.id === entry.enemy.id)) continue;
            const enemy = entry.enemy;
            const specialGrid = gameState.grid[enemy.y] && gameState.grid[enemy.y][enemy.x] && gameState.grid[enemy.y][enemy.x].specialGrid;
            if (specialGrid === 'canon') {
                await handleEnemyCanon(enemy, enemy.x, enemy.y);
            } else if (specialGrid === 'lava') {
                const lavaDamage = CONFIG.SPECIAL_GRID_TYPES.lava.damage;
                if (enemy.value > lavaDamage) {
                    enemy.value -= lavaDamage;
                    syncEnemyStats(enemy);
                } else {
                    gameState.grid[enemy.y][enemy.x].enemy = null;
                    gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
                }
            } else if (specialGrid === 'swamp') {
                const swampDamage = CONFIG.SPECIAL_GRID_TYPES.swamp.damage;
                if (enemy.value > swampDamage) {
                    enemy.value -= swampDamage;
                    syncEnemyStats(enemy);
                } else {
                    gameState.grid[enemy.y][enemy.x].enemy = null;
                    gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
                }
            }
            if (gameState.grid[enemy.y][enemy.x].item !== null) {
                await enemyCollectItem(enemy, enemy.x, enemy.y);
            }
        }
        
        renderGrid();
        await sleep(150);
    }
    
    if (typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.playDefaultInCell) {
        for (var ei = 0; ei < entries.length; ei++) {
            var e = entries[ei];
            if (!gameState.enemies.find(function (x) { return x.id === e.enemy.id; })) continue;
            var c = elements.gameGrid.querySelector('[data-x="' + e.curX + '"][data-y="' + e.curY + '"]');
            if (c) SpineEnemyIntegration.playDefaultInCell(c);
        }
    }
    
    await endEnemyTurn();
}

async function endEnemyTurn() {
    if (!gameState.gameRunning) return;
    checkItemSpawn();
    if (!gameState.gameRunning) return;
    gameState.currentTurn = 'player';
    await updatePendingSpawns();
    checkItemSpawn();
    if (!gameState.gameRunning) return;
    elements.diceLabel.textContent = 'Your turn';
    elements.diceFace.textContent = '?';
    elements.rollButton.disabled = false;
    if (elements.endTurnButton) elements.endTurnButton.style.display = 'none';
}

// Enemy Turn - Process enemies one by one
async function enemyTurn() {
    if (!gameState.gameRunning) return;
    
    console.log('Enemy turn started');
    
    // Update camera position to get current viewport
    if (typeof CAMERA !== 'undefined') {
        CAMERA.updateCameraPosition();
    }
    
    // Only process enemies within the viewport (8x10 around player)
    const enemiesInViewport = [];
    
    for (const enemy of [...gameState.enemies]) {
        if (!gameState.gameRunning) break;
        
        // Skip if enemy was removed
        if (!gameState.enemies.find(e => e.id === enemy.id)) continue;
        
        // Check if enemy is in viewport (8x10 around player)
        if (typeof CAMERA !== 'undefined' && CAMERA.isInViewport(enemy.x, enemy.y)) {
            enemiesInViewport.push(enemy);
        }
    }
    
    console.log(`Processing ${enemiesInViewport.length} enemies in viewport (out of ${gameState.enemies.length} total)`);
    
    // When more than 3 enemies on screen: roll and move all at once to save time
    const PARALLEL_ENEMY_THRESHOLD = 3;
    if (enemiesInViewport.length > PARALLEL_ENEMY_THRESHOLD) {
        await enemyTurnParallel(enemiesInViewport);
        return;
    }
    
    // Process enemies in viewport one by one (with roll dice animation)
    for (const enemy of enemiesInViewport) {
        if (!gameState.gameRunning) break;
        
        // Skip if enemy was removed
        if (!gameState.enemies.find(e => e.id === enemy.id)) continue;
        
        console.log(`Processing visible enemy ${enemy.id} at (${enemy.x}, ${enemy.y})`);
        
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
                    if (typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.isEnabled && SpineEnemyIntegration.isEnabled() && enemy.type) {
                        var atkCell = elements.gameGrid.querySelector('[data-x="' + enemy.x + '"][data-y="' + enemy.y + '"]');
                        if (atkCell) {
                            var jumpAnim = SpineEnemyIntegration.getJumpAnimation ? SpineEnemyIntegration.getJumpAnimation(enemy.type) : 'Monster1_Jump_01';
                            SpineEnemyIntegration.playAnimationInCell(atkCell, jumpAnim, false);
                        }
                    }
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
        
        if (typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.isEnabled && SpineEnemyIntegration.isEnabled() && enemy.type) {
            var enemyCell = elements.gameGrid.querySelector('[data-x="' + enemy.x + '"][data-y="' + enemy.y + '"]');
            if (enemyCell) {
                var jumpAnim = SpineEnemyIntegration.getJumpAnimation ? SpineEnemyIntegration.getJumpAnimation(enemy.type) : 'Monster1_Jump_01';
                SpineEnemyIntegration.playAnimationInCell(enemyCell, jumpAnim, false);
            }
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
            
            // Check if cell is walkable (isFloor)
            const cellData = gameState.grid[newPos.y][newPos.x];
            if (!cellData || cellData.isFloor === false) {
                break; // Hit wall (not walkable)
            }
            
            // Check for box (obstacle)
            if (cellData.specialGrid === 'box') {
                break; // Hit box
            }
            
            // Canon cells are walkable for enemies (they can enter to activate teleport)
            
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
            
            // Check for special grid effects (enemy can take damage from lava and swamp, or use canon)
            const specialGrid = gameState.grid[enemy.y][enemy.x].specialGrid;
            if (specialGrid === 'canon') {
                // Enemy stepped on canon - activate teleport
                await handleEnemyCanon(enemy, enemy.x, enemy.y);
                break; // Stop movement after canon teleport
            } else if (specialGrid === 'lava') {
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
        
        if (typeof SpineEnemyIntegration !== 'undefined' && SpineEnemyIntegration.playDefaultInCell) {
            var endCell = elements.gameGrid.querySelector('[data-x="' + enemy.x + '"][data-y="' + enemy.y + '"]');
            if (endCell) SpineEnemyIntegration.playDefaultInCell(endCell);
        }
    }
    
    await endEnemyTurn();
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
    
    // Show combat screen and start combat
    showCombatScreen(
        gameState.player.value,
        enemy.value,
        enemy.emoji || '👹',
        enemy.type || 'Enemy',
        enemy.id
    );
    
    // Start combat with enemy turn (enemy moved into player, so enemy attacks first)
    await performCombatTurn('enemy');
}

// Portal Spawn System

// Spawn portal after princess rescue
function spawnPortal() {
    if (gameState.portal.active) {
        // Portal already exists
        return;
    }
    
    // Find all empty cells (not occupied by player, enemy, item, special grid, gold, or portal)
    const emptyCells = [];
    for (let y = 0; y < gameState.gridHeight; y++) {
        for (let x = 0; x < gameState.gridWidth; x++) {
            const cell = gameState.grid[y][x];
            if (!cell.player && 
                cell.enemy === null && 
                cell.item === null && 
                cell.specialGrid === null &&
                !cell.gold &&
                !cell.portal) {
                emptyCells.push({ x, y });
            }
        }
    }
    
    if (emptyCells.length === 0) {
        console.log('No empty cells available for portal spawn');
        return;
    }
    
    // Random select an empty cell
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // Set portal position and activate
    gameState.portal.x = randomCell.x;
    gameState.portal.y = randomCell.y;
    gameState.portal.active = true;
    gameState.grid[randomCell.y][randomCell.x].portal = true;
    
    console.log(`Portal spawned at (${randomCell.x}, ${randomCell.y})`);
}

// Item Spawn System - DISABLED
// Auto-spawn system has been removed - items are now only placed in layout

// Check if items need to be spawned - DISABLED
function checkItemSpawn() {
    // Auto-spawn system disabled - items are only from layout
    return;
}

// Initiate item spawn - DISABLED
function initiateItemSpawn(levelConfig) {
    // Auto-spawn system disabled - items are only from layout
    return;
}

// Update pending spawns - DISABLED
// This should only be called at the START of player turn (not enemy turn)
async function updatePendingSpawns() {
    // Auto-spawn system disabled - items are only from layout
    return;
}

// Spawn item at position - DISABLED
async function spawnItemAtPosition(x, y, value) {
    // Auto-spawn system disabled - items are only from layout
    return;
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
    // Check if we're in level designer test mode
    if (window.isLevelDesignerTestMode) {
        // In test mode, just show a simple message and return to designer
        const message = won 
            ? `Test Level Completed!\nYou rescued the princess in Level ${gameState.level}!\nFinal value: ${gameState.player.value}`
            : `Test Level Failed!\nYou were defeated in Level ${gameState.level}!\nYour value: ${gameState.player.value}`;
        alert(message);
        
        // Exit playtest mode (will return to designer)
        // Use setTimeout to ensure alert is closed first
        setTimeout(() => {
            if (typeof window.exitGame === 'function' && window.exitGame !== exitGame) {
                window.exitGame();
            } else {
                // Fallback: directly call exitPlaytestMode if available
                if (typeof exitPlaytestMode === 'function') {
                    exitPlaytestMode();
                }
            }
        }, 100);
        return;
    }
    
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
            ? `You rescued the princess and escaped Level ${gameState.level}!\nFinal value: ${gameState.player.value}`
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
    // Check if we're in level designer test mode
    if (window.isLevelDesignerTestMode) {
        // Let the level designer handle the exit (it will call the overridden function)
        if (typeof window.exitGame === 'function' && window.exitGame !== exitGame) {
            window.exitGame();
        }
        return;
    }
    
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

// ==================== POI SYSTEM ====================

// Show Shop POI
async function showShopPOI(x, y) {
    const shopScreen = document.getElementById('shopPOIScreen');
    if (!shopScreen) return;
    
    // Generate random powerup options
    const shopConfig = CONFIG.POI_CONFIG.shop;
    gameState.availablePowerups = POWERUP_CONFIG.getRandomPowerups(shopConfig.optionsCount);
    gameState.currentResources = 0;
    gameState.resourceDiceRolled = false;
    
    // Show shop screen
    shopScreen.style.display = 'flex';
    
    // Generate shop cards
    generateShopCards();
    
    // Store POI position for later
    gameState.poiData.currentPOI = { x, y, type: 'shop' };
}

// Generate Shop Cards
function generateShopCards() {
    const shopCards = document.getElementById('shopCards');
    if (!shopCards) return;
    
    shopCards.innerHTML = '';
    
    gameState.availablePowerups.forEach(powerup => {
        const card = document.createElement('div');
        card.className = 'powerup-card unaffordable';
        card.dataset.powerupId = powerup.id;
        
        const diceRequired = Math.floor(Math.random() * 
            (CONFIG.POI_CONFIG.shop.diceRequiredMax - CONFIG.POI_CONFIG.shop.diceRequiredMin + 1)) + 
            CONFIG.POI_CONFIG.shop.diceRequiredMin;
        powerup.diceRequired = diceRequired;
        
        card.innerHTML = `
            <div class="powerup-name">${powerup.name}</div>
            <div class="powerup-description">${powerup.description}</div>
            <div class="powerup-cost">Cost: ${diceRequired} dice</div>
        `;
        
        card.addEventListener('click', () => selectShopPowerup(powerup.id));
        shopCards.appendChild(card);
    });
    
    updateShopCardsAffordability();
}

// Update Shop Cards Affordability
function updateShopCardsAffordability() {
    const shopCards = document.getElementById('shopCards');
    if (!shopCards) return;
    
    shopCards.querySelectorAll('.powerup-card').forEach(card => {
        const powerupId = card.dataset.powerupId;
        const powerup = gameState.availablePowerups.find(p => p.id === powerupId);
        
        if (!powerup) return;
        
        const isSelected = card.classList.contains('selected');
        const canAfford = gameState.currentResources >= powerup.diceRequired;
        
        card.classList.remove('affordable', 'unaffordable');
        if (isSelected) {
            card.classList.add('selected');
        } else if (canAfford) {
            card.classList.add('affordable');
        } else {
            card.classList.add('unaffordable');
        }
    });
}

// Select Shop Powerup
function selectShopPowerup(powerupId) {
    const powerup = POWERUP_CONFIG.getPowerup(powerupId);
    
    if (!powerup || gameState.currentResources < powerup.diceRequired) {
        return; // Can't afford
    }
    
    // Mark power-up as selected
    const card = document.getElementById('shopCards').querySelector(`[data-powerup-id="${powerupId}"]`);
    if (card) {
        card.classList.add('selected');
        card.classList.remove('affordable', 'unaffordable');
    }
    
    // Subtract resources
    gameState.currentResources -= powerup.diceRequired;
    
    // Update dice display
    const shopDice = document.getElementById('shopDice');
    if (shopDice) {
        shopDice.textContent = gameState.currentResources;
    }
    
    // Apply power-up effect
    applyPowerupEffect(powerup);
    
    // Update power-up cards affordability
    updateShopCardsAffordability();
    
    // Check if user can still afford any power-ups
    const canAffordAny = gameState.availablePowerups.some(p => 
        gameState.currentResources >= p.diceRequired && 
        !document.getElementById('shopCards').querySelector(`[data-powerup-id="${p.id}"].selected`)
    );
    
    if (!canAffordAny) {
        // No more affordable power-ups, close shop
        setTimeout(() => {
            hideShopPOI();
        }, 1000);
    }
}

// Hide Shop POI
function hideShopPOI() {
    const shopScreen = document.getElementById('shopPOIScreen');
    if (shopScreen) {
        shopScreen.style.display = 'none';
    }
    
    // Mark POI as visited
    if (gameState.poiData.currentPOI) {
        const poiKey = `${gameState.poiData.currentPOI.x},${gameState.poiData.currentPOI.y}`;
        gameState.visitedPOIs.add(poiKey);
        
        // Remove POI from grid
        gameState.grid[gameState.poiData.currentPOI.y][gameState.poiData.currentPOI.x].specialGrid = null;
        
        gameState.poiData.currentPOI = null;
    }
    
    // Reset resources
    gameState.currentResources = 0;
    gameState.resourceDiceRolled = false;
    gameState.availablePowerups = [];
    
    // Re-render grid
    renderGrid();
    updateUI();
}

// Roll Shop Dice
function rollShopDice() {
    if (gameState.resourceDiceRolled) return;
    
    const shopDice = document.getElementById('shopDice');
    if (!shopDice) return;
    
    // Start roll animation
    shopDice.classList.add('rolling');
    shopDice.textContent = '?';
    
    // Cycle through random numbers during roll for visible "rolling" effect
    const rollDuration = 1000;
    const tickInterval = 80;
    let elapsed = 0;
    const rollInterval = setInterval(() => {
        elapsed += tickInterval;
        if (elapsed < rollDuration) {
            shopDice.textContent = Math.floor(Math.random() * 6) + 1;
        } else {
            clearInterval(rollInterval);
        }
    }, tickInterval);
    
    setTimeout(() => {
        clearInterval(rollInterval);
        const roll = Math.floor(Math.random() * 6) + 1;
        gameState.currentResources = roll;
        gameState.resourceDiceRolled = true;
        
        shopDice.classList.remove('rolling');
        shopDice.textContent = roll;
        
        updateShopCardsAffordability();
    }, rollDuration);
}

// Show Stat Check POI — game sets target number; player chooses one stat to add to 1d6 roll
async function showStatCheckPOI(x, y) {
    const statCheckScreen = document.getElementById('statCheckPOIScreen');
    if (!statCheckScreen) return;
    
    const cfg = CONFIG.POI_CONFIG.stat_check;
    const targetMin = cfg.targetMin != null ? cfg.targetMin : 4;
    const targetMax = cfg.targetMax != null ? cfg.targetMax : 6;
    const targetNumber = targetMin + Math.floor(Math.random() * (targetMax - targetMin + 1));
    
    gameState.poiData.currentPOI = {
        x, y, type: 'stat_check',
        targetNumber,
        chosenStat: null,
        rollResult: null,
        diceValue: null
    };
    
    document.getElementById('statCheckTitle').textContent = `⚔️ ${cfg.title || 'Trial'}`;
    const dialogue = (cfg.dialogueTemplate || 'You must reach **TARGET** or higher. Roll 1d6 and add one of your stats.').replace('**TARGET**', targetNumber);
    document.getElementById('statCheckDialogue').textContent = dialogue;
    document.getElementById('statCheckTarget').textContent = `Need: ${targetNumber} or higher`;
    
    const dmgVal = document.getElementById('statCheckDmgVal');
    const spdVal = document.getElementById('statCheckSpdVal');
    const intVal = document.getElementById('statCheckIntVal');
    if (dmgVal) dmgVal.textContent = gameState.playerStats.dmg.max;
    if (spdVal) spdVal.textContent = gameState.playerStats.spd.max;
    if (intVal) intVal.textContent = gameState.playerStats.int.max;
    
    document.getElementById('statRollSection').style.display = 'block';
    document.getElementById('statResult').style.display = 'none';
    const continueBtn = document.getElementById('statResultContinue');
    if (continueBtn) continueBtn.style.display = 'none';
    const resultDice = document.getElementById('statResultDice');
    if (resultDice) resultDice.textContent = '?';
    const diceContainer = document.getElementById('statCheckDiceContainer');
    if (diceContainer) diceContainer.style.display = 'none';
    const rollBtns = document.querySelectorAll('.stat-roll-btn');
    rollBtns.forEach(btn => { btn.style.display = ''; });
    
    statCheckScreen.style.display = 'flex';
}

// Roll Stat Check — player chose a stat; roll 1d6 + stat, success if total >= target
function rollStatCheck(chosenStat) {
    const statCheck = gameState.poiData.currentPOI;
    if (!statCheck || statCheck.type !== 'stat_check' || statCheck.chosenStat != null) return;
    if (!chosenStat || !['dmg', 'spd', 'int'].includes(chosenStat)) return;
    
    const statCheckDice = document.getElementById('statCheckDice');
    if (!statCheckDice) return;
    
    let statValue = 0;
    if (chosenStat === 'dmg') statValue = gameState.playerStats.dmg.max;
    else if (chosenStat === 'spd') statValue = gameState.playerStats.spd.max;
    else if (chosenStat === 'int') statValue = gameState.playerStats.int.max;
    
    statCheck.chosenStat = chosenStat;
    const rollBtns = document.querySelectorAll('.stat-roll-btn');
    rollBtns.forEach(btn => { btn.style.display = 'none'; });
    const diceContainer = document.getElementById('statCheckDiceContainer');
    if (diceContainer) diceContainer.style.display = 'flex';
    
    statCheckDice.classList.add('rolling');
    statCheckDice.textContent = '?';
    
    const rollDuration = 1000;
    const tickInterval = 80;
    let elapsed = 0;
    const rollInterval = setInterval(() => {
        elapsed += tickInterval;
        if (elapsed < rollDuration) {
            statCheckDice.textContent = Math.floor(Math.random() * 6) + 1;
        } else {
            clearInterval(rollInterval);
        }
    }, tickInterval);
    
    setTimeout(() => {
        clearInterval(rollInterval);
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        const total = diceRoll + statValue;
        statCheck.rollResult = total;
        statCheck.diceValue = diceRoll;
        
        statCheckDice.classList.remove('rolling');
        statCheckDice.textContent = diceRoll;
        
        const won = total >= statCheck.targetNumber;
        const theme = CONFIG.POI_CONFIG.stat_check.dialogueThemes[chosenStat];
        
        document.getElementById('statRollSection').style.display = 'none';
        const resultEl = document.getElementById('statResult');
        resultEl.style.display = 'flex';
        const resultDiceEl = document.getElementById('statResultDice');
        if (resultDiceEl) resultDiceEl.textContent = total;
        const resultDetail = document.getElementById('statResultDetail');
        if (resultDetail) resultDetail.textContent = `1d6 = ${diceRoll} + ${theme.label || chosenStat} (${statValue}) = ${total}. Need ${statCheck.targetNumber}.`;
        document.getElementById('statResultMessage').textContent = won ? theme.success : theme.failure;
        
        if (won) {
            const powerupMap = {
                'dmg_min': { id: 'dmg_min_boost', effect: 'increase_dmg_min', value: 1 },
                'dmg_max': { id: 'dmg_max_boost', effect: 'increase_dmg_max', value: 1 },
                'spd_min': { id: 'spd_min_boost', effect: 'increase_spd_min', value: 1 },
                'spd_max': { id: 'spd_max_boost', effect: 'increase_spd_max', value: 1 },
                'int_min': { id: 'int_min_boost', effect: 'increase_int_min', value: 1 },
                'int_max': { id: 'int_max_boost', effect: 'increase_int_max', value: 1 }
            };
            const powerup = powerupMap[theme.rewardUpgrade];
            if (powerup) applyPowerupEffect(powerup);
            const continueBtn = document.getElementById('statResultContinue');
            if (continueBtn) continueBtn.style.display = 'block';
        } else {
            setTimeout(() => hideStatCheckPOI(), 2000);
        }
    }, rollDuration);
}

// Hide Stat Check POI
function hideStatCheckPOI() {
    const statCheckScreen = document.getElementById('statCheckPOIScreen');
    if (statCheckScreen) {
        statCheckScreen.style.display = 'none';
    }
    
    // Mark POI as visited
    if (gameState.poiData.currentPOI) {
        const poiKey = `${gameState.poiData.currentPOI.x},${gameState.poiData.currentPOI.y}`;
        gameState.visitedPOIs.add(poiKey);
        
        // Remove POI from grid
        gameState.grid[gameState.poiData.currentPOI.y][gameState.poiData.currentPOI.x].specialGrid = null;
        
        gameState.poiData.currentPOI = null;
    }
    
    // Re-render grid
    renderGrid();
    updateUI();
}

// Show Healer POI
async function showHealerPOI(x, y) {
    const healerScreen = document.getElementById('healerPOIScreen');
    if (!healerScreen) return;
    
    // Select random healer dialogue
    const dialogues = CONFIG.POI_CONFIG.healer.dialogueVariations;
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    
    // Update UI
    document.getElementById('healerName').textContent = `💚 ${dialogue.name}`;
    document.getElementById('healerDialogue').textContent = dialogue.greeting;
    document.getElementById('healMessage').textContent = dialogue.healing;
    
    // Hide heal animation initially
    document.getElementById('healAnimation').style.display = 'none';
    
    // Show healer screen
    healerScreen.style.display = 'flex';
    
    // Store POI position
    gameState.poiData.currentPOI = { x, y, type: 'healer', dialogue: dialogue };
}

// Accept Heal from Healer
async function acceptHeal() {
    const healer = gameState.poiData.currentPOI;
    if (!healer || healer.type !== 'healer') return;
    
    // Calculate heal amount
    const healPercentage = CONFIG.POI_CONFIG.healer.healPercentage;
    const maxHP = gameState.playerStats.hp.max;
    const healAmount = Math.floor(maxHP * healPercentage);
    const newHP = Math.min(gameState.playerStats.hp.current + healAmount, maxHP);
    const actualHeal = newHP - gameState.playerStats.hp.current;
    
    // Apply heal
    gameState.playerStats.hp.current = newHP;
    
    // Show heal animation
    document.getElementById('healAnimation').style.display = 'block';
    document.getElementById('healAmount').textContent = `+${actualHeal} HP`;
    
    // Show heal animation on grid
    await showValueGainAnimation(healer.x, healer.y, actualHeal);
    
    // Update UI
    updateUI();
    
    // Wait a bit then close
    setTimeout(() => {
        hideHealerPOI();
    }, 2000);
}

// Hide Healer POI
function hideHealerPOI() {
    const healerScreen = document.getElementById('healerPOIScreen');
    if (healerScreen) {
        healerScreen.style.display = 'none';
    }
    
    // Mark POI as visited
    if (gameState.poiData.currentPOI) {
        const poiKey = `${gameState.poiData.currentPOI.x},${gameState.poiData.currentPOI.y}`;
        gameState.visitedPOIs.add(poiKey);
        
        // Remove POI from grid
        gameState.grid[gameState.poiData.currentPOI.y][gameState.poiData.currentPOI.x].specialGrid = null;
        
        gameState.poiData.currentPOI = null;
    }
    
    // Re-render grid
    renderGrid();
    updateUI();
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

// POI Event Listeners
const rollShopDiceBtn = document.getElementById('rollShopDice');
if (rollShopDiceBtn) {
    rollShopDiceBtn.addEventListener('click', () => {
        rollShopDice();
    });
}

const closeShopPOIBtn = document.getElementById('closeShopPOI');
if (closeShopPOIBtn) {
    closeShopPOIBtn.addEventListener('click', () => {
        hideShopPOI();
    });
}

// Stat Check POI event listeners (roll with chosen stat + continue + close)
function setupStatCheckListeners() {
    ['dmg', 'spd', 'int'].forEach(stat => {
        const btn = document.getElementById(`rollStatCheck${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
        if (btn) btn.addEventListener('click', () => rollStatCheck(stat));
    });
    const continueBtn = document.getElementById('statResultContinue');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => hideStatCheckPOI());
    }
}

// Set up listeners when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupStatCheckListeners);
} else {
    setupStatCheckListeners();
}

const closeStatCheckPOIBtn = document.getElementById('closeStatCheckPOI');
if (closeStatCheckPOIBtn) {
    closeStatCheckPOIBtn.addEventListener('click', () => {
        hideStatCheckPOI();
    });
}

// Healer POI event listeners
const acceptHealBtn = document.getElementById('acceptHeal');
if (acceptHealBtn) {
    acceptHealBtn.addEventListener('click', () => {
        acceptHeal();
    });
}

const closeHealerPOIBtn = document.getElementById('closeHealerPOI');
if (closeHealerPOIBtn) {
    closeHealerPOIBtn.addEventListener('click', () => {
        hideHealerPOI();
    });
}

// Exit game button
const exitGameBtn = document.getElementById('exitGameBtn');
if (exitGameBtn) {
    exitGameBtn.addEventListener('click', () => {
        exitGame();
    });
}

// Cheat buttons (View Full Map)
const cheatViewMapBtn = document.getElementById('cheatViewMapBtn');
const cheatNormalViewBtn = document.getElementById('cheatNormalViewBtn');

if (cheatViewMapBtn) {
    cheatViewMapBtn.addEventListener('click', () => {
        // Enable cheat mode
        gameState.cheatMode = true;
        // Show normal view button, hide view map button
        cheatViewMapBtn.style.display = 'none';
        if (cheatNormalViewBtn) {
            cheatNormalViewBtn.style.display = 'flex';
        }
        // Re-render grid to show full map
        renderGrid();
    });
}

if (cheatNormalViewBtn) {
    cheatNormalViewBtn.addEventListener('click', () => {
        // Open full map view screen
        openFullMapView();
    });
}

// Full Map View Functions
function openFullMapView() {
    const fullMapScreen = document.getElementById('fullMapViewScreen');
    if (!fullMapScreen) return;
    
    // Show the screen
    fullMapScreen.style.display = 'flex';
    
    // Render full map
    renderFullMap();
    
    // Setup mouse drag to pan
    setupMapPanning();
}

function closeFullMapView() {
    const fullMapScreen = document.getElementById('fullMapViewScreen');
    if (fullMapScreen) {
        fullMapScreen.style.display = 'none';
    }
}

function renderFullMap() {
    const fullMapGrid = document.getElementById('fullMapGrid');
    if (!fullMapGrid || !gameState.grid) return;
    
    // Clear existing content
    fullMapGrid.innerHTML = '';
    
    // Set grid dimensions
    fullMapGrid.style.gridTemplateColumns = `repeat(${gameState.gridWidth}, 1fr)`;
    fullMapGrid.style.gridTemplateRows = `repeat(${gameState.gridHeight}, 1fr)`;
    
    // Create a map of entities by position
    const entityMap = new Map();
    
    // Add player
    if (gameState.player) {
        const key = `${gameState.player.x},${gameState.player.y}`;
        entityMap.set(key, { type: 'player', emoji: '👤' });
    }
    
    // Add enemies
    if (gameState.enemies) {
        gameState.enemies.forEach(enemy => {
            const key = `${enemy.x},${enemy.y}`;
            entityMap.set(key, { type: 'enemy', emoji: enemy.emoji || '👹' });
        });
    }
    
    // Add items
    if (gameState.items) {
        gameState.items.forEach(item => {
            const key = `${item.x},${item.y}`;
            entityMap.set(key, { type: 'item', emoji: item.emoji || '💎' });
        });
    }
    
    // Add princess
    if (gameState.princess && gameState.princess.x >= 0 && gameState.princess.y >= 0) {
        const key = `${gameState.princess.x},${gameState.princess.y}`;
        entityMap.set(key, { type: 'princess', emoji: '👸' });
    }
    
    // Add portal
    if (gameState.portal && gameState.portal.x >= 0 && gameState.portal.y >= 0) {
        const key = `${gameState.portal.x},${gameState.portal.y}`;
        entityMap.set(key, { type: 'portal', emoji: '🌀' });
    }
    
    // Render all cells
    for (let y = 0; y < gameState.gridHeight; y++) {
        for (let x = 0; x < gameState.gridWidth; x++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            const cellData = gameState.grid[y] && gameState.grid[y][x];
            
            // Check if it's a wall
            if (!cellData || cellData.isFloor === false) {
                cell.classList.add('wall');
                fullMapGrid.appendChild(cell);
                continue;
            }
            
            // It's a floor
            cell.classList.add('floor');
            
            // Check for entities at this position
            const key = `${x},${y}`;
            const entity = entityMap.get(key);
            
            if (entity) {
                cell.classList.add(entity.type);
                cell.textContent = entity.emoji;
            }
            
            fullMapGrid.appendChild(cell);
        }
    }
    
    // Update info
    updateFullMapInfo();
}

function updateFullMapInfo() {
    const mapSizeInfo = document.getElementById('mapSizeInfo');
    const mapEnemyCount = document.getElementById('mapEnemyCount');
    const mapItemCount = document.getElementById('mapItemCount');
    const mapPlayerPos = document.getElementById('mapPlayerPos');
    
    if (mapSizeInfo) {
        mapSizeInfo.textContent = `${gameState.gridWidth} × ${gameState.gridHeight}`;
    }
    
    if (mapEnemyCount) {
        mapEnemyCount.textContent = gameState.enemies ? gameState.enemies.length : 0;
    }
    
    if (mapItemCount) {
        mapItemCount.textContent = gameState.items ? gameState.items.length : 0;
    }
    
    if (mapPlayerPos && gameState.player) {
        mapPlayerPos.textContent = `(${gameState.player.x}, ${gameState.player.y})`;
    }
}

function setupMapPanning() {
    const scrollContainer = document.getElementById('fullMapScrollContainer');
    if (!scrollContainer) return;
    
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    
    scrollContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - scrollContainer.offsetLeft;
        startY = e.pageY - scrollContainer.offsetTop;
        scrollLeft = scrollContainer.scrollLeft;
        scrollTop = scrollContainer.scrollTop;
        scrollContainer.style.cursor = 'grabbing';
    });
    
    scrollContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        scrollContainer.style.cursor = 'grab';
    });
    
    scrollContainer.addEventListener('mouseup', () => {
        isDragging = false;
        scrollContainer.style.cursor = 'grab';
    });
    
    scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const y = e.pageY - scrollContainer.offsetTop;
        const walkX = (x - startX);
        const walkY = (y - startY);
        scrollContainer.scrollLeft = scrollLeft - walkX;
        scrollContainer.scrollTop = scrollTop - walkY;
    });
}

// Close full map view button
const closeFullMapViewBtn = document.getElementById('closeFullMapViewBtn');
if (closeFullMapViewBtn) {
    closeFullMapViewBtn.addEventListener('click', () => {
        closeFullMapView();
    });
}

// Reachable cells are handled in renderGrid() when cells are created

