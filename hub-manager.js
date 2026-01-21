// TheRing Game Hub Manager
// Quản lý và hiển thị tất cả các game trong hệ thống

const HUB_MANAGER = {
    // Danh sách games được cấu hình
    games: [
        {
            id: 'dicedefend',
            name: 'DiceDefend',
            icon: '🎲',
            path: 'DiceDefend/index.html',
            description: 'Tower defense kết hợp với cơ chế xúc xắc. Bảo vệ lâu đài khỏi các làn sóng quái vật!',
            category: 'Tower Defense',
            status: 'active'
        },
        {
            id: 'dicebound',
            name: 'DiceBound',
            icon: '🎯',
            path: 'DiceBound/index.html',
            description: 'Turn-based grid game với xúc xắc. Di chuyển, combat và thu thập items trên grid 8x8!',
            category: 'Strategy',
            status: 'active'
        },
        {
            id: 'dicequest',
            name: 'DiceQuest',
            icon: '👸',
            path: 'DiceQuest/index1.html',
            description: 'Cứu công chúa và đến cổng dịch chuyển để hoàn thành màn chơi. Turn-based grid game với xúc xắc!',
            category: 'Adventure',
            status: 'active'
        },
        {
            id: 'dicerogue',
            name: 'DiceRogue',
            icon: '🗡️',
            path: 'DiceRogue/index.html',
            description: 'Roguelite variant của DiceQuest với những thay đổi mới lạ! Turn-based grid game với xúc xắc!',
            category: 'Roguelike',
            status: 'active'
        }
    ],

    // Khởi tạo Hub
    init: function() {
        console.log('🎮 TheRing Game Hub - Initializing...');
        this.loadGames();
    },

    // Tải và hiển thị games
    loadGames: function() {
        const gamesGrid = document.getElementById('gamesGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');

        if (!gamesGrid) {
            console.error('Games grid not found!');
            return;
        }

        // Lọc chỉ các game active
        const activeGames = this.games.filter(game => game.status === 'active');

        if (activeGames.length === 0) {
            loadingState.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        // Xóa loading state
        loadingState.style.display = 'none';

        // Tạo game cards
        activeGames.forEach(game => {
            const gameCard = this.createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });

        console.log(`✓ Loaded ${activeGames.length} games`);
    },

    // Tạo game card element
    createGameCard: function(game) {
        const card = document.createElement('a');
        card.href = game.path;
        card.className = 'game-card';
        card.setAttribute('data-game-id', game.id);

        card.innerHTML = `
            <div class="game-card-content">
                <div class="game-icon">${game.icon}</div>
                <div class="game-name">${game.name}</div>
                <div class="game-description">${game.description}</div>
                <div class="game-meta">
                    <span class="game-meta-item">
                        <span>📁</span>
                        <span>${game.category}</span>
                    </span>
                </div>
            </div>
        `;

        // Thêm click tracking (optional)
        card.addEventListener('click', () => {
            console.log(`🎮 Opening game: ${game.name}`);
        });

        return card;
    },

    // Thêm game mới (có thể dùng để mở rộng)
    addGame: function(gameData) {
        if (!gameData.id || !gameData.name || !gameData.path) {
            console.error('Invalid game data');
            return false;
        }

        this.games.push({
            ...gameData,
            status: gameData.status || 'active'
        });

        // Reload games
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid) {
            gamesGrid.innerHTML = '';
            this.loadGames();
        }

        return true;
    },

    // Lấy thông tin game theo ID
    getGame: function(gameId) {
        return this.games.find(game => game.id === gameId);
    },

    // Lấy tất cả games
    getAllGames: function() {
        return this.games;
    }
};

// Khởi tạo khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        HUB_MANAGER.init();
    });
} else {
    HUB_MANAGER.init();
}

// Export for external use
if (typeof window !== 'undefined') {
    window.HUB_MANAGER = HUB_MANAGER;
}
