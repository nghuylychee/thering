// Camera System for DiceRogue
// Camera follows player and only displays 8x10 viewport (Rogue-like view)

const CAMERA = {
    // Viewport size (fixed at 8x10 for Rogue-like display)
    viewportWidth: 8,
    viewportHeight: 10,
    
    // Camera position (top-left corner of viewport)
    cameraX: 0,
    cameraY: 0,
    
    // Initialize camera
    init: function() {
        this.updateCameraPosition();
    },
    
    // Update camera position to center on player
    updateCameraPosition: function() {
        if (!gameState || !gameState.player) return;
        
        const playerX = gameState.player.x;
        const playerY = gameState.player.y;
        
        // Center player in viewport
        // Camera position is top-left of viewport
        this.cameraX = Math.max(0, Math.min(
            playerX - Math.floor(this.viewportWidth / 2),
            gameState.gridWidth - this.viewportWidth
        ));
        
        this.cameraY = Math.max(0, Math.min(
            playerY - Math.floor(this.viewportHeight / 2),
            gameState.gridHeight - this.viewportHeight
        ));
    },
    
    // Get viewport bounds
    getViewportBounds: function() {
        return {
            startX: this.cameraX,
            endX: this.cameraX + this.viewportWidth,
            startY: this.cameraY,
            endY: this.cameraY + this.viewportHeight
        };
    },
    
    // Check if a cell is in viewport
    isInViewport: function(x, y) {
        const bounds = this.getViewportBounds();
        return x >= bounds.startX && x < bounds.endX &&
               y >= bounds.startY && y < bounds.endY;
    },
    
    // Convert world coordinates to viewport coordinates
    worldToViewport: function(worldX, worldY) {
        return {
            viewportX: worldX - this.cameraX,
            viewportY: worldY - this.cameraY
        };
    },
    
    // Convert viewport coordinates to world coordinates
    viewportToWorld: function(viewportX, viewportY) {
        return {
            worldX: viewportX + this.cameraX,
            worldY: viewportY + this.cameraY
        };
    }
};
