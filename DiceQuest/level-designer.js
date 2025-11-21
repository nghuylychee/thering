// Level Designer UI and Logic

let currentGeneratedLevel = null;
let testLevelNumber = null;
let generated10Levels = null;
let generatedLevelsCache = {}; // Cache for generated levels: { levelNumber: levelObject }
let levelConfigsCache = null; // Cache for level configs (updated by AI)

// DOM Elements
const designerElements = {
    levelDesignerScreen: document.getElementById('levelDesignerScreen'),
    levelDesignerBtn: document.getElementById('levelDesignerBtn'),
    backToHomeFromDesignerBtn: document.getElementById('backToHomeFromDesignerBtn'),
    
    // Tabs
    tabs: document.querySelectorAll('.designer-tab'),
    tabContents: document.querySelectorAll('.designer-tab-content'),
    
    // Tuning form inputs
    paramGridWidth: document.getElementById('paramGridWidth'),
    paramGridHeight: document.getElementById('paramGridHeight'),
    paramWalkableCells: document.getElementById('paramWalkableCells'),
    paramTotalEnemyPower: document.getElementById('paramTotalEnemyPower'),
    paramEnemyCount: document.getElementById('paramEnemyCount'),
    paramEnemyMinDistance: document.getElementById('paramEnemyMinDistance'),
    paramEnemyMaxDistance: document.getElementById('paramEnemyMaxDistance'),
    paramTotalItemValue: document.getElementById('paramTotalItemValue'),
    paramItemCount: document.getElementById('paramItemCount'),
    paramItemMinDistance: document.getElementById('paramItemMinDistance'),
    paramItemMaxDistance: document.getElementById('paramItemMaxDistance'),
    paramItemMinDistanceFromEnemy: document.getElementById('paramItemMinDistanceFromEnemy'),
    paramObstacleBox: document.getElementById('paramObstacleBox'),
    paramObstacleLava: document.getElementById('paramObstacleLava'),
    paramObstacleSwamp: document.getElementById('paramObstacleSwamp'),
    paramObstacleCanon: document.getElementById('paramObstacleCanon'),
    paramPrincessDistance: document.getElementById('paramPrincessDistance'),
    paramPortalDistance: document.getElementById('paramPortalDistance'),
    paramPlayerStartValue: document.getElementById('paramPlayerStartValue'),
    paramGoldPerLevel: document.getElementById('paramGoldPerLevel'),
    paramGoldPerBag: document.getElementById('paramGoldPerBag'),
    paramMinItems: document.getElementById('paramMinItems'),
    paramMaxItems: document.getElementById('paramMaxItems'),
    paramSpawnTurns: document.getElementById('paramSpawnTurns'),
    paramLevel: document.getElementById('paramLevel'),
    paramName: document.getElementById('paramName'),
    paramDescription: document.getElementById('paramDescription'),
    
    // Level selector
    levelSelector: document.getElementById('levelSelector'),
    difficultyScore: document.getElementById('difficultyScore'),
    
    // Buttons
    generateLevelBtn: document.getElementById('generateLevelBtn'),
    playTestBtn: document.getElementById('playTestBtn'),
    adjustParamsBtn: document.getElementById('adjustParamsBtn'),
    saveToFileBtn: document.getElementById('saveToFileBtn'),
    generateNewBtn: document.getElementById('generateNewBtn'),
    backToTuningBtn: document.getElementById('backToTuningBtn'),
    
    // Preview
    previewGrid: document.getElementById('previewGrid'),
    previewStats: document.getElementById('previewStats'),
    
    // Test
    testInfo: document.getElementById('testInfo'),
    
    // Level parameters list
    levelParametersList: document.getElementById('levelParametersList'),
    generateAll10LevelsBtn: document.getElementById('generateAll10LevelsBtn'),
    saveGenFileBtn: document.getElementById('saveGenFileBtn')
};

// Initialize
function initLevelDesigner() {
    console.log('Initializing Level Designer...');
    
    // Re-query elements in case they weren't ready before
    const levelDesignerBtn = document.getElementById('levelDesignerBtn');
    const backToHomeFromDesignerBtn = document.getElementById('backToHomeFromDesignerBtn');
    const tabs = document.querySelectorAll('.designer-tab');
    const tabContents = document.querySelectorAll('.designer-tab-content');
    
    // Navigation
    if (levelDesignerBtn) {
        console.log('Found levelDesignerBtn, attaching event listener');
        levelDesignerBtn.addEventListener('click', showLevelDesigner);
    } else {
        console.error('levelDesignerBtn not found!');
    }
    
    if (backToHomeFromDesignerBtn) {
        backToHomeFromDesignerBtn.addEventListener('click', hideLevelDesigner);
    }
    
    // Tab switching (only tuning tab now)
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                switchTab(tabName);
            });
        });
    }
    
    // Generate all and save actions
    if (designerElements.generateAll10LevelsBtn) {
        designerElements.generateAll10LevelsBtn.addEventListener('click', handleGenerateAll10);
    }
    const generateAllWithAIBtn = document.getElementById('generateAllWithAIBtn');
    if (generateAllWithAIBtn) {
        // Button is disabled - API generation temporarily disabled
        // generateAllWithAIBtn.addEventListener('click', handleAIGenerateAll);
    }
    
    // Load AI Result button
    const loadAIResultBtn = document.getElementById('loadAIResultBtn');
    const aiResultFileInput = document.getElementById('aiResultFileInput');
    if (loadAIResultBtn) {
        loadAIResultBtn.addEventListener('click', () => {
            // Try to load from ai-result.json first
            fetch('ai-result.json')
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        // If file not found, prompt for file upload
                        aiResultFileInput?.click();
                        return null;
                    }
                })
                .then(data => {
                    if (data) {
                        handleLoadAIResult(data);
                    }
                })
                .catch(error => {
                    console.log('ai-result.json not found, using file input instead');
                    aiResultFileInput?.click();
                });
        });
    }
    
    if (aiResultFileInput) {
        aiResultFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        handleLoadAIResult(data);
                    } catch (error) {
                        alert(`Failed to parse JSON file: ${error.message}`);
                    }
                };
                reader.readAsText(file);
            }
        });
    }
    
    // API Key input handler
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const apiKeyInput = document.getElementById('openaiApiKeyInput');
    if (saveApiKeyBtn && apiKeyInput) {
        // Load saved API key if available
        if (typeof AI_LEVEL_DESIGNER !== 'undefined') {
            const savedKey = AI_LEVEL_DESIGNER.getAPIKey();
            if (savedKey) {
                apiKeyInput.value = savedKey;
            }
        }
        
        saveApiKeyBtn.addEventListener('click', () => {
            const key = apiKeyInput.value.trim();
            if (!key) {
                alert('Please enter an API key');
                return;
            }
            if (typeof AI_LEVEL_DESIGNER !== 'undefined') {
                AI_LEVEL_DESIGNER.setAPIKey(key);
                alert('API key saved! (Stored in browser localStorage)');
            } else {
                alert('AI Level Designer not loaded');
            }
        });
    }
    if (designerElements.saveGenFileBtn) {
        designerElements.saveGenFileBtn.addEventListener('click', saveAllGeneratedLevelsToFile);
    }
    
    // Metric selector for overview tab
    const metricSelector = document.getElementById('metricSelector');
    if (metricSelector) {
        metricSelector.addEventListener('change', (e) => {
            updateOverviewCharts(e.target.value);
        });
    }
    
    // Initialize level parameters list
    renderLevelParametersList();
    
    // Load cached levels from storage
    loadGeneratedLevelsFromStorage();
    
    console.log('Level Designer initialized');
}

// Save generated levels to localStorage
function saveGeneratedLevelsToStorage() {
    try {
        // Convert levels to serializable format
        const serializableCache = {};
        Object.keys(generatedLevelsCache).forEach(levelNum => {
            const level = generatedLevelsCache[levelNum];
            if (level && level.layout) {
                serializableCache[levelNum] = {
                    level: level.level,
                    name: level.name,
                    description: level.description,
                    playerStartValue: level.playerStartValue,
                    goldPerLevel: level.goldPerLevel,
                    goldPerBag: level.goldPerBag,
                    minItems: level.minItems,
                    maxItems: level.maxItems,
                    spawnTurns: level.spawnTurns,
                    designIntent: level.designIntent || '',
                    optimalStrategy: level.optimalStrategy || '',
                    layout: level.layout,
                    stats: level.stats
                };
            }
        });
        
        localStorage.setItem('diceQuestGeneratedLevels', JSON.stringify(serializableCache));
        console.log('Generated levels saved to localStorage');
    } catch (error) {
        console.error('Error saving generated levels to storage:', error);
    }
}

// Load generated levels from localStorage
function loadGeneratedLevelsFromStorage() {
    try {
        const saved = localStorage.getItem('diceQuestGeneratedLevels');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure all loaded levels are properly formatted
            Object.keys(parsed).forEach(levelNum => {
                const level = parsed[levelNum];
                if (level && level.layout) {
                    // Ensure level number is set correctly
                    if (!level.level) {
                        level.level = parseInt(levelNum);
                    }
                    // Store in cache
                    generatedLevelsCache[levelNum] = level;
                }
            });
            console.log(`Loaded ${Object.keys(generatedLevelsCache).length} cached levels from storage`);
        }
    } catch (error) {
        console.error('Error loading generated levels from storage:', error);
    }
}

// Save all generated levels to file (matching level-design.js format)
function saveAllGeneratedLevelsToFile() {
    if (Object.keys(generatedLevelsCache).length === 0) {
        console.warn('No levels have been generated yet.');
        return;
    }
    
    // Format all levels for file
    const levelsArray = [];
    for (let levelNum = 1; levelNum <= 10; levelNum++) {
        const level = generatedLevelsCache[levelNum];
        if (level) {
            levelsArray.push(formatLevelForFile(level, levelNum));
        }
    }
    
    if (levelsArray.length === 0) {
        console.warn('No valid levels to save.');
        return;
    }
    
    const allLevelsCode = levelsArray.join(',\n\n');
    const fullCode = `// DiceQuest Level Design Configuration
// Level Design Format:
// - 'P' = Player starting position
// - Negative numbers (-1, -3, -5, -8, etc.) = Enemy (value = abs(number), icon auto-assigned)
// - Positive numbers (1, 2, 3, 5, etc.) = Item (value = number, icon auto-assigned)
// - 'B' = Box (obstacle)
// - 'L' = Lava
// - 'S' = Swamp
// - 'C' = Canon
// - 'R' = Princess (must be rescued to spawn portal)
// - '.' or ' ' or 0 = Empty cell

const LEVEL_DESIGN = {
    LEVELS: [
${allLevelsCode}
        
    ]
};

// Attach LEVELS to CONFIG for backward compatibility
if (typeof CONFIG !== 'undefined') {
    CONFIG.LEVELS = LEVEL_DESIGN.LEVELS;
}`;
    
    // Copy to clipboard (no pop-up)
    navigator.clipboard.writeText(fullCode).then(() => {
        console.log(`All ${levelsArray.length} generated levels copied to clipboard!`);
        console.log('All generated levels code:');
        console.log(fullCode);
    }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        console.log('All generated levels code:');
        console.log(fullCode);
    });
    
    // Also create download link (no pop-up)
    const blob = new Blob([fullCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'level-design.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`File downloaded: level-design.js (${levelsArray.length} levels)`);
}

// Show/Hide Level Designer
function showLevelDesigner() {
    console.log('showLevelDesigner called');
    const levelDesignerScreen = document.getElementById('levelDesignerScreen');
    const homeScreen = document.getElementById('homeScreen');
    
    if (levelDesignerScreen) {
        console.log('Showing level designer screen');
        levelDesignerScreen.style.display = 'block';
        if (homeScreen) {
            homeScreen.style.display = 'none';
        }
        switchTab('tuning');
    } else {
        console.error('levelDesignerScreen not found!');
    }
}

function hideLevelDesigner() {
    const levelDesignerScreen = document.getElementById('levelDesignerScreen');
    if (levelDesignerScreen) {
        levelDesignerScreen.style.display = 'none';
    }
    // Show home screen
    const homeScreen = document.getElementById('homeScreen');
    if (homeScreen) {
        homeScreen.style.display = 'flex';
    }
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    designerElements.tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update tab contents
    designerElements.tabContents.forEach(content => {
        if (content.id === tabName + 'Tab') {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // If overview tab is opened, render charts
    if (tabName === 'overview') {
        renderOverviewTab();
    }
}

// Calculate difficulty score
function calculateDifficultyScore(parameters) {
    if (!parameters) {
        parameters = getParameters();
    }
    
    let score = 0;
    
    // Enemy factors (40% weight)
    const enemyPowerWeight = 0.4;
    score += (parameters.totalEnemyPower || 0) * enemyPowerWeight;
    score += (parameters.enemyCount || 0) * 2 * enemyPowerWeight;
    
    // Item factors (20% weight) - items reduce difficulty
    const itemWeight = 0.2;
    score -= (parameters.totalItemValue || 0) * itemWeight * 0.5;
    
    // Obstacle factors (25% weight) - more obstacles = harder
    const obstacleWeight = 0.25;
    const totalObstacles = (parameters.obstacleBox || 0) + (parameters.obstacleLava || 0) + 
                          (parameters.obstacleSwamp || 0) + (parameters.obstacleCanon || 0);
    score += totalObstacles * 0.5 * obstacleWeight;
    score += (parameters.obstacleBox || 0) * 0.5 * obstacleWeight;
    score += (parameters.obstacleLava || 0) * 1 * obstacleWeight;
    score += (parameters.obstacleSwamp || 0) * 1.5 * obstacleWeight;
    score += (parameters.obstacleCanon || 0) * 0.3 * obstacleWeight;
    
    // Distance factors (10% weight)
    const distanceWeight = 0.1;
    score += (parameters.princessDistance || 0) * distanceWeight;
    score += (parameters.enemyMaxDistance || 0) * 0.5 * distanceWeight;
    
    // Walkable cells (5% weight) - fewer walkable = harder
    // Calculate walkable from obstacles
    const walkableWeight = 0.05;
    const totalCells = (parameters.gridWidth || 8) * (parameters.gridHeight || 10);
    const estimatedEntities = 1 + 1 + (parameters.enemyCount || 3) + (parameters.itemCount || 3);
    const calculatedWalkable = Math.max(0, totalCells - totalObstacles - estimatedEntities);
    const walkableRatio = calculatedWalkable / totalCells;
    score += (1 - walkableRatio) * 20 * walkableWeight;
    
    // Normalize to 0-100 scale
    score = Math.max(0, Math.min(100, score));
    
    return Math.round(score);
}

// Update difficulty score display
function updateDifficultyScore() {
    const params = getParameters();
    const score = calculateDifficultyScore(params);
    
    if (designerElements.difficultyScore) {
        designerElements.difficultyScore.textContent = score;
        
        // Color code based on difficulty
        designerElements.difficultyScore.className = 'difficulty-score';
        if (score < 20) {
            designerElements.difficultyScore.classList.add('difficulty-easy');
        } else if (score < 40) {
            designerElements.difficultyScore.classList.add('difficulty-medium');
        } else if (score < 70) {
            designerElements.difficultyScore.classList.add('difficulty-hard');
        } else {
            designerElements.difficultyScore.classList.add('difficulty-very-hard');
        }
    }
}

// Render Level Parameters List
function renderLevelParametersList() {
    if (!designerElements.levelParametersList) return;
    
    const levelConfigs = getLevelConfigs();
    designerElements.levelParametersList.innerHTML = '';
    
    levelConfigs.forEach(config => {
        const levelCard = document.createElement('div');
        levelCard.className = 'level-param-card';
        levelCard.dataset.level = config.level;
        
        // Determine pacing
        const clusterPosition = ((config.level - 1) % 3) + 1;
        let pacing = '';
        let pacingClass = '';
        if (clusterPosition === 1) {
            pacing = 'Intro';
            pacingClass = 'pacing-intro';
        } else if (clusterPosition === 2) {
            pacing = 'Upgrade';
            pacingClass = 'pacing-upgrade';
        } else {
            pacing = 'Climax';
            pacingClass = 'pacing-climax';
        }
        
        const clusterNumber = Math.floor((config.level - 1) / 3) + 1;
        const difficultyScore = calculateDifficultyScore(config);
        
        // Determine difficulty class
        let difficultyClass = '';
        if (difficultyScore < 20) {
            difficultyClass = 'difficulty-easy';
        } else if (difficultyScore < 40) {
            difficultyClass = 'difficulty-medium';
        } else if (difficultyScore < 70) {
            difficultyClass = 'difficulty-hard';
        } else {
            difficultyClass = 'difficulty-very-hard';
        }
        
        // Get designIntent and optimalStrategy from LEVEL_DESIGN.LEVELS if available
        let designIntent = '';
        let optimalStrategy = '';
        if (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) {
            const levelData = LEVEL_DESIGN.LEVELS.find(l => l.level === config.level);
            if (levelData) {
                designIntent = levelData.designIntent || '';
                optimalStrategy = levelData.optimalStrategy || '';
            }
        }
        
        // Generate preview grid for this level (use cached or generate)
        // This will also ensure the level is cached for Save functionality
        const previewLevel = getOrGenerateLevel(config.level, false);
        let previewGridHTML = '';
        if (previewLevel && previewLevel.layout) {
            // Ensure level is in cache (getOrGenerateLevel should have done this, but double-check)
            if (!generatedLevelsCache[config.level]) {
                generatedLevelsCache[config.level] = previewLevel;
            }
            // Show FULL map (no size limit) - same as preview modal
            const gridWidth = previewLevel.layout[0].length;
            const gridHeight = previewLevel.layout.length;
            
            previewGridHTML = previewLevel.layout.map(row => 
                row.map(cell => {
                    const content = renderCellToEmoji(cell);
                    return `<div class="level-preview-cell">${content}</div>`;
                }).join('')
            ).join('');
        }
        
        levelCard.innerHTML = `
            <div class="level-param-card-header" data-level="${config.level}">
                <div class="level-param-top-row">
                    <div class="level-param-info">
                        <div class="level-param-title">
                            <span class="level-param-number">Level ${config.level}</span>
                            <span class="pacing-badge ${pacingClass}">${pacing}</span>
                            <span class="difficulty-badge ${difficultyClass}">${difficultyScore}</span>
                        </div>
                        <div class="level-param-name">${config.name}</div>
                        <div class="level-param-description">${config.description} (Cụm ${clusterNumber})</div>
                        <div class="difficulty-formula">
                            <strong>Difficulty Score Formula:</strong><br>
                            Enemy Power (40%) + Enemy Count × 2 (40%) - Item Value × 0.5 (20%) + 
                            Obstacles (25%) + Distance (10%) + Walkable Ratio (5%)
                        </div>
                    </div>
                    ${previewGridHTML ? `
                    <div class="level-preview-container">
                        <div class="level-preview-grid" style="grid-template-columns: repeat(${previewLevel?.layout[0]?.length || 8}, 1fr);">
                            ${previewGridHTML}
                        </div>
                    </div>
                    ` : ''}
                    <div class="level-param-stats-overview">
                        <div class="stat-overview-item">
                            <span class="stat-label">Enemy Power:</span>
                            <input type="number" class="stat-value-edit read-only" data-level="${config.level}" data-param="totalEnemyPower" value="${config.totalEnemyPower}" min="1" max="50" disabled readonly>
                        </div>
                        <div class="stat-overview-item">
                            <span class="stat-label">Enemies:</span>
                            <input type="number" class="stat-value-edit read-only" data-level="${config.level}" data-param="enemyCount" value="${config.enemyCount}" min="1" max="15" disabled readonly>
                        </div>
                        <div class="stat-overview-item">
                            <span class="stat-label">Item Value:</span>
                            <input type="number" class="stat-value-edit read-only" data-level="${config.level}" data-param="totalItemValue" value="${config.totalItemValue}" min="1" max="30" disabled readonly>
                        </div>
                        <div class="stat-overview-item">
                            <span class="stat-label">Items:</span>
                            <input type="number" class="stat-value-edit read-only" data-level="${config.level}" data-param="itemCount" value="${config.itemCount}" min="1" max="15" disabled readonly>
                        </div>
                        <div class="stat-overview-item">
                            <span class="stat-label">📦 Boxes:</span>
                            <input type="number" class="stat-value-edit read-only" data-level="${config.level}" data-param="obstacleBox" value="${config.obstacleBox || 0}" min="0" max="30" disabled readonly>
                        </div>
                        <div class="stat-overview-item">
                            <span class="stat-label">🌋 Lava:</span>
                            <input type="number" class="stat-value-edit read-only" data-level="${config.level}" data-param="obstacleLava" value="${config.obstacleLava || 0}" min="0" max="15" disabled readonly>
                        </div>
                        <div class="stat-overview-item">
                            <span class="stat-label">🟤 Swamp:</span>
                            <input type="number" class="stat-value-edit read-only" data-level="${config.level}" data-param="obstacleSwamp" value="${config.obstacleSwamp || 0}" min="0" max="15" disabled readonly>
                        </div>
                        <div class="stat-overview-item">
                            <span class="stat-label">💣 Canon:</span>
                            <input type="number" class="stat-value-edit read-only" data-level="${config.level}" data-param="obstacleCanon" value="${config.obstacleCanon || 0}" min="0" max="10" disabled readonly>
                        </div>
                        <div class="stat-overview-item">
                            <span class="stat-label">Walkable:</span>
                            <span class="stat-value" style="color: #ffd700; font-weight: bold;" id="walkableDisplay_${config.level}">Calculating...</span>
                        </div>
                    </div>
                </div>
                <div class="level-param-bottom-row">
                    <div class="level-param-actions">
                        <button class="level-param-btn preview-btn" data-level="${config.level}">Preview</button>
                        <button class="level-param-btn playtest-btn" data-level="${config.level}">Playtest</button>
                        <button class="level-param-btn regenerate-btn" data-level="${config.level}">Regenerate</button>
                        <button class="level-param-btn save-btn" data-level="${config.level}">Save</button>
                    </div>
                </div>
            </div>
            ${designIntent || optimalStrategy ? `
            <div class="level-ai-info" data-level="${config.level}">
                ${designIntent ? `
                <div class="design-intent-section">
                    <div class="ai-section-header">
                        <span class="ai-section-icon">🎯</span>
                        <span class="ai-section-title">Design Intent</span>
                    </div>
                    <div class="ai-section-content">${designIntent}</div>
                </div>
                ` : ''}
                ${optimalStrategy ? `
                <div class="optimal-strategy-section">
                    <div class="ai-section-header">
                        <span class="ai-section-icon">🧠</span>
                        <span class="ai-section-title">Optimal Strategy</span>
                    </div>
                    <div class="ai-section-content">${optimalStrategy}</div>
                </div>
                ` : ''}
            </div>
            ` : ''}
            <div class="level-ai-loading" id="aiLoading_${config.level}" style="display: none;">
                <div class="ai-loading-spinner"></div>
                <span class="ai-loading-text">AI is generating suggestions...</span>
            </div>
            <div class="level-ai-message" id="aiMessage_${config.level}" style="display: none;"></div>
            <div class="level-param-details" id="levelParamDetails${config.level}" style="display: none;">
                <!-- Detailed form will be inserted here -->
            </div>
        `;
        
        // Note: Tuning parameters are now read-only (disabled) - stats are auto-calculated from layout
        // Event listeners removed as inputs are disabled
        
        // Calculate and display initial walkable cells
        setTimeout(() => {
            updateLevelStatsFromInline(config.level);
        }, 100);
        
        // Add event listeners for action buttons
        const previewBtn = levelCard.querySelector('.preview-btn');
        const playtestBtn = levelCard.querySelector('.playtest-btn');
        const regenerateBtn = levelCard.querySelector('.regenerate-btn');
        const saveBtn = levelCard.querySelector('.save-btn');
        
        if (previewBtn) {
            previewBtn.addEventListener('click', () => handlePreviewLevel(config.level));
        }
        if (playtestBtn) {
            playtestBtn.addEventListener('click', () => handlePlaytestLevel(config.level));
        }
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => handleRegenerateLevel(config.level));
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => handleSaveLevel(config.level));
        }
        
        designerElements.levelParametersList.appendChild(levelCard);
    });
}

// Update level stats from inline editing
function updateLevelStatsFromInline(levelNumber) {
    const prefix = `level${levelNumber}_`;
    const card = document.querySelector(`.level-param-card[data-level="${levelNumber}"]`);
    if (!card) return;
    
    // Get values from inline inputs
    const totalEnemyPower = parseInt(card.querySelector(`.stat-value-edit[data-param="totalEnemyPower"]`)?.value) || 0;
    const enemyCount = parseInt(card.querySelector(`.stat-value-edit[data-param="enemyCount"]`)?.value) || 0;
    const totalItemValue = parseInt(card.querySelector(`.stat-value-edit[data-param="totalItemValue"]`)?.value) || 0;
    const itemCount = parseInt(card.querySelector(`.stat-value-edit[data-param="itemCount"]`)?.value) || 0;
    const obstacleBox = parseInt(card.querySelector(`.stat-value-edit[data-param="obstacleBox"]`)?.value) || 0;
    const obstacleLava = parseInt(card.querySelector(`.stat-value-edit[data-param="obstacleLava"]`)?.value) || 0;
    const obstacleSwamp = parseInt(card.querySelector(`.stat-value-edit[data-param="obstacleSwamp"]`)?.value) || 0;
    const obstacleCanon = parseInt(card.querySelector(`.stat-value-edit[data-param="obstacleCanon"]`)?.value) || 0;
    
    // Calculate walkable cells from obstacles
    const gridWidth = parseInt(document.getElementById(`${prefix}GridWidth`)?.value) || 8;
    const gridHeight = parseInt(document.getElementById(`${prefix}GridHeight`)?.value) || 10;
    const totalCells = gridWidth * gridHeight;
    const totalObstacles = obstacleBox + obstacleLava + obstacleSwamp + obstacleCanon;
    const estimatedEntities = 1 + 1 + enemyCount + itemCount; // player + princess + enemies + items
    const walkableCells = Math.max(0, totalCells - totalObstacles - estimatedEntities);
    
    // Update walkable display
    const walkableDisplay = document.getElementById(`walkableDisplay_${levelNumber}`);
    if (walkableDisplay) {
        walkableDisplay.textContent = walkableCells;
    }
    
    // Clear cache for this level when parameters change
    // This ensures the level will be regenerated with new parameters
    if (generatedLevelsCache[levelNumber]) {
        delete generatedLevelsCache[levelNumber];
        console.log(`Cleared cache for level ${levelNumber} due to parameter changes`);
        // Also update localStorage
        saveGeneratedLevelsToStorage();
    }
    
    // Update difficulty score
    const params = {
        totalEnemyPower,
        enemyCount,
        totalItemValue,
        itemCount,
        walkableCells,
        obstacleBox,
        obstacleLava,
        obstacleSwamp,
        obstacleCanon,
        gridWidth: parseInt(document.getElementById(`${prefix}GridWidth`)?.value) || 8,
        gridHeight: parseInt(document.getElementById(`${prefix}GridHeight`)?.value) || 10,
        enemyMinDistance: parseInt(document.getElementById(`${prefix}EnemyMinDistance`)?.value) || 2,
        enemyMaxDistance: parseInt(document.getElementById(`${prefix}EnemyMaxDistance`)?.value) || 8,
        itemMinDistance: parseInt(document.getElementById(`${prefix}ItemMinDistance`)?.value) || 1,
        itemMaxDistance: parseInt(document.getElementById(`${prefix}ItemMaxDistance`)?.value) || 6,
        itemMinDistanceFromEnemy: parseInt(document.getElementById(`${prefix}ItemMinDistanceFromEnemy`)?.value) || 0,
        obstacleBox: obstacleBox !== null ? obstacleBox : (parseInt(document.getElementById(`${prefix}ObstacleBox`)?.value) || 0),
        obstacleLava: obstacleLava !== null ? obstacleLava : (parseInt(document.getElementById(`${prefix}ObstacleLava`)?.value) || 0),
        obstacleSwamp: obstacleSwamp !== null ? obstacleSwamp : (parseInt(document.getElementById(`${prefix}ObstacleSwamp`)?.value) || 0),
        obstacleCanon: obstacleCanon !== null ? obstacleCanon : (parseInt(document.getElementById(`${prefix}ObstacleCanon`)?.value) || 0),
        princessDistance: parseInt(document.getElementById(`${prefix}PrincessDistance`)?.value) || 5,
        portalDistance: parseInt(document.getElementById(`${prefix}PortalDistance`)?.value) || 3
    };
    
    const score = calculateDifficultyScore(params);
    const difficultyBadge = card.querySelector('.difficulty-badge');
    if (difficultyBadge) {
        let difficultyClass = '';
        if (score < 20) {
            difficultyClass = 'difficulty-easy';
        } else if (score < 40) {
            difficultyClass = 'difficulty-medium';
        } else if (score < 70) {
            difficultyClass = 'difficulty-hard';
        } else {
            difficultyClass = 'difficulty-very-hard';
        }
        difficultyBadge.className = `difficulty-badge ${difficultyClass}`;
        difficultyBadge.textContent = `${score}`;
    }
}

// Get or generate level (with caching)
function getOrGenerateLevel(levelNumber, forceRegenerate = false) {
    // Normalize levelNumber to string for consistent cache key
    const cacheKey = String(levelNumber);
    
    // Check cache first (unless force regenerate)
    // Check both string and number keys for compatibility
    if (!forceRegenerate) {
        const cachedLevel = generatedLevelsCache[cacheKey] || generatedLevelsCache[levelNumber];
        if (cachedLevel && cachedLevel.layout) {
            console.log(`Using cached level ${levelNumber}`);
            // Ensure cache key is consistent (use string key)
            if (!generatedLevelsCache[cacheKey]) {
                generatedLevelsCache[cacheKey] = cachedLevel;
            }
            return cachedLevel;
        }
        
        // If not in cache, check LEVEL_DESIGN.LEVELS (which has AI-generated layouts)
        if (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) {
            const levelData = LEVEL_DESIGN.LEVELS.find(l => l.level === levelNumber);
            if (levelData && levelData.layout && Array.isArray(levelData.layout)) {
                console.log(`Using level ${levelNumber} from LEVEL_DESIGN.LEVELS (AI-generated layout)`);
                // Cache it for future use
                generatedLevelsCache[cacheKey] = levelData;
                generatedLevelsCache[levelNumber] = levelData;
                return levelData;
            }
        }
    }
    
    // Generate new level from parameters (fallback)
    const params = getLevelParameters(levelNumber);
    if (!params) {
        console.error('Failed to get parameters for level', levelNumber);
        return null;
    }
    
    const level = generateLevel(params);
    if (!level) {
        console.error('Failed to generate level', levelNumber);
        return null;
    }
    
    // Ensure level number is set
    if (!level.level) {
        level.level = levelNumber;
    }
    
    // Cache the generated level (use string key for consistency)
    generatedLevelsCache[cacheKey] = level;
    // Also cache with number key for backward compatibility
    generatedLevelsCache[levelNumber] = level;
    console.log(`Generated and cached level ${levelNumber} from parameters`);
    
    // Save to localStorage as backup
    saveGeneratedLevelsToStorage();
    
    return level;
}

// Handle Preview Level
function handlePreviewLevel(levelNumber) {
    // Get or use cached level
    const level = getOrGenerateLevel(levelNumber, false);
    if (!level) {
        alert('Failed to generate level. Please check parameters.');
        return;
    }
    
    // Create preview modal
    let previewModal = document.getElementById('levelPreviewModal');
    if (!previewModal) {
        previewModal = document.createElement('div');
        previewModal.id = 'levelPreviewModal';
        previewModal.className = 'preview-modal';
        document.body.appendChild(previewModal);
    }
    
    // Build preview grid HTML - use shared render function
    const gridHTML = level.layout.map(row => 
        row.map(cell => {
            const content = renderCellToEmoji(cell);
            return `<div class="preview-modal-cell">${content}</div>`;
        }).join('')
    ).join('');
    
    previewModal.innerHTML = `
        <div class="preview-modal-content">
            <div class="preview-modal-header">
                <h2>Level ${levelNumber}: ${level.name}</h2>
                <button class="preview-modal-close">&times;</button>
            </div>
            <div class="preview-modal-body">
                <p class="preview-modal-description">${level.description}</p>
                <div class="preview-modal-grid" style="grid-template-columns: repeat(${level.layout[0].length}, 1fr);">
                    ${gridHTML}
                </div>
                <div class="preview-modal-stats">
                    <h3>Stats:</h3>
                    <div class="preview-stat-row">
                        <span>Enemy Power:</span>
                        <strong>${level.stats?.enemyPower || 0}</strong>
                    </div>
                    <div class="preview-stat-row">
                        <span>Item Value:</span>
                        <strong>${level.stats?.itemValue || 0}</strong>
                    </div>
                    <div class="preview-stat-row">
                        <span>Enemies:</span>
                        <strong>${level.stats?.enemyCount || 0}</strong>
                    </div>
                    <div class="preview-stat-row">
                        <span>Items:</span>
                        <strong>${level.stats?.itemCount || 0}</strong>
                    </div>
                    <div class="preview-stat-row">
                        <span>Walkable Cells:</span>
                        <strong>${level.stats?.walkableCells || 0}</strong>
                    </div>
                    <div class="preview-stat-row">
                        <span>Total Obstacles:</span>
                        <strong>${level.stats?.obstacles || 0}</strong>
                    </div>
                    ${level.stats?.obstacleBox || level.stats?.obstacleLava || level.stats?.obstacleSwamp || level.stats?.obstacleCanon ? `
                    <div class="preview-stat-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <span style="font-weight: bold; color: #ffd700;">Obstacle Details:</span>
                    </div>
                    ${level.stats?.obstacleBox ? `<div class="preview-stat-row"><span>📦 Boxes:</span><strong>${level.stats.obstacleBox}</strong></div>` : ''}
                    ${level.stats?.obstacleLava ? `<div class="preview-stat-row"><span>🌋 Lava:</span><strong>${level.stats.obstacleLava}</strong></div>` : ''}
                    ${level.stats?.obstacleSwamp ? `<div class="preview-stat-row"><span>🟤 Swamp:</span><strong>${level.stats.obstacleSwamp}</strong></div>` : ''}
                    ${level.stats?.obstacleCanon ? `<div class="preview-stat-row"><span>💣 Canon:</span><strong>${level.stats.obstacleCanon}</strong></div>` : ''}
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    previewModal.style.display = 'flex';
    
    // Close button handler
    const closeBtn = previewModal.querySelector('.preview-modal-close');
    closeBtn.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });
    
    // Close on background click
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.style.display = 'none';
        }
    });
}

// Handle Playtest Level - Separate flow from main game
function handlePlaytestLevel(levelNumber) {
    console.log('=== PLAYTEST START === Level:', levelNumber);
    
    // Get or use cached level
    const level = getOrGenerateLevel(levelNumber, false);
    if (!level) {
        alert('Failed to generate level. Please check parameters.');
        return;
    }
    
    console.log('Level loaded (cached or generated):', level.name);
    
    // Get level parameters for initializePlaytestMode
    const params = getLevelParameters(levelNumber);
    
    // Store original game state to restore later
    if (!window.originalGameState) {
        window.originalGameState = JSON.parse(JSON.stringify(gameState));
        console.log('Original game state saved');
    }
    
    // Set test mode flag IMMEDIATELY
    window.isLevelDesignerTestMode = true;
    window.testLevelNumber = levelNumber;
    console.log('Test mode flag set:', window.isLevelDesignerTestMode);
    
    // Convert level format to match game.js expectations
    const levelConfig = {
        level: levelNumber,
        name: level.name,
        description: level.description,
        playerStartValue: level.playerStartValue,
        goldPerLevel: level.goldPerLevel,
        goldPerBag: level.goldPerBag,
        minItems: level.minItems,
        maxItems: level.maxItems,
        spawnTurns: level.spawnTurns,
        layout: level.layout
    };
    
    console.log('Level config prepared:', levelConfig);
    
    // Store original exitGame function
    if (!window.originalExitGame) {
        window.originalExitGame = window.exitGame;
    }
    
    // Override exitGame to return to designer and restore state
    window.exitGame = function() {
        console.log('Exit game called in playtest mode');
        exitPlaytestMode();
    };
    
    // Also override any other functions that might redirect to home or start main game
    // Store original showHomeScreen if exists
    if (typeof HOME_MANAGER !== 'undefined' && HOME_MANAGER.showHomeScreen) {
        if (!window.originalShowHomeScreen) {
            window.originalShowHomeScreen = HOME_MANAGER.showHomeScreen;
        }
        // Override to prevent redirect during playtest
        HOME_MANAGER.showHomeScreen = function() {
            if (window.isLevelDesignerTestMode) {
                console.log('showHomeScreen blocked - in playtest mode');
                exitPlaytestMode();
                return;
            }
            if (window.originalShowHomeScreen) {
                window.originalShowHomeScreen.call(this);
            }
        };
    }
    
    // Override startGame to prevent it from being called during playtest
    if (typeof HOME_MANAGER !== 'undefined' && HOME_MANAGER.startGame) {
        if (!window.originalStartGame) {
            window.originalStartGame = HOME_MANAGER.startGame;
        }
        // Override to prevent main game start during playtest
        HOME_MANAGER.startGame = function() {
            if (window.isLevelDesignerTestMode) {
                // Don't start main game, we're in playtest mode
                console.log('startGame blocked - Playtest mode active, ignoring startGame call');
                return;
            }
            if (window.originalStartGame) {
                window.originalStartGame.call(this);
            }
        };
    }
    
    // Override initGame to prevent it from being called during playtest
    if (typeof initGame === 'function') {
        if (!window.originalInitGame) {
            window.originalInitGame = initGame;
        }
        // Temporarily override initGame
        window.initGame = function(levelNum) {
            if (window.isLevelDesignerTestMode) {
                console.log('initGame blocked - Playtest mode active, ignoring initGame call');
                return;
            }
            if (window.originalInitGame) {
                return window.originalInitGame(levelNum);
            }
        };
    }
    
    // Hide designer first
    hideLevelDesigner();
    console.log('Designer hidden');
    
    // Hide home screen to prevent any interference
    const homeScreen = document.getElementById('homeScreen');
    if (homeScreen) {
        homeScreen.style.display = 'none';
        console.log('Home screen hidden');
    }
    
    // Hide game over screen if exists
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) {
        gameOverScreen.style.display = 'none';
    }
    
    // Show game screen
    const gameScreen = document.getElementById('gameScreen');
    if (gameScreen) {
        gameScreen.style.display = 'flex'; // Use flex to match main game
        console.log('Game screen shown');
    }
    
    // Initialize playtest mode - separate from main game
    // Use setTimeout to ensure DOM is ready and no other scripts interfere
    // Also ensure we're not triggering any auto-start logic
    setTimeout(() => {
        try {
            // Double check test mode flag is set
            if (!window.isLevelDesignerTestMode) {
                window.isLevelDesignerTestMode = true;
                console.log('Re-setting test mode flag');
            }
            
            // Ensure home screen is hidden
            const homeScreen = document.getElementById('homeScreen');
            if (homeScreen && homeScreen.style.display !== 'none') {
                homeScreen.style.display = 'none';
                console.log('Re-hiding home screen');
            }
            
            // Initialize playtest
            console.log('About to initialize playtest mode...');
            initializePlaytestMode(levelConfig, params);
            
            console.log('=== PLAYTEST INITIALIZED === Level:', levelConfig.level, 'Name:', levelConfig.name);
        } catch (error) {
            console.error('Error loading level for playtest:', error);
            alert('Error loading level: ' + error.message);
            // Show designer again on error
            exitPlaytestMode();
        }
    }, 100);
}

// Initialize playtest mode - completely separate from main game
function initializePlaytestMode(levelConfig, params) {
    // Create a fresh game state for playtest (don't modify main gameState)
    // We'll work directly with gameState but mark it as test mode
    
    console.log('Initializing playtest mode with level:', levelConfig);
    console.log('Test mode flag:', window.isLevelDesignerTestMode);
    
    // Ensure test mode flag is set
    window.isLevelDesignerTestMode = true;
    
    // Reset game state for playtest
    if (typeof resetGame === 'function') {
        resetGame();
    }
    
    // IMPORTANT: Don't call initGame() - we're setting up our own test level
    // Make sure no other code calls initGame() during playtest
    
    // Set grid dimensions
    gameState.gridWidth = params.gridWidth || CONFIG.GRID_W;
    gameState.gridHeight = params.gridHeight || CONFIG.GRID_H;
    
    // Set player start value
    gameState.playerStartValue = levelConfig.playerStartValue || CONFIG.PLAYER_START_VALUE;
    
    // Initialize run stats for playtest (must match game.js structure)
    gameState.runStats = {
        minRoll: 1,
        maxRoll: 6,
        startValueBoost: 0
    };
    
    // Initialize player stats (must match game.js structure)
    // Structure: hp: { current, max }, dmg: { min, max }, spd: { min, max }, int: { min, max }
    const startingValue = gameState.playerStartValue;
    gameState.playerStats = {
        hp: { current: startingValue, max: startingValue },
        dmg: { min: 1, max: startingValue },
        spd: { min: 1, max: 6 },
        int: { min: 1, max: 2 }
    };
    
    // Initialize player object (must match game.js structure)
    gameState.player = {
        x: -1,
        y: -1,
        value: gameState.playerStartValue,
        lastValue: gameState.playerStartValue
    };
    
    // Initialize other required gameState properties
    gameState.level = levelConfig.level || 1;
    gameState.objective = {
        type: 'defeat_all',
        target: null
    };
    gameState.currentTurn = 'player';
    gameState.playerRoll = null;
    gameState.playerRemainingSteps = 0;
    gameState.playerDirection = null;
    gameState.isMoving = false;
    gameState.availablePowerups = [];
    gameState.currentResources = 0;
    gameState.resourceDiceRolled = false;
    gameState.nextLevel = null;
    gameState.currentGold = 0;
    gameState.combatState = {
        active: false,
        playerHP: 0,
        enemyHP: 0,
        maxPlayerHP: 0,
        maxEnemyHP: 0,
        currentCombatTurn: 'player',
        enemyId: null,
        enemyEmoji: '👹',
        enemyName: 'Enemy'
    };
    gameState.pendingSpawns = [];
    
    // Initialize grid
    if (typeof initializeGrid === 'function') {
        initializeGrid();
    } else {
        // Fallback: manually initialize grid
        gameState.grid = [];
        for (let y = 0; y < gameState.gridHeight; y++) {
            gameState.grid[y] = [];
            for (let x = 0; x < gameState.gridWidth; x++) {
                gameState.grid[y][x] = {
                    player: false,
                    enemy: null,
                    item: null,
                    specialGrid: null,
                    gold: false,
                    goldAmount: 0,
                    princess: false,
                    portal: false,
                    goldCollected: false
                };
            }
        }
    }
    
    // Clear enemies and items arrays
    gameState.enemies = [];
    gameState.items = [];
    gameState.goldBags = [];
    
    // Reset game state flags
    gameState.gameRunning = false;
    gameState.currentTurn = 0;
    gameState.player = { x: -1, y: -1 };
    gameState.princess = { x: -1, y: -1, rescued: false };
    gameState.portal = { x: -1, y: -1, active: false };
    gameState.princessRescued = false;
    gameState.initialEnemyCount = 0;
    
    // Set level config in gameState FIRST - this is critical
    gameState.levelConfig = levelConfig;
    gameState.level = levelConfig.level || 1;
    
    // Set gold per level and bag BEFORE loading layout
    gameState.goldPerLevel = levelConfig.goldPerLevel || 10;
    gameState.goldPerBag = levelConfig.goldPerBag || 5;
    gameState.minItems = levelConfig.minItems || 1;
    gameState.maxItems = levelConfig.maxItems || 5;
    gameState.spawnTurns = levelConfig.spawnTurns || 3;
    
    // Set game running flag
    gameState.gameRunning = true;
    
    // Set totalItemsSpawned to 0
    gameState.totalItemsSpawned = 0;
    
    console.log('Loading level layout for playtest:', {
        level: levelConfig.level,
        name: levelConfig.name,
        layoutSize: `${levelConfig.layout.length}x${levelConfig.layout[0]?.length || 0}`
    });
    
    // Load the level layout
    if (typeof loadLevelFromLayout === 'function') {
        loadLevelFromLayout(levelConfig);
        console.log('Level layout loaded successfully');
    } else {
        throw new Error('loadLevelFromLayout function not found');
    }
    
    // Render the grid
    if (typeof renderGrid === 'function') {
        renderGrid();
    }
    
    // Update UI
    if (typeof updateUI === 'function') {
        updateUI();
    }
    
    // Set game running flag BEFORE enabling roll button
    gameState.gameRunning = true;
    gameState.currentTurn = 'player';
    gameState.isMoving = false;
    
    // Enable roll button
    if (typeof elements !== 'undefined' && elements.rollButton) {
        elements.rollButton.disabled = false;
        if (elements.diceLabel) {
            const rollRange = `${gameState.playerStats.spd.min}-${gameState.playerStats.spd.max}`;
            elements.diceLabel.textContent = `Roll to start (SPD: ${rollRange})`;
        }
        if (elements.diceFace) {
            elements.diceFace.textContent = '?';
        }
        console.log('Roll button enabled for playtest');
    } else {
        console.warn('Roll button element not found!');
    }
    
    console.log(`Playtest Mode - Level ${levelConfig.level}: ${levelConfig.name}`);
    console.log(`Test Mode - This is a test level, changes won't affect main game`);
    console.log(`Level layout loaded: ${levelConfig.layout.length}x${levelConfig.layout[0]?.length || 0}`);
    console.log('Playtest initialized - gameRunning:', gameState.gameRunning, 'currentTurn:', gameState.currentTurn);
}

// Exit playtest mode and restore original state
// Expose globally so game.js can call it
window.exitPlaytestMode = function exitPlaytestMode() {
    // Restore original exitGame function
    if (window.originalExitGame) {
        window.exitGame = window.originalExitGame;
        window.originalExitGame = null;
    }
    
    // Restore original showHomeScreen if overridden
    if (window.originalShowHomeScreen && typeof HOME_MANAGER !== 'undefined') {
        HOME_MANAGER.showHomeScreen = window.originalShowHomeScreen;
        window.originalShowHomeScreen = null;
    }
    
    // Restore original startGame if overridden
    if (window.originalStartGame && typeof HOME_MANAGER !== 'undefined') {
        HOME_MANAGER.startGame = window.originalStartGame;
        window.originalStartGame = null;
    }
    
    // Restore original initGame if overridden
    if (window.originalInitGame) {
        window.initGame = window.originalInitGame;
        window.originalInitGame = null;
    }
    
    // Clear test mode flag
    window.isLevelDesignerTestMode = false;
    window.testLevelNumber = null;
    
    // Restore original game state if saved
    if (window.originalGameState) {
        // Deep copy back
        Object.keys(window.originalGameState).forEach(key => {
            if (typeof window.originalGameState[key] === 'object' && window.originalGameState[key] !== null && !Array.isArray(window.originalGameState[key])) {
                gameState[key] = JSON.parse(JSON.stringify(window.originalGameState[key]));
            } else {
                gameState[key] = window.originalGameState[key];
            }
        });
        window.originalGameState = null;
    }
    
    // Hide game screen
    const gameScreen = document.getElementById('gameScreen');
    if (gameScreen) {
        gameScreen.style.display = 'none';
    }
    
    // Show designer again (don't show home screen)
    showLevelDesigner();
    
    console.log('Exited playtest mode - main game state restored');
}

// Helper function to render a cell to emoji (shared logic for preview)
function renderCellToEmoji(cell) {
    // Handle special cell types first
    if (cell === 'P') return '🧙';
    else if (cell === 'R') return '👸';
    else if (cell === 'B') return '🧱';
    else if (cell === 'L') return '🔥';
    else if (cell === 'S') return '🌊';
    else if (cell === 'C') return '⚡';
    // Handle numbers (enemies are negative, items are positive)
    else if (typeof cell === 'number') {
        if (cell < 0) {
            const enemyValue = Math.abs(cell);
            const enemyType = CONFIG.ENEMY_TYPES.find(e => e.value === enemyValue);
            return enemyType ? enemyType.emoji : '👹';
        } else if (cell > 0) {
            const itemType = CONFIG.ITEM_TYPES.find(i => i.value === cell);
            return itemType ? itemType.emoji : '💎';
        }
    }
    // Handle string representations of numbers (from JSON parsing or AI-generated layouts)
    else if (typeof cell === 'string') {
        const numValue = Number(cell);
        if (!isNaN(numValue) && numValue !== 0) {
            if (numValue < 0) {
                const enemyValue = Math.abs(numValue);
                const enemyType = CONFIG.ENEMY_TYPES.find(e => e.value === enemyValue);
                return enemyType ? enemyType.emoji : '👹';
            } else if (numValue > 0) {
                const itemType = CONFIG.ITEM_TYPES.find(i => i.value === numValue);
                return itemType ? itemType.emoji : '💎';
            }
        }
    }
    return '';
}

// Update preview grid for a specific level
function updatePreviewGrid(levelNumber) {
    const card = document.querySelector(`.level-param-card[data-level="${levelNumber}"]`);
    if (!card) return;
    
    const previewContainer = card.querySelector('.level-preview-container');
    if (!previewContainer) return;
    
    // Get level from cache or generate
    const level = getOrGenerateLevel(levelNumber, false);
    if (!level || !level.layout) return;
    
    // Generate preview grid HTML - show FULL map (no size limit)
    const gridWidth = level.layout[0].length;
    const gridHeight = level.layout.length;
    
    const previewGridHTML = level.layout.map(row => 
        row.map(cell => {
            const content = renderCellToEmoji(cell);
            return `<div class="level-preview-cell">${content}</div>`;
        }).join('')
    ).join('');
    
    // Update preview grid
    const previewGrid = previewContainer.querySelector('.level-preview-grid');
    if (previewGrid) {
        previewGrid.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
        previewGrid.innerHTML = previewGridHTML;
    }
}

// Handle Regenerate Level
function handleRegenerateLevel(levelNumber) {
    console.log(`Regenerating level ${levelNumber}...`);
    
    // Force regenerate (ignore cache)
    const level = getOrGenerateLevel(levelNumber, true);
    if (!level) {
        alert('Failed to regenerate level. Please check parameters.');
        return;
    }
    
    // Also store in window.generatedLevels for backward compatibility
    if (!window.generatedLevels) {
        window.generatedLevels = {};
    }
    window.generatedLevels[levelNumber] = level;
    
    // Update preview grid immediately (no alert)
    updatePreviewGrid(levelNumber);
    
    console.log(`Level ${levelNumber} regenerated and cached`);
}

// Handle Save Level - Update level directly into main game
function handleSaveLevel(levelNumber) {
    // Normalize levelNumber to string for consistent cache key
    const cacheKey = String(levelNumber);
    
    // Try to get level from cache first (check both string and number keys)
    let level = generatedLevelsCache[cacheKey] || generatedLevelsCache[levelNumber];
    
    // If not in cache, try to get or generate (this will also populate cache)
    if (!level || !level.layout) {
        level = getOrGenerateLevel(levelNumber, false);
    }
    
    // If still no level, show error
    if (!level || !level.layout) {
        alert('Level not found. Please generate the level first by clicking "Regenerate" or "Generate All 10 Levels".');
        return;
    }
    
    // Get existing level from LEVEL_DESIGN.LEVELS to preserve designIntent and optimalStrategy
    let existingLevel = null;
    if (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) {
        existingLevel = LEVEL_DESIGN.LEVELS.find(l => l.level === levelNumber);
    }
    
    // Convert generated level to format compatible with LEVEL_DESIGN.LEVELS
    const levelConfig = {
        level: levelNumber,
        name: level.name,
        playerStartValue: level.playerStartValue,
        description: level.description,
        goldPerLevel: level.goldPerLevel,
        goldPerBag: level.goldPerBag,
        minItems: level.minItems,
        maxItems: level.maxItems,
        spawnTurns: level.spawnTurns,
        designIntent: level.designIntent || existingLevel?.designIntent || '',
        optimalStrategy: level.optimalStrategy || existingLevel?.optimalStrategy || '',
        layout: level.layout
    };
    
    // Update LEVEL_DESIGN.LEVELS if it exists
    if (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) {
        // Find existing level with same level number
        const existingIndex = LEVEL_DESIGN.LEVELS.findIndex(l => l.level === levelNumber);
        
        if (existingIndex !== -1) {
            // Replace existing level
            LEVEL_DESIGN.LEVELS[existingIndex] = levelConfig;
            console.log(`Updated level ${levelNumber} in LEVEL_DESIGN.LEVELS at index ${existingIndex}`);
        } else {
            // Insert new level (maintain sorted order by level number)
            let insertIndex = LEVEL_DESIGN.LEVELS.length;
            for (let i = 0; i < LEVEL_DESIGN.LEVELS.length; i++) {
                if (LEVEL_DESIGN.LEVELS[i].level > levelNumber) {
                    insertIndex = i;
                    break;
                }
            }
            LEVEL_DESIGN.LEVELS.splice(insertIndex, 0, levelConfig);
            console.log(`Inserted level ${levelNumber} into LEVEL_DESIGN.LEVELS at index ${insertIndex}`);
        }
    }
    
    // Update CONFIG.LEVELS for backward compatibility
    if (typeof CONFIG !== 'undefined') {
        if (!CONFIG.LEVELS) {
            CONFIG.LEVELS = [];
        }
        
        // Find existing level with same level number
        const existingIndex = CONFIG.LEVELS.findIndex(l => l.level === levelNumber);
        
        if (existingIndex !== -1) {
            // Replace existing level
            CONFIG.LEVELS[existingIndex] = levelConfig;
            console.log(`Updated level ${levelNumber} in CONFIG.LEVELS at index ${existingIndex}`);
        } else {
            // Insert new level (maintain sorted order by level number)
            let insertIndex = CONFIG.LEVELS.length;
            for (let i = 0; i < CONFIG.LEVELS.length; i++) {
                if (CONFIG.LEVELS[i].level > levelNumber) {
                    insertIndex = i;
                    break;
                }
            }
            CONFIG.LEVELS.splice(insertIndex, 0, levelConfig);
            console.log(`Inserted level ${levelNumber} into CONFIG.LEVELS at index ${insertIndex}`);
        }
    }
    
    // Show success message
    alert(`Level ${levelNumber} "${level.name}" has been saved to the main game!\n\nYou can now play this level in the main game.`);
    
    console.log(`Level ${levelNumber} saved to main game:`, levelConfig);
}

// Get level parameters from form or inline edits
function getLevelParameters(levelNumber) {
    const prefix = `level${levelNumber}_`;
    const card = document.querySelector(`.level-param-card[data-level="${levelNumber}"]`);
    const configs = getLevelConfigs();
    const defaultConfig = configs.find(c => c.level === levelNumber);
    
    // Priority: Use config from memory (already updated by AI) > inline edits > form inputs > default
    // Get from inline edits if available (these are updated by applyAISuggestion)
    const totalEnemyPower = card ? parseInt(card.querySelector(`.stat-value-edit[data-param="totalEnemyPower"]`)?.value) : null;
    const enemyCount = card ? parseInt(card.querySelector(`.stat-value-edit[data-param="enemyCount"]`)?.value) : null;
    const totalItemValue = card ? parseInt(card.querySelector(`.stat-value-edit[data-param="totalItemValue"]`)?.value) : null;
    const itemCount = card ? parseInt(card.querySelector(`.stat-value-edit[data-param="itemCount"]`)?.value) : null;
    const obstacleBox = card ? parseInt(card.querySelector(`.stat-value-edit[data-param="obstacleBox"]`)?.value) : null;
    const obstacleLava = card ? parseInt(card.querySelector(`.stat-value-edit[data-param="obstacleLava"]`)?.value) : null;
    const obstacleSwamp = card ? parseInt(card.querySelector(`.stat-value-edit[data-param="obstacleSwamp"]`)?.value) : null;
    const obstacleCanon = card ? parseInt(card.querySelector(`.stat-value-edit[data-param="obstacleCanon"]`)?.value) : null;
    
    // Use config from memory as source of truth (already updated by applyAISuggestion)
    // Priority: inline edits > config in memory > form inputs > defaults
    // This ensures we use the latest AI-generated parameters
    
    return {
        level: levelNumber,
        gridWidth: defaultConfig?.gridWidth || 8,
        gridHeight: defaultConfig?.gridHeight || 10,
        totalEnemyPower: totalEnemyPower !== null ? totalEnemyPower : (defaultConfig?.totalEnemyPower || 10),
        enemyCount: enemyCount !== null ? enemyCount : (defaultConfig?.enemyCount || 3),
        enemyMinDistance: defaultConfig?.enemyMinDistance || 2,
        enemyMaxDistance: defaultConfig?.enemyMaxDistance || 8,
        totalItemValue: totalItemValue !== null ? totalItemValue : (defaultConfig?.totalItemValue || 5),
        itemCount: itemCount !== null ? itemCount : (defaultConfig?.itemCount || 3),
        itemMinDistance: defaultConfig?.itemMinDistance || 1,
        itemMaxDistance: defaultConfig?.itemMaxDistance || 6,
        itemMinDistanceFromEnemy: defaultConfig?.itemMinDistanceFromEnemy || 0,
        // Get obstacles from inline edits or config (exact values)
        obstacleBox: obstacleBox !== null ? obstacleBox : (defaultConfig?.obstacleBox || 0),
        obstacleLava: obstacleLava !== null ? obstacleLava : (defaultConfig?.obstacleLava || 0),
        obstacleSwamp: obstacleSwamp !== null ? obstacleSwamp : (defaultConfig?.obstacleSwamp || 0),
        obstacleCanon: obstacleCanon !== null ? obstacleCanon : (defaultConfig?.obstacleCanon || 0),
        princessDistance: defaultConfig?.princessDistance || 5,
        portalDistance: defaultConfig?.portalDistance || 3,
        playerStartValue: defaultConfig?.playerStartValue || 2,
        goldPerLevel: defaultConfig?.goldPerLevel || 10,
        goldPerBag: defaultConfig?.goldPerBag || 5,
        minItems: defaultConfig?.minItems || 1,
        maxItems: defaultConfig?.maxItems || 5,
        spawnTurns: defaultConfig?.spawnTurns || 3,
        name: defaultConfig?.name || 'Generated Level',
        description: defaultConfig?.description || 'Auto-generated level',
        walkableCells: defaultConfig?.walkableCells || 50
    };
}

// Load detailed parameter form for a level
function loadLevelParameterDetails(levelNumber, container) {
    const configs = getLevelConfigs();
    const config = configs.find(c => c.level === levelNumber);
    
    if (!config) return;
    
    // Create unique IDs for this level's inputs
    const prefix = `level${levelNumber}_`;
    
    // Calculate initial difficulty score
    const initialDifficultyScore = calculateDifficultyScore(config);
    
    container.innerHTML = `
        <div class="level-param-form">
            <div class="form-section">
                <h4>Layout & Space (Read-only)</h4>
                <div class="form-group">
                    <label>Grid Width:</label>
                    <input type="number" id="${prefix}GridWidth" value="${config.gridWidth}" min="6" max="12" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Grid Height:</label>
                    <input type="number" id="${prefix}GridHeight" value="${config.gridHeight}" min="6" max="15" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Walkable Cells:</label>
                    <input type="number" id="${prefix}WalkableCells" value="${config.walkableCells}" min="20" max="120" disabled readonly class="read-only">
                </div>
            </div>
            
            <div class="form-section">
                <h4>Enemies (Read-only)</h4>
                <div class="form-group">
                    <label>Total Enemy Power:</label>
                    <input type="number" id="${prefix}TotalEnemyPower" value="${config.totalEnemyPower}" min="1" max="50" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Enemy Count:</label>
                    <input type="number" id="${prefix}EnemyCount" value="${config.enemyCount}" min="1" max="15" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Min Distance from Player:</label>
                    <input type="number" id="${prefix}EnemyMinDistance" value="${config.enemyMinDistance}" min="1" max="10" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Max Distance from Player:</label>
                    <input type="number" id="${prefix}EnemyMaxDistance" value="${config.enemyMaxDistance}" min="2" max="15" disabled readonly class="read-only">
                </div>
            </div>
            
            <div class="form-section">
                <h4>Items (Read-only)</h4>
                <div class="form-group">
                    <label>Total Item Value:</label>
                    <input type="number" id="${prefix}TotalItemValue" value="${config.totalItemValue}" min="1" max="60" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Item Count:</label>
                    <input type="number" id="${prefix}ItemCount" value="${config.itemCount}" min="1" max="15" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Min Distance from Player:</label>
                    <input type="number" id="${prefix}ItemMinDistance" value="${config.itemMinDistance}" min="0" max="10" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Max Distance from Player:</label>
                    <input type="number" id="${prefix}ItemMaxDistance" value="${config.itemMaxDistance}" min="1" max="15" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Min Distance from Enemies:</label>
                    <input type="number" id="${prefix}ItemMinDistanceFromEnemy" value="${config.itemMinDistanceFromEnemy}" min="0" max="10" disabled readonly class="read-only">
                </div>
            </div>
            
            <!-- Obstacles are now calculated automatically from walkableCells -->
            
            <div class="form-section">
                <h4>Princess & Portal (Read-only)</h4>
                <div class="form-group">
                    <label>Princess Distance from Player:</label>
                    <input type="number" id="${prefix}PrincessDistance" value="${config.princessDistance}" min="2" max="12" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Portal Distance from Princess:</label>
                    <input type="number" id="${prefix}PortalDistance" value="${config.portalDistance}" min="1" max="8" disabled readonly class="read-only">
                </div>
            </div>
            
            <div class="form-section">
                <h4>Level Config (Read-only)</h4>
                <div class="form-group">
                    <label>Player Start Value:</label>
                    <input type="number" id="${prefix}PlayerStartValue" value="${config.playerStartValue}" min="1" max="10" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Gold Per Level:</label>
                    <input type="number" id="${prefix}GoldPerLevel" value="${config.goldPerLevel}" min="0" max="100" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Gold Per Bag:</label>
                    <input type="number" id="${prefix}GoldPerBag" value="${config.goldPerBag}" min="0" max="50" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Min Items:</label>
                    <input type="number" id="${prefix}MinItems" value="${config.minItems}" min="0" max="10" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Max Items:</label>
                    <input type="number" id="${prefix}MaxItems" value="${config.maxItems}" min="1" max="15" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Spawn Turns:</label>
                    <input type="number" id="${prefix}SpawnTurns" value="${config.spawnTurns}" min="1" max="10" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Level Name:</label>
                    <input type="text" id="${prefix}Name" value="${config.name}" disabled readonly class="read-only">
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <input type="text" id="${prefix}Description" value="${config.description}" disabled readonly class="read-only">
                </div>
            </div>
            
            <div class="form-actions">
                <button class="generate-level-btn" data-level="${levelNumber}">Generate This Level</button>
                <span class="difficulty-score-display" id="${prefix}DifficultyScore">Difficulty: <span class="difficulty-score-value">${initialDifficultyScore}</span></span>
            </div>
        </div>
    `;
    
    // Add event listeners for this level's inputs
    const inputs = container.querySelectorAll('input[type="number"], input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            updateLevelDifficultyScore(levelNumber);
        });
    });
    
    // Add generate button handler
    const generateBtn = container.querySelector('.generate-level-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            generateSingleLevel(levelNumber);
        });
    }
}

// Update difficulty score for a specific level
function updateLevelDifficultyScore(levelNumber) {
    const prefix = `level${levelNumber}_`;
    const params = {
        gridWidth: parseInt(document.getElementById(`${prefix}GridWidth`)?.value) || 8,
        gridHeight: parseInt(document.getElementById(`${prefix}GridHeight`)?.value) || 10,
        walkableCells: parseInt(document.getElementById(`${prefix}WalkableCells`)?.value) || 50,
        totalEnemyPower: parseInt(document.getElementById(`${prefix}TotalEnemyPower`)?.value) || 10,
        enemyCount: parseInt(document.getElementById(`${prefix}EnemyCount`)?.value) || 3,
        enemyMinDistance: parseInt(document.getElementById(`${prefix}EnemyMinDistance`)?.value) || 2,
        enemyMaxDistance: parseInt(document.getElementById(`${prefix}EnemyMaxDistance`)?.value) || 8,
        totalItemValue: parseInt(document.getElementById(`${prefix}TotalItemValue`)?.value) || 5,
        itemCount: parseInt(document.getElementById(`${prefix}ItemCount`)?.value) || 3,
        itemMinDistance: parseInt(document.getElementById(`${prefix}ItemMinDistance`)?.value) || 1,
        itemMaxDistance: parseInt(document.getElementById(`${prefix}ItemMaxDistance`)?.value) || 6,
        itemMinDistanceFromEnemy: parseInt(document.getElementById(`${prefix}ItemMinDistanceFromEnemy`)?.value) || 0,
        obstacleBox: parseInt(document.getElementById(`${prefix}ObstacleBox`)?.value) || 5,
        obstacleLava: parseInt(document.getElementById(`${prefix}ObstacleLava`)?.value) || 2,
        obstacleSwamp: parseInt(document.getElementById(`${prefix}ObstacleSwamp`)?.value) || 1,
        obstacleCanon: parseInt(document.getElementById(`${prefix}ObstacleCanon`)?.value) || 0,
        princessDistance: parseInt(document.getElementById(`${prefix}PrincessDistance`)?.value) || 5,
        portalDistance: parseInt(document.getElementById(`${prefix}PortalDistance`)?.value) || 3
    };
    
    const score = calculateDifficultyScore(params);
    const scoreDisplay = document.getElementById(`${prefix}DifficultyScore`);
    if (scoreDisplay) {
        const scoreValue = scoreDisplay.querySelector('.difficulty-score-value');
        if (scoreValue) {
            scoreValue.textContent = score;
            
            // Update color
            scoreValue.className = 'difficulty-score-value';
            if (score < 20) {
                scoreValue.classList.add('difficulty-easy');
            } else if (score < 40) {
                scoreValue.classList.add('difficulty-medium');
            } else if (score < 70) {
                scoreValue.classList.add('difficulty-hard');
            } else {
                scoreValue.classList.add('difficulty-very-hard');
            }
        }
    }
    
    // Also update the overview stats in the card header
    updateLevelCardStats(levelNumber, params, score);
}

// Update level card stats in overview
function updateLevelCardStats(levelNumber, params, difficultyScore) {
    const card = document.querySelector(`.level-param-card[data-level="${levelNumber}"]`);
    if (!card) return;
    
    const statsOverview = card.querySelector('.level-param-stats-overview');
    if (statsOverview) {
        statsOverview.innerHTML = `
            <div class="stat-overview-item">
                <span class="stat-label">Enemy Power:</span>
                <span class="stat-value">${params.totalEnemyPower}</span>
            </div>
            <div class="stat-overview-item">
                <span class="stat-label">Enemies:</span>
                <span class="stat-value">${params.enemyCount}</span>
            </div>
            <div class="stat-overview-item">
                <span class="stat-label">Item Value:</span>
                <span class="stat-value">${params.totalItemValue}</span>
            </div>
            <div class="stat-overview-item">
                <span class="stat-label">Items:</span>
                <span class="stat-value">${params.itemCount}</span>
            </div>
            <div class="stat-overview-item">
                <span class="stat-label">Walkable:</span>
                <span class="stat-value">${params.walkableCells}</span>
            </div>
        `;
    }
    
    // Update difficulty badge
    const difficultyBadge = card.querySelector('.difficulty-badge');
    if (difficultyBadge) {
        let difficultyClass = '';
        if (difficultyScore < 20) {
            difficultyClass = 'difficulty-easy';
        } else if (difficultyScore < 40) {
            difficultyClass = 'difficulty-medium';
        } else if (difficultyScore < 70) {
            difficultyClass = 'difficulty-hard';
        } else {
            difficultyClass = 'difficulty-very-hard';
        }
        difficultyBadge.className = `difficulty-badge ${difficultyClass}`;
        difficultyBadge.textContent = `Score: ${difficultyScore}`;
    }
}

// Generate single level
function generateSingleLevel(levelNumber) {
    const prefix = `level${levelNumber}_`;
    const params = {
        level: levelNumber,
        gridWidth: parseInt(document.getElementById(`${prefix}GridWidth`)?.value) || 8,
        gridHeight: parseInt(document.getElementById(`${prefix}GridHeight`)?.value) || 10,
        walkableCells: parseInt(document.getElementById(`${prefix}WalkableCells`)?.value) || 50,
        totalEnemyPower: parseInt(document.getElementById(`${prefix}TotalEnemyPower`)?.value) || 10,
        enemyCount: parseInt(document.getElementById(`${prefix}EnemyCount`)?.value) || 3,
        enemyMinDistance: parseInt(document.getElementById(`${prefix}EnemyMinDistance`)?.value) || 2,
        enemyMaxDistance: parseInt(document.getElementById(`${prefix}EnemyMaxDistance`)?.value) || 8,
        totalItemValue: parseInt(document.getElementById(`${prefix}TotalItemValue`)?.value) || 5,
        itemCount: parseInt(document.getElementById(`${prefix}ItemCount`)?.value) || 3,
        itemMinDistance: parseInt(document.getElementById(`${prefix}ItemMinDistance`)?.value) || 1,
        itemMaxDistance: parseInt(document.getElementById(`${prefix}ItemMaxDistance`)?.value) || 6,
        itemMinDistanceFromEnemy: parseInt(document.getElementById(`${prefix}ItemMinDistanceFromEnemy`)?.value) || 0,
        obstacleBox: parseInt(document.getElementById(`${prefix}ObstacleBox`)?.value) || 5,
        obstacleLava: parseInt(document.getElementById(`${prefix}ObstacleLava`)?.value) || 2,
        obstacleSwamp: parseInt(document.getElementById(`${prefix}ObstacleSwamp`)?.value) || 1,
        obstacleCanon: parseInt(document.getElementById(`${prefix}ObstacleCanon`)?.value) || 0,
        princessDistance: parseInt(document.getElementById(`${prefix}PrincessDistance`)?.value) || 5,
        portalDistance: parseInt(document.getElementById(`${prefix}PortalDistance`)?.value) || 3,
        playerStartValue: parseInt(document.getElementById(`${prefix}PlayerStartValue`)?.value) || 2,
        goldPerLevel: parseInt(document.getElementById(`${prefix}GoldPerLevel`)?.value) || 10,
        goldPerBag: parseInt(document.getElementById(`${prefix}GoldPerBag`)?.value) || 5,
        minItems: parseInt(document.getElementById(`${prefix}MinItems`)?.value) || 1,
        maxItems: parseInt(document.getElementById(`${prefix}MaxItems`)?.value) || 5,
        spawnTurns: parseInt(document.getElementById(`${prefix}SpawnTurns`)?.value) || 3,
        name: document.getElementById(`${prefix}Name`)?.value || 'Generated Level',
        description: document.getElementById(`${prefix}Description`)?.value || 'Auto-generated level'
    };
    
    console.log(`Generating level ${levelNumber} with parameters:`, params);
    
    const level = generateLevel(params);
    
    if (!level) {
        alert(`Failed to generate level ${levelNumber}. Please adjust parameters and try again.`);
        return;
    }
    
    currentGeneratedLevel = level;
    renderPreview(level);
    switchTab('preview');
}

// Load parameters for a specific level
function loadLevelParameters(levelNumber) {
    // Get level config from generate10Levels configs
    const levelConfigs = getLevelConfigs();
    const config = levelConfigs.find(c => c.level === levelNumber);
    
    if (!config) {
        console.warn(`No config found for level ${levelNumber}`);
        return;
    }
    
    // Update form fields
    if (designerElements.paramGridWidth) designerElements.paramGridWidth.value = config.gridWidth || 8;
    if (designerElements.paramGridHeight) designerElements.paramGridHeight.value = config.gridHeight || 10;
    if (designerElements.paramWalkableCells) designerElements.paramWalkableCells.value = config.walkableCells || 50;
    if (designerElements.paramTotalEnemyPower) designerElements.paramTotalEnemyPower.value = config.totalEnemyPower || 10;
    if (designerElements.paramEnemyCount) designerElements.paramEnemyCount.value = config.enemyCount || 3;
    if (designerElements.paramEnemyMinDistance) designerElements.paramEnemyMinDistance.value = config.enemyMinDistance || 2;
    if (designerElements.paramEnemyMaxDistance) designerElements.paramEnemyMaxDistance.value = config.enemyMaxDistance || 8;
    if (designerElements.paramTotalItemValue) designerElements.paramTotalItemValue.value = config.totalItemValue || 5;
    if (designerElements.paramItemCount) designerElements.paramItemCount.value = config.itemCount || 3;
    if (designerElements.paramItemMinDistance) designerElements.paramItemMinDistance.value = config.itemMinDistance || 1;
    if (designerElements.paramItemMaxDistance) designerElements.paramItemMaxDistance.value = config.itemMaxDistance || 6;
    if (designerElements.paramItemMinDistanceFromEnemy) designerElements.paramItemMinDistanceFromEnemy.value = config.itemMinDistanceFromEnemy || 0;
    if (designerElements.paramObstacleBox) designerElements.paramObstacleBox.value = config.obstacleBox || 5;
    if (designerElements.paramObstacleLava) designerElements.paramObstacleLava.value = config.obstacleLava || 2;
    if (designerElements.paramObstacleSwamp) designerElements.paramObstacleSwamp.value = config.obstacleSwamp || 1;
    if (designerElements.paramObstacleCanon) designerElements.paramObstacleCanon.value = config.obstacleCanon || 0;
    if (designerElements.paramPrincessDistance) designerElements.paramPrincessDistance.value = config.princessDistance || 5;
    if (designerElements.paramPortalDistance) designerElements.paramPortalDistance.value = config.portalDistance || 3;
    if (designerElements.paramPlayerStartValue) designerElements.paramPlayerStartValue.value = config.playerStartValue || 2;
    if (designerElements.paramGoldPerLevel) designerElements.paramGoldPerLevel.value = config.goldPerLevel || 10;
    if (designerElements.paramGoldPerBag) designerElements.paramGoldPerBag.value = config.goldPerBag || 5;
    if (designerElements.paramMinItems) designerElements.paramMinItems.value = config.minItems || 1;
    if (designerElements.paramMaxItems) designerElements.paramMaxItems.value = config.maxItems || 5;
    if (designerElements.paramSpawnTurns) designerElements.paramSpawnTurns.value = config.spawnTurns || 3;
    if (designerElements.paramLevel) designerElements.paramLevel.value = config.level || 1;
    if (designerElements.paramName) designerElements.paramName.value = config.name || 'Generated Level';
    if (designerElements.paramDescription) designerElements.paramDescription.value = config.description || 'Auto-generated level';
    
    // Update level selector
    if (designerElements.levelSelector) {
        designerElements.levelSelector.value = levelNumber;
    }
}

// Get level configs (extract from generate10Levels)
function getLevelConfigs() {
    // If we have cached configs (updated by AI), use those
    if (levelConfigsCache && Array.isArray(levelConfigsCache)) {
        return levelConfigsCache;
    }
    
    // Otherwise return default configs
    const defaultConfigs = [
        // Cụm 1: Level 1-3 (Intro → Upgrade → Climax)
        {
            level: 1,
            name: 'Dungeon Entrance',
            description: 'Your first challenge - learn the basics',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 45,
            totalEnemyPower: 4,
            enemyCount: 2,
            enemyMinDistance: 2,
            enemyMaxDistance: 6,
            totalItemValue: 4,
            itemCount: 2,
            itemMinDistance: 1,
            itemMaxDistance: 5,
            itemMinDistanceFromEnemy: 0,
            obstacleBox: 3,
            obstacleLava: 0,
            obstacleSwamp: 0,
            obstacleCanon: 0,
            princessDistance: 4,
            portalDistance: 2,
            playerStartValue: 2,
            goldPerLevel: 10,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 3,
            spawnTurns: 3
        },
        {
            level: 2,
            name: 'Barrel Maze',
            description: 'Navigate through obstacles and monsters',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 50,
            totalEnemyPower: 7,
            enemyCount: 3,
            enemyMinDistance: 2,
            enemyMaxDistance: 7,
            totalItemValue: 6,
            itemCount: 3,
            itemMinDistance: 1,
            itemMaxDistance: 6,
            itemMinDistanceFromEnemy: 0,
            obstacleBox: 5,
            obstacleLava: 1,
            obstacleSwamp: 0,
            obstacleCanon: 0,
            princessDistance: 5,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 12,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 4,
            spawnTurns: 3
        },
        {
            level: 3,
            name: 'Goblin Den',
            description: 'Face hordes of goblins and rats',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 52,
            totalEnemyPower: 9,
            enemyCount: 3,
            enemyMinDistance: 2,
            enemyMaxDistance: 8,
            totalItemValue: 8,
            itemCount: 3,
            itemMinDistance: 1,
            itemMaxDistance: 6,
            itemMinDistanceFromEnemy: 0,
            obstacleBox: 6,
            obstacleLava: 2,
            obstacleSwamp: 0,
            obstacleCanon: 0,
            princessDistance: 6,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 15,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 5,
            spawnTurns: 3
        },
        // Cụm 2: Level 4-6 (Intro → Upgrade → Climax)
        {
            level: 4,
            name: 'Cluttered Corridor',
            description: 'Tight spaces filled with barrels and orcs',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 48,
            totalEnemyPower: 13,
            enemyCount: 4,
            enemyMinDistance: 3,
            enemyMaxDistance: 8,
            totalItemValue: 11,
            itemCount: 4,
            itemMinDistance: 2,
            itemMaxDistance: 7,
            itemMinDistanceFromEnemy: 1,
            obstacleBox: 7,
            obstacleLava: 2,
            obstacleSwamp: 1,
            obstacleCanon: 0,
            princessDistance: 7,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 18,
            goldPerBag: 6,
            minItems: 2,
            maxItems: 6,
            spawnTurns: 3
        },
        {
            level: 5,
            name: 'Fire Chamber',
            description: 'Beware the fire pits and dangerous monsters',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 46,
            totalEnemyPower: 16,
            enemyCount: 4,
            enemyMinDistance: 3,
            enemyMaxDistance: 9,
            totalItemValue: 13,
            itemCount: 4,
            itemMinDistance: 2,
            itemMaxDistance: 7,
            itemMinDistanceFromEnemy: 1,
            obstacleBox: 8,
            obstacleLava: 3,
            obstacleSwamp: 2,
            obstacleCanon: 1,
            princessDistance: 8,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 20,
            goldPerBag: 6,
            minItems: 2,
            maxItems: 7,
            spawnTurns: 3
        },
        {
            level: 6,
            name: 'Monster Lair',
            description: 'Multiple paths filled with dangerous creatures',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 44,
            totalEnemyPower: 20,
            enemyCount: 5,
            enemyMinDistance: 3,
            enemyMaxDistance: 9,
            totalItemValue: 16,
            itemCount: 5,
            itemMinDistance: 2,
            itemMaxDistance: 8,
            itemMinDistanceFromEnemy: 1,
            obstacleBox: 10,
            obstacleLava: 4,
            obstacleSwamp: 3,
            obstacleCanon: 2,
            princessDistance: 9,
            portalDistance: 4,
            playerStartValue: 2,
            goldPerLevel: 25,
            goldPerBag: 7,
            minItems: 2,
            maxItems: 8,
            spawnTurns: 3
        },
        // Cụm 3: Level 7-9 (Intro → Upgrade → Climax)
        {
            level: 7,
            name: 'Poison Pools',
            description: 'Toxic waters and swarms of monsters',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 42,
            totalEnemyPower: 24,
            enemyCount: 5,
            enemyMinDistance: 4,
            enemyMaxDistance: 10,
            totalItemValue: 20,
            itemCount: 5,
            itemMinDistance: 2,
            itemMaxDistance: 8,
            itemMinDistanceFromEnemy: 2,
            obstacleBox: 12,
            obstacleLava: 4,
            obstacleSwamp: 3,
            obstacleCanon: 2,
            princessDistance: 10,
            portalDistance: 4,
            playerStartValue: 2,
            goldPerLevel: 28,
            goldPerBag: 7,
            minItems: 3,
            maxItems: 9,
            spawnTurns: 3
        },
        {
            level: 8,
            name: 'Teleport Runes',
            description: 'Magic runes and closing enemies',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 40,
            totalEnemyPower: 28,
            enemyCount: 6,
            enemyMinDistance: 3,
            enemyMaxDistance: 8,
            totalItemValue: 23,
            itemCount: 6,
            itemMinDistance: 2,
            itemMaxDistance: 8,
            itemMinDistanceFromEnemy: 2,
            obstacleBox: 14,
            obstacleLava: 5,
            obstacleSwamp: 4,
            obstacleCanon: 3,
            princessDistance: 8,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 32,
            goldPerBag: 8,
            minItems: 3,
            maxItems: 10,
            spawnTurns: 3
        },
        {
            level: 9,
            name: 'Dungeon Maze',
            description: 'Complex maze with obstacles and monsters',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 38,
            totalEnemyPower: 32,
            enemyCount: 6,
            enemyMinDistance: 3,
            enemyMaxDistance: 9,
            totalItemValue: 26,
            itemCount: 6,
            itemMinDistance: 2,
            itemMaxDistance: 8,
            itemMinDistanceFromEnemy: 2,
            obstacleBox: 16,
            obstacleLava: 5,
            obstacleSwamp: 4,
            obstacleCanon: 3,
            princessDistance: 9,
            portalDistance: 4,
            playerStartValue: 2,
            goldPerLevel: 35,
            goldPerBag: 8,
            minItems: 3,
            maxItems: 10,
            spawnTurns: 3
        },
        // Level 10: Boss
        {
            level: 10,
            name: 'Dragon\'s Lair',
            description: 'Face the first dragon and its minions',
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 36,
            totalEnemyPower: 37,
            enemyCount: 7,
            enemyMinDistance: 4,
            enemyMaxDistance: 9,
            totalItemValue: 30,
            itemCount: 7,
            itemMinDistance: 2,
            itemMaxDistance: 8,
            itemMinDistanceFromEnemy: 2,
            obstacleBox: 18,
            obstacleLava: 6,
            obstacleSwamp: 5,
            obstacleCanon: 4,
            princessDistance: 9,
            portalDistance: 4,
            playerStartValue: 2,
            goldPerLevel: 40,
            goldPerBag: 10,
            minItems: 3,
            maxItems: 10,
            spawnTurns: 3
        }
    ];
    
    // Cache default configs for first time
    if (!levelConfigsCache) {
        levelConfigsCache = [...defaultConfigs];
    }
    
    return levelConfigsCache;
}

// Get parameters from form
function getParameters() {
    return {
        gridWidth: parseInt(designerElements.paramGridWidth.value) || 8,
        gridHeight: parseInt(designerElements.paramGridHeight.value) || 10,
        walkableCells: parseInt(designerElements.paramWalkableCells.value) || 50,
        totalEnemyPower: parseInt(designerElements.paramTotalEnemyPower.value) || 10,
        enemyCount: parseInt(designerElements.paramEnemyCount.value) || 3,
        enemyMinDistance: parseInt(designerElements.paramEnemyMinDistance.value) || 2,
        enemyMaxDistance: parseInt(designerElements.paramEnemyMaxDistance.value) || 8,
        totalItemValue: parseInt(designerElements.paramTotalItemValue.value) || 5,
        itemCount: parseInt(designerElements.paramItemCount.value) || 3,
        itemMinDistance: parseInt(designerElements.paramItemMinDistance.value) || 1,
        itemMaxDistance: parseInt(designerElements.paramItemMaxDistance.value) || 6,
        itemMinDistanceFromEnemy: parseInt(designerElements.paramItemMinDistanceFromEnemy.value) || 0,
        obstacleBox: parseInt(designerElements.paramObstacleBox.value) || 5,
        obstacleLava: parseInt(designerElements.paramObstacleLava.value) || 2,
        obstacleSwamp: parseInt(designerElements.paramObstacleSwamp.value) || 1,
        obstacleCanon: parseInt(designerElements.paramObstacleCanon.value) || 0,
        princessDistance: parseInt(designerElements.paramPrincessDistance.value) || 5,
        portalDistance: parseInt(designerElements.paramPortalDistance.value) || 3,
        playerStartValue: parseInt(designerElements.paramPlayerStartValue.value) || 2,
        goldPerLevel: parseInt(designerElements.paramGoldPerLevel.value) || 10,
        goldPerBag: parseInt(designerElements.paramGoldPerBag.value) || 5,
        minItems: parseInt(designerElements.paramMinItems.value) || 1,
        maxItems: parseInt(designerElements.paramMaxItems.value) || 5,
        spawnTurns: parseInt(designerElements.paramSpawnTurns.value) || 3,
        level: parseInt(designerElements.paramLevel.value) || 1,
        name: designerElements.paramName.value || 'Generated Level',
        description: designerElements.paramDescription.value || 'Auto-generated level'
    };
}

// Handle Generate
function handleGenerate() {
    const params = getParameters();
    console.log('Generating level with parameters:', params);
    
    const level = generateLevel(params);
    
    if (!level) {
        alert('Failed to generate level. Please adjust parameters and try again.');
        return;
    }
    
    currentGeneratedLevel = level;
    renderPreview(level);
    switchTab('preview');
}

// Render Preview
function renderPreview(level) {
    if (!level || !level.layout) return;
    
    // Render stats
    if (designerElements.previewStats && level.stats) {
        designerElements.previewStats.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Walkable Cells:</span>
                <span class="stat-value">${level.stats.walkableCells}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Enemy Power:</span>
                <span class="stat-value">${level.stats.enemyPower}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Enemy Count:</span>
                <span class="stat-value">${level.stats.enemyCount}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Item Value:</span>
                <span class="stat-value">${level.stats.itemValue}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Item Count:</span>
                <span class="stat-value">${level.stats.itemCount}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Obstacles:</span>
                <span class="stat-value">${level.stats.obstacles}</span>
            </div>
        `;
    }
    
    // Render grid
    if (designerElements.previewGrid) {
        designerElements.previewGrid.innerHTML = '';
        designerElements.previewGrid.style.gridTemplateColumns = `repeat(${level.layout[0].length}, 1fr)`;
        
        for (let y = 0; y < level.layout.length; y++) {
            for (let x = 0; x < level.layout[y].length; x++) {
                const cell = level.layout[y][x];
                const cellDiv = document.createElement('div');
                cellDiv.className = 'preview-cell';
                
                let content = '';
                let cellClass = '';
                
                if (cell === 'P') {
                    content = '🧙';
                    cellClass = 'player-cell';
                } else if (cell === 'R') {
                    content = '👸';
                    cellClass = 'princess-cell';
                } else if (typeof cell === 'number') {
                    if (cell < 0) {
                        // Enemy
                        const enemyType = findEnemyTypeByValue(Math.abs(cell));
                        content = enemyType ? enemyType.emoji : '👹';
                        cellClass = 'enemy-cell';
                    } else if (cell > 0) {
                        // Item
                        const itemType = findItemTypeByValue(cell);
                        content = itemType ? itemType.emoji : '💎';
                        cellClass = 'item-cell';
                    } else {
                        content = '';
                        cellClass = 'empty-cell';
                    }
                } else if (cell === 'B') {
                    content = '🧱';
                    cellClass = 'obstacle-cell';
                } else if (cell === 'L') {
                    content = '🔥';
                    cellClass = 'lava-cell';
                } else if (cell === 'S') {
                    content = '🌊';
                    cellClass = 'swamp-cell';
                } else if (cell === 'C') {
                    content = '⚡';
                    cellClass = 'canon-cell';
                } else {
                    content = '';
                    cellClass = 'empty-cell';
                }
                
                cellDiv.textContent = content;
                cellDiv.className += ' ' + cellClass;
                designerElements.previewGrid.appendChild(cellDiv);
            }
        }
    }
}

// Helper functions to find enemy/item types (reuse from game.js logic)
function findEnemyTypeByValue(value) {
    if (typeof CONFIG === 'undefined' || !CONFIG.ENEMY_TYPES) return null;
    let enemyType = CONFIG.ENEMY_TYPES.find(et => et.value === value);
    if (!enemyType) {
        const sortedTypes = [...CONFIG.ENEMY_TYPES].sort((a, b) => b.value - a.value);
        enemyType = sortedTypes.find(et => et.value <= value);
    }
    return enemyType || CONFIG.ENEMY_TYPES[0];
}

function findItemTypeByValue(value) {
    if (typeof CONFIG === 'undefined' || !CONFIG.ITEM_TYPES) return null;
    let itemType = CONFIG.ITEM_TYPES.find(it => it.value === value);
    if (!itemType) {
        const sortedTypes = [...CONFIG.ITEM_TYPES].sort((a, b) => b.value - a.value);
        itemType = sortedTypes.find(it => it.value <= value);
    }
    return itemType || CONFIG.ITEM_TYPES[0];
}

// Handle Play Test
function handlePlayTest() {
    if (!currentGeneratedLevel) {
        alert('No level generated. Please generate a level first.');
        return;
    }
    
    // Store the generated level temporarily
    // We'll inject it into the level design system
    const tempLevel = { ...currentGeneratedLevel };
    
    // Find a temporary level number (use a high number like 999)
    testLevelNumber = 999;
    tempLevel.level = testLevelNumber;
    
    // Temporarily add to LEVEL_DESIGN
    if (typeof LEVEL_DESIGN === 'undefined') {
        window.LEVEL_DESIGN = { LEVELS: [] };
    }
    
    // Remove any existing test level
    LEVEL_DESIGN.LEVELS = LEVEL_DESIGN.LEVELS.filter(l => l.level !== testLevelNumber);
    
    // Add test level
    LEVEL_DESIGN.LEVELS.push(tempLevel);
    
    // Update CONFIG if needed
    if (typeof CONFIG !== 'undefined') {
        CONFIG.LEVELS = LEVEL_DESIGN.LEVELS;
    }
    
    // Hide designer and show game
    hideLevelDesigner();
    const homeScreen = document.getElementById('homeScreen');
    if (homeScreen) {
        homeScreen.style.display = 'none';
    }
    
    // Start game with test level
    if (typeof initGame === 'function') {
        initGame(testLevelNumber);
        const gameScreen = document.getElementById('gameScreen');
        if (gameScreen) {
            gameScreen.style.display = 'block';
        }
    }
    
    // Store flag to indicate we're in test mode
    window.isLevelDesignerTestMode = true;
    
    // Override exit game function temporarily
    if (typeof exitGame === 'function') {
        const originalExitGame = window.exitGame;
        window.exitGame = function() {
            // Return to designer instead of home
            const gameScreen = document.getElementById('gameScreen');
            if (gameScreen) {
                gameScreen.style.display = 'none';
            }
            
            // Stop game
            if (typeof resetGame === 'function') {
                resetGame();
            }
            
            showLevelDesigner();
            switchTab('test');
            
            // Update test info
            if (designerElements.testInfo) {
                designerElements.testInfo.innerHTML = `
                    <p><strong>Testing Level ${tempLevel.level}: ${tempLevel.name}</strong></p>
                    <p>${tempLevel.description}</p>
                    <p>After playing, you can save this level or adjust parameters.</p>
                `;
            }
            
            // Restore original exit game
            window.exitGame = originalExitGame;
            window.isLevelDesignerTestMode = false;
        };
    }
    
    // Update test info
    if (designerElements.testInfo) {
        designerElements.testInfo.innerHTML = `
            <p><strong>Testing Level ${tempLevel.level}: ${tempLevel.name}</strong></p>
            <p>${tempLevel.description}</p>
            <p>After playing, you can save this level or adjust parameters.</p>
        `;
    }
}

// Handle Save to File
function handleSaveToFile() {
    if (!currentGeneratedLevel) {
        alert('No level to save. Please generate a level first.');
        return;
    }
    
    const level = currentGeneratedLevel;
    const levelNumber = parseInt(designerElements.paramLevel.value) || level.level;
    
    // Confirm save
    const confirmMsg = `Save level "${level.name}" as level ${levelNumber}?\n\nThis will copy the level code to clipboard. You can then paste it into level-design.js.`;
    if (!confirm(confirmMsg)) {
        return;
    }
    
    // Format level for file
    const levelCode = formatLevelForFile(level, levelNumber);
    
    // Copy to clipboard
    navigator.clipboard.writeText(levelCode).then(() => {
        alert(`Level code copied to clipboard!\n\nTo add it to level-design.js:\n1. Open level-design.js\n2. Find the LEVELS array\n3. Paste the code into the array (before the closing bracket)\n4. Add a comma after the previous level if needed\n5. Save the file`);
        
        // Also log to console for easy access
        console.log('Level code to add to level-design.js:');
        console.log(levelCode);
    }).catch(err => {
        // Fallback: show in alert
        alert(`Level code:\n\n${levelCode}\n\nCopy this code and add it to level-design.js in the LEVELS array.`);
        console.log('Level code to add to level-design.js:');
        console.log(levelCode);
    });
    
    // Also create download link as backup
    const blob = new Blob([levelCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `level-${levelNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Handle Save AI Levels to level-design.js
function handleGenerateAll10() {
    console.log('Saving AI-generated levels to level-design.js...');
    
    // Get levels from LEVEL_DESIGN.LEVELS (which has AI-generated layouts) or cache
    const levelsToSave = [];
    
    // First, try to get from LEVEL_DESIGN.LEVELS (preferred - has AI layouts)
    if (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) {
        for (let levelNum = 1; levelNum <= 10; levelNum++) {
            const level = LEVEL_DESIGN.LEVELS.find(l => l.level === levelNum);
            if (level && level.layout) {
                levelsToSave.push(level);
            } else {
                // Fallback to cache
                const cachedLevel = generatedLevelsCache[levelNum] || generatedLevelsCache[String(levelNum)];
                if (cachedLevel && cachedLevel.layout) {
                    levelsToSave.push(cachedLevel);
                }
            }
        }
    } else {
        // Fallback to cache only
        for (let levelNum = 1; levelNum <= 10; levelNum++) {
            const cachedLevel = generatedLevelsCache[levelNum] || generatedLevelsCache[String(levelNum)];
            if (cachedLevel && cachedLevel.layout) {
                levelsToSave.push(cachedLevel);
            }
        }
    }
    
    if (levelsToSave.length === 0) {
        alert('No AI-generated levels found!\n\nPlease:\n1. Load AI result from ai-result.json, OR\n2. Generate levels with AI first');
        return;
    }
    
    if (levelsToSave.length < 10) {
        if (!confirm(`Only ${levelsToSave.length} levels found. Save these ${levelsToSave.length} levels to level-design.js?`)) {
            return;
        }
    } else {
        if (!confirm(`Save all ${levelsToSave.length} AI-generated levels to level-design.js?\n\nThis will create a downloadable file that you can use to replace the current level-design.js.`)) {
            return;
        }
    }
    
    // Sort by level number
    levelsToSave.sort((a, b) => a.level - b.level);
    
    // Format all levels for file
    const levelsArray = levelsToSave.map(level => formatLevelForFile(level, level.level));
    
    const allLevelsCode = levelsArray.join(',\n\n');
    const fullCode = `// DiceQuest Level Design Configuration
// Level Design Format:
// - 'P' = Player starting position
// - Negative numbers (-1, -3, -5, -8, etc.) = Enemy (value = abs(number), icon auto-assigned)
// - Positive numbers (1, 2, 3, 5, etc.) = Item (value = number, icon auto-assigned)
// - 'B' = Box (obstacle)
// - 'L' = Lava
// - 'S' = Swamp
// - 'C' = Canon
// - 'R' = Princess (must be rescued to spawn portal)
// - '.' or ' ' or 0 = Empty cell

const LEVEL_DESIGN = {
    LEVELS: [
${allLevelsCode}
        
    ]
};

// Attach LEVELS to CONFIG for backward compatibility
if (typeof CONFIG !== 'undefined') {
    CONFIG.LEVELS = LEVEL_DESIGN.LEVELS;
}`;

    // Create download link
    const blob = new Blob([fullCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'level-design.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`✅ Successfully saved ${levelsToSave.length} levels to level-design.js!\n\nFile downloaded. To use:\n1. Replace your current level-design.js with the downloaded file\n2. Refresh the game to see the new levels`);
    
    // Also copy to clipboard as backup
    navigator.clipboard.writeText(fullCode).then(() => {
        console.log('Level design code also copied to clipboard');
    }).catch(err => {
        console.log('Could not copy to clipboard:', err);
    });
    
    console.log(`Saved ${levelsToSave.length} levels to level-design.js`);
    
    // Get parameters from all level forms
    const allLevels = [];
    const levelConfigs = getLevelConfigs();
    const generatedLevels = [];
    let successCount = 0;
    let failedCount = 0;
    
    for (let levelNum = 1; levelNum <= 10; levelNum++) {
        const prefix = `level${levelNum}_`;
        const config = levelConfigs.find(c => c.level === levelNum);
        
        // Try to get from expanded form, otherwise use default config
        const params = {
            level: levelNum,
            gridWidth: parseInt(document.getElementById(`${prefix}GridWidth`)?.value) || config?.gridWidth || 8,
            gridHeight: parseInt(document.getElementById(`${prefix}GridHeight`)?.value) || config?.gridHeight || 10,
            walkableCells: parseInt(document.getElementById(`${prefix}WalkableCells`)?.value) || config?.walkableCells || 50,
            totalEnemyPower: parseInt(document.getElementById(`${prefix}TotalEnemyPower`)?.value) || config?.totalEnemyPower || 10,
            enemyCount: parseInt(document.getElementById(`${prefix}EnemyCount`)?.value) || config?.enemyCount || 3,
            enemyMinDistance: parseInt(document.getElementById(`${prefix}EnemyMinDistance`)?.value) || config?.enemyMinDistance || 2,
            enemyMaxDistance: parseInt(document.getElementById(`${prefix}EnemyMaxDistance`)?.value) || config?.enemyMaxDistance || 8,
            totalItemValue: parseInt(document.getElementById(`${prefix}TotalItemValue`)?.value) || config?.totalItemValue || 5,
            itemCount: parseInt(document.getElementById(`${prefix}ItemCount`)?.value) || config?.itemCount || 3,
            itemMinDistance: parseInt(document.getElementById(`${prefix}ItemMinDistance`)?.value) || config?.itemMinDistance || 1,
            itemMaxDistance: parseInt(document.getElementById(`${prefix}ItemMaxDistance`)?.value) || config?.itemMaxDistance || 6,
            itemMinDistanceFromEnemy: parseInt(document.getElementById(`${prefix}ItemMinDistanceFromEnemy`)?.value) || config?.itemMinDistanceFromEnemy || 0,
            obstacleBox: parseInt(document.getElementById(`${prefix}ObstacleBox`)?.value) || config?.obstacleBox || 5,
            obstacleLava: parseInt(document.getElementById(`${prefix}ObstacleLava`)?.value) || config?.obstacleLava || 2,
            obstacleSwamp: parseInt(document.getElementById(`${prefix}ObstacleSwamp`)?.value) || config?.obstacleSwamp || 1,
            obstacleCanon: parseInt(document.getElementById(`${prefix}ObstacleCanon`)?.value) || config?.obstacleCanon || 0,
            princessDistance: parseInt(document.getElementById(`${prefix}PrincessDistance`)?.value) || config?.princessDistance || 5,
            portalDistance: parseInt(document.getElementById(`${prefix}PortalDistance`)?.value) || config?.portalDistance || 3,
            playerStartValue: parseInt(document.getElementById(`${prefix}PlayerStartValue`)?.value) || config?.playerStartValue || 2,
            goldPerLevel: parseInt(document.getElementById(`${prefix}GoldPerLevel`)?.value) || config?.goldPerLevel || 10,
            goldPerBag: parseInt(document.getElementById(`${prefix}GoldPerBag`)?.value) || config?.goldPerBag || 5,
            minItems: parseInt(document.getElementById(`${prefix}MinItems`)?.value) || config?.minItems || 1,
            maxItems: parseInt(document.getElementById(`${prefix}MaxItems`)?.value) || config?.maxItems || 5,
            spawnTurns: parseInt(document.getElementById(`${prefix}SpawnTurns`)?.value) || config?.spawnTurns || 3,
            name: document.getElementById(`${prefix}Name`)?.value || config?.name || 'Generated Level',
            description: document.getElementById(`${prefix}Description`)?.value || config?.description || 'Auto-generated level'
        };
        
        allLevels.push(params);
    }
    
    // Generate all levels (no pop-up, generate immediately)
    allLevels.forEach(params => {
        const level = generateLevel(params);
        if (level) {
            // Cache the generated level
            generatedLevelsCache[params.level] = level;
            generatedLevels.push(level);
            successCount++;
        } else {
            failedCount++;
            generatedLevels.push({
                level: params.level,
                name: params.name,
                description: params.description + ' (Generation failed)',
                error: true,
                config: params
            });
        }
    });
    
    generated10Levels = generatedLevels;
    
    // Save to localStorage
    saveGeneratedLevelsToStorage();
    
    // Show save button
    if (designerElements.saveGenFileBtn) {
        designerElements.saveGenFileBtn.style.display = 'inline-block';
    }
    
    // Update preview grids for all successfully generated levels
    for (let levelNum = 1; levelNum <= 10; levelNum++) {
        if (generatedLevelsCache[levelNum] && !generatedLevelsCache[levelNum].error) {
            updatePreviewGrid(levelNum);
        }
    }
    
    // Update overview charts if overview tab is active
    const overviewTab = document.getElementById('overviewTab');
    if (overviewTab && overviewTab.classList.contains('active')) {
        updateOverviewCharts(document.getElementById('metricSelector')?.value || 'difficultyScore');
    }
    
    // Log result to console (no pop-up)
    if (failedCount > 0) {
        console.warn(`Generated ${successCount}/10 levels successfully. ${failedCount} levels failed to generate.`);
    } else {
        console.log('Successfully generated all 10 levels!');
    }
}

// Render Overview (deprecated - now using level parameters list)
function renderOverview(levels) {
    // This function is kept for backward compatibility but not used anymore
    // Overview is now integrated into tuning parameters list
}

// Collect level data for charts
function collectLevelData() {
    const levelConfigs = getLevelConfigs();
    const data = [];
    
    for (let levelNum = 1; levelNum <= 10; levelNum++) {
        const config = levelConfigs.find(c => c.level === levelNum);
        if (!config) continue;
        
        // Try to get from cache first (actual generated level), otherwise use config
        const cachedLevel = generatedLevelsCache[levelNum];
        const levelParams = cachedLevel ? {
            // Use cached level stats if available
            totalEnemyPower: cachedLevel.stats?.enemyPower || config.totalEnemyPower,
            enemyCount: cachedLevel.stats?.enemyCount || config.enemyCount,
            totalItemValue: cachedLevel.stats?.itemValue || config.totalItemValue,
            itemCount: cachedLevel.stats?.itemCount || config.itemCount,
            obstacleBox: cachedLevel.stats?.obstacleBox || config.obstacleBox || 0,
            obstacleLava: cachedLevel.stats?.obstacleLava || config.obstacleLava || 0,
            obstacleSwamp: cachedLevel.stats?.obstacleSwamp || config.obstacleSwamp || 0,
            obstacleCanon: cachedLevel.stats?.obstacleCanon || config.obstacleCanon || 0,
            walkableCells: cachedLevel.stats?.walkableCells || config.walkableCells || 0,
            gridWidth: config.gridWidth,
            gridHeight: config.gridHeight
        } : {
            totalEnemyPower: config.totalEnemyPower,
            enemyCount: config.enemyCount,
            totalItemValue: config.totalItemValue,
            itemCount: config.itemCount,
            obstacleBox: config.obstacleBox || 0,
            obstacleLava: config.obstacleLava || 0,
            obstacleSwamp: config.obstacleSwamp || 0,
            obstacleCanon: config.obstacleCanon || 0,
            walkableCells: config.walkableCells || 0,
            gridWidth: config.gridWidth,
            gridHeight: config.gridHeight
        };
        
        // Calculate metrics
        const totalObstacles = levelParams.obstacleBox + levelParams.obstacleLava + 
                              levelParams.obstacleSwamp + levelParams.obstacleCanon;
        
        // Calculate difficulty score
        const difficultyScore = calculateDifficultyScore(levelParams);
        
        data.push({
            level: levelNum,
            name: config.name,
            difficultyScore: difficultyScore,
            enemyPower: levelParams.totalEnemyPower,
            enemyCount: levelParams.enemyCount,
            totalObstacles: totalObstacles,
            walkableCells: levelParams.walkableCells,
            itemValue: levelParams.totalItemValue,
            obstacleBox: levelParams.obstacleBox,
            obstacleLava: levelParams.obstacleLava,
            obstacleSwamp: levelParams.obstacleSwamp,
            obstacleCanon: levelParams.obstacleCanon
        });
    }
    
    return data;
}

// Detect milestones (feature introductions)
function detectMilestones(levelData) {
    const milestones = [];
    let lavaIntroduced = false;
    let swampIntroduced = false;
    let canonIntroduced = false;
    
    for (const level of levelData) {
        // Lava introduced (first level with obstacleLava > 0)
        if (!lavaIntroduced && level.obstacleLava > 0) {
            milestones.push({
                level: level.level,
                type: 'lava',
                label: 'Lava Introduced',
                icon: '🔥'
            });
            lavaIntroduced = true;
        }
        
        // Swamp introduced (first level with obstacleSwamp > 0)
        if (!swampIntroduced && level.obstacleSwamp > 0) {
            milestones.push({
                level: level.level,
                type: 'swamp',
                label: 'Swamp Introduced',
                icon: '🌊'
            });
            swampIntroduced = true;
        }
        
        // Canon introduced (first level with obstacleCanon > 0)
        if (!canonIntroduced && level.obstacleCanon > 0) {
            milestones.push({
                level: level.level,
                type: 'canon',
                label: 'Canon Introduced',
                icon: '⚡'
            });
            canonIntroduced = true;
        }
    }
    
    return milestones;
}

// Render Line Chart
function renderLineChart(data, selectedMetric, milestones) {
    const canvas = document.getElementById('lineChartCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const width = container.clientWidth - 40;
    const height = 400;
    
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart area (with padding)
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Get metric values
    const metricValues = data.map(d => d[selectedMetric] || 0);
    const maxValue = Math.max(...metricValues, 1);
    const minValue = Math.min(...metricValues, 0);
    const valueRange = maxValue - minValue || 1;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
        const value = maxValue - (valueRange / gridLines) * i;
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.fillText(Math.round(value).toString(), padding.left - 10, y + 4);
    }
    
    // Draw X-axis labels (levels)
    ctx.textAlign = 'center';
    const levelSpacing = chartWidth / (data.length - 1 || 1);
    data.forEach((d, i) => {
        const x = padding.left + levelSpacing * i;
        ctx.fillText(`L${d.level}`, x, padding.top + chartHeight + 20);
    });
    
    // Draw line
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, i) => {
        const value = d[selectedMetric] || 0;
        const x = padding.left + levelSpacing * i;
        const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#3498db';
    data.forEach((d, i) => {
        const value = d[selectedMetric] || 0;
        const x = padding.left + levelSpacing * i;
        const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw white border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Draw milestone markers
    milestones.forEach(milestone => {
        const levelIndex = data.findIndex(d => d.level === milestone.level);
        if (levelIndex === -1) return;
        
        const value = data[levelIndex][selectedMetric] || 0;
        const x = padding.left + levelSpacing * levelIndex;
        const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        
        // Draw milestone icon
        ctx.fillStyle = 'rgba(52, 152, 219, 0.9)';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label text (icon will be shown in label)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = '11px Arial';
        const labelText = milestone.icon + ' ' + milestone.label;
        const labelWidth = ctx.measureText(labelText).width;
        ctx.fillRect(x - labelWidth / 2 - 4, y - 35, labelWidth + 8, 18);
        
        ctx.fillStyle = 'white';
        ctx.fillText(labelText, x, y - 26);
    });
    
    // Add hover tooltip
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const levelSpacing = chartWidth / (data.length - 1 || 1);
        let closestIndex = -1;
        let minDistance = Infinity;
        
        data.forEach((d, i) => {
            const x = padding.left + levelSpacing * i;
            const distance = Math.abs(mouseX - x);
            if (distance < minDistance && distance < 30) {
                minDistance = distance;
                closestIndex = i;
            }
        });
        
        const tooltip = document.getElementById('lineChartTooltip');
        if (closestIndex !== -1 && tooltip) {
            const d = data[closestIndex];
            const x = padding.left + levelSpacing * closestIndex;
            tooltip.style.display = 'block';
            tooltip.style.left = (rect.left + x) + 'px';
            tooltip.style.top = (rect.top + padding.top - 40) + 'px';
            tooltip.innerHTML = `
                <strong>Level ${d.level}: ${d.name}</strong><br>
                ${getMetricLabel(selectedMetric)}: ${d[selectedMetric]}
            `;
        } else if (tooltip) {
            tooltip.style.display = 'none';
        }
    });
}

// Render Bar Chart
function renderBarChart(data) {
    const canvas = document.getElementById('barChartCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const width = container.clientWidth - 40;
    const height = 400;
    
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart area
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Calculate max obstacles
    const maxObstacles = Math.max(...data.map(d => 
        d.obstacleBox + d.obstacleLava + d.obstacleSwamp + d.obstacleCanon
    ), 1);
    
    // Bar width and spacing
    const barWidth = (chartWidth / data.length) * 0.6;
    const barSpacing = (chartWidth / data.length) * 0.4;
    
    // Colors
    const colors = {
        box: '#e74c3c',
        lava: '#f39c12',
        swamp: '#8e44ad',
        canon: '#3498db'
    };
    
    // Draw bars
    data.forEach((d, i) => {
        const x = padding.left + (chartWidth / data.length) * i + barSpacing / 2;
        let currentY = padding.top + chartHeight;
        
        const obstacles = [
            { value: d.obstacleBox, color: colors.box, label: 'Box' },
            { value: d.obstacleLava, color: colors.lava, label: 'Lava' },
            { value: d.obstacleSwamp, color: colors.swamp, label: 'Swamp' },
            { value: d.obstacleCanon, color: colors.canon, label: 'Canon' }
        ];
        
        obstacles.forEach(obs => {
            if (obs.value > 0) {
                const barHeight = (obs.value / maxObstacles) * chartHeight;
                currentY -= barHeight;
                
                ctx.fillStyle = obs.color;
                ctx.fillRect(x, currentY, barWidth, barHeight);
                
                // Draw border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, currentY, barWidth, barHeight);
            }
        });
        
        // Draw level label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`L${d.level}`, x + barWidth / 2, padding.top + chartHeight + 20);
    });
    
    // Draw Y-axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxObstacles / 5) * i);
        const y = padding.top + chartHeight - (chartHeight / 5) * i;
        ctx.fillText(value.toString(), padding.left - 10, y + 4);
    }
    
    // Draw legend
    const legendY = padding.top - 25;
    let legendX = padding.left;
    Object.entries(colors).forEach(([key, color]) => {
        ctx.fillStyle = color;
        ctx.fillRect(legendX, legendY, 15, 15);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(key.charAt(0).toUpperCase() + key.slice(1), legendX + 20, legendY + 12);
        legendX += 80;
    });
}

// Render Pie Chart
function renderPieChart(data) {
    const canvas = document.getElementById('pieChartCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const width = Math.min(container.clientWidth - 40, 400);
    const height = 400;
    
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate totals
    const totals = {
        box: data.reduce((sum, d) => sum + d.obstacleBox, 0),
        lava: data.reduce((sum, d) => sum + d.obstacleLava, 0),
        swamp: data.reduce((sum, d) => sum + d.obstacleSwamp, 0),
        canon: data.reduce((sum, d) => sum + d.obstacleCanon, 0)
    };
    
    const total = totals.box + totals.lava + totals.swamp + totals.canon;
    if (total === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No obstacles', width / 2, height / 2);
        return;
    }
    
    // Colors
    const colors = {
        box: '#e74c3c',
        lava: '#f39c12',
        swamp: '#8e44ad',
        canon: '#3498db'
    };
    
    // Draw pie chart
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    let currentAngle = -Math.PI / 2;
    
    Object.entries(totals).forEach(([key, value]) => {
        if (value > 0) {
            const sliceAngle = (value / total) * Math.PI * 2;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[key];
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const percentage = ((value / total) * 100).toFixed(1);
            ctx.fillText(`${percentage}%`, labelX, labelY);
            
            currentAngle += sliceAngle;
        }
    });
    
    // Draw legend
    const legend = document.getElementById('pieChartLegend');
    if (legend) {
        legend.innerHTML = '';
        Object.entries(totals).forEach(([key, value]) => {
            if (value > 0) {
                const item = document.createElement('div');
                item.className = 'legend-item';
                const percentage = ((value / total) * 100).toFixed(1);
                item.innerHTML = `
                    <div class="legend-color" style="background-color: ${colors[key]}"></div>
                    <span>${key.charAt(0).toUpperCase() + key.slice(1)}: ${value} (${percentage}%)</span>
                `;
                legend.appendChild(item);
            }
        });
    }
}

// Get metric label for display
function getMetricLabel(metric) {
    const labels = {
        difficultyScore: 'Difficulty Score',
        enemyPower: 'Enemy Power',
        totalObstacles: 'Total Obstacles',
        walkableCells: 'Walkable Cells',
        itemValue: 'Item Value',
        enemyCount: 'Enemy Count'
    };
    return labels[metric] || metric;
}

// Render Overview Tab
function renderOverviewTab() {
    const data = collectLevelData();
    const milestones = detectMilestones(data);
    const metricSelector = document.getElementById('metricSelector');
    const selectedMetric = metricSelector ? metricSelector.value : 'difficultyScore';
    
    // Render all charts
    renderLineChart(data, selectedMetric, milestones);
    renderBarChart(data);
    renderPieChart(data);
}

// Update Overview Charts
function updateOverviewCharts(selectedMetric) {
    const data = collectLevelData();
    const milestones = detectMilestones(data);
    
    // Update line chart with new metric
    renderLineChart(data, selectedMetric, milestones);
    
    // Bar and pie charts don't depend on metric, but we can refresh them if needed
    // (They show obstacle distribution which is independent of selected metric)
}


// Format level for file (matching level-design.js format)
function formatLevelForFile(level, levelNumber) {
    const layoutStr = level.layout.map(row => {
        const rowStr = row.map(cell => {
            if (typeof cell === 'string') {
                return `"${cell}"`;
            }
            return cell.toString();
        }).join(', ');
        return `                [${rowStr}]`;
    }).join(',\n');
    
    const designIntentStr = level.designIntent ? `            designIntent: '${level.designIntent.replace(/'/g, "\\'").replace(/\n/g, '\\n')}',\n` : '';
    const optimalStrategyStr = level.optimalStrategy ? `            optimalStrategy: '${level.optimalStrategy.replace(/'/g, "\\'").replace(/\n/g, '\\n')}',\n` : '';
    
    return `        {
            level: ${levelNumber},
            name: '${level.name.replace(/'/g, "\\'")}',
            playerStartValue: ${level.playerStartValue},
            description: '${level.description.replace(/'/g, "\\'")}',
            goldPerLevel: ${level.goldPerLevel},
            goldPerBag: ${level.goldPerBag},
            minItems: ${level.minItems},
            maxItems: ${level.maxItems},
            spawnTurns: ${level.spawnTurns},${designIntentStr}${optimalStrategyStr}            layout: [
${layoutStr}
            ]            
        }`;
}

// Initialize on load
function initializeLevelDesigner() {
    // Wait a bit to ensure all scripts are loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initLevelDesigner, 100);
        });
    } else {
        setTimeout(initLevelDesigner, 100);
    }
}

// ========== AI Level Design Functions ==========

/**
 * Count stats from layout array
 * @param {Array<Array>} layout - 2D layout array
 * @returns {Object} - Stats object with enemyCount, totalEnemyPower, itemCount, totalItemValue, obstacles, walkableCells
 */
function countStatsFromLayout(layout) {
    if (!layout || !Array.isArray(layout) || layout.length === 0) {
        return {
            enemyCount: 0,
            totalEnemyPower: 0,
            itemCount: 0,
            totalItemValue: 0,
            obstacleBox: 0,
            obstacleLava: 0,
            obstacleSwamp: 0,
            obstacleCanon: 0,
            walkableCells: 0
        };
    }
    
    let enemyCount = 0;
    let totalEnemyPower = 0;
    let itemCount = 0;
    let totalItemValue = 0;
    let obstacleBox = 0;
    let obstacleLava = 0;
    let obstacleSwamp = 0;
    let obstacleCanon = 0;
    let walkableCells = 0;
    
    layout.forEach(row => {
        if (!Array.isArray(row)) return;
        
        row.forEach(cell => {
            // Handle number cells
            if (typeof cell === 'number') {
                if (cell < 0) {
                    // Enemy (negative number)
                    enemyCount++;
                    totalEnemyPower += Math.abs(cell);
                } else if (cell > 0) {
                    // Item (positive number)
                    itemCount++;
                    totalItemValue += cell;
                } else {
                    // Zero = empty walkable cell
                    walkableCells++;
                }
            } else if (typeof cell === 'string') {
                // Handle string cells
                if (cell === 'B') {
                    obstacleBox++;
                } else if (cell === 'L') {
                    obstacleLava++;
                    walkableCells++; // Lava is walkable (just deals damage)
                } else if (cell === 'S') {
                    obstacleSwamp++;
                    walkableCells++; // Swamp is walkable (just deals damage)
                } else if (cell === 'C') {
                    obstacleCanon++;
                    walkableCells++; // Canon is walkable
                } else if (cell === 'P' || cell === 'R') {
                    // Player and Princess positions are walkable
                    walkableCells++;
                } else if (cell === '0' || cell === '.' || cell === ' ' || cell === '') {
                    // Empty cell
                    walkableCells++;
                }
            } else if (cell === 0 || cell === null || cell === undefined) {
                // Empty cell
                walkableCells++;
            }
        });
    });
    
    return {
        enemyCount,
        totalEnemyPower,
        itemCount,
        totalItemValue,
        obstacleBox,
        obstacleLava,
        obstacleSwamp,
        obstacleCanon,
        walkableCells
    };
}

/**
 * Validate layout array
 * @param {Array<Array>} layout - 2D layout array
 * @param {number} levelNumber - Level number (for error messages)
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateLayout(layout, levelNumber) {
    const errors = [];
    
    if (!layout || !Array.isArray(layout)) {
        errors.push(`Level ${levelNumber}: Layout is not an array`);
        return { valid: false, errors };
    }
    
    if (layout.length !== 10) {
        errors.push(`Level ${levelNumber}: Layout must have exactly 10 rows, got ${layout.length}`);
    }
    
    let playerCount = 0;
    let princessCount = 0;
    const rowWidths = [];
    
    layout.forEach((row, rowIndex) => {
        if (!Array.isArray(row)) {
            errors.push(`Level ${levelNumber}: Row ${rowIndex} is not an array`);
            return;
        }
        
        rowWidths.push(row.length);
        
        if (row.length !== 8) {
            errors.push(`Level ${levelNumber}: Row ${rowIndex} must have exactly 8 columns, got ${row.length}`);
        }
        
        row.forEach(cell => {
            if (cell === 'P') {
                playerCount++;
            } else if (cell === 'R') {
                princessCount++;
            }
        });
    });
    
    if (playerCount !== 1) {
        errors.push(`Level ${levelNumber}: Must have exactly 1 'P' (player), found ${playerCount}`);
    }
    
    if (princessCount !== 1) {
        errors.push(`Level ${levelNumber}: Must have exactly 1 'R' (princess), found ${princessCount}`);
    }
    
    // Check if all rows have same width
    if (rowWidths.length > 0) {
        const firstWidth = rowWidths[0];
        const inconsistentRows = rowWidths.filter((width, index) => width !== firstWidth);
        if (inconsistentRows.length > 0) {
            errors.push(`Level ${levelNumber}: Rows have inconsistent widths (expected ${firstWidth}, found different widths)`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Apply AI suggestion to UI (auto-apply, doesn't save to file)
 * @param {number} levelNumber - Level number
 * @param {Object} suggestion - AI suggestion with parameters, layout, designIntent, optimalStrategy
 */
function applyAISuggestion(levelNumber, suggestion) {
    const { parameters, layout, designIntent, optimalStrategy } = suggestion;
    
    // Get level configs (this will use cache if available)
    const configs = getLevelConfigs();
    let config = configs.find(c => c.level === levelNumber);
    
    // If config not found, create new one
    if (!config) {
        config = {
            level: levelNumber,
            gridWidth: 8,
            gridHeight: 10,
            walkableCells: 50,
            totalEnemyPower: 10,
            enemyCount: 3,
            enemyMinDistance: 2,
            enemyMaxDistance: 8,
            totalItemValue: 5,
            itemCount: 3,
            itemMinDistance: 1,
            itemMaxDistance: 6,
            itemMinDistanceFromEnemy: 0,
            obstacleBox: 5,
            obstacleLava: 0,
            obstacleSwamp: 0,
            obstacleCanon: 0,
            princessDistance: 5,
            portalDistance: 3,
            playerStartValue: 2,
            goldPerLevel: 10,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 5,
            spawnTurns: 3,
            name: 'Generated Level',
            description: 'Auto-generated level'
        };
        configs.push(config);
    }
    
    // If layout is provided, use it directly (new workflow)
    if (layout && Array.isArray(layout) && layout.length > 0) {
        // Validate layout
        const validation = validateLayout(layout, levelNumber);
        if (!validation.valid) {
            console.error(`Level ${levelNumber} layout validation failed:`, validation.errors);
            alert(`Level ${levelNumber} layout validation failed:\n${validation.errors.join('\n')}`);
            return;
        }
        
        // Count stats from layout
        const stats = countStatsFromLayout(layout);
        
        // Update config with stats from layout
        config.totalEnemyPower = stats.totalEnemyPower;
        config.enemyCount = stats.enemyCount;
        config.totalItemValue = stats.totalItemValue;
        config.itemCount = stats.itemCount;
        config.obstacleBox = stats.obstacleBox;
        config.obstacleLava = stats.obstacleLava;
        config.obstacleSwamp = stats.obstacleSwamp;
        config.obstacleCanon = stats.obstacleCanon;
        config.walkableCells = stats.walkableCells;
        
        // Update config with parameters (for name, description, etc.)
        if (parameters) {
            if (parameters.name) config.name = parameters.name;
            if (parameters.description) config.description = parameters.description;
            if (parameters.goldPerLevel !== undefined) config.goldPerLevel = parameters.goldPerLevel;
            if (parameters.goldPerBag !== undefined) config.goldPerBag = parameters.goldPerBag;
            if (parameters.minItems !== undefined) config.minItems = parameters.minItems;
            if (parameters.maxItems !== undefined) config.maxItems = parameters.maxItems;
            if (parameters.playerStartValue !== undefined) config.playerStartValue = parameters.playerStartValue;
            if (parameters.spawnTurns !== undefined) config.spawnTurns = parameters.spawnTurns;
        }
        
        // Update UI inputs with stats from layout
        const card = document.querySelector(`.level-param-card[data-level="${levelNumber}"]`);
        if (card) {
            const updateInput = (param, value) => {
                const input = card.querySelector(`.stat-value-edit[data-param="${param}"]`);
                if (input && value !== undefined) {
                    input.value = value;
                }
            };
            
            updateInput('totalEnemyPower', stats.totalEnemyPower);
            updateInput('enemyCount', stats.enemyCount);
            updateInput('totalItemValue', stats.totalItemValue);
            updateInput('itemCount', stats.itemCount);
            updateInput('obstacleBox', stats.obstacleBox);
            updateInput('obstacleLava', stats.obstacleLava);
            updateInput('obstacleSwamp', stats.obstacleSwamp);
            updateInput('obstacleCanon', stats.obstacleCanon);
            
            // Trigger update to recalculate difficulty
            updateLevelStatsFromInline(levelNumber);
        }
        
        // Create complete level object with layout from AI
        const completeLevel = {
            level: levelNumber,
            name: config.name,
            description: config.description,
            playerStartValue: config.playerStartValue || 2,
            goldPerLevel: config.goldPerLevel || 10,
            goldPerBag: config.goldPerBag || 5,
            minItems: config.minItems || 1,
            maxItems: config.maxItems || 5,
            spawnTurns: config.spawnTurns || 3,
            layout: layout, // Use layout directly from AI
            designIntent: designIntent || '',
            optimalStrategy: optimalStrategy || ''
        };
        
        // Update cache with complete level (both string and number keys)
        const cacheKey = String(levelNumber);
        generatedLevelsCache[cacheKey] = completeLevel;
        generatedLevelsCache[levelNumber] = completeLevel;
        
        // Save to localStorage
        saveGeneratedLevelsToStorage();
        
        // Update LEVEL_DESIGN.LEVELS in memory (not file yet)
        if (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) {
            const existingIndex = LEVEL_DESIGN.LEVELS.findIndex(l => l.level === levelNumber);
            if (existingIndex !== -1) {
                // Replace entire level with new one (including layout)
                LEVEL_DESIGN.LEVELS[existingIndex] = completeLevel;
            } else {
                // Add new level if not found
                LEVEL_DESIGN.LEVELS.push(completeLevel);
                LEVEL_DESIGN.LEVELS.sort((a, b) => a.level - b.level);
            }
        }
        
        // Update preview grid immediately
        updatePreviewGrid(levelNumber);
        
        // Re-render level card to show new layout and AI info
        renderLevelParametersList();
        
        console.log(`Level ${levelNumber} updated with AI layout. Stats counted from layout.`);
        return;
    }
    
    // Fallback: If no layout, use old workflow (generate from parameters)
    if (!parameters) {
        console.error('No parameters or layout in AI suggestion');
        return;
    }
    
    // Update config with AI parameters (this updates the cached config)
    if (parameters.totalEnemyPower !== undefined) config.totalEnemyPower = parameters.totalEnemyPower;
    if (parameters.enemyCount !== undefined) config.enemyCount = parameters.enemyCount;
    if (parameters.totalItemValue !== undefined) config.totalItemValue = parameters.totalItemValue;
    if (parameters.itemCount !== undefined) config.itemCount = parameters.itemCount;
    if (parameters.obstacleBox !== undefined) config.obstacleBox = parameters.obstacleBox;
    if (parameters.obstacleLava !== undefined) config.obstacleLava = parameters.obstacleLava;
    if (parameters.obstacleSwamp !== undefined) config.obstacleSwamp = parameters.obstacleSwamp;
    if (parameters.obstacleCanon !== undefined) config.obstacleCanon = parameters.obstacleCanon;
    if (parameters.walkableCells !== undefined) config.walkableCells = parameters.walkableCells;
    if (parameters.name) config.name = parameters.name;
    if (parameters.description) config.description = parameters.description;
    if (parameters.goldPerLevel !== undefined) config.goldPerLevel = parameters.goldPerLevel;
    if (parameters.goldPerBag !== undefined) config.goldPerBag = parameters.goldPerBag;
    if (parameters.minItems !== undefined) config.minItems = parameters.minItems;
    if (parameters.maxItems !== undefined) config.maxItems = parameters.maxItems;
    if (parameters.enemyMinDistance !== undefined) config.enemyMinDistance = parameters.enemyMinDistance;
    if (parameters.enemyMaxDistance !== undefined) config.enemyMaxDistance = parameters.enemyMaxDistance;
    if (parameters.itemMinDistance !== undefined) config.itemMinDistance = parameters.itemMinDistance;
    if (parameters.itemMaxDistance !== undefined) config.itemMaxDistance = parameters.itemMaxDistance;
    if (parameters.itemMinDistanceFromEnemy !== undefined) config.itemMinDistanceFromEnemy = parameters.itemMinDistanceFromEnemy;
    if (parameters.princessDistance !== undefined) config.princessDistance = parameters.princessDistance;
    if (parameters.portalDistance !== undefined) config.portalDistance = parameters.portalDistance;
    if (parameters.playerStartValue !== undefined) config.playerStartValue = parameters.playerStartValue;
    if (parameters.spawnTurns !== undefined) config.spawnTurns = parameters.spawnTurns;
    
    // Update UI inputs
    const card = document.querySelector(`.level-param-card[data-level="${levelNumber}"]`);
    if (card) {
        // Update inline inputs
        const updateInput = (param, value) => {
            const input = card.querySelector(`.stat-value-edit[data-param="${param}"]`);
            if (input && value !== undefined) {
                input.value = value;
            }
        };
        
        updateInput('totalEnemyPower', parameters.totalEnemyPower);
        updateInput('enemyCount', parameters.enemyCount);
        updateInput('totalItemValue', parameters.totalItemValue);
        updateInput('itemCount', parameters.itemCount);
        updateInput('obstacleBox', parameters.obstacleBox);
        updateInput('obstacleLava', parameters.obstacleLava);
        updateInput('obstacleSwamp', parameters.obstacleSwamp);
        updateInput('obstacleCanon', parameters.obstacleCanon);
        
        // Trigger update to recalculate difficulty
        updateLevelStatsFromInline(levelNumber);
    }
    
    // Clear cache to force regeneration with new parameters
    const cacheKey = String(levelNumber);
    delete generatedLevelsCache[cacheKey];
    delete generatedLevelsCache[levelNumber];
    
    // Regenerate level layout with new parameters (force regenerate)
    const newLevel = getOrGenerateLevel(levelNumber, true);
    if (newLevel && newLevel.layout) {
        // Create complete level object with AI metadata
        const completeLevel = {
            ...newLevel,
            level: levelNumber,
            name: parameters.name || config.name,
            description: parameters.description || config.description,
            playerStartValue: parameters.playerStartValue || config.playerStartValue || 2,
            goldPerLevel: parameters.goldPerLevel !== undefined ? parameters.goldPerLevel : config.goldPerLevel,
            goldPerBag: parameters.goldPerBag !== undefined ? parameters.goldPerBag : config.goldPerBag,
            minItems: parameters.minItems !== undefined ? parameters.minItems : config.minItems,
            maxItems: parameters.maxItems !== undefined ? parameters.maxItems : config.maxItems,
            spawnTurns: parameters.spawnTurns !== undefined ? parameters.spawnTurns : config.spawnTurns || 3,
            designIntent: designIntent || '',
            optimalStrategy: optimalStrategy || ''
        };
        
        // Update cache with complete level (both string and number keys)
        generatedLevelsCache[cacheKey] = completeLevel;
        generatedLevelsCache[levelNumber] = completeLevel;
        
        // Save to localStorage
        saveGeneratedLevelsToStorage();
        
        // Update LEVEL_DESIGN.LEVELS in memory (not file yet)
        if (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) {
            const existingIndex = LEVEL_DESIGN.LEVELS.findIndex(l => l.level === levelNumber);
            if (existingIndex !== -1) {
                // Replace entire level with new one (including layout)
                LEVEL_DESIGN.LEVELS[existingIndex] = completeLevel;
            } else {
                // Add new level if not found
                LEVEL_DESIGN.LEVELS.push(completeLevel);
                LEVEL_DESIGN.LEVELS.sort((a, b) => a.level - b.level);
            }
        }
        
        // Update preview grid immediately
        updatePreviewGrid(levelNumber);
        
        // Re-render level card to show new layout and AI info
        renderLevelParametersList();
        
        console.log(`Level ${levelNumber} updated with AI design. Layout regenerated from new parameters.`);
    } else {
        console.error(`Failed to generate level ${levelNumber} with new parameters`);
    }
}

/**
 * Handle AI Generate All - generate all 10 levels with AI in a single call
 */
async function handleAIGenerateAll() {
    if (typeof AI_LEVEL_DESIGNER === 'undefined') {
        alert('AI Level Designer module not loaded');
        return;
    }
    
    // Check API key
    const apiKey = AI_LEVEL_DESIGNER.getAPIKey();
    if (!apiKey) {
        const userKey = prompt('Please enter your OpenAI API key:');
        if (!userKey || !userKey.trim()) {
            alert('API key is required to generate levels with AI.');
            return;
        }
        AI_LEVEL_DESIGNER.setAPIKey(userKey);
    }
    
    if (!confirm('Generate all 10 levels with AI? This will update all level parameters and may take 30-60 seconds.')) {
        return;
    }
    
    // Show loading for all levels
    for (let i = 1; i <= 10; i++) {
        showAILoading(i, true);
        hideAIMessage(i);
    }
    
    try {
        // Generate all 10 levels in a single API call
        const levels = await AI_LEVEL_DESIGNER.generateAll10Levels();
        
        // Apply all level designs
        let successCount = 0;
        for (let i = 0; i < levels.length; i++) {
            const levelData = levels[i];
            const levelNumber = levelData.level || (i + 1);
            
            // Skip if level number is out of range
            if (levelNumber < 1 || levelNumber > 10) {
                console.warn(`Skipping level ${levelNumber} - out of range`);
                showAILoading(levelNumber, false);
                continue;
            }
            
            try {
                applyAISuggestion(levelNumber, {
                    parameters: levelData.parameters,
                    layout: levelData.layout || null, // Include layout if present
                    designIntent: levelData.designIntent || '',
                    optimalStrategy: levelData.optimalStrategy || ''
                });
                showAISuccess(levelNumber, 'AI design applied successfully!');
                successCount++;
            } catch (error) {
                console.error(`Error applying level ${levelNumber}:`, error);
                showAIError(levelNumber, error.message || 'Failed to apply design');
            }
            
            // Hide loading for this level
            showAILoading(levelNumber, false);
        }
        
        // Hide loading for any levels that weren't generated
        for (let i = levels.length; i < 10; i++) {
            showAILoading(i + 1, false);
        }
        
        // Re-render to show all updates
        renderLevelParametersList();
        
        if (successCount === 10) {
            alert('All 10 levels generated successfully! Review and save if satisfied.');
        } else {
            alert(`${successCount} out of ${levels.length} levels generated successfully. Some levels may have failed. Please review and try again if needed.`);
        }
        
    } catch (error) {
        console.error('AI generation error:', error);
        
        // Show error for all levels
        for (let i = 1; i <= 10; i++) {
            showAILoading(i, false);
            showAIError(i, error.message || 'Failed to generate levels');
        }
        
        alert(`AI generation failed: ${error.message}\n\nPlease check:\n1. Your OpenAI API key is correct\n2. You have sufficient API credits\n3. Your internet connection is stable`);
    }
}

/**
 * Load AI result from JSON file
 * @param {Object} data - JSON data with levels array
 */
function handleLoadAIResult(data) {
    if (!data || !data.levels || !Array.isArray(data.levels)) {
        alert('Invalid format: Expected JSON with "levels" array');
        return;
    }
    
    if (data.levels.length === 0) {
        alert('No levels found in file');
        return;
    }
    
    if (!confirm(`Load ${data.levels.length} levels from AI result? This will update all level parameters.`)) {
        return;
    }
    
    // Show loading for all levels
    for (let i = 1; i <= 10; i++) {
        showAILoading(i, true);
        hideAIMessage(i);
    }
    
    let successCount = 0;
    
    // Apply all level designs
    for (let i = 0; i < data.levels.length; i++) {
        const levelData = data.levels[i];
        const levelNumber = levelData.level || (i + 1);
        
        // Skip if level number is out of range
        if (levelNumber < 1 || levelNumber > 10) {
            console.warn(`Skipping level ${levelNumber} - out of range`);
            showAILoading(levelNumber, false);
            continue;
        }
        
        try {
            // Parse layout if it's a string (JSON stringified)
            let layout = levelData.layout;
            if (typeof layout === 'string') {
                try {
                    layout = JSON.parse(layout);
                } catch (e) {
                    console.warn(`Level ${levelNumber}: Failed to parse layout string, using as is`);
                }
            }
            
            // Ensure layout is a valid 2D array
            if (layout && !Array.isArray(layout)) {
                console.warn(`Level ${levelNumber}: Layout is not an array, skipping layout`);
                layout = null;
            } else if (layout && (!Array.isArray(layout[0]) || layout.length !== 10 || layout[0].length !== 8)) {
                console.warn(`Level ${levelNumber}: Layout has wrong dimensions (${layout.length}x${layout[0]?.length || 0}), expected 10x8`);
                // Still use it, but warn
            }
            
            applyAISuggestion(levelNumber, {
                parameters: levelData.parameters || {},
                layout: layout, // Include layout if present and valid
                designIntent: levelData.designIntent || '',
                optimalStrategy: levelData.optimalStrategy || ''
            });
            showAISuccess(levelNumber, 'AI design loaded successfully!');
            successCount++;
        } catch (error) {
            console.error(`Error applying level ${levelNumber}:`, error);
            showAIError(levelNumber, error.message || 'Failed to apply design');
        }
        
        // Hide loading for this level
        showAILoading(levelNumber, false);
    }
    
    // Hide loading for any levels that weren't in the file
    for (let i = data.levels.length; i < 10; i++) {
        showAILoading(i + 1, false);
    }
    
    // Re-render to show all updates
    renderLevelParametersList();
    
    if (successCount === data.levels.length) {
        alert(`Successfully loaded ${successCount} levels! Review and save if satisfied.`);
    } else {
        alert(`Loaded ${successCount} out of ${data.levels.length} levels. Some levels may have failed.`);
    }
}

/**
 * Show/hide AI loading state
 * @param {number} levelNumber - Level number
 * @param {boolean} show - Whether to show loading
 */
function showAILoading(levelNumber, show) {
    const loadingEl = document.getElementById(`aiLoading_${levelNumber}`);
    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
    }
}

/**
 * Show AI success message
 * @param {number} levelNumber - Level number
 * @param {string} message - Success message
 */
function showAISuccess(levelNumber, message) {
    const messageEl = document.getElementById(`aiMessage_${levelNumber}`);
    if (messageEl) {
        messageEl.className = 'level-ai-message ai-success';
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}

/**
 * Show AI error message
 * @param {number} levelNumber - Level number
 * @param {string} message - Error message
 */
function showAIError(levelNumber, message) {
    const messageEl = document.getElementById(`aiMessage_${levelNumber}`);
    if (messageEl) {
        messageEl.className = 'level-ai-message ai-error';
        messageEl.textContent = message;
        messageEl.style.display = 'block';
    }
}

/**
 * Hide AI message
 * @param {number} levelNumber - Level number
 */
function hideAIMessage(levelNumber) {
    const messageEl = document.getElementById(`aiMessage_${levelNumber}`);
    if (messageEl) {
        messageEl.style.display = 'none';
    }
}

// Start initialization
initializeLevelDesigner();

