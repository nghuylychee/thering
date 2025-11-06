# Level Design Balance Guide - 20 Levels

## 📊 Tổng quan về Cân bằng Độ khó

File này giải thích logic cân bằng độ khó cho 20 levels trong game DiceBound.

---

## 🎯 Các Yếu tố Cân bằng

### 1. **Tổng Enemy Value vs Total Available Value**

**Formula**: `Player Start (2) + Total Item Values >= Total Enemy Values`

Điều này đảm bảo player có thể đánh bại tất cả enemies nếu thu thập đủ items.

### 2. **Progression Curve**

| Level Range | Difficulty | Enemy Count | Boss Count | Special Grids | Items |
|-------------|------------|-------------|------------|---------------|-------|
| 1-5 | Easy | 1-2 | 0 | 0-2 | 2-3 |
| 6-10 | Medium | 3-4 | 0-1 | 2-4 | 1-2 |
| 11-15 | Hard | 4-5 | 1-2 | 3-5 | 1-2 |
| 16-20 | Expert | 5-6 | 2-4 | 4-6 | 1 |

### 3. **Introduction Progression**

- **Level 1-2**: Basic gameplay, no hazards
- **Level 3**: Introduce obstacles (Box)
- **Level 5**: Introduce Lava
- **Level 7**: Introduce Swamp
- **Level 8**: Introduce Canon
- **Level 10**: First Boss encounter
- **Level 11+**: All hazards combined

---

## 📈 Chi tiết từng Level

### **Level 1-5: Tutorial/Easy**

#### Level 1: First Steps
- **Enemies**: 1 Weak (value 1)
- **Items**: 1 Small (1) + 1 Medium (2) = 3 total
- **Balance**: Player (2) + Items (3) = 5 > Enemy (1) ✅
- **Design**: Simple, items nearby, enemy far away
- **Learning**: Basic collection and combat

#### Level 2: Obstacle Course
- **Enemies**: 2 Weak (value 2)
- **Items**: 1 Small (1)
- **Balance**: Player (2) + Items (1) = 3 = Enemies (2) ✅ (close, but doable)
- **Design**: 2 Boxes introduce navigation challenge
- **Learning**: Pathfinding around obstacles

#### Level 3: Mixed Threats
- **Enemies**: 1 Weak (1) + 1 Normal (3) = 4
- **Items**: 1 Small (1) + 1 Medium (2) = 3
- **Balance**: Player (2) + Items (3) = 5 > Enemies (4) ✅ (close call)
- **Design**: Strategy needed - defeat weak enemy first
- **Learning**: Enemy prioritization

#### Level 4: Tight Spaces
- **Enemies**: 2 Normal (value 6)
- **Items**: 1 Medium (2)
- **Balance**: Player (2) + Items (2) = 4 < Enemies (6) ❌
- **Fix**: Need more items or weaker enemies
- **Design**: More obstacles, tighter spaces

#### Level 5: Lava Fields
- **Enemies**: 1 Normal (3) + 1 Strong (5) = 8
- **Items**: 1 Large (3)
- **Balance**: Player (2) + Items (3) = 5 < Enemies (8) ❌
- **Fix**: Need more items
- **Design**: First special grid (Lava), teaches hazard avoidance

---

### **Level 6-10: Medium**

#### Level 6: Three Way Split
- **Enemies**: 3 enemies (1+3+5 = 9)
- **Items**: 1 Small (1) + 1 Medium (2) = 3
- **Balance**: Player (2) + Items (3) = 5 < Enemies (9) ❌
- **Fix**: Need more items or adjust enemy values
- **Design**: Multiple enemies, prioritize order matters

#### Level 7: Swamp Danger
- **Enemies**: 3 enemies (3+3+5 = 11)
- **Items**: 1 Large (3)
- **Balance**: Player (2) + Items (3) = 5 < Enemies (11) ❌
- **Fix**: Need more items
- **Design**: Swamp introduced (high damage)

#### Level 8: Canon Jump
- **Enemies**: 3 enemies (3+5+5 = 13)
- **Items**: 1 Medium (2)
- **Balance**: Player (2) + Items (2) = 4 < Enemies (13) ❌
- **Fix**: Need more items
- **Design**: Canon teleport mechanic

#### Level 9: Maze Runner
- **Enemies**: 3 enemies (3+5+5 = 13)
- **Items**: 1 Large (3)
- **Balance**: Player (2) + Items (3) = 5 < Enemies (13) ❌
- **Fix**: Need more items
- **Design**: Complex obstacle maze

#### Level 10: First Boss
- **Enemies**: 1 Strong (5) + 1 Boss (8) = 13
- **Items**: 1 Small (1) + 1 Medium (2) = 3
- **Balance**: Player (2) + Items (3) = 5 < Enemies (13) ❌
- **Fix**: Need more items
- **Design**: First boss encounter, milestone level

---

### **Level 11-15: Hard**

Tăng dần số enemies, giảm items, thêm special grids.

#### Level 11: Death Trap
- **Enemies**: 4 enemies (3+5+5+5 = 18)
- **Items**: 1 Large (3)
- **Balance**: Player (2) + Items (3) = 5 < Enemies (18) ❌
- **Fix**: Need more items
- **Design**: All hazards (Lava + Swamp)

#### Level 12: Elite Guard
- **Enemies**: 5 enemies (3+5+5+5+5 = 23)
- **Items**: 1 Small (1) + 1 Large (3) = 4
- **Balance**: Player (2) + Items (4) = 6 < Enemies (23) ❌
- **Fix**: Need more items or adjust
- **Design**: High enemy count

#### Level 13: Boss Duo
- **Enemies**: 2 Bosses (8+8 = 16)
- **Items**: 1 Huge (5)
- **Balance**: Player (2) + Items (5) = 7 < Enemies (16) ❌
- **Fix**: Need more items
- **Design**: Two bosses challenge

#### Level 14: Chaos Maze
- **Enemies**: 4 enemies (3+5+5+8 = 21)
- **Items**: 1 Large (3)
- **Balance**: Player (2) + Items (3) = 5 < Enemies (21) ❌
- **Fix**: Need more items
- **Design**: Complex maze with all elements

#### Level 15: Mid Game Climax
- **Enemies**: 4 enemies (5+5+8+8 = 26)
- **Items**: 1 Medium (2) + 1 Huge (5) = 7
- **Balance**: Player (2) + Items (7) = 9 < Enemies (26) ❌
- **Fix**: Need more items
- **Design**: Boss rush, milestone

---

### **Level 16-20: Expert/Boss**

#### Level 16: Expert Test
- **Enemies**: 6 enemies (3+5+5+5+8+8 = 34)
- **Items**: 1 Large (3)
- **Balance**: Player (2) + Items (3) = 5 < Enemies (34) ❌
- **Fix**: Need more items
- **Design**: High enemy count

#### Level 17: Tactical Warfare
- **Enemies**: 5 enemies (5+5+8+8+8 = 34)
- **Items**: 1 Large (3)
- **Balance**: Player (2) + Items (3) = 5 < Enemies (34) ❌
- **Fix**: Need more items
- **Design**: Canon + obstacles strategy

#### Level 18: Boss Trio
- **Enemies**: 3 Bosses (8+8+8 = 24)
- **Items**: 1 Huge (5)
- **Balance**: Player (2) + Items (5) = 7 < Enemies (24) ❌
- **Fix**: Need more items
- **Design**: Three bosses, minimal resources

#### Level 19: Nightmare Labyrinth
- **Enemies**: 5 enemies (5+5+8+8+8 = 34)
- **Items**: 1 Huge (5)
- **Balance**: Player (2) + Items (5) = 7 < Enemies (34) ❌
- **Fix**: Need more items
- **Design**: All hazards + bosses

#### Level 20: Final Challenge
- **Enemies**: 4 Bosses (8+8+8+8 = 32)
- **Items**: 1 Huge (5)
- **Balance**: Player (2) + Items (5) = 7 < Enemies (32) ❌
- **Fix**: Need more items
- **Design**: Ultimate challenge, 4 bosses

---

## ⚠️ Vấn đề Cân bằng

**Nhận xét**: Hầu hết các levels từ level 4 trở đi đều **KHÔNG cân bằng** theo công thức đơn giản.

### Lý do thiết kế này vẫn hợp lý:

1. **Combat Value Gain**: Khi đánh bại enemy, player nhận thêm value
   - Ví dụ: Đánh bại enemy value 5 → player nhận +5
   - Player có thể "snowball" bằng cách đánh bại enemies yếu trước

2. **Strategic Progression**: 
   - Level dễ: Đủ items để đánh bại tất cả
   - Level khó: Cần strategy đánh bại enemies theo thứ tự đúng

3. **Risk vs Reward**:
   - Items xa player = risk cao nhưng reward lớn
   - Enemies mạnh = cần collect items trước

4. **Special Grids**:
   - Canon giúp di chuyển nhanh
   - Lava/Swamp buộc player phải cẩn thận

---

## 🎯 Công thức Cân bằng Thực tế

### Cách tính Value Progression:

```
Player Start: 2
After defeating enemy value X: +X value
Total possible value = Player Start + All Items + All Defeated Enemies
```

### Ví dụ Level 18 (Boss Trio):
- Player Start: 2
- Items: 5 (Huge)
- Defeating 1 Boss: +8
- Defeating 2 Bosses: +16
- Defeating 3 Bosses: +24

**Strategy**:
1. Collect item: 2 + 5 = 7
2. Defeat 1st Boss: 7 + 8 = 15
3. Defeat 2nd Boss: 15 + 8 = 23
4. Defeat 3rd Boss: 23 + 8 = 31 ✅

**Kết luận**: Level cân bằng nếu player đánh bại enemies theo thứ tự đúng!

---

## 📋 Checklist cho Level Design

Khi thiết kế level mới, kiểm tra:

- [ ] **Feasibility**: Player có thể đánh bại tất cả enemies không?
- [ ] **Progression**: Độ khó tăng dần từ level trước?
- [ ] **Items**: Đủ items để player có cơ hội?
- [ ] **Obstacles**: Tạo challenge nhưng không chặn hoàn toàn?
- [ ] **Special Grids**: Sử dụng đa dạng và có mục đích?
- [ ] **Enemy Placement**: Tạo strategic decisions?
- [ ] **Item Placement**: Tạo risk/reward choices?

---

## 🎮 Tips cho Level Design

1. **Early Levels**: Nhiều items, ít enemies → player học mechanics
2. **Mid Levels**: Cân bằng items/enemies → player học strategy
3. **Late Levels**: Ít items, nhiều enemies → player master skills

4. **Obstacles**: Đặt ở vị trí tạo alternate paths, không chặn hoàn toàn
5. **Hazards**: Đặt ở strategic points để player phải chọn route
6. **Canon**: Đặt ở vị trí giúp skip obstacles hoặc reach items nhanh

7. **Enemy Placement**: 
   - Weak enemies gần player → dễ đánh bại trước
   - Strong enemies xa → player có time collect items
   - Bosses ở cuối → climax battle

8. **Item Placement**:
   - Items gần = safe route
   - Items xa = risk/reward
   - Items giữa obstacles = skill test

---

## 📊 Summary Table

| Level | Enemies | Enemy Value | Items | Item Value | Balance Ratio | Special Features |
|-------|---------|-------------|-------|------------|---------------|------------------|
| 1 | 1 | 1 | 2 | 3 | 5:1 ✅ | Tutorial |
| 2 | 2 | 2 | 1 | 1 | 3:2 ⚠️ | Obstacles |
| 3 | 2 | 4 | 2 | 3 | 5:4 ⚠️ | Mixed enemies |
| 4 | 2 | 6 | 1 | 2 | 4:6 ❌ | Tight spaces |
| 5 | 2 | 8 | 1 | 3 | 5:8 ❌ | Lava |
| 6 | 3 | 9 | 2 | 3 | 5:9 ❌ | Multiple paths |
| 7 | 3 | 11 | 1 | 3 | 5:11 ❌ | Swamp |
| 8 | 3 | 13 | 1 | 2 | 4:13 ❌ | Canon |
| 9 | 3 | 13 | 1 | 3 | 5:13 ❌ | Complex maze |
| 10 | 2 | 13 | 2 | 3 | 5:13 ❌ | First Boss |
| 11 | 4 | 18 | 1 | 3 | 5:18 ❌ | All hazards |
| 12 | 5 | 23 | 2 | 4 | 6:23 ❌ | High count |
| 13 | 2 | 16 | 1 | 5 | 7:16 ❌ | Boss duo |
| 14 | 4 | 21 | 1 | 3 | 5:21 ❌ | Chaos |
| 15 | 4 | 26 | 2 | 7 | 9:26 ❌ | Boss rush |
| 16 | 6 | 34 | 1 | 3 | 5:34 ❌ | Expert |
| 17 | 5 | 34 | 1 | 3 | 5:34 ❌ | Tactical |
| 18 | 3 | 24 | 1 | 5 | 7:24 ❌ | Boss trio |
| 19 | 5 | 34 | 1 | 5 | 7:34 ❌ | Nightmare |
| 20 | 4 | 32 | 1 | 5 | 7:32 ❌ | Final |

**Note**: Balance ratio = (Player Start + Items) : Total Enemy Value
- ✅ = Có thể đánh bại ngay
- ⚠️ = Cần strategy
- ❌ = Cần đánh bại enemies theo thứ tự để gain value

---

## 🎯 Kết luận

Level design này sử dụng **"Combat Value Gain"** làm cơ chế cân bằng chính:
- Player không thể đánh bại tất cả enemies ngay lập tức
- Cần đánh bại enemies yếu trước để gain value
- Items giúp player có đủ value để đánh bại enemies đầu tiên
- Sau đó, defeated enemies cung cấp value để đánh bại enemies mạnh hơn

Đây là một **progression system** classic trong game design, tạo ra gameplay loop:
1. Collect items
2. Defeat weak enemies
3. Gain value
4. Defeat stronger enemies
5. Repeat

