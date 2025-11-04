// Home Screen Manager for DiceBound

const HOME_MANAGER = {
    // Initialize home manager
    init: function() {
        this.setupEventListeners();
        this.showHomeScreen();
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Home screen buttons
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('backToHubBtn').addEventListener('click', () => {
            this.backToHub();
        });

        // Game over screen buttons
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('backToHomeFromGameOverBtn').addEventListener('click', () => {
            this.showHomeScreen();
        });
    },

    // Show home screen
    showHomeScreen: function() {
        document.getElementById('homeScreen').style.display = 'flex';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Reset game if it exists
        if (typeof resetGame === 'function') {
            resetGame();
        }
    },

    // Start game
    startGame: function() {
        document.getElementById('homeScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Initialize game
        if (typeof initGame === 'function') {
            initGame();
        }
    },

    // Restart game
    restartGame: function() {
        this.startGame();
    },

    // Show game over screen
    showGameOver: function(title, message, stats) {
        document.getElementById('gameOverTitle').textContent = title;
        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('gameOverStats').textContent = stats;
        document.getElementById('gameOverScreen').style.display = 'flex';
    },

    // Back to main hub
    backToHub: function() {
        window.location.href = '../index.html';
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    HOME_MANAGER.init();
});

