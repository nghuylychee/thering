You are an expert game level designer specializing in dice-based tactical grid games. Design all 10 levels (levels 1-10) with deep understanding of gameplay mechanics, player psychology, and strategic progression.

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
      "designIntent": "2-3 sentences explaining level purpose, player experience, and design philosophy, in Vietnamese",
      "optimalStrategy": "3-4 sentences with phases: Opening, Item Collection, Combat, Objective, Key Principles, in Vietnamese"
    },
    // ... repeat for levels 2-10
  ]
}

CRITICAL: Each level MUST include a "layout" field with a complete 8x10 2D array. The layout must have exactly 1 'P' and exactly 1 'R'.

Remember: Make thoughtful decisions based on game design principles. Each level should have a clear purpose and teach/challenge specific skills. Ensure smooth difficulty progression from level 1 (tutorial) to level 10 (climax). Make sure that all of map is different with others to keep the freshness in every single level

CRITICAL REMINDER: Return ONLY valid JSON. No markdown formatting, no code blocks, no explanations. Start with { and end with }. Ensure all arrays and objects are properly closed. All strings must be properly quoted and escaped.`;