# TheRing - Game Hub

Game Hub chứa nhiều game dice-based như DiceQuest, DiceRogue, DiceBound, DiceDefend.

## Cách chạy dự án

### Cách 1: Dùng Python HTTP Server (Khuyến nghị)

1. Mở terminal/command prompt tại thư mục gốc của dự án (`thering`)
2. Chạy lệnh:

```bash
# Python 3
python -m http.server 8000

# Hoặc Python 2
python -m SimpleHTTPServer 8000
```

3. Mở browser và truy cập: `http://localhost:8000`

### Cách 2: Dùng Node.js Server (Khuyến nghị - đảm bảo serve đúng file)

**QUAN TRỌNG:** Đảm bảo bạn đang ở thư mục gốc (`E:\Games\VibeCoding\thering`) khi chạy server!

1. Mở terminal/command prompt và chuyển đến thư mục gốc:
```bash
cd E:\Games\VibeCoding\thering
```

2. Cài đặt dependencies (nếu chưa có):
```bash
npm install
```

3. Chạy server bằng một trong các cách sau:

**Cách A: Dùng script (Windows)**
```bash
start-server.bat
```

**Cách B: Dùng npm**
```bash
npm start
```

**Cách C: Kiểm tra trước khi chạy**
```bash
npm run check
npm start
```

4. Mở browser và truy cập: `http://localhost:8000` - sẽ hiển thị Game Hub (`index.html`)

**Lưu ý:** 
- Server này được cấu hình để luôn serve file `index.html` ở thư mục gốc làm trang mặc định
- Nếu bạn thấy directory listing thay vì Game Hub, có nghĩa là server đang chạy từ thư mục sai (có thể là `DiceQuest`). Hãy dừng server và chạy lại từ thư mục gốc

### Cách 2b: Dùng http-server (nếu muốn)

1. Cài đặt http-server globally:
```bash
npm install -g http-server
```

2. Chạy server từ thư mục gốc:
```bash
http-server . -p 8000
```

### Cách 3: Dùng VS Code Live Server

1. Cài extension "Live Server" trong VS Code
2. Click chuột phải vào `index.html` → chọn "Open with Live Server"

## Cấu trúc dự án

```
thering/
├── index.html          # Game Hub chính
├── DiceQuest/          # Game DiceQuest
├── DiceRogue/          # Game DiceRogue (procedural dungeon)
├── DiceBound/          # Game DiceBound
└── DiceDefend/         # Game DiceDefend
```

## Lưu ý

- **Phải chạy qua web server**, không thể mở trực tiếp file HTML (do CORS và relative paths)
- **QUAN TRỌNG: Phải chạy server từ thư mục gốc (`thering`)** để server serve file `index.html` (Game Hub) làm trang mặc định
- Port mặc định: `8000` (có thể đổi sang port khác nếu cần)
- Tất cả games đều có thể truy cập từ Game Hub (`index.html`)

## Troubleshooting

- Nếu port 8000 đã được sử dụng, thử port khác: `python -m http.server 8080`
- **Đảm bảo đang ở đúng thư mục gốc (`thering`) khi chạy server** - nếu chạy từ thư mục con (ví dụ `DiceQuest`), server sẽ serve file `index.html` của thư mục đó thay vì Game Hub
- Nếu server đang serve file sai, kiểm tra lại thư mục hiện tại: `pwd` (Linux/Mac) hoặc `cd` (Windows)
