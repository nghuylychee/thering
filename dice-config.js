// Dice Configuration
// Định nghĩa các loại dice và thuộc tính của chúng

const DICE_CONFIG = {
    // Dice types với các thuộc tính khác nhau
    types: {
        D2: {
            name: 'D2',
            maxValue: 2,
            possibleValues: [1, 2],
            bulletSpeed: 2,        // Tốc độ đạn chậm
            cooldownTime: 6000,   // 6 giây cooldown - Hardcore pressure
            color: '#95a5a6',      // Màu xám
            description: 'Basic Dice'
        },
        D3: {
            name: 'D3',
            maxValue: 3,
            possibleValues: [1, 2, 3],
            bulletSpeed: 2.5,     // Tốc độ đạn trung bình
            cooldownTime: 5500,   // 5.5 giây cooldown
            color: '#3498db',     // Màu xanh dương
            description: 'Speed Dice'
        },
        D4: {
            name: 'D4',
            maxValue: 4,
            possibleValues: [1, 2, 3, 4],
            bulletSpeed: 3,       // Tốc độ đạn nhanh
            cooldownTime: 5000,   // 5 giây cooldown
            color: '#27ae60',     // Màu xanh lá
            description: 'Power Dice'
        },
        D5: {
            name: 'D5',
            maxValue: 5,
            possibleValues: [1, 2, 3, 4, 5],
            bulletSpeed: 3.5,     // Tốc độ đạn rất nhanh
            cooldownTime: 4500,   // 4.5 giây cooldown
            color: '#9b59b6',     // Màu tím
            description: 'Elite Dice'
        },
        D6: {
            name: 'D6',
            maxValue: 6,
            possibleValues: [1, 2, 3, 4, 5, 6],
            bulletSpeed: 4,      // Tốc độ đạn cực nhanh
            cooldownTime: 4000,   // 4 giây cooldown
            color: '#f1c40f',     // Màu vàng
            description: 'Legendary Dice'
        }
    },
    
    // Get dice config by type
    getDiceConfig: function(diceType) {
        return this.types[diceType] || this.types.D2;
    },
    
    // Get all dice types
    getAllDiceTypes: function() {
        return Object.keys(this.types);
    },
    
    // Roll dice và trả về giá trị random
    rollDice: function(diceType) {
        const config = this.getDiceConfig(diceType);
        const randomIndex = Math.floor(Math.random() * config.possibleValues.length);
        return config.possibleValues[randomIndex];
    },
    
    // Check if dice type is valid
    isValidDiceType: function(diceType) {
        return this.types.hasOwnProperty(diceType);
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DICE_CONFIG;
}
