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
            name: 'First Steps',
            playerStartValue: 2,
            description: 'Learn the basics - immediate enemy threat',
            goldPerLevel: 10,
            goldPerBag: 5,
            minItems: 3,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0, 0],  // Item nearby
                [0, 0, 0, 0, -1, 0, 0, 0],  // Enemy right side
                [0, 0, 0, 0, 0, 0, 0, 0],  // Gold bag
                [0, 0, 0, 0, 0, 0, 0, 0],  // Item mid-left
                [0, 0, -1, 0, 0, 0, -1, 0],  // Enemies mid-left and mid-right
                [0, 0, 0, 0, 0, 0, 0, 0],  // Item mid-right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, -1, 0, 0, 0, 0, 0, 0],  // Enemy left side
                [0, 0, 0, 0, 0, 0, 0, 0]  // Item bottom-right
            ]
        },
        {
            level: 2,
            name: 'Obstacle Course',
            playerStartValue: 2,
            description: 'Boxes + enemies - navigate carefully',
            goldPerLevel: 12,
            goldPerBag: 5,
            minItems: 3,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 'B', 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 'B', 0],
                [0, 0, 0, 0, 'B', 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, -1, 0, 0, 0, 0, -3, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, -1, -3, 0, -3, -3, 0, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 3,
            name: 'Mixed Threats',
            playerStartValue: 2,
            description: 'Weak + Normal enemies - enemies closer',
            goldPerLevel: 15,
            goldPerBag: 5,
            minItems: 3,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 'B', 0, 0, 0, 0],
                [0, 0, 0, 0, -1, 0, 0, 0],  // Enemy mid-top
                [0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, -3, 0, 0],  // Enemy mid-right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, -3, 0, 0, 0, 0, 0, 0],  // Enemy left side
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, -3, 0, -5, 0, 0, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 4,
            name: 'Tight Spaces',
            playerStartValue: 2,
            description: 'More obstacles + enemies closing in',
            goldPerLevel: 18,
            goldPerBag: 6,
            minItems: 4,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 'B', 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 'B', 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, -3, 0, 0, 0, 0, -3, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, -3, -5, 0, -5, -5, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 5,
            name: 'Lava Fields',
            playerStartValue: 2,
            description: 'Lava + enemies - high pressure!',
            goldPerLevel: 20,
            goldPerBag: 6,
            minItems: 4,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 0],
                [0, 0, 'B', 0, 'L', 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 'L', 0, 0],
                [0, -3, 0, 0, 0, 0, -3, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, -5, -5, 0, -5, -8, 0]  // Enemies scattered bottom + gold
            ]
        },
        
        // ========== LEVEL 6-10: MEDIUM (Much harder now) ==========
        {
            level: 6,
            name: 'Three Way Split',
            playerStartValue: 2,
            description: 'Multiple enemies - high pressure!',
            goldPerLevel: 25,
            goldPerBag: 7,
            minItems: 4,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 'B', 0, 0, 0, 'B', 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, -1, 0, 0, 0, 0, -3, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-3, 0, -5, -5, 0, -5, -8, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 7,
            name: 'Swamp Danger',
            playerStartValue: 2,
            description: 'Swamp + many enemies - extreme danger!',
            goldPerLevel: 28,
            goldPerBag: 7,
            minItems: 4,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 'B', 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 'S', 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, -3, 0, 0, 0, 0, -3, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, -5, -5, 0, -5, -8, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 8,
            name: 'Canon Jump',
            playerStartValue: 2,
            description: 'Canon + enemies closing in',
            goldPerLevel: 32,
            goldPerBag: 8,
            minItems: 5,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 'B', 0, 0, 0, 'B', 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, -3, 0, 0, 0, 0, -5, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 'C', 0],  // Canon
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, -5, 0, -8, -8, 0, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 9,
            name: 'Maze Runner',
            playerStartValue: 2,
            description: 'Complex obstacles + enemies everywhere',
            goldPerLevel: 35,
            goldPerBag: 8,
            minItems: 5,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 'B', 0, 0],
                [0, 0, 0, 'B', 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-3, 0, 0, 0, 0, 0, -3, 0],  // Enemies left and right
                [0, 0, -5, -5, 0, -8, -8, -8]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 10,
            name: 'First Boss',
            playerStartValue: 2,
            description: 'Boss + strong enemies - ultimate challenge!',
            goldPerLevel: 40,
            goldPerBag: 10,
            minItems: 5,
            spawnTurns: 3,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, -5, 0, 0, 0, 0, -5, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, -8, -8, 0, -8, -8, 0]  // Enemies scattered bottom + gold
            ]
        },
        
        // ========== LEVEL 11-15: HARD (Brutal now) ==========
        {
            level: 11,
            name: 'Death Trap',
            playerStartValue: 2,
            description: 'Lava + swamp + many enemies - nightmare!',
            goldPerLevel: 45,
            goldPerBag: 10,
            minItems: 5,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 'B', 0, 'L', 0, 'B', 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 'S', 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-3, 0, 0, 0, 0, 0, -5, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, -5, -5, 0, -8, -8, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 12,
            name: 'Elite Guard',
            playerStartValue: 2,
            description: 'All strong enemies - no mercy!',
            goldPerLevel: 50,
            goldPerBag: 12,
            minItems: 6,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 'B', 0, 'B', 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, 0, 0, 0, 0, -5, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, -8, -8, 0, -8, 0, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 13,
            name: 'Boss Duo',
            playerStartValue: 2,
            description: 'Two bosses + strong enemies - impossible?',
            goldPerLevel: 55,
            goldPerBag: 12,
            minItems: 6,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 'B', 0, 0, 0, 'B', 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, 0, 0, 0, 0, -5, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-8, 0, -8, -8, 0, -8, 0, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 14,
            name: 'Chaos Maze',
            playerStartValue: 2,
            description: 'All hazards + enemies swarm - chaos!',
            goldPerLevel: 58,
            goldPerBag: 15,
            minItems: 6,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 'B', 0, 0],
                [0, 0, 0, 'L', 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 'S', 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 0, 0, 0],
                [-5, 0, 0, 0, 0, 0, -5, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-8, 0, -8, -8, 0, -8, 0, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 15,
            name: 'Mid Game Climax',
            playerStartValue: 2,
            description: 'Boss rush - multiple bosses!',
            goldPerLevel: 60,
            goldPerBag: 15,
            minItems: 7,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 'B', 0, 0, 0, 'B', 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, 0, 0, 0, 0, -8, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-8, 0, -8, -8, 0, -8, -8, 0]  // Enemies scattered bottom + gold
            ]
        },
        
        // ========== LEVEL 16-20: EXPERT/BOSS (Nightmare difficulty) ==========
        {
            level: 16,
            name: 'Expert Test',
            playerStartValue: 2,
            description: 'Extreme enemy count - perfect execution only!',
            goldPerLevel: 70,
            goldPerBag: 18,
            minItems: 7,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 'B', 0, 'L', 0, 'B', 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 'S', 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, 0, 0, 0, 0, -5, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, -8, -8, 0, -8, -8, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 17,
            name: 'Tactical Warfare',
            playerStartValue: 2,
            description: 'Canon + obstacles + boss swarm - impossible odds!',
            goldPerLevel: 75,
            goldPerBag: 18,
            minItems: 8,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 'B', 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, 0, 0, 0, 0, 'C', 0],  // Canon right, enemy left
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-8, 0, -8, -8, 0, -8, -8, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 18,
            name: 'Boss Trio',
            playerStartValue: 2,
            description: 'Three bosses + strong enemies - no items!',
            goldPerLevel: 80,
            goldPerBag: 20,
            minItems: 8,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 'B', 0, 0, 0, 'B', 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-5, 0, 0, 0, 0, 0, -5, 0],  // Enemies left and right
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-8, 0, -8, -8, 0, -8, 0, 0]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 19,
            name: 'Nightmare Labyrinth',
            playerStartValue: 2,
            description: 'All hazards + boss swarm - survive impossible maze!',
            goldPerLevel: 90,
            goldPerBag: 20,
            minItems: 8,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 'B', 0, 0],
                [0, 0, 0, 'L', 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 'S', 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 0, 0, 0],
                [-5, 0, 0, 0, 0, 0, 'C', 0],  // Canon right, enemy left
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-8, 0, -8, -8, 0, -8, -8, -8]  // Enemies scattered bottom + gold
            ]
        },
        {
            level: 20,
            name: 'Final Challenge',
            playerStartValue: 2,
            description: 'Ultimate test - 7 bosses + all hazards - IMPOSSIBLE!',
            goldPerLevel: 100,
            goldPerBag: 25,
            minItems: 8,
            spawnTurns: 4,
            layout: [
                ['P', 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 'B', 0, 0],
                [0, 0, 0, 'L', 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 'S', 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 'B', 0, 0, 0, 0, 0, 0],
                [-8, 0, 0, 0, 0, 0, 'C', 0],  // Canon right, boss left
                [0, 0, 0, 0, 0, 0, 0, 0],
                [-8, 0, -8, -8, 0, -8, -8, -8]  // Enemies scattered bottom + gold
            ]
        }
    ]
};

// Attach LEVELS to CONFIG for backward compatibility
if (typeof CONFIG !== 'undefined') {
    CONFIG.LEVELS = LEVEL_DESIGN.LEVELS;
}
