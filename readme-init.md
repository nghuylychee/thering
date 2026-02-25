# readme-init.md — Tổng hợp chat & thông tin project TheRing

File này tổng hợp **tóm tắt nội dung chat** (từ agent transcripts) và **thông tin project** để dùng làm context khởi tạo / onboard cho AI hoặc người mới vào repo.

---

## 1. Nguồn dữ liệu

- **Chat**: Transcripts trong `agent-transcripts/` (ví dụ: `64b3fe15-b08d-4417-8306-491dcb74791c.txt`, `9733b11e-573a-4316-aea9-14cbbacfa913.txt`).
- **Project**: `README.md`, `PROJECT_INDEX.md`, `package.json`, `hub-manager.js`.

---

## 2. Tóm tắt nội dung chat (theo chủ đề)

### 2.1 Gameplay & logic (DiceRogue)

- **Check stat**: Game định một số X, người chơi phải roll **từ X trở lên**; người chơi roll theo **một stat** hiện có (đã chỉnh cơ chế).
- **Enemy turn**: Khi số enemy trên màn **> 3** → tất cả enemy **roll và di chuyển song song** (parallel) để không tốn thời gian; vẫn giữ hiệu ứng roll và di chuyển.
- **Bug đã fix**: `(a.enemy.id || "").localeCompare is not a function` khi sort enemy (cần đảm bảo `enemy.id` string khi dùng `localeCompare`).
- **Enemy combat**: Enemy phải đi **đúng ô player** mới tấn công được (không chỉ ô kế bên).
- **Canon/teleport**: Khi player đang trong canon để teleport thì **chưa cho enemy đi**; chỉ khi **kết thúc lượt player** thì enemy mới đi.
- **POI**: Enemy **không được đi lên các ô POI** (shop, healer, stat check, v.v.).
- **Princess & portal**: Đã **bỏ logic princess** và **bỏ UI/portal** (objective rescue princess, icon portal).

### 2.2 Trial of strength

- Hiển thị **dice khi roll xong**; bảng kết quả nút **Continue** cần **căn giữa**.

### 2.3 Spine animation (Unity export)

- **Player**: Dùng folder **Assassin** (sau đó **Fighter**), skin level 4; anim di chuyển `AssassinPyramid_Walk_01`, đánh `AssassinPyramid_Attack_01`.
- **Enemy**: Dùng data spine từ folder **monster** (5 monster) cho 4 enemy hiện có + 1 enemy mới; anim mặc định **monster_fly_01**; khi di chuyển dùng **fly** (không dùng jump).
- **Combat screen**: Enemy dùng anim giống ngoài map; player khi đánh dùng `AssassinPyramid_Attack_01`; tăng **size** player/enemy trong combat.
- **Fix**: Nền đen → background trong suốt; chỉnh **size** (fit 1 cell, width = height); chỉnh **vị trí** (sprite không lệch trái/trên, dời phải và xuống cho khớp grid); **scale** spine không dùng số cứng (tránh lệch tỉ lệ màn hình); fix **mất hình / reset** khi di chuyển (player và enemy); fix **sprite không đi theo** khi di chuyển liên tiếp hoặc đến một số ô (đồng bộ logic walkable và vị trí spine).

### 2.4 Grid, POI, decor, wall (DiceRogue)

- **Reachable cell**: Hiệu ứng **rõ và sáng**.
- **Special grid (box)**: Background trong suốt, **lót grid bình thường** bên dưới rồi đặt sprite box lên.
- **Wall**: Dùng sprite `decor/decor1.png`, background trong suốt, lót grid bên dưới.
- **Grid**: Thêm **đường grid mờ nhẹ** để dễ tính khoảng cách.
- **POI**: Heal → `items/shipper.png`; Swamp → trong suốt, sprite `bomb.png`, lót grid; Merchant → `merchant.png`; Trial → `trial.png`; **Bỏ hiệu ứng nhấp nháy** ở POI.
- **Canon**: Đổi thành sprite **tele**, background trong suốt, lót grid; thêm **hiệu ứng xoay vòng** (sprite).
- **Multi-cell decor/wall**: Hệ thống **unwalkable nhiều ô** (2x2, 3x3, 1x2, 2x3…); logic vẫn là các ô đó không đi được; **một asset phủ đúng vùng grid** (đã có plan và implement overlay, dungeon generator, config).

### 2.5 Map theo area & theme

- Map tổ chức theo **area**; mỗi area **một theme**.
- **5 theme**: Greenland, Freljord, Hot sand, Sakura, Island — mỗi theme có **grid, decor** riêng; có **đường nối** giữa các area.
- **Menu**: **Bỏ Level Designer**; **Asset Helper** cập nhật theo cấu trúc theme (grid/decor theo theme, shared: player, enemies, items, UI).

### 2.6 Map Editor (tilemap)

- **Mục đích**: Tự xếp map bằng tay (không dùng procedural) để làm map đẹp, quay creative quảng cáo.
- **Terrain**: Ô **rỗng** ban đầu, sau đó đặt **terrain theo theme**; terrain **update sprite** theo map cho dễ nhìn.
- **Entity**: Đặt bằng **sprite/asset** (không emoji); **click item rồi click lên grid** mới đặt (không hover đặt luôn); **giữ đè chuột** để brush; có **decor** trong palette; entity (player, enemy, item, POI) **minh họa đè lên grid base**; không có box, lava, swamp, gold trong palette entity (theo yêu cầu đã ghi).
- **Export/Load JSON**: Layout + `levelConfig` (themeId, name, playerStartValue, goldPerBag, …).
- **Chơi thử**: Dùng **đúng map trong editor** (không dùng map procedural); flow: **bỏ thuật toán sinh map**, load map từ **file JSON** (ví dụ `DiceRogue/dicerogue-map.json`); fix bug **Chơi thử** không render map / `#gameGrid` rỗng / vào main game thay vì playtest; cần **load level từ layout** đúng và render grid.
- **Asset Helper**: Thêm **nút Back** về main menu.

### 2.7 Bug đã đề cập (tóm tắt)

- Sort enemy: `localeCompare` với `enemy.id` (phải là string).
- Sprite player/enemy mất hình hoặc không đi theo khi di chuyển (nhiều lần fix: transition anim, đồng bộ vị trí grid vs spine).
- Scale spine số cứng → chỉnh theo tỉ lệ màn hình.
- Chơi thử map editor: không load layout, grid rỗng, nhầm sang main game.

---

## 3. Thông tin project TheRing

### 3.1 Tổng quan

- **TheRing** là **Game Hub** chứa nhiều game dựa trên xúc xắc: **DiceQuest**, **DiceRogue**, **DiceBound**, **DiceDefend**.
- Root: `index.html` là Hub; mỗi game trong thư mục riêng, vào qua Hub.

### 3.2 Cách chạy

- **Bắt buộc chạy qua web server** (CORS, đường dẫn tương đối). **Chạy từ thư mục gốc `thering`** để Hub (`index.html`) là trang mặc định.
- **Port mặc định**: 8000.

**Cách 1 – Python**
```bash
python -m http.server 8000
```

**Cách 2 – Node (khuyến nghị)**
```bash
cd /path/to/thering
npm install
npm start
# hoặc: node server.js
```

**Cách 3 – http-server**
```bash
npm install -g http-server
http-server . -p 8000
```

- Mở: `http://localhost:8000` → Game Hub.

### 3.3 Cấu trúc root

| Thành phần      | Mô tả |
|-----------------|--------|
| `index.html`    | Game Hub chính |
| `hub-style.css` | Style Hub |
| `hub-manager.js` | Danh sách game, load, card |
| `server.js`     | HTTP server (port 8000), serve từ root |
| `package.json`  | `npm start` → `node server.js`, script `check` |
| `README.md`     | Hướng dẫn chạy, cấu trúc, troubleshooting |
| `PROJECT_INDEX.md` | Index chi tiết toàn bộ project |

**Games trong Hub (hub-manager.js):**

| ID          | Tên       | Path                  | Thể loại     |
|------------|-----------|------------------------|--------------|
| dicedefend | DiceDefend| DiceDefend/index.html | Tower Defense|
| dicebound  | DiceBound | DiceBound/index.html  | Strategy     |
| dicequest  | DiceQuest | DiceQuest/index1.html | Adventure    |
| dicerogue  | DiceRogue | DiceRogue/index.html  | Roguelike    |

### 3.4 Từng game (tóm tắt)

- **DiceBound**: Strategy, turn-based grid, dice movement, combat. File chính: `game.js`, `config.js`, `level-design.js`, `powerup-config.js`, `home-manager.js`. Không có assets phức tạp, level design, AI designer.
- **DiceDefend**: Tower Defense + dice. File: `game.js`, `dice-config.js`, `enemy-config.js`, `wave-config.js`, `powerup-config.js`, `home-manager.js`.
- **DiceQuest**: Adventure, cứu công chúa (có thể đã bỏ trong DiceRogue), turn-based grid + dice. Có `level-design.js`, `level-generator.js`, `level-designer.js`, `camera-system.js`, `ai-level-designer.js`, assets (enemies, grid, items, player, ui).
- **DiceRogue**: Roguelike, biến thể DiceQuest, **procedural dungeon** (có thể tắt, dùng map từ JSON). Có `dungeon-generator.js`, map editor, theme/area, Spine, multi-cell decor, assets theo theme (map: greenland, freljord, hotsand, sakura, island…).

### 3.5 Cây thư mục (tóm tắt)

```
thering/
├── index.html, hub-style.css, hub-manager.js
├── server.js, package.json, README.md, PROJECT_INDEX.md
├── DiceBound/     (index.html, game.js, config, level-design, powerup, home-manager)
├── DiceDefend/    (index.html, game.js, dice/enemy/wave/powerup config, home-manager)
├── DiceQuest/     (index1.html = entry, game.js, level-*, camera, ai-level-designer, assets)
└── DiceRogue/     (index.html, game.js, dungeon-generator, map-editor, theme/area, Spine, assets)
```

---

## 4. Ghi chú khi dùng readme-init.md

- File này **không thay README.md** hay **PROJECT_INDEX.md**; dùng để **context nhanh** (chat + project).
- Có thể **cập nhật** phần “Tóm tắt chat” khi có transcript mới hoặc quyết định design mới.
- Chi tiết kỹ thuật (entry point, từng file, level design, assets) lấy từ **PROJECT_INDEX.md** và **README.md**.

---

*Tạo từ tổng hợp agent transcripts + README.md, PROJECT_INDEX.md, package.json, hub-manager.js.*
