// Asset Configuration for DiceRogue
// Maps game elements to their image assets

const ASSETS_CONFIG = {
    // Base path for assets
    basePath: 'assets/images/',
    
    // Player assets - chỉ cần 1 hình
    player: {
        image: 'player/player.png',
        emoji: '🧙' // Fallback emoji
    },
    
    // Enemy assets - mapped by enemy type, chỉ cần 1 hình mỗi enemy
    enemies: {
        'Giant Rat': {
            image: 'enemies/rat.png',
            emoji: '🐀' // Fallback emoji
        },
        'Goblin': {
            image: 'enemies/goblin.png',
            emoji: '👺'
        },
        'Orc': {
            image: 'enemies/orc.png',
            emoji: '👹'
        },
        'Dragon': {
            image: 'enemies/dragon.png',
            emoji: '🐉'
        }
    },
    
    // Item assets
    items: {
        'Small Gem': {
            image: 'items/gem-small.png',
            emoji: '💎'
        },
        'Treasure Ring': {
            image: 'items/ring.png',
            emoji: '💍'
        },
        'Enchanted Blade': {
            image: 'items/blade.png',
            emoji: '⚔️'
        },
        'Royal Crown': {
            image: 'items/crown.png',
            emoji: '👑'
        }
    },
    
    // Special grid assets
    specialGrids: {
        'box': {
            image: 'backgrounds/box.png',
            emoji: '🧱'
        },
        'lava': {
            image: 'grid/lava.png',
            emoji: '🔥'
        },
        'swamp': {
            image: 'grid/swamp.png',
            emoji: '🌊'
        },
        'canon': {
            image: 'grid/teleport-rune.png',
            emoji: '⚡'
        }
    },
    
    // River/Water assets for wall cells (non-walkable areas - displayed as rivers)
    river: {
        image: 'backgrounds/river.png', // Main river asset
        emoji: '🌊' // Fallback emoji
    },
    
    // UI assets
    ui: {
        dice: {
            face1: 'ui/dice-1.png',
            face2: 'ui/dice-2.png',
            face3: 'ui/dice-3.png',
            face4: 'ui/dice-4.png',
            face5: 'ui/dice-5.png',
            face6: 'ui/dice-6.png',
            rolling: 'ui/dice-rolling.png'
        },
        gold: 'ui/gold-coin.png',
        hp: 'ui/heart.png',
        portal: 'ui/portal.png',
        princess: 'ui/princess.png'
    },
    
    // Background assets
    backgrounds: {
        home: 'backgrounds/home-bg.png',
        game: 'backgrounds/game-bg.png',
        combat: 'backgrounds/combat-bg.png'
    },
    
    // Grid cell assets (for random floor tiles)
    gridCells: {
        variants: [
            'grid/grid1.png',
            'grid/grid2.png',
            'grid/grid3.png',
            'grid/grid4.png'
        ],
        default: 'grid/grid.png' // Fallback
    },
    
    // Settings
    settings: {
        useImages: true, // Toggle to use images or emoji fallback
        preload: true, // Preload all assets on game start
        fallbackToEmoji: true // Use emoji if image fails to load
    }
};

// Asset Manager Class
class AssetManager {
    constructor(config) {
        this.config = config;
        this.loadedAssets = new Map();
        this.loadingPromises = new Map();
        this.onLoadCallbacks = [];
    }
    
    // Get full path for an asset
    getAssetPath(relativePath) {
        return this.config.basePath + relativePath;
    }
    
    // Load a single image
    loadImage(path) {
        const fullPath = this.getAssetPath(path);
        
        // Return cached promise if already loading
        if (this.loadingPromises.has(fullPath)) {
            return this.loadingPromises.get(fullPath);
        }
        
        // Return cached image if already loaded
        if (this.loadedAssets.has(fullPath)) {
            return Promise.resolve(this.loadedAssets.get(fullPath));
        }
        
        // Create new loading promise
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.loadedAssets.set(fullPath, img);
                this.loadingPromises.delete(fullPath);
                resolve(img);
            };
            
            img.onerror = () => {
                this.loadingPromises.delete(fullPath);
                console.warn(`Failed to load image: ${fullPath}`);
                resolve(null); // Resolve with null instead of rejecting
            };
            
            img.src = fullPath;
        });
        
        this.loadingPromises.set(fullPath, promise);
        return promise;
    }
    
    // Load multiple images
    async loadImages(paths) {
        const promises = paths.map(path => this.loadImage(path));
        return Promise.all(promises);
    }
    
    // Get loaded image or null
    getImage(path) {
        const fullPath = this.getAssetPath(path);
        return this.loadedAssets.get(fullPath) || null;
    }
    
    // Preload all assets
    async preloadAll() {
        const allPaths = [];
        
        // Player assets - chỉ 1 hình
        if (this.config.player.image) {
            allPaths.push(this.config.player.image);
        }
        
        // Enemy assets - chỉ 1 hình mỗi enemy
        Object.values(this.config.enemies).forEach(enemy => {
            if (enemy.image) {
                allPaths.push(enemy.image);
            }
        });
        
        // Item assets
        Object.values(this.config.items).forEach(item => {
            if (item.image) allPaths.push(item.image);
        });
        
        // Special grid assets
        Object.values(this.config.specialGrids).forEach(grid => {
            if (grid.image) allPaths.push(grid.image);
        });
        
        // UI assets
        Object.values(this.config.ui.dice).forEach(path => allPaths.push(path));
        allPaths.push(this.config.ui.gold);
        allPaths.push(this.config.ui.hp);
        allPaths.push(this.config.ui.portal);
        allPaths.push(this.config.ui.princess);
        
        // Grid cell assets
        if (this.config.gridCells) {
            this.config.gridCells.variants.forEach(path => allPaths.push(path));
            if (this.config.gridCells.default) {
                allPaths.push(this.config.gridCells.default);
            }
        }
        
        // River asset for wall cells
        if (this.config.river && this.config.river.image) {
            allPaths.push(this.config.river.image);
        }
        
        console.log(`Preloading ${allPaths.length} assets...`);
        await this.loadImages(allPaths);
        console.log('Assets preloaded!');
        
        // Notify callbacks
        this.onLoadCallbacks.forEach(callback => callback());
    }
    
    // Register callback for when assets are loaded
    onLoad(callback) {
        this.onLoadCallbacks.push(callback);
    }
    
    // Get player image
    getPlayerImage() {
        if (!this.config.settings.useImages) return null;
        const path = this.config.player.image;
        return this.getImage(path);
    }
    
    // Get player emoji fallback
    getPlayerEmoji() {
        return this.config.player.emoji || '🧙';
    }
    
    // Get enemy image
    getEnemyImage(enemyName) {
        if (!this.config.settings.useImages) return null;
        const enemy = this.config.enemies[enemyName];
        if (!enemy) return null;
        const path = enemy.image;
        return this.getImage(path);
    }
    
    // Get enemy emoji fallback
    getEnemyEmoji(enemyName) {
        const enemy = this.config.enemies[enemyName];
        return enemy ? enemy.emoji : '👹';
    }
    
    // Get item image
    getItemImage(itemName) {
        if (!this.config.settings.useImages) return null;
        const item = this.config.items[itemName];
        if (!item) return null;
        return this.getImage(item.image);
    }
    
    // Get item emoji fallback
    getItemEmoji(itemName) {
        const item = this.config.items[itemName];
        return item ? item.emoji : '⭐';
    }
    
    // Get special grid image
    getSpecialGridImage(gridType) {
        if (!this.config.settings.useImages) return null;
        const grid = this.config.specialGrids[gridType];
        if (!grid) return null;
        return this.getImage(grid.image);
    }
    
    // Get special grid emoji fallback
    getSpecialGridEmoji(gridType) {
        const grid = this.config.specialGrids[gridType];
        return grid ? grid.emoji : '⬛';
    }
    
    // Get dice face image
    getDiceImage(value) {
        if (!this.config.settings.useImages) return null;
        const path = this.config.ui.dice[`face${value}`] || this.config.ui.dice.face1;
        return this.getImage(path);
    }
    
    // Get UI image
    getUIImage(type) {
        if (!this.config.settings.useImages) return null;
        const path = this.config.ui[type];
        return path ? this.getImage(path) : null;
    }
    
    // Get grid cell image (random variant)
    getGridCellImage(variantIndex) {
        if (!this.config.settings.useImages) return null;
        if (!this.config.gridCells || !this.config.gridCells.variants) return null;
        
        const variants = this.config.gridCells.variants;
        if (variantIndex >= 0 && variantIndex < variants.length) {
            return this.getImage(variants[variantIndex]);
        }
        
        // Fallback to default
        if (this.config.gridCells.default) {
            return this.getImage(this.config.gridCells.default);
        }
        
        return null;
    }
    
    // Get random grid cell variant index
    getRandomGridVariantIndex() {
        if (!this.config.gridCells || !this.config.gridCells.variants) return 0;
        return Math.floor(Math.random() * this.config.gridCells.variants.length);
    }
    
    // Get river image for wall cells (non-walkable areas displayed as rivers)
    getRiverImage() {
        if (!this.config.settings.useImages) return null;
        if (!this.config.river || !this.config.river.image) return null;
        return this.getImage(this.config.river.image);
    }
    
    // Get river emoji fallback
    getRiverEmoji() {
        return this.config.river ? (this.config.river.emoji || '🌊') : '🌊';
    }
}

// Create global asset manager instance
const assetManager = new AssetManager(ASSETS_CONFIG);
