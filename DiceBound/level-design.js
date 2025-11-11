// DiceBound Level Design Configuration
// Level Design Format:
// - 'P' = Player starting position
// - Negative numbers (-1, -3, -5, -8, etc.) = Enemy (value = abs(number), icon auto-assigned)
// - Positive numbers (1, 2, 3, 5, etc.) = Item (value = number, icon auto-assigned)
// - 'B' = Box (obstacle)
// - 'L' = Lava
// - 'S' = Swamp
// - 'C' = Canon
// - '.' or ' ' or 0 = Empty cell

const LEVEL_DESIGN = {
    LEVELS: [
        // ========== LEVEL 1-5: TUTORIAL/EASY (Harder now - base dice 1-2) ==========
        {
            level: 1,
            name: 'Dungeon Entrance',
            playerStartValue: 2,
            description: 'Enter the dark dungeon - your first challenge awaits',
            goldPerLevel: 10,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 1,
            spawnTurns: 3,
            layout: [
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", -1, 0, 0, 0, "B", "B"],
                ["B", "B", 0, 0, 0, 0, "B", "B"],
                ["B", "B", 0, 1, 0, 0, "B", "B"],
                ["B", "B", "P", 0, 0, 0, "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"]
            ]            
        },
        {
            level: 2,
            name: 'Barrel Maze',
            playerStartValue: 2,
            description: 'Navigate through cluttered barrels and monsters',
            goldPerLevel: 12,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 2,
            spawnTurns: 3,
            layout: [
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", 0, 0, 0, 0, 0, 0, "B"],
                ["B", 0, -2, 0, 0, 0, -2, "B"],
                ["B", 0, 0, 1, 0, 0, 0, "B"],
                ["B", 0, 0, 0, 0, 1, 0, "B"],
                ["B", 0, "P", 0, 0, 0, 0, "B"],
                ["B", 0, 0, 0, 0, 0, 0, "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"]
            ]            
        },
        {
            level: 3,
            name: 'Goblin Den',
            playerStartValue: 2,
            description: 'Face hordes of goblins and rats',
            goldPerLevel: 15,
            goldPerBag: 5,
            minItems: 1,
            maxItems: 3,
            spawnTurns: 3,
            layout: [
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", 0, 0, 0, 0, 0, "P", "B"],
                ["B", 0, -3, 0, 0, 0, 0, "B"],
                ["B", 0, 0, 1, 0, 1, 0, "B"],
                ["B", 0, 0, 0, 0, 0, 0, "B"],
                ["B", 0, 0, 0, -3, 0, 0, "B"],
                ["B", 0, 1, 0, 0, 0, 0, "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"]
            ]            
        },
        {
            level: 4,
            name: 'Cluttered Corridor',
            playerStartValue: 2,
            description: 'Tight spaces filled with barrels and orcs',
            goldPerLevel: 18,
            goldPerBag: 6,
            minItems: 2,
            maxItems: 4,
            spawnTurns: 3,
            layout: [
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", -4, 0, 1, 0, 0, -4, "B"],
                ["B", 0, 0, 0, 0, 0, 0, "B"],
                ["B", 1, 0, 0, "P", 0, 0, "B"],
                ["B", 0, 0, 0, 0, 0, 1, "B"],
                ["B", 0, 0, 0, 0, 0, 0, "B"],
                ["B", -4, 0, 1, 0, 0, -4, "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"]
            ]            
        },
        {
            level: 5,
            name: 'Fire Chamber',
            playerStartValue: 2,
            description: 'Beware the fire pits and dangerous monsters',
            goldPerLevel: 20,
            goldPerBag: 6,
            minItems: 2,
            maxItems: 5,
            spawnTurns: 3,
            layout: [
                ["B", "B", "B", "B", "B", "B", "B", "B"],
                ["B", 1, 0, 0, 0, 0, 1, "B"],
                ["B", "B", "B", 0, "B", "B", "B", "B"],
                ["B", 0, -4, 0, 0, -3, 0, "B"],
                ["B", 0, 0, 0, 0, 0, 0, "B"],
                ["B", 0, 0, 0, 0, 0, 0, "B"],
                ["B", 0, -3, 0, 0, -4, 0, "B"],
                ["B", "B", "B", 0, "B", "B", "B", "B"],
                ["B", 1, 0, 0, 0, 1, "P", "B"],
                ["B", "B", "B", "B", "B", "B", "B", "B"]
            ]            
        },
        
        // ========== LEVEL 6-10: MEDIUM (Much harder now) ==========
        {
            level: 6,
            name: 'Monster Lair',
            playerStartValue: 2,
            description: 'Multiple paths filled with dangerous creatures',
            goldPerLevel: 25,
            goldPerBag: 7,
            minItems: 2,
            maxItems: 6,
            spawnTurns: 3,
            layout: [
                [-4, "B", "B", "B", "B", "B", -6, 0],
                [0, 0, 0, 1, 0, 0, 0, 0],
                ["B", "B", "B", 0, "B", "B", "B", "B"],
                [1, 0, 0, 0, 0, 0, 0, 1],
                ["B", "B", "B", 0, 0, 0, "B", "B"],
                [1, 0, 0, 0, 0, 0, 0, 1],
                ["B", 0, "B", 0, "B", "B", "B", "B"],
                [0, "B", 0, 1, 0, 0, 0, 0],
                [1, "B", "B", "B", "B", "B", "B", 0],
                [-2, 0, 0, 0, "P", 0, 0, -1]
            ]            
        },
        {
            level: 7,
            name: 'Poison Pools',
            playerStartValue: 2,
            description: 'Toxic waters and swarms of monsters',
            goldPerLevel: 28,
            goldPerBag: 7,
            minItems: 2,
            maxItems: 7,
            spawnTurns: 3,
            layout: [
                [1, "B", 0, "B", 0, 0, 1, 0],
                [0, "B", 0, 1, 1, "B", 0, 0],
                [-5, "B", "B", 0, 0, "B", "B", -6],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-4, 0, 0, 0, 0, 0, 0, -3],
                [0, 0, 1, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-1, "B", "B", 0, 0, "B", "B", -2],
                [0, "B", 0, 0, "B", 0, 0, 0],
                [1, "B", 0, "P", "B", 0, 0, 1]
            ]            
        },
        {
            level: 8,
            name: 'Teleport Runes',
            playerStartValue: 2,
            description: 'Magic runes and closing enemies',
            goldPerLevel: 32,
            goldPerBag: 8,
            minItems: 2,
            maxItems: 8,
            spawnTurns: 3,
            layout: [
                [-5, 0, 0, 0, 0, 0, 0, -5],
                [0, "B", 0, "B", "B", "B", "B", 0],
                [0, "B", -2, 0, 0, 1, "B", 0],
                [0, "B", 0, "B", 0, "B", 0, 0],
                [0, "B", 0, 1, 1, 0, "B", 0],
                [0, "B", 0, 1, 1, 0, "B", 0],
                [0, "B", "B", "B", 0, "B", 0, 0],
                [0, "B", 1, 0, 0, -2, "B", 0],
                [0, "B", "B", "B", "B", 0, "B", 0],
                [-3, 0, 0, 0, 0, 0, 0, -3]
            ]            
        },
        {
            level: 9,
            name: 'Dungeon Maze',
            playerStartValue: 2,
            description: 'Complex maze with obstacles and monsters',
            goldPerLevel: 35,
            goldPerBag: 8,
            minItems: 3,
            maxItems: 9,
            spawnTurns: 3,
            layout: [
                [1, 1, 0, 0, 0, 0, 0, -6],
                ["B", "B", 0, 0, 0, 0, "B", "B"],
                ["B", 0, "B", 1, "B", 1, "B", 0],
                ["B", 0, "B", 0, 0, "B", 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, "B", 1, "B", 1, "B", 1, "B"],
                [0, "B", 0, "B", 0, "B", 0, "B"],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, "B", 0, "B", 0, "B", 0, "B"],
                [-4, "B", -4, "B", "P", "B", -4, "B"]
              ]              
        },
        {
            level: 10,
            name: 'Dragon\'s Lair',
            playerStartValue: 2,
            description: 'Face the first dragon and its minions',
            goldPerLevel: 40,
            goldPerBag: 10,
            minItems: 3,
            maxItems: 10,
            spawnTurns: 3,
            layout: [
                ["B", -6, 0, 0, 0, 0, -6, "B"],
                [-3, "B", 0, 0, 0, 0, "B", -3],
                [0, "B", 1, 0, 0, 0, 1, "B"],
                [0, 1, "B", 0, 0, 0, "B", 1],
                [0, 0, "B", 0, 0, 0, "B", 0],
                [-3, 0, 1, "P", 0, 1, 0, -6],
                [0, "B", 0, 0, 0, "B", 0, 0],
                [0, "B", 0, 0, 0, "B", 0, 0],
                [-3, "B", 0, 0, 0, 0, "B", -3],
                ["B", -6, 0, 0, 0, 0, -6, "B"]
              ]              
        },
        
    ]
};

// Attach LEVELS to CONFIG for backward compatibility
if (typeof CONFIG !== 'undefined') {
    CONFIG.LEVELS = LEVEL_DESIGN.LEVELS;
}
