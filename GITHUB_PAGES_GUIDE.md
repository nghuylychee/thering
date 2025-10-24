# 🚀 HƯỚNG DẪN GITHUB PAGES CHO DICEDEFEND

## 📋 **BƯỚC 1: Tạo GitHub Repository**

### **1.1. Tạo repo mới trên GitHub**
- Vào: https://github.com/new
- **Repository name**: `dicedefend-mvp`
- **Description**: `Hardcore tower defense game với dice mechanics`
- **Public**: ✅ (cần để dùng GitHub Pages miễn phí)
- **Add README**: ❌ (đã có code rồi)
- Click "Create repository"

### **1.2. Push code lên GitHub**
```bash
# Thêm remote origin (thay YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/dicedefend-mvp.git

# Push code lên GitHub
git branch -M main
git push -u origin main
```

## 🌐 **BƯỚC 2: Enable GitHub Pages**

### **2.1. Vào Settings**
- Vào repo: `https://github.com/YOUR_USERNAME/dicedefend-mvp`
- Click tab **"Settings"**

### **2.2. Cấu hình Pages**
- Scroll xuống phần **"Pages"** (sidebar trái)
- **Source**: Chọn "Deploy from a branch"
- **Branch**: Chọn "main"
- **Folder**: Chọn "/ (root)"
- Click **"Save"**

### **2.3. Chờ deploy**
- GitHub sẽ build và deploy tự động
- Thời gian: ~2-5 phút
- Link sẽ có dạng: `https://YOUR_USERNAME.github.io/dicedefend-mvp/`

## 🔗 **BƯỚC 3: Chia sẻ với GD**

### **3.1. Lấy link game**
- Vào repo → Settings → Pages
- Copy link: `https://YOUR_USERNAME.github.io/dicedefend-mvp/`

### **3.2. Gửi cho GD**
```
🎮 DiceDefend MVP - Hardcore Tower Defense

Link test: https://YOUR_USERNAME.github.io/dicedefend-mvp/

📱 Chơi được trên:
- Desktop: Chrome, Firefox, Edge
- Mobile: Safari, Chrome

🎯 Game features:
- Hardcore difficulty scaling
- Dice-based tower defense
- Upgrade system
- 25+ waves với exponential difficulty

Test và feedback nhé! 🚀
```

## ⚡ **LƯU Ý QUAN TRỌNG**

### **✅ Ưu điểm GitHub Pages:**
- **Miễn phí** hoàn toàn
- **HTTPS** tự động
- **Custom domain** được (nếu muốn)
- **Auto-deploy** khi push code mới

### **📱 Testing:**
- Desktop: Test trên Chrome/Firefox
- Mobile: Test trên Safari/Chrome
- Responsive design sẵn sàng

### **🔄 Update game:**
- Chỉ cần push code mới lên GitHub
- GitHub Pages tự động update
- GD sẽ thấy version mới ngay

## 🎯 **CHECKLIST**

- [ ] Tạo GitHub repo thành công
- [ ] Push code lên GitHub
- [ ] Enable GitHub Pages
- [ ] Test link hoạt động
- [ ] Test trên desktop
- [ ] Test trên mobile
- [ ] Gửi link cho GD

---
**Tổng thời gian: ~10 phút**
**GD có thể test ngay sau khi deploy!**
