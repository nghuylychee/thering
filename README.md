# DiceDefend 🎲🏰

A mobile-first tower defense game combining dice rolling mechanics with strategic tower defense gameplay.

## 🎮 Game Features

### Core Mechanics
- **Dice Rolling**: Roll different dice types (D2-D6) to shoot bullets at enemies
- **Tower Defense**: Defend your castle from waves of enemies across multiple lanes
- **Upgrade System**: Choose power-ups between waves to enhance your dice and abilities
- **Mobile Optimized**: Designed for portrait mobile gameplay

### Dice Types
- **D2**: Basic dice with 2 possible values
- **D3**: Enhanced dice with 3 possible values  
- **D4**: Advanced dice with 4 possible values
- **D5**: Expert dice with 5 possible values
- **D6**: Master dice with 6 possible values

### Gameplay Flow
1. **Wave Start**: Enemies spawn across multiple lanes
2. **Dice Rolling**: Roll your dice to shoot bullets at enemies
3. **Combat**: Bullets target nearest enemies across all lanes
4. **Wave Complete**: Enter upgrade phase to select power-ups
5. **Upgrade Selection**: Roll resource dice and choose enhancements
6. **Next Wave**: Continue with enhanced abilities

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Mobile device recommended for optimal experience

### Installation
1. Clone the repository:
```bash
git clone https://github.com/nghuylychee/thering.git
```

2. Navigate to the DiceDefend folder:
```bash
cd DiceDefend
```

3. Open `index.html` in your web browser

## 🎯 How to Play

### Basic Controls
- **Roll Button**: Roll all available dice to shoot bullets
- **Drag & Drop**: Move dice between slots to reorganize
- **Upgrade Phase**: Select power-ups using resource dice

### Strategy Tips
- **Dice Placement**: Position stronger dice in optimal lanes
- **Resource Management**: Choose power-ups that complement your strategy
- **Enemy Prioritization**: Target enemies closest to your castle
- **Wave Planning**: Save resources for crucial upgrades

## 🛠️ Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **No Dependencies**: Vanilla JavaScript implementation
- **Mobile-First**: Responsive design optimized for touch devices
- **Modular Code**: Separated configuration files for easy customization

### File Structure
```
DiceDefend/
├── index.html          # Main game interface
├── style.css           # Game styling and animations
├── game.js             # Core game logic and state management
├── dice-config.js      # Dice types and properties
├── enemy-config.js     # Enemy types and scaling
├── wave-config.js      # Wave definitions and progression
└── powerup-config.js   # Power-up definitions and effects
```

### Key Features
- **Real-time Game Loop**: Smooth 60fps gameplay
- **Collision Detection**: Precise bullet-enemy interactions
- **State Management**: Comprehensive game state tracking
- **Animation System**: CSS animations for dice rolling and effects
- **Drag & Drop**: Native HTML5 drag and drop API

## 🎨 Customization

### Adding New Dice Types
Edit `dice-config.js` to add new dice with custom properties:
```javascript
DICE_CONFIG: {
    'D7': {
        maxValue: 7,
        possibleValues: [1, 2, 3, 4, 5, 6, 7],
        bulletSpeed: 4,
        cooldownTime: 2000,
        color: '#e67e22',
        description: 'Lucky Seven'
    }
}
```

### Creating New Enemies
Modify `enemy-config.js` to add enemy variants:
```javascript
ENEMY_CONFIG: {
    'flying': {
        baseHealth: 50,
        baseSpeed: 2,
        baseDamage: 15,
        color: '#9b59b6',
        emoji: '🦅'
    }
}
```

### Designing Power-ups
Extend `powerup-config.js` with new abilities:
```javascript
POWERUP_CONFIG: {
    'rapid_fire': {
        id: 'rapid_fire',
        name: 'Rapid Fire',
        description: 'Reduces dice cooldown by 50%',
        effect: 'cooldown_reduction',
        value: 0.5,
        diceRequired: 3
    }
}
```

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea for a new feature? Please open an issue on GitHub!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

Project maintained by [nghuylychee](https://github.com/nghuylychee)

---

**Enjoy defending your castle with dice! 🎲🏰**
