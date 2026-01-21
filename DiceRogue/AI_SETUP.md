# Hướng dẫn Setup AI Level Designer

## Tổng quan

Button "🤖 Generate All 10 Levels with AI" sử dụng OpenAI API trực tiếp từ browser để generate tất cả 10 levels trong một lần gọi API, tối ưu token usage (~70-80% tiết kiệm so với 10 calls riêng biệt).

## Setup OpenAI API Key

### Bước 1: Lấy OpenAI API Key

1. Đăng ký/đăng nhập tại [OpenAI Platform](https://platform.openai.com/)
2. Vào [API Keys](https://platform.openai.com/api-keys)
3. Tạo API key mới
4. Copy API key (bắt đầu với `sk-`)

### Bước 2: Nhập API Key trong Game

1. Mở game trong browser
2. Vào tab **"Level Design"**
3. Tìm phần **"OpenAI API Key"** ở đầu danh sách levels
4. Paste API key vào ô input
5. Click **"Save Key"**

**Lưu ý bảo mật:**
- API key được lưu trong browser localStorage
- Chỉ lưu trữ trên máy của bạn
- Không được chia sẻ với người khác
- Có thể bị lộ nếu ai đó truy cập máy tính của bạn

### Bước 3: Generate Levels

1. Click button **"🤖 Generate All 10 Levels with AI"**
2. Đợi 30-60 giây (AI đang generate tất cả 10 levels)
3. Xem kết quả: mỗi level sẽ có:
   - Parameters (enemies, items, obstacles, etc.)
   - **Design Intent** (ý đồ thiết kế)
   - **Optimal Strategy** (chiến thuật chơi tối ưu)
4. Review và click **"Save"** trên từng level nếu hài lòng

## Cách hoạt động

Khi bạn click "Generate All 10 Levels with AI":
1. Game tạo một prompt chi tiết về gameplay mechanics
2. Gọi OpenAI API một lần với prompt yêu cầu generate 10 levels
3. OpenAI trả về JSON array với 10 level designs
4. Game tự động apply tất cả designs vào UI
5. Mỗi level hiển thị designIntent và optimalStrategy

**Token Optimization:**
- 1 API call thay vì 10 calls riêng biệt
- Shared context (gameplay mechanics chỉ giải thích 1 lần)
- Ước tính tiết kiệm: ~70-80% tokens

## Troubleshooting

### Lỗi: "OpenAI API key not set"
- Nhập API key vào ô input và click "Save Key"
- Kiểm tra API key có đúng format (bắt đầu với `sk-`)

### Lỗi: "Invalid API key"
- Kiểm tra API key có đúng không
- Đảm bảo API key chưa bị revoke
- Tạo API key mới nếu cần

### Lỗi: "Rate limit exceeded"
- Bạn đã gọi API quá nhiều lần
- Đợi vài phút rồi thử lại
- Kiểm tra usage limits trong OpenAI dashboard

### Lỗi: "AI generation failed"
- Kiểm tra internet connection
- Kiểm tra có đủ credits trong OpenAI account
- Thử lại sau vài phút

### Response không đúng format
- Đôi khi AI trả về format không đúng
- Thử generate lại
- Nếu vẫn lỗi, có thể do prompt quá phức tạp - thử đơn giản hóa

## Chi phí OpenAI

- **Model**: gpt-4o-mini (rẻ nhất, đủ tốt)
- **Ước tính token usage**: ~2000-3000 tokens per generation (10 levels)
- **Chi phí**: ~$0.001-0.002 per generation (rất rẻ!)
- **Tối ưu**: Generate 10 levels cùng lúc tiết kiệm ~70-80% so với 10 calls riêng

## Kết luận

Sau khi setup API key, bạn có thể generate tất cả 10 levels với một click! Mỗi level sẽ có designIntent và optimalStrategy rõ ràng, giúp bạn hiểu rõ ý đồ thiết kế và chiến thuật chơi.
