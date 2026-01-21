# DiceQuest Assets

Thư mục này chứa tất cả art assets cho game DiceQuest.

## Cấu trúc thư mục

```
assets/
├── images/
│   ├── player/          # Player character sprite
│   │   └── player.png
│   ├── enemies/         # Enemy sprites (1 hình mỗi enemy)
│   │   ├── rat.png
│   │   ├── goblin.png
│   │   ├── orc.png
│   │   └── dragon.png
│   ├── items/           # Item sprites
│   │   ├── gem-small.png
│   │   ├── ring.png
│   │   ├── blade.png
│   │   └── crown.png
│   ├── grid/            # Special grid tiles
│   │   ├── barrel.png
│   │   ├── lava.png
│   │   ├── swamp.png
│   │   └── teleport-rune.png
│   ├── ui/              # UI elements
│   │   ├── dice-1.png
│   │   ├── dice-2.png
│   │   ├── dice-3.png
│   │   ├── dice-4.png
│   │   ├── dice-5.png
│   │   ├── dice-6.png
│   │   ├── dice-rolling.png
│   │   ├── gold-coin.png
│   │   ├── heart.png
│   │   ├── portal.png
│   │   └── princess.png
│   └── backgrounds/     # Background images
│       ├── home-bg.png
│       ├── game-bg.png
│       └── combat-bg.png
```

## Yêu cầu kích thước

### Player & Enemies
- **Kích thước**: 64x64px hoặc 128x128px (PNG với transparency)
- **Format**: PNG với alpha channel
- **Lưu ý**: Chỉ cần 1 hình cho mỗi character (không cần idle/attack/hurt riêng)

### Items
- **Kích thước**: 32x32px hoặc 64x64px
- Format: PNG với alpha channel

### Grid Tiles
- **Kích thước**: 64x64px (khớp với grid cell size)
- Format: PNG với alpha channel

### UI Elements
- **Dice faces**: 60x60px (khớp với dice visual size)
- **Icons**: 32x32px hoặc 64x64px
- Format: PNG với alpha channel

### Backgrounds
- **Kích thước**: 1920x1080px hoặc responsive
- Format: PNG hoặc JPG

## Fallback System

Game sẽ tự động fallback về emoji nếu:
- Image không load được
- File không tồn tại
- `useImages` setting = false

## Cách thêm assets mới

1. Đặt file image vào thư mục tương ứng
2. Cập nhật `assets-config.js` với path mới
3. Reload game để assets được load

## Notes

- Tất cả paths trong config là relative từ `assets/images/`
- Game sẽ preload tất cả assets khi khởi động (nếu `preload: true`)
- Assets được cache sau khi load lần đầu
