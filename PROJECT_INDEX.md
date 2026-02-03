# TheRing — Index toàn bộ project

Tài liệu index cấu trúc, entry point và module chính của toàn bộ repo.

---

## 1. Root — Game Hub

| File / Thư mục | Mô tả |
|----------------|--------|
| `index.html` | Trang Game Hub chính; load danh sách game từ `hub-manager.js` |
| `hub-style.css` | Style cho Hub (header, grid game cards, footer) |
| `hub-manager.js` | Logic Hub: danh sách game cấu hình, `loadGames()`, `createGameCard()`, `addGame()`, `getGame()` |
| `server.js` | HTTP server Node (port 8000), serve từ root, `/` và `/index.html` → root `index.html` |
| `package.json` | Scripts: `npm start` → `node server.js`, `check` kiểm tra root `index.html` |
| `start-server.sh` | Script khởi động server |
| `README.md` | Hướng dẫn chạy (Python/Node, cấu trúc, troubleshooting) |
| `.gitignore` | Git ignore |

**Games đăng ký trong Hub (hub-manager.js):**

| ID | Tên | Path | Thể loại |
|----|-----|------|----------|
| dicedefend | DiceDefend | `DiceDefend/index.html` | Tower Defense |
| dicebound | DiceBound | `DiceBound/index.html` | Strategy |
| dicequest | DiceQuest | `DiceQuest/index1.html` | Adventure |
| dicerogue | DiceRogue | `DiceRogue/index.html` | Roguelike |

---

## 2. DiceBound

**Thể loại:** Strategy — Turn-based grid, dice movement, combat.

| File | Mô tả |
|------|--------|
| `index.html` | Entry point game |
| `style.css` | Giao diện game |
| `game.js` | Logic chính: grid, roll dice, di chuyển, combat, items |
| `config.js` | Cấu hình (grid, số enemy/item, giá trị) |
| `level-design.js` | Thiết kế level |
| `powerup-config.js` | Cấu hình power-up |
| `home-manager.js` | Màn hình chọn game / quay Hub |
| `readme.md` | Mô tả gameplay, điều khiển, luật MVP |
| `LEVEL_DESIGN_GUIDE.md` | Hướng dẫn thiết kế level |

**Không có:** `assets/`, camera, level generator, AI designer.

---

## 3. DiceDefend

**Thể loại:** Tower Defense — Dice + bảo vệ lâu đài.

| File | Mô tả |
|------|--------|
| `index.html` | Entry point game |
| `style.css` | Giao diện game |
| `game.js` | Logic tower defense + dice |
| `dice-config.js` | Cấu hình xúc xắc |
| `enemy-config.js` | Cấu hình quái |
| `wave-config.js` | Cấu hình wave |
| `powerup-config.js` | Cấu hình power-up |
| `home-manager.js` | Màn hình chọn / quay Hub |

**Không có:** level design, assets images, camera, generator.

---

## 4. DiceQuest

**Thể loại:** Adventure — Cứu công chúa, turn-based grid + dice.

| File | Mô tả |
|------|--------|
| `index1.html` | **Entry point** (Hub trỏ tới đây) |
| `index.html` | Trang thay thế (nếu dùng) |
| `style.css` | Giao diện game |
| `game.js` | Logic game chính |
| `config.js` | Cấu hình tổng |
| `level-design.js` | Định nghĩa level |
| `level-generator.js` | Sinh level |
| `level-designer.js` | Tool/UI thiết kế level |
| `camera-system.js` | Hệ thống camera |
| `powerup-config.js` | Cấu hình power-up |
| `home-manager.js` | Màn hình chọn / quay Hub |
| `assets-config.js` | Cấu hình đường dẫn assets |
| `assets-helper.js` | Hàm load/helper assets |
| `ai-level-designer.js` | Tích hợp AI thiết kế level |
| `ai-result.json` | Kết quả/export từ AI designer |
| `assets-helper-tool.html` | Tool hỗ trợ assets |
| `test-assets.html` | Test load assets |
| `readme.md` | Mô tả game |
| `LEVEL_DESIGN_GUIDE.md` | Hướng dẫn level |
| `ASSETS_INTEGRATION.md` | Tích hợp assets |
| `HOW_TO_CHANGE_ASSETS.md` | Đổi assets |
| `AI_SETUP.md` | Cài đặt AI level designer |
| `prompt.md` | Prompt cho AI |
| `.env.example` | Biến môi trường mẫu |
| `package.json` / `package-lock.json` | NPM (nếu dùng tool local) |

**Assets:** `assets/images/` — `enemies/`, `grid/`, `items/`, `player/`, `ui/`.

---

## 5. DiceRogue

**Thể loại:** Roguelike — Biến thể DiceQuest, procedural dungeon.

| File | Mô tả |
|------|--------|
| `index.html` | **Entry point** game |
| `style.css` | Giao diện game |
| `game.js` | Logic game chính |
| `config.js` | Cấu hình tổng |
| `level-design.js` | Định nghĩa level tĩnh |
| `level-generator.js` | Sinh level |
| `dungeon-generator.js` | Sinh dungeon procedural |
| `level-designer.js` | Tool thiết kế level |
| `camera-system.js` | Hệ thống camera |
| `powerup-config.js` | Cấu hình power-up |
| `home-manager.js` | Màn hình chọn / quay Hub |
| `assets-config.js` | Cấu hình assets |
| `assets-helper.js` | Helper assets |
| `ai-level-designer.js` | AI level designer |
| `ai-result.json` | Kết quả AI |
| `assets-helper-tool.html` | Tool assets |
| `test-assets.html` | Test assets |
| `readme.md` | Mô tả game |
| `LEVEL_DESIGN_GUIDE.md` | Hướng dẫn level |
| `ASSETS_INTEGRATION.md` | Tích hợp assets |
| `HOW_TO_CHANGE_ASSETS.md` | Đổi assets |
| `AI_SETUP.md` | Cài đặt AI |
| `prompt.md` | Prompt AI |
| `.env.example` | Biến môi trường mẫu |
| `package.json` / `package-lock.json` | NPM |

**Assets:** `assets/images/` — `backgrounds/`, `decor/`, `enemies/`, `grid/`, `items/`, `player/`, `ui/` (nhiều grid: grid1–4).

---

## 6. Cây thư mục (tóm tắt)

```
thering/
├── index.html              # Hub
├── hub-style.css
├── hub-manager.js
├── server.js
├── package.json
├── start-server.sh
├── README.md
├── PROJECT_INDEX.md        # File này
├── .gitignore
│
├── DiceBound/
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   ├── config.js
│   ├── level-design.js
│   ├── powerup-config.js
│   ├── home-manager.js
│   ├── readme.md
│   └── LEVEL_DESIGN_GUIDE.md
│
├── DiceDefend/
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   ├── dice-config.js
│   ├── enemy-config.js
│   ├── wave-config.js
│   ├── powerup-config.js
│   └── home-manager.js
│
├── DiceQuest/
│   ├── index1.html         # Entry từ Hub
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   ├── config.js
│   ├── level-design.js
│   ├── level-generator.js
│   ├── level-designer.js
│   ├── camera-system.js
│   ├── powerup-config.js
│   ├── home-manager.js
│   ├── assets-config.js
│   ├── assets-helper.js
│   ├── ai-level-designer.js
│   ├── assets-helper-tool.html
│   ├── test-assets.html
│   ├── assets/
│   │   └── images/ (enemies, grid, items, player, ui)
│   └── *.md, .env.example, package.json
│
└── DiceRogue/
    ├── index.html
    ├── style.css
    ├── game.js
    ├── config.js
    ├── level-design.js
    ├── level-generator.js
    ├── dungeon-generator.js
    ├── level-designer.js
    ├── camera-system.js
    ├── powerup-config.js
    ├── home-manager.js
    ├── assets-config.js
    ├── assets-helper.js
    ├── ai-level-designer.js
    ├── assets-helper-tool.html
    ├── test-assets.html
    ├── assets/
    │   └── images/ (backgrounds, decor, enemies, grid, items, player, ui)
    └── *.md, .env.example, package.json
```

---

## 7. Chạy project

- **Từ root:** `npm start` hoặc `node server.js` → `http://localhost:8000` (Hub).
- **Hub:** Click từng game → mở đúng `index.html` hoặc `index1.html` của game đó.
- Cần chạy server từ thư mục gốc `thering` để route `/` đúng tới Hub.

---

*Cập nhật: index toàn bộ project TheRing.*
