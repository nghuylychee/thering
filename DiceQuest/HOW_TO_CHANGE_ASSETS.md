# 🎨 Hướng dẫn thay đổi Assets trong DiceQuest

## Cách 1: Thay thế file images trực tiếp (Đơn giản nhất)

### Bước 1: Chuẩn bị file images
- Chuẩn bị file images với tên đúng như trong config
- Đặt vào thư mục tương ứng

### Bước 2: Thay file
Ví dụ thay player:
```
1. Tạo/copy file: player-idle.png, player-attack.png, player-hurt.png
2. Đặt vào: DiceQuest/assets/images/player/
3. Reload game → Xong!
```

### Danh sách file cần thay:

#### Player Assets
```
assets/images/player/
└── player.png    (64x64px hoặc 128x128px)
```

#### Enemy Assets
```
assets/images/enemies/
├── rat.png
├── goblin.png
├── orc.png
└── dragon.png
```

#### Item Assets
```
assets/images/items/
├── gem-small.png
├── ring.png
├── blade.png
└── crown.png
```

#### Grid Assets
```
assets/images/grid/
├── barrel.png
├── lava.png
├── swamp.png
└── teleport-rune.png
```

#### UI Assets
```
assets/images/ui/
├── dice-1.png đến dice-6.png
├── dice-rolling.png
├── gold-coin.png
├── heart.png
├── portal.png
└── princess.png
```

---

## Cách 2: Thay đổi tên file hoặc thêm assets mới

Nếu bạn muốn dùng tên file khác hoặc thêm assets mới:

### Bước 1: Thêm file vào thư mục
Đặt file vào thư mục tương ứng (ví dụ: `assets/images/enemies/my-enemy.png`)

### Bước 2: Cập nhật `assets-config.js`

Ví dụ thay đổi enemy:
```javascript
enemies: {
    'Giant Rat': {
        idle: 'enemies/my-rat.png',  // ← Đổi path này
        attack: 'enemies/my-rat-attack.png',
        hurt: 'enemies/my-rat-hurt.png',
        emoji: '🐀'
    },
    // ... các enemy khác
}
```

Ví dụ thêm enemy mới:
```javascript
enemies: {
    // ... các enemy cũ
    'New Enemy': {  // ← Thêm enemy mới
        idle: 'enemies/new-enemy-idle.png',
        attack: 'enemies/new-enemy-attack.png',
        hurt: 'enemies/new-enemy-hurt.png',
        emoji: '👾'
    }
}
```

---

## Cách 3: Thay đổi emoji fallback

Nếu muốn đổi emoji hiển thị khi không có image:

```javascript
// Trong assets-config.js
enemies: {
    'Giant Rat': {
        idle: 'enemies/rat-idle.png',
        attack: 'enemies/rat-attack.png',
        hurt: 'enemies/rat-hurt.png',
        emoji: '🐭'  // ← Đổi emoji này
    }
}
```

---

## Cách 4: Tắt/bật images (dùng emoji)

Nếu muốn tạm thời dùng emoji thay vì images:

```javascript
// Trong assets-config.js
settings: {
    useImages: false,  // ← Đổi thành false để dùng emoji
    preload: true,
    fallbackToEmoji: true
}
```

---

## Quick Reference - Tên file cần có

### Player
- `player.png`

### Enemies (mỗi enemy chỉ cần 1 hình)
- `rat.png`
- `goblin.png`
- `orc.png`
- `dragon.png`

### Items
- `gem-small.png`
- `ring.png`
- `blade.png`
- `crown.png`

### Special Grids
- `barrel.png`
- `lava.png`
- `swamp.png`
- `teleport-rune.png`

### UI
- `dice-1.png` đến `dice-6.png`
- `dice-rolling.png`
- `gold-coin.png`
- `heart.png`
- `portal.png`
- `princess.png`

---

## Tips

1. **Kích thước khuyến nghị:**
   - Player/Enemies: 64x64px hoặc 128x128px
   - Items: 32x32px hoặc 64x64px
   - Grid tiles: 64x64px
   - UI icons: 32x32px hoặc 64x64px
   - Dice: 60x60px

2. **Format:**
   - PNG với transparency (alpha channel)
   - Background trong suốt

3. **Sau khi thay file:**
   - Hard refresh browser (Ctrl+F5) để clear cache
   - Hoặc mở DevTools → Network → Disable cache

4. **Test:**
   - Mở `test-assets.html` để xem assets có load đúng không
   - Check console để xem có lỗi load không

---

## Ví dụ thực tế

### Ví dụ 1: Thay player sprite
```
1. Tải/copy file player.png
2. Đặt vào assets/images/player/
3. Reload game → Player hiển thị sprite mới!
```

### Ví dụ 2: Thay tất cả enemies
```
1. Chuẩn bị sprites cho rat, goblin, orc, dragon
2. Đặt vào assets/images/enemies/ với tên đúng
3. Reload game → Tất cả enemies hiển thị sprites mới!
```

### Ví dụ 3: Chỉ thay một vài items
```
1. Chỉ thay file gem-small.png và ring.png
2. Các items khác vẫn dùng emoji
3. Game tự động mix images và emoji!
```

---

## Troubleshooting

**Q: Images không hiển thị?**
- Check tên file có đúng không
- Check path trong assets-config.js
- Check console có lỗi load không
- Hard refresh browser (Ctrl+F5)

**Q: Muốn dùng sprite sheet thay vì nhiều file?**
- Cần thêm code để crop sprite sheet
- Hoặc export thành nhiều file riêng

**Q: Muốn thay đổi kích thước hiển thị?**
- Sửa CSS trong style.css
- Hoặc tham số size trong helper functions
