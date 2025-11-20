// AI Level Designer - Direct OpenAI API Integration
// Generates all 10 levels in a single API call to optimize token usage

const AI_LEVEL_DESIGNER = {
    OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
    
    /**
     * Get OpenAI API key from localStorage or prompt user
     * @returns {string|null} - API key or null if not set
     */
    getAPIKey() {
        let apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            // Try to get from input field if available
            const input = document.getElementById('openaiApiKeyInput');
            if (input && input.value.trim()) {
                apiKey = input.value.trim();
                localStorage.setItem('openai_api_key', apiKey);
            }
        }
        return apiKey;
    },
    
    /**
     * Set OpenAI API key
     * @param {string} key - API key
     */
    setAPIKey(key) {
        if (key && key.trim()) {
            localStorage.setItem('openai_api_key', key.trim());
        }
    },
    
    /**
     * Generate all 10 levels in a single API call
     * @returns {Promise<Array>} - Array of 10 level designs with parameters, designIntent, and optimalStrategy
     */
    async generateAll10Levels() {
        const apiKey = this.getAPIKey();
        if (!apiKey) {
            throw new Error('OpenAI API key not set. Please enter your API key in the Level Designer.');
        }
        
        // Build comprehensive prompt for all 10 levels
        const prompt = this.buildPromptForAllLevels();
        
        try {
            const response = await fetch(this.OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert game level designer. Generate level designs as JSON. CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations, no text before or after JSON. The JSON must be perfectly formatted and parseable.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 8000,
                    response_format: { type: 'json_object' }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your OpenAI API key.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else {
                    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
                }
            }
            
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // Parse JSON response with robust error handling
            let parsed;
            try {
                // First, try direct parse
                parsed = JSON.parse(content);
            } catch (parseError) {
                console.log('Direct parse failed, trying to extract/repair JSON...');
                console.log('Parse error:', parseError.message);
                console.log('Content preview:', content.substring(0, 500));
                
                // Try to extract JSON from markdown code blocks
                let jsonText = content;
                const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
                if (jsonMatch) {
                    jsonText = jsonMatch[1];
                } else {
                    // Try to find JSON object in text (find first { to last })
                    const firstBrace = content.indexOf('{');
                    const lastBrace = content.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        jsonText = content.substring(firstBrace, lastBrace + 1);
                    }
                }
                
                // Try to repair common JSON issues
                jsonText = this.repairJSON(jsonText);
                
                try {
                    parsed = JSON.parse(jsonText);
                } catch (repairError) {
                    console.error('JSON repair failed:', repairError.message);
                    console.error('JSON text length:', jsonText.length);
                    console.error('JSON preview:', jsonText.substring(0, 1000));
                    console.error('JSON around error position:', jsonText.substring(Math.max(0, 16900), Math.min(jsonText.length, 17100)));
                    throw new Error(`Failed to parse JSON: ${repairError.message}. The AI response may be malformed. Please try again.`);
                }
            }
            
            // Validate response structure
            if (!parsed.levels || !Array.isArray(parsed.levels)) {
                // Try alternative structure - maybe levels are at root
                if (Array.isArray(parsed)) {
                    parsed = { levels: parsed };
                } else {
                    throw new Error('Invalid response format: expected "levels" array. Got: ' + JSON.stringify(Object.keys(parsed || {})));
                }
            }
            
            if (parsed.levels.length !== 10) {
                console.warn(`Expected 10 levels, got ${parsed.levels.length}. Attempting to use available levels.`);
                // If we have fewer than 10, we can still proceed but warn
                if (parsed.levels.length === 0) {
                    throw new Error('No levels found in response');
                }
            }
            
            // Validate and clean each level
            const validLevels = [];
            for (let i = 0; i < parsed.levels.length; i++) {
                const level = parsed.levels[i];
                
                // Skip invalid levels but log them
                if (!level || typeof level !== 'object') {
                    console.warn(`Level ${i + 1} is invalid (not an object), skipping`);
                    continue;
                }
                
                // Extract layout - handle both direct array and stringified JSON
                let layout = level.layout;
                if (typeof layout === 'string') {
                    try {
                        layout = JSON.parse(layout);
                    } catch (e) {
                        console.warn(`Level ${i + 1}: Failed to parse layout string, skipping layout`);
                        layout = null;
                    }
                }
                
                // Validate layout is a 2D array
                if (layout !== null && layout !== undefined) {
                    if (!Array.isArray(layout) || layout.length === 0 || !Array.isArray(layout[0])) {
                        console.warn(`Level ${i + 1}: Layout is not a valid 2D array, skipping layout`);
                        layout = null;
                    }
                }
                
                // Ensure required fields exist (with defaults if missing)
                const validLevel = {
                    level: level.level || (i + 1),
                    parameters: level.parameters || {},
                    layout: layout || null, // Include layout if present
                    designIntent: level.designIntent || '',
                    optimalStrategy: level.optimalStrategy || ''
                };
                
                // Validate parameters object
                if (!validLevel.parameters || typeof validLevel.parameters !== 'object') {
                    console.warn(`Level ${validLevel.level} has invalid parameters, using defaults`);
                    validLevel.parameters = {};
                }
                
                validLevels.push(validLevel);
            }
            
            if (validLevels.length === 0) {
                throw new Error('No valid levels found in response after validation');
            }
            
            if (validLevels.length < 10) {
                console.warn(`Only ${validLevels.length} valid levels found. Expected 10.`);
            }
            
            return validLevels;
            
        } catch (error) {
            if (error.message.includes('API key')) {
                throw error;
            }
            if (error.message.includes('rate limit')) {
                throw error;
            }
            throw new Error(`AI generation failed: ${error.message}`);
        }
    },
    
    /**
     * Build comprehensive prompt for all 10 levels
     * @returns {string} - Complete prompt
     */
    buildPromptForAllLevels() {
        // Get existing levels for context (if any)
        const existingLevels = this.getAllExistingLevels();
        
        return `You are an expert game level designer specializing in dice-based tactical grid games. Design all 10 levels (levels 1-10) with deep understanding of gameplay mechanics, player psychology, and strategic progression.

=== CORE GAMEPLAY MECHANICS ===

**Game Loop:**
1. Player rolls dice (A-B) to move on an 8x10 grid, A is the minimum roll, B is the maximum roll, A and B can be increased by items or upgrades
2. Player collects items to increase their value (combat power)
3. Player fights enemies in turn-based combat (dice-based damage)
4. Player rescues princess to complete level
5. Player earns gold to upgrade between levels

**Combat System:**
- Turn-based dice combat: Player and enemy alternate rolling dice
- Damage = dice roll value (player rolls 1 to their current value, enemy rolls 1 to their value)
- Higher roll wins the turn and deals damage
- Player starts with value 2 (can roll 1-2 damage)
- Items increase player value (e.g., +1 item → player value becomes 3, can roll 1-3 damage)
- Combat continues until one side reaches 0 HP
- Player dies if HP reaches 0 → Game Over

**Movement System:**
- Player rolls dice (1-2) each turn to get movement points
- Player moves on grid using movement points
- Enemies move toward player on their turn
- Strategic positioning matters: avoid multiple enemies, plan routes

**Obstacle Types:**
- **Box (B)**: Blocks movement completely - creates pathfinding challenges
- **Lava (L)**: Deals 1 damage when stepped on - teaches risk/reward pathfinding
- **Swamp (S)**: Deals 2 damage when stepped on - more dangerous, requires careful routing
- **Canon (C)**: Teleports player to chosen location - advanced tactical tool

**Item System:**
- Items increase player value (combat power)
- Items are essential for survival - players must collect before fighting
- Item placement creates strategic decisions: risk vs reward
- Items spawn randomly during gameplay (minItems to maxItems range)

**Enemy Behavior:**
- Enemies move toward player each turn
- Enemies attack player if adjacent
- Multiple enemies = dangerous - player must plan route carefully
- Enemy value determines their combat power (HP and damage range)

**Progression Philosophy:**
- **Level 1 (Tutorial)**: Introduce core loop gently - safe to experiment
- **Levels 2-3 (Intro)**: Introduce new mechanics - moderate difficulty
- **Levels 4-6 (Practice)**: Reinforce learned mechanics - increased challenge
- **Levels 7-9 (Mastery)**: Test all skills - high difficulty, requires optimal play
- **Level 10 (Climax)**: Ultimate challenge - demands complete mastery

=== PROGRESSION CONTEXT ===
${existingLevels.length > 0 ? 
    `**Existing Levels:**
${existingLevels.map(l => `  Level ${l.level} "${l.name}": ${l.enemyCount} enemies (${l.totalEnemyPower} power), ${l.totalItemValue || 0} item value`).join('\n')}` :
    '**No existing levels** - Design from scratch with smooth progression curve'}

=== YOUR DESIGN TASK ===

Design all 10 levels (levels 1-10) as an experienced game designer with a deep understanding of game design principles and mechanics. 
Also you need to care about the progression that keeps player engaged and motivated to play the game. Also you need to care about the difficulty curve that is not too easy or too hard.
You need to have a clear mindset about content unlocked timing, choose the best timing to unlock the content to keep player engaged and motivated to play the game.

**Design Principles for Each Level:**
1. **Enemy Parameters**: totalEnemyPower (sum of all enemy values), enemyCount, enemyMinDistance (2-4), enemyMaxDistance (5-9)
2. **Item Parameters**: totalItemValue (50-70% of enemy power), itemCount, itemMinDistance (1-2), itemMaxDistance (4-8), itemMinDistanceFromEnemy (0-2)
3. **Obstacle Parameters**: obstacleBox (2-20, scales with level), obstacleLava (0-8, introduce at 2-3), obstacleSwamp (0-6, introduce at 4-5), obstacleCanon (0-4, introduce at 6-7)
4. **Spatial Parameters**: walkableCells (32-48, 40-60% of 80 cells), princessDistance (4-10), portalDistance (2-5)
5. **Economy Parameters**: goldPerLevel (10-50), goldPerBag (5-15), minItems (1-3), maxItems (2-7)
6. **Design Intent**: 2-3 paragraphs explaining level purpose, player experience, and design philosophy
7. **Optimal Strategy**: 3-4 paragraphs with phases (Opening, Item Collection, Combat, Objective, Key Principles)

=== LAYOUT FORMAT (CRITICAL) ===

You MUST generate a complete 2D layout array for each level. The layout is an 8x10 grid (8 columns width, 10 rows height) represented as a 2D array.

**Layout Cell Symbols:**
- **'P'**: Player starting position (EXACTLY ONE per level)
- **'R'**: Princess position (EXACTLY ONE per level - must be rescued to complete level)
- **Negative numbers** (-1, -3, -5, -8, etc.): Enemies (value = absolute value, e.g., -3 = enemy with value 3)
- **Positive numbers** (1, 2, 3, 5, etc.): Items (value = the number, e.g., 3 = item with value 3)
- **'B'**: Box obstacle (blocks movement completely)
- **'L'**: Lava (deals 1 damage when stepped on)
- **'S'**: Swamp (deals 2 damage when stepped on)
- **'C'**: Canon (teleports player to chosen location)
- **0, '.', or ' '**: Empty walkable cell

**Layout Requirements:**
1. Grid size: 8 columns × 10 rows (width × height)
2. Must have EXACTLY 1 'P' (player start)
3. Must have EXACTLY 1 'R' (princess)
4. All rows must have exactly 8 columns
5. Create interesting maze-like layouts with strategic enemy/item placement
6. Use obstacles to create pathfinding challenges
7. Ensure there is a valid path from 'P' to 'R' (not completely blocked by 'B' obstacles)

**Layout Example:**
[
  ["B", "B", "B", "B", "B", "B", "B", "B"],
  ["B", "B", "B", "B", "B", "B", "B", "B"],
  ["B", "B", "B", "B", "B", "B", "B", "B"],
  ["B", "B", -1, 0, 0, "R", "B", "B"],
  ["B", "B", 0, 0, 0, 0, "B", "B"],
  ["B", "B", 0, 1, 0, 0, "B", "B"],
  ["B", "B", "P", 0, 0, 0, "B", "B"],
  ["B", "B", "B", "B", "B", "B", "B", "B"],
  ["B", "B", "B", "B", "B", "B", "B", "B"],
  ["B", "B", "B", "B", "B", "B", "B", "B"]
]

=== OUTPUT FORMAT ===

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations, no text before or after. The JSON must be perfectly formatted and parseable.

Return a JSON object with this exact structure:

{
  "levels": [
    {
      "level": 1,
      "parameters": {
        "level": 1,
        "name": "Creative level name",
        "description": "One-line description",
        "gridWidth": 8,
        "gridHeight": 10,
        "walkableCells": <32-48>,
        "totalEnemyPower": <number>,
        "enemyCount": <number>,
        "enemyMinDistance": <2-4>,
        "enemyMaxDistance": <5-9>,
        "totalItemValue": <50-70% of totalEnemyPower>,
        "itemCount": <number>,
        "itemMinDistance": <1-2>,
        "itemMaxDistance": <4-8>,
        "itemMinDistanceFromEnemy": <0-2>,
        "obstacleBox": <2-20>,
        "obstacleLava": <0-8>,
        "obstacleSwamp": <0-6>,
        "obstacleCanon": <0-4>,
        "princessDistance": <4-10>,
        "portalDistance": <2-5>,
        "playerStartValue": 2,
        "goldPerLevel": <10-50>,
        "goldPerBag": <5-15>,
        "minItems": <1-3>,
        "maxItems": <2-7>,
        "spawnTurns": 3
      },
      "layout": [
        ["B", "B", "B", "B", "B", "B", "B", "B"],
        ["B", "B", "B", "B", "B", "B", "B", "B"],
        ["B", "B", "B", "B", "B", "B", "B", "B"],
        ["B", "B", -1, 0, 0, "R", "B", "B"],
        ["B", "B", 0, 0, 0, 0, "B", "B"],
        ["B", "B", 0, 1, 0, 0, "B", "B"],
        ["B", "B", "P", 0, 0, 0, "B", "B"],
        ["B", "B", "B", "B", "B", "B", "B", "B"],
        ["B", "B", "B", "B", "B", "B", "B", "B"],
        ["B", "B", "B", "B", "B", "B", "B", "B"]
      ],
      "designIntent": "2-3 paragraphs explaining level purpose, player experience, and design philosophy",
      "optimalStrategy": "3-4 paragraphs with phases: Opening, Item Collection, Combat, Objective, Key Principles"
    },
    // ... repeat for levels 2-10
  ]
}

CRITICAL: Each level MUST include a "layout" field with a complete 8x10 2D array. The layout must have exactly 1 'P' and exactly 1 'R'.

Remember: Make thoughtful decisions based on game design principles. Each level should have a clear purpose and teach/challenge specific skills. Ensure smooth difficulty progression from level 1 (tutorial) to level 10 (climax).

CRITICAL REMINDER: Return ONLY valid JSON. No markdown formatting, no code blocks, no explanations. Start with { and end with }. Ensure all arrays and objects are properly closed. All strings must be properly quoted and escaped.`;
    },
    
    /**
     * Get all existing levels for context
     * @returns {Array} - Array of existing level data
     */
    getAllExistingLevels() {
        const existingLevels = [];
        
        if (typeof LEVEL_DESIGN !== 'undefined' && LEVEL_DESIGN.LEVELS) {
            LEVEL_DESIGN.LEVELS.forEach(level => {
                if (level.level >= 1 && level.level <= 10) {
                    const stats = this.calculateLevelStats(level);
                    existingLevels.push({
                        level: level.level,
                        name: level.name,
                        totalEnemyPower: stats.totalEnemyPower,
                        enemyCount: stats.enemyCount,
                        totalItemValue: stats.totalItemValue,
                        itemCount: stats.itemCount,
                        obstacleBox: stats.obstacleBox,
                        obstacleLava: stats.obstacleLava,
                        obstacleSwamp: stats.obstacleSwamp,
                        obstacleCanon: stats.obstacleCanon,
                        walkableCells: stats.walkableCells
                    });
                }
            });
        }
        
        return existingLevels;
    },
    
    /**
     * Calculate stats from level layout
     * @param {Object} level - Level object with layout
     * @returns {Object} - Calculated stats
     */
    calculateLevelStats(level) {
        if (!level.layout) {
            return {
                totalEnemyPower: 0,
                enemyCount: 0,
                totalItemValue: 0,
                itemCount: 0,
                obstacleBox: 0,
                obstacleLava: 0,
                obstacleSwamp: 0,
                obstacleCanon: 0,
                walkableCells: 0
            };
        }
        
        let totalEnemyPower = 0;
        let enemyCount = 0;
        let totalItemValue = 0;
        let itemCount = 0;
        let obstacleBox = 0;
        let obstacleLava = 0;
        let obstacleSwamp = 0;
        let obstacleCanon = 0;
        let walkableCells = 0;
        
        level.layout.forEach(row => {
            row.forEach(cell => {
                if (typeof cell === 'number') {
                    if (cell < 0) {
                        totalEnemyPower += Math.abs(cell);
                        enemyCount++;
                    } else if (cell > 0) {
                        totalItemValue += cell;
                        itemCount++;
                    } else {
                        walkableCells++;
                    }
                } else if (cell === 'B') {
                    obstacleBox++;
                } else if (cell === 'L') {
                    obstacleLava++;
                } else if (cell === 'S') {
                    obstacleSwamp++;
                } else if (cell === 'C') {
                    obstacleCanon++;
                } else if (cell === 0 || cell === '.' || cell === ' ' || cell === 'P' || cell === 'R') {
                    walkableCells++;
                }
            });
        });
        
        return {
            totalEnemyPower,
            enemyCount,
            totalItemValue,
            itemCount,
            obstacleBox,
            obstacleLava,
            obstacleSwamp,
            obstacleCanon,
            walkableCells
        };
    },
    
    /**
     * Try to repair common JSON issues, especially truncated strings
     * @param {string} jsonText - Potentially malformed JSON
     * @returns {string} - Repaired JSON (may still be invalid)
     */
    repairJSON(jsonText) {
        let repaired = jsonText.trim();
        
        // Remove trailing commas before } or ]
        repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix truncated strings - find unclosed strings and close them
        let i = 0;
        let inString = false;
        let escapeNext = false;
        const result = [];
        
        while (i < repaired.length) {
            const char = repaired[i];
            
            if (escapeNext) {
                result.push(char);
                escapeNext = false;
                i++;
                continue;
            }
            
            if (char === '\\') {
                escapeNext = true;
                result.push(char);
                i++;
                continue;
            }
            
            if (char === '"') {
                inString = !inString;
                result.push(char);
                i++;
                continue;
            }
            
            result.push(char);
            i++;
        }
        
        // If we ended in a string, close it
        if (inString) {
            result.push('"');
        }
        
        repaired = result.join('');
        
        // Now try to close any unclosed objects/arrays
        // Find the last complete structure and close everything after it
        let depth = 0;
        let bracketDepth = 0;
        let lastValidPos = -1;
        inString = false;
        escapeNext = false;
        
        for (let i = 0; i < repaired.length; i++) {
            const char = repaired[i];
            
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            
            if (char === '"') {
                inString = !inString;
                continue;
            }
            
            if (inString) continue;
            
            if (char === '{') {
                depth++;
                lastValidPos = i;
            } else if (char === '}') {
                depth--;
                lastValidPos = i;
            } else if (char === '[') {
                bracketDepth++;
                lastValidPos = i;
            } else if (char === ']') {
                bracketDepth--;
                lastValidPos = i;
            }
        }
        
        // If we have unclosed structures, try to close them
        // But first, check if we're in the middle of a string value
        // Look for patterns like "designIntent": "text that was cut
        const designIntentMatch = repaired.match(/"designIntent"\s*:\s*"([^"]*)$/);
        const optimalStrategyMatch = repaired.match(/"optimalStrategy"\s*:\s*"([^"]*)$/);
        
        if (designIntentMatch || optimalStrategyMatch) {
            // We're in the middle of a string value, close it and add default
            if (designIntentMatch) {
                const before = repaired.substring(0, designIntentMatch.index + designIntentMatch[0].length);
                repaired = before + '"';
            }
            if (optimalStrategyMatch) {
                const before = repaired.substring(0, optimalStrategyMatch.index + optimalStrategyMatch[0].length);
                repaired = before + '"';
            }
        }
        
        // Close any unclosed objects/arrays
        while (depth > 0) {
            repaired += '}';
            depth--;
        }
        while (bracketDepth > 0) {
            repaired += ']';
            bracketDepth--;
        }
        
        return repaired;
    }
};
