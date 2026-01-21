# Hướng dẫn tích hợp Art Assets vào DiceQuest

## Tổng quan

Hệ thống asset đã được thiết lập với:
- ✅ Asset Manager (`assets-config.js`)
- ✅ Helper Functions (`assets-helper.js`)
- ✅ CSS styles hỗ trợ images
- ✅ Cấu trúc thư mục assets

## Cách sử dụng trong game.js

### 1. Render Player Character

**Trước (emoji):**
```javascript
element.textContent = '🧙';
```

**Sau (với assets):**
```javascript
renderPlayer(element); // Chỉ cần 1 hình
```

### 2. Render Enemy trong Grid

**Trước:**
```javascript
cell.innerHTML = enemy.emoji;
```

**Sau:**
```javascript
const enemyElement = document.createElement('div');
renderEnemy(enemyElement, enemy.name); // Chỉ cần 1 hình
cell.appendChild(enemyElement);
```

### 3. Render Item trong Grid

**Trước:**
```javascript
cell.innerHTML = item.emoji;
```

**Sau:**
```javascript
const itemElement = document.createElement('div');
renderItem(itemElement, item.name);
cell.appendChild(itemElement);
```

### 4. Render Dice

**Trước:**
```javascript
diceFace.textContent = diceValue;
```

**Sau:**
```javascript
renderDice(diceFace, diceValue, isRolling);
```

### 5. Render UI Icons

**Trước:**
```javascript
goldIcon.textContent = '🪙';
```

**Sau:**
```javascript
renderUIIcon(goldIcon, 'gold', 20);
```

## Ví dụ tích hợp trong các hàm chính

### Hàm renderGridCell

```javascript
function renderGridCell(cell, cellData) {
    // Clear cell
    cell.innerHTML = '';
    
    // Render player
    if (cellData.player) {
        const playerElement = document.createElement('div');
        renderPlayer(playerElement);
        cell.appendChild(playerElement);
    }
    
    // Render enemy
    if (cellData.enemy) {
        const enemyElement = document.createElement('div');
        renderEnemy(enemyElement, cellData.enemy.name);
        cell.appendChild(enemyElement);
    }
    
    // Render item
    if (cellData.item) {
        const itemElement = document.createElement('div');
        renderItem(itemElement, cellData.item.name);
        cell.appendChild(itemElement);
    }
    
    // Render special grid
    if (cellData.specialGrid) {
        const gridElement = document.createElement('div');
        renderSpecialGrid(gridElement, cellData.specialGrid.type);
        cell.appendChild(gridElement);
    }
}
```

### Hàm updateCombatScreen

```javascript
function updateCombatScreen(player, enemy) {
    // Update player
    const playerArea = document.getElementById('combatPlayerArea');
    const playerEmoji = playerArea.querySelector('.character-emoji');
    renderPlayer(playerEmoji);
    
    // Update enemy
    const enemyArea = document.getElementById('combatEnemyArea');
    const enemyEmoji = enemyArea.querySelector('.character-emoji');
    renderEnemy(enemyEmoji, enemy.name);
}
```

### Hàm animateAttack

```javascript
function animateAttack(isPlayer) {
    const characterArea = isPlayer 
        ? document.getElementById('combatPlayerArea')
        : document.getElementById('combatEnemyArea');
    const emojiElement = characterArea.querySelector('.character-emoji');
    
    // Render character (chỉ có 1 hình, animation sẽ được xử lý bằng CSS)
    if (isPlayer) {
        renderPlayer(emojiElement);
    } else {
        const enemy = currentEnemy; // Get current enemy
        renderEnemy(emojiElement, enemy.name);
    }
    
    // Animation được xử lý bằng CSS classes (attacking, defending)
}
```

## Toggle giữa Images và Emoji

Trong `assets-config.js`, bạn có thể toggle:

```javascript
settings: {
    useImages: true,  // Đặt false để dùng emoji
    preload: true,
    fallbackToEmoji: true
}
```

## Thêm assets mới

1. **Thêm file image** vào thư mục tương ứng (ví dụ: `assets/images/enemies/new-enemy.png`)

2. **Cập nhật `assets-config.js`**:
```javascript
enemies: {
    'New Enemy': {
        image: 'enemies/new-enemy.png',
        emoji: '👾'
    }
}
```

3. **Sử dụng trong code**:
```javascript
renderEnemy(element, 'New Enemy');
```

## Testing

1. **Test với images**: Đặt `useImages: true` và đảm bảo tất cả images có trong thư mục
2. **Test fallback**: Xóa một vài images và kiểm tra emoji hiển thị đúng
3. **Test performance**: Kiểm tra preload time và memory usage

## Notes

- Tất cả helper functions tự động fallback về emoji nếu image không load
- Assets được cache sau khi load lần đầu
- Preload chạy tự động khi page load (nếu `preload: true`)
- Images sẽ scale để fit container size

## Next Steps

1. Thêm các file images vào thư mục assets
2. Tìm và thay thế các chỗ render emoji trong game.js bằng helper functions
3. Test với cả images và emoji fallback
4. Optimize image sizes nếu cần
