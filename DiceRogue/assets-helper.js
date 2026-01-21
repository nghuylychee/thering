// Asset Helper Functions
// Provides easy-to-use functions for rendering game elements with image/emoji fallback

/**
 * Create an image element with emoji fallback
 * @param {HTMLImageElement|string} imageOrEmoji - Image element or emoji string
 * @param {string} emoji - Fallback emoji
 * @param {string} className - CSS class name
 * @param {number} size - Size in pixels (optional)
 * @param {boolean} constrainToGrid - Whether to constrain size to fit grid cell (default: false)
 * @returns {HTMLElement} - Image or span element
 */
function createAssetElement(imageOrEmoji, emoji, className = '', size = null, constrainToGrid = false) {
    if (imageOrEmoji && imageOrEmoji instanceof Image) {
        // Use image
        const img = document.createElement('img');
        img.src = imageOrEmoji.src;
        img.className = className;
        img.style.objectFit = 'contain';
        
        if (constrainToGrid) {
            // Constrain to grid cell size (typically smaller)
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
        } else if (size) {
            img.style.width = `${size}px`;
            img.style.height = `${size}px`;
        }
        
        img.alt = emoji; // Use emoji as alt text for accessibility
        return img;
    } else {
        // Use emoji fallback
        const span = document.createElement('span');
        span.className = className;
        span.textContent = emoji;
        
        if (constrainToGrid) {
            // For emoji in grid, use percentage-based sizing
            span.style.fontSize = 'clamp(16px, 80%, 32px)'; // Responsive sizing
            span.style.display = 'flex';
            span.style.alignItems = 'center';
            span.style.justifyContent = 'center';
            span.style.width = '100%';
            span.style.height = '100%';
        } else {
            span.style.fontSize = size ? `${size}px` : 'inherit';
        }
        
        span.style.lineHeight = '1';
        return span;
    }
}

/**
 * Normalize asset size for grid cells
 * Ensures assets fit within grid cells without breaking layout
 * @param {HTMLElement} element - Element to normalize
 * @param {string} type - Type of asset ('player', 'enemy', 'item', 'grid')
 */
function normalizeAssetForGrid(element, type = 'enemy') {
    // Size constraints based on asset type
    const sizeConstraints = {
        'player': { maxSize: '80%', fontSize: 'clamp(20px, 70%, 40px)' },
        'enemy': { maxSize: '80%', fontSize: 'clamp(20px, 70%, 40px)' },
        'item': { maxSize: '60%', fontSize: 'clamp(16px, 50%, 28px)' },
        'grid': { maxSize: '70%', fontSize: 'clamp(18px, 60%, 32px)' }
    };
    
    const constraint = sizeConstraints[type] || sizeConstraints['enemy'];
    
    if (element.tagName === 'IMG') {
        // For images
        element.style.width = constraint.maxSize;
        element.style.height = constraint.maxSize;
        element.style.maxWidth = constraint.maxSize;
        element.style.maxHeight = constraint.maxSize;
        element.style.objectFit = 'contain';
        element.style.display = 'block';
        element.style.margin = 'auto';
    } else {
        // For emoji/span elements
        element.style.fontSize = constraint.fontSize;
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.width = '100%';
        element.style.height = '100%';
    }
}

/**
 * Render player character
 * @param {HTMLElement} container - Container element
 * @param {boolean} inGrid - Whether rendering in grid cell (default: false)
 */
function renderPlayer(container, inGrid = false) {
    const image = assetManager.getPlayerImage();
    const emoji = assetManager.getPlayerEmoji();
    const size = inGrid ? null : 120; // No fixed size if in grid
    const element = createAssetElement(image, emoji, 'character-emoji player-asset', size, inGrid);
    
    // Normalize size if in grid
    if (inGrid) {
        normalizeAssetForGrid(element, 'player');
    }
    
    // Clear and append
    container.innerHTML = '';
    container.appendChild(element);
}

/**
 * Render enemy character
 * @param {HTMLElement} container - Container element
 * @param {string} enemyName - Name of the enemy
 * @param {boolean} inGrid - Whether rendering in grid cell (default: false)
 */
function renderEnemy(container, enemyName, inGrid = false) {
    const image = assetManager.getEnemyImage(enemyName);
    const emoji = assetManager.getEnemyEmoji(enemyName);
    const size = inGrid ? null : 120; // No fixed size if in grid
    const element = createAssetElement(image, emoji, 'character-emoji enemy-asset', size, inGrid);
    
    // Normalize size if in grid
    if (inGrid) {
        normalizeAssetForGrid(element, 'enemy');
    }
    
    container.innerHTML = '';
    container.appendChild(element);
}

/**
 * Render item in grid cell
 * @param {HTMLElement} container - Container element
 * @param {string} itemName - Name of the item
 * @param {boolean} inGrid - Whether rendering in grid cell (default: true for items)
 */
function renderItem(container, itemName, inGrid = true) {
    const image = assetManager.getItemImage(itemName);
    const emoji = assetManager.getItemEmoji(itemName);
    const size = inGrid ? null : 32; // No fixed size if in grid
    const element = createAssetElement(image, emoji, 'item-asset', size, inGrid);
    
    // Normalize size if in grid
    if (inGrid) {
        normalizeAssetForGrid(element, 'item');
    }
    
    container.innerHTML = '';
    container.appendChild(element);
}

/**
 * Render special grid element
 * @param {HTMLElement} container - Container element
 * @param {string} gridType - Type of special grid ('box', 'lava', 'swamp', 'canon')
 * @param {boolean} inGrid - Whether rendering in grid cell (default: true for grids)
 */
function renderSpecialGrid(container, gridType, inGrid = true) {
    const image = assetManager.getSpecialGridImage(gridType);
    const emoji = assetManager.getSpecialGridEmoji(gridType);
    const size = inGrid ? null : 32; // No fixed size if in grid
    const element = createAssetElement(image, emoji, 'special-grid-asset', size, inGrid);
    
    // Normalize size if in grid
    if (inGrid) {
        normalizeAssetForGrid(element, 'grid');
    }
    
    container.innerHTML = '';
    container.appendChild(element);
}

/**
 * Render dice face
 * @param {HTMLElement} container - Container element
 * @param {number} value - Dice value (1-6)
 * @param {boolean} rolling - Whether dice is rolling
 */
function renderDice(container, value, rolling = false) {
    if (rolling) {
        const image = assetManager.getImage(ASSETS_CONFIG.ui.dice.rolling);
        const emoji = '🎲';
        const element = createAssetElement(image, emoji, 'dice-face rolling', 60);
        container.innerHTML = '';
        container.appendChild(element);
    } else if (value) {
        const image = assetManager.getDiceImage(value);
        const emoji = value.toString();
        const element = createAssetElement(image, emoji, 'dice-face', 60);
        container.innerHTML = '';
        container.appendChild(element);
    } else {
        container.textContent = '?';
    }
}

/**
 * Render UI icon
 * @param {HTMLElement} container - Container element
 * @param {string} iconType - Type of icon ('gold', 'hp', 'portal', 'princess')
 * @param {number} size - Size in pixels
 */
function renderUIIcon(container, iconType, size = 32) {
    const image = assetManager.getUIImage(iconType);
    const emojiMap = {
        'gold': '🪙',
        'hp': '❤️',
        'portal': '🌀',
        'princess': '👸'
    };
    const emoji = emojiMap[iconType] || '⭐';
    const element = createAssetElement(image, emoji, `ui-icon ${iconType}-icon`, size);
    
    container.innerHTML = '';
    container.appendChild(element);
}

/**
 * Update element with asset (for existing elements)
 * @param {HTMLElement} element - Element to update
 * @param {HTMLImageElement|string} imageOrEmoji - Image or emoji
 * @param {string} emoji - Fallback emoji
 */
function updateElementWithAsset(element, imageOrEmoji, emoji) {
    if (imageOrEmoji && imageOrEmoji instanceof Image) {
        // Replace with image
        if (element.tagName === 'IMG') {
            element.src = imageOrEmoji.src;
        } else {
            const img = document.createElement('img');
            img.src = imageOrEmoji.src;
            img.className = element.className;
            img.style.objectFit = 'contain';
            img.alt = emoji;
            element.replaceWith(img);
        }
    } else {
        // Replace with emoji
        if (element.tagName === 'IMG') {
            const span = document.createElement('span');
            span.className = element.className;
            span.textContent = emoji;
            span.style.fontSize = 'inherit';
            span.style.display = 'inline-block';
            element.replaceWith(span);
        } else {
            element.textContent = emoji;
        }
    }
}

/**
 * Preload assets and show loading indicator
 */
async function initializeAssets() {
    if (ASSETS_CONFIG.settings.preload) {
        // Show loading indicator if needed
        const loadingIndicator = document.getElementById('assetLoadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        try {
            await assetManager.preloadAll();
            console.log('All assets loaded successfully!');
        } catch (error) {
            console.error('Error loading assets:', error);
        } finally {
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }
}

// Initialize assets when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAssets);
} else {
    initializeAssets();
}
