# Hướng dẫn Config Level Design

## 📋 Tổng quan

File `level-design.js` chứa cấu hình cho tất cả các level trong game. Mỗi level được định nghĩa bằng một **ma trận 2D** (layout) và **entityConfig** để chỉ định chi tiết cho từng entity.

---

## 🎯 Cấu trúc cơ bản

```javascript
{
    level: 1,                    // Số thứ tự level
    name: 'Tutorial',            // Tên level
    playerStartValue: 2,         // Giá trị khởi đầu của player
    description: 'Learn the basics', // Mô tả level
    
    // Ma trận 2D định nghĩa vị trí các entities
    layout: [
        ['P', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        // ... các hàng khác
    ],
}
```

---

## 🗺️ Ký hiệu trong Layout (Ma trận 2D)

Ma trận layout là một mảng 2 chiều, mỗi hàng đại diện cho một dòng trong grid:

| Ký hiệu | Ý nghĩa | Mô tả |
|---------|---------|-------|
| `'P'` | **Player** | Vị trí bắt đầu của player |
| **Số âm** (`-1`, `-3`, `-5`, `-8`, etc.) | **Enemy** | Value = abs(số), icon tự động gán |
| **Số dương** (`1`, `2`, `3`, `5`, etc.) | **Item** | Value = số, icon tự động gán |
| `'B'` | **Box** | Hộp chướng ngại vật (không thể đi qua) |
| `'L'` | **Lava** | Lava - gây damage khi đi qua |
| `'S'` | **Swamp** | Đầm lầy - gây damage khi đi qua |
| `'C'` | **Canon** | Súng đại bác - teleport player |
| `'G'` | **Gold Bag** | Túi vàng - collect gold (amount = levelConfig.goldPerBag) |
| `0`, `'.'` hoặc `' '` | **Empty** | Ô trống, có thể đi qua |

---

## 📍 Tọa độ trong Layout

**Quan trọng**: Tọa độ trong ma trận là `[y][x]` (hàng trước, cột sau):

```javascript
layout: [
    // Row 0 (y=0)
    ['P', '.', '.', '.', '.', '.', '.', '.'],  // x=0,1,2,3,4,5,6,7
    // Row 1 (y=1)
    ['.', '.', '.', '.', '.', '.', '.', '.'],  // x=0,1,2,3,4,5,6,7
    // Row 2 (y=2)
    ['.', '.', 'B', '.', '.', '.', '.', '.'],  // x=0,1,2,3,4,5,6,7
    // ...
]
```

**Ví dụ**: 
- `'P'` ở hàng đầu tiên (y=0), cột đầu tiên (x=0) → tọa độ `(0, 0)`
- `'B'` ở hàng thứ 3 (y=2), cột thứ 3 (x=2) → tọa độ `(2, 2)`

---

## 🎯 Cách hoạt động của số âm/số dương

### Enemy (Số âm):
- **Format**: Số âm trong layout (ví dụ: `-1`, `-3`, `-5`, `-8`)
- **Value**: `abs(số âm)` - Game tự động tính giá trị
- **Icon**: Game tự động match với ENEMY_TYPES dựa trên value
  - Value 1 → Weak 👺
  - Value 3 → Normal 😈
  - Value 5 → Strong 👹
  - Value 8 → Boss 👑

### Item (Số dương):
- **Format**: Số dương trong layout (ví dụ: `1`, `2`, `3`, `5`)
- **Value**: Chính số đó
- **Icon**: Game tự động match với ITEM_TYPES dựa trên value
  - Value 1 → Small ⭐
  - Value 2 → Medium 💎
  - Value 3 → Large 💠
  - Value 5 → Huge 👑

### Ví dụ:

```javascript
layout: [
    ['P', 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],  // Item value 1 (Small) ở (3, 3)
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0],  // Item value 2 (Medium) ở (2, 5)
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, -1, 0]  // Enemy value 1 (Weak) ở (6, 9)
]
// Không cần entityConfig nữa!
```

---

## 🎮 Các loại Enemy và Item

### Enemy Types (xem trong `config.js`):
- `'Weak'` - Enemy yếu (value: 1) 👺
- `'Normal'` - Enemy bình thường (value: 3) 😈
- `'Strong'` - Enemy mạnh (value: 5) 👹
- `'Boss'` - Boss (value: 8) 👑

### Item Types (xem trong `config.js`):
- `'Small'` - Item nhỏ (value: +1) ⭐
- `'Medium'` - Item trung bình (value: +2) 💎
- `'Large'` - Item lớn (value: +3) 💠
- `'Huge'` - Item rất lớn (value: +5) 👑

---

## 📝 Ví dụ hoàn chỉnh

### Ví dụ 1: Level đơn giản

```javascript
{
    level: 1,
    name: 'Tutorial',
    playerStartValue: 2,
    description: 'Learn the basics',
    
    // Layout 8x10 (8 cột, 10 hàng)
    // Số âm = Enemy, số dương = Item
    layout: [
        ['P', 0, 0, 0, 0, 0, 0, 0],  // Row 0: Player ở góc trái trên
        [0, 0, 0, 0, 0, 0, 0, 0],   // Row 1: Trống
        [0, 0, 0, 0, 0, 0, 0, 0],   // Row 2: Trống
        [0, 0, 0, 1, 0, 0, 0, 0],   // Row 3: Item value 1 ở (3, 3)
        [0, 0, 0, 0, 0, 0, 0, 0],   // Row 4: Trống
        [0, 0, 2, 0, 0, 0, 0, 0],   // Row 5: Item value 2 ở (2, 5)
        [0, 0, 0, 0, 0, 0, 0, 0],   // Row 6: Trống
        [0, 0, 0, 0, 0, 0, 0, 0],   // Row 7: Trống
        [0, 0, 0, 0, 0, 0, 0, 0],   // Row 8: Trống
        [0, 0, 0, 0, 0, 0, -1, 0]   // Row 9: Enemy value 1 ở (6, 9)
    ]
    // Không cần entityConfig nữa! Game tự động gán icon
}
```

### Ví dụ 2: Level có obstacles và special grids

```javascript
{
    level: 2,
    name: 'Easy Start',
    playerStartValue: 2,
    description: 'Simple enemies',
    
    layout: [
        ['P', 0, 0, 0, 0, 0, 0, 0],      // Player ở (0, 0)
        [0, 0, 0, 0, 0, 0, 0, 0],       // Trống
        [0, 0, 'B', 0, 0, 0, 0, 0],     // Box obstacle ở (2, 2)
        [0, 0, 0, 0, 0, 0, 0, 0],       // Trống
        [0, 0, 0, 0, 1, 0, 0, 0],       // Item value 1 ở (4, 4)
        [0, 0, 0, 0, 0, 'L', 0, 0],     // Lava ở (5, 5)
        [0, 0, 0, 0, 0, 0, 0, 0],       // Trống
        [0, 0, 0, 0, 0, 0, 'S', 0],     // Swamp ở (6, 7)
        [0, 0, 0, 0, 0, 0, 0, 'C'],     // Canon ở (7, 7)
        [0, 0, 0, 0, 0, 0, -1, -1]      // Enemy value 1 ở (6, 9) và (7, 9)
    ]
    // Không cần entityConfig!
}
```

---

## ⚠️ Lưu ý quan trọng

1. **Enemy (Số âm)**: 
   - Dùng số âm để đặt enemy (ví dụ: `-1`, `-3`, `-5`, `-8`)
   - Value của enemy = `abs(số âm)`
   - Game tự động match icon dựa trên value (tìm closest match trong ENEMY_TYPES)

2. **Item (Số dương)**: 
   - Dùng số dương để đặt item (ví dụ: `1`, `2`, `3`, `5`)
   - Value của item = chính số đó
   - Game tự động match icon dựa trên value (tìm closest match trong ITEM_TYPES)

3. **Kích thước layout**: 
   - Số hàng = chiều cao grid
   - Số cột = chiều rộng grid
   - Tất cả các hàng phải có cùng số cột

4. **Player position**: 
   - Chỉ được có **1 ký hiệu 'P'** trong layout
   - Nếu không có 'P', player sẽ spawn ở (0, 0) mặc định

5. **Special grids**:
   - `'B'` (Box): Không thể đi qua, block đường
   - `'L'` (Lava): Gây 1 damage khi player/enemy đi qua
   - `'S'` (Swamp): Gây 2 damage khi player/enemy đi qua
   - `'C'` (Canon): Teleport player đến vị trí được chọn

6. **Empty cells**: 
   - Có thể dùng `0`, `'.'` hoặc `' '` để đánh dấu ô trống
   - `0` là cách ngắn gọn nhất

---

## 🎨 Tips để tạo level design tốt

1. **Bắt đầu từ level đơn giản**: Ít enemies, nhiều items để player học
2. **Tăng dần độ khó**: Thêm obstacles, special grids, enemies mạnh hơn
3. **Tạo lối đi rõ ràng**: Không chặn tất cả đường đi bằng boxes
4. **Cân bằng**: Đảm bảo player có thể đánh bại tất cả enemies nếu thu thập đủ items
5. **Test thử**: Chơi thử level để đảm bảo có thể hoàn thành

---

## 📚 Tham khảo

- File `config.js`: Xem danh sách đầy đủ Enemy Types và Item Types
- File `level-design.js`: Xem các ví dụ level đã có sẵn
- File `game.js`: Logic xử lý layout và entityConfig

