# DiceBound — MVP (HTML/CSS/JS Thuần)

Một prototype nhỏ để test gameplay **dice-based, turn-based, grid**:
- Player và Enemy đều **roll 1D6** để quyết định **số bước di chuyển**.
- Player chọn **1 trong 4 hướng (↑ ↓ ← →)** sau khi roll.
- Gặp **Enemy** thì combat: **số lớn hơn thắng**. Player thắng sẽ **hấp thụ value** của Enemy. Thua thì **Game Over**.
- Gặp **Item** thì nhặt, cộng value và **tiếp tục di chuyển**.
- Enemy **không đánh nhau** với nhau, chỉ đánh Player.

## Chạy nhanh
1. Copy 4 file vào cùng một folder:
   - `index.html`
   - `style.css`
   - `game.js`
   - `README.md`
2. Mở `index.html` bằng trình duyệt (Chrome/Edge/Firefox).

> Không cần server, không cần thư viện ngoài.

## Điều khiển
- Nhấn **🎲 Roll** để đổ xúc xắc.
- Khi roll xong sẽ hiện các hướng xung quanh character để chọn hướng bằng cách nhấn vào đó, 4 hướng thôi

## Luật MVP
- Player **dừng di chuyển sau khi xảy ra combat** (kể cả thắng).
- Nhặt **Item không dừng**: chỉ diễn hiệu ứng cộng value rồi đi tiếp.
- Enemy lượt của chúng:
  - Mỗi Enemy roll 1D6, di chuyển ngẫu nhiên từng bước.
  - Đụng Player sẽ **combat ngay** (nếu Player ≥ Enemy, Player hấp thụ; nếu Enemy > Player, Game Over).
  - Enemy **không đi vào** ô đang có Enemy khác (tránh chồng chéo).
  - Enemy khi đi qua **vẫn nhặt Item**

## Tuỳ chỉnh nhanh (trong `game.js`)
- Kích thước map: `GRID_W`, `GRID_H` (mặc định 8×8).
- Số lượng: `ENEMY_COUNT`, `ITEM_COUNT`.
- Giá trị:
  - Player bắt đầu: `PLAYER_START_VALUE`
  - Enemy: `ENEMY_MIN` ~ `ENEMY_MAX`
  - Item: `ITEM_MIN` ~ `ITEM_MAX`

## Roadmap gợi ý (sau MVP)
- Thêm **hiển thị đường đi** dựa trên số bước.
- **Reroll**/Luck buff/Trap.
- **Procedural map** với seed.
- **Điều khiển trên mobile** tốt hơn (swipe).
- **Âm thanh** nhẹ cho roll/combat.

## Kiến trúc code
- **State thuần JS** (không framework).
- Render grid bằng **CSS Grid**.
- **Log** sự kiện để debug loop.

---
Made for quick prototyping in Cursor. Happy hacking!
