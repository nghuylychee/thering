# The Ring’s Diary

# Mục tiêu

- Tổng hợp info khi làm việc ở The Ring
- Update plan, progress và các design quanh gameplay đang làm

# Design game loop

![image.png](The%20Ring%E2%80%99s%20Diary/image.png)

Trong đó

- Moment-to-moment loop
    - Xoay quanh dynamic xác định mục tiêu muốn đến và roll dice để di chuyển của user
    - Cố tạo ra niềm vui mini xoay quanh sự kì vọng khi roll dice
- Minutes loop
    - Đóng vai trò là mục tiêu cho moment-to-moment loop
    - Đẩy cảm xúc lên cho user thông qua việc combat và progress sức mạnh trong run
- 20-min loop (Run loop)
    - Đoạn reset của hành trình
    - Cho phép user upgrade persistent power cho bản thân để run sau dễ hơn
- Hours loop
    - Muốn tạo ra cảm giác friction cao, buộc user phải thua nhiều lần ở 1 màn trước khi qua màn mới

# Deconstruct

| Entity | Cơ chế |
| --- | --- |
| Player | Roll dice để ra số bước có thể di chuyển
User di chuyển max bao nhiêu đó bước, min có thể không đi luôn |
| Player | Có bộ stat cơ bản
- Min dice roll
- Max dice roll
- Power |
| Player | Cơ chế thắng round: giết hết enemy có trong round |
| Player vs Enemy | Combat khi đứng chung ô, ai có power lớn hơn thì thắng, player thắng thì ăn hết power của enemy |
| Player | Player có thể chọn nâng cấp khi complete 1 round.
Sẽ có 3 nâng cấp được gen random ra, mỗi nâng cấp có effect và tốn 1 lượng dice nhất định
Player sẽ phải roll dice để xài khi mua nâng cấp, min-max dice theo stat player |
| Enemy | Roll dice để di chuyển mỗi turn, cơ chế di chuyển giống player |
| Enemy | Dice của enemy có max value = đúng Power của nó |
| Enemy | Cơ chế AI
- Khi mạnh hơn player thì đi săn player
- Khi yếu hơn player thì cố gắng đi ăn item, nếu hết item thì ráng chạy |
| Obstacle | Có
- Block: cản đường
- Lava: đi qua mất 1 máu
- Swamp: đi qua mất 2 máu |
| Gold | User có thể nhận gold từ việc hoàn thành các level trong run
User có thể nhận gold từ việc collect các túi gold trong level |
| Player | Dùng gold để upgrade sức mạnh sau mỗi run để các run sau dễ dàng hơn. Có thể upgrade
- Min dice roll
- Max dice roll
- Power khi bắt đầu mỗi level |

# How to get started

- Clone project từ repo này: https://github.com/nghuylychee/thering
- Cài node trước để chạy
    - cd E:\Games\VibeCoding\thering
    - npm install
    - npm start
- Sau đó tốt nhất nên đẩy repo lên git riêng để tiếp tục dev tiếp

# Feedback gameplay - 07/11

![image.png](The%20Ring%E2%80%99s%20Diary/image%201.png)

# Feedback gameplay - 10/11

## Update game loop

![image.png](The%20Ring%E2%80%99s%20Diary/image%202.png)

## Change log

- Update thêm cơ chế combat bằng màn hình pop-up
- Sửa một số bug về cơ chế di chuyển và combat

# Feedback gameplay - 11/11

## Feeling

- Gameplay còn quá nặng yếu tố may mắn, kém yếu tố chiến thuật
- Cơ chế sử dụng đúng 1 value để quyết định thắng/thua làm giảm độ deep của gameplay → khó làm thêm các cơ chế mở rộng sau này

## Update game loop

![image.png](The%20Ring%E2%80%99s%20Diary/image%203.png)

## Change log

### Thêm cơ chế 4 stat cho player

- Player giờ sẽ có 4 stat khác nhau thay vì chỉ đại diện bằng 1 value như trước đó, gồm
    - SPD: quyết định dice player khi roll di chuyển
    - INT: quyết định dice player khi roll chọn power-up lúc hoàn thành màn chơi
    - DMG: quyết định dice của player khi combat với enemy
    - HP: máu của player
- Cơ chế của các stat
    - SPD, INT, DMG: sẽ có giá trị min/max để quyết định min/max dice mà người chơi sẽ roll ra khi check
    - HP: quản lý theo dạng CurrentHP / Max HP

### Thay đổi cơ chế upgrade stat

- Upgrade dùng gold
- Upgrade tăng min/max riêng cho các stat SPD, INT, DMG
- Upgrade HP

### Thay đổi cơ chế ăn item

- Khi ăn item user sẽ được chọn stat để tăng 1 trong 4 stat (HP, SPD, INT, DMG)

### Thay đổi cơ chế stat của enemy

- Enemy giờ sẽ dùng value để scale cả HP, DMG và SPD theo cơ chế random từ 1 đến value

### Thay đổi cơ chế combat của enemy

- Enemy khi tấn công sẽ roll dice theo stat DMG của enemy
- Enemy nếu di chuyển trigger combat với player sẽ được tấn công trước

### Thay đổi cơ chế stat khi combat và hoàn thành level

- Khi hoàn thành level player giờ sẽ được giữ lại toàn bộ stat để tạo cảm giác mạnh hơn dần trong run
- Tuy nhiên player cũng sẽ không được hồi máu khi combat xong hay hoàn thành level

# Feedback gameplay - 12/11

- DiceBound hiện tại sẽ chốt gameplay như thế
- Plan sắp tới là duplicate thành 1 gameplay riêng và đổi điều kiện thắng lại thành chỉ cần giải cứu được công chúa thay vì giết hết enemy ⇒ tạo ra nhiều playstyle hơn

## Change log

### Duplicate ra thành 1 gameplay mới trên nền cũ

- Vẫn giữ nguyên gameplay cũ để tách ra thành game DiceBound
- Duplicate ra thành 1 gameplay mới tên DiceQuest

### Thêm điều kiện thắng khác

- Điều kiện thắng giờ sẽ thành cứu công chúa và thoát khỏi màn chơi thông qua cánh cổng teleport
- Cơ chế:
    - User tìm đến ô có công chúa
    - Sau đó game sẽ spawn cổng tele ra
    - Để thắng thì player sẽ phải đem công chúa chạy đến cổng

### Chỉnh sửa cơ chế enemy

- Enemy giờ sẽ có 2 phase
    - Phase 1: khi player chưa cứu công chúa, cơ chế như cũ
    - Phase 2: khi player đã cứu công chúa thì enemy sẽ luôn cố gắng tấn công player

# DiceQuest in Quantic Foundry

![image.png](The%20Ring%E2%80%99s%20Diary/image%204.png)

Design của mong muốn sẽ tập trung vào 2 yếu tố chính là

- **Strategy:**
    - Người chơi cân nhắc di chuyển / combat như nào trong run
        - Thêm độ deep trong màn chơi
            - Qua các region sau sẽ giới thiệu thêm các loại Equipment khác ⇒ tăng loại stat khác
            - Tương ứng với đó là giới thiệu các loại enemy đặc thù yêu cầu các stat mới
                - Ví dụ enemy né cần stat accuracy
        - Thêm các layer buff sức mạnh khác (giống We are warrior)
            - Skill: cho phép user active khi đang trong run
    - Người chơi cân nhắc cách farm tối ưu qua các run để nâng cấp stat
    - Người chơi cân nhắc nâng cấp stat nào trước sau
- **Power:**
    - Nâng cấp sức mạnh thông qua việc tăng min/max của các stat SPD, DMG, HP
        - Spend gold cày được qua các run ⇒ bán gói multiply gold như We are Warrior
        - Các stat này sẽ reset khi qua region mới
    - Nâng cấp thông qua hệ thống Equipment
        - Equipment đóng vai trò bonus point cộng thẳng vào value các stat tương ứng khi roll. Ví dụ
            - Giày cộng stat SPD
            - Giáp cộng stat HP
            - Weapon cộng stat DMG
        - Equipment phải được equip vào để có tác dụng
        - Nâng cấp item thông qua **hệ thống gacha**
            - Equipment nâng cấp sẽ tăng bonus point cho stat
            - Stat của Equipment sẽ được giữ vĩnh viễn

## What’s next

- Bỏ hệ thống nâng stat lúc hoàn thành level, cảm thấy không cần thiết
    - Đi kèm là bỏ luôn stat INT
- Làm thêm hệ thống Equipment để test
    - Gacha ra từ chest, upgrade bằng cách collect đủ mảnh
    - User được phép chọn lựa equip trước khi vào game
    - Cơ chế equipment cho bonus point khi roll tương ứng (SPD, DMG, riêng HP là tác động trực tiếp)

# Market Research

## Product Positioning

- Nếu định vị DiceQuest theo chuẩn của SensorTower thì thấy xếp vô genre [**Board**](https://app.sensortower.com/market-analysis/top-apps?metric=revenue&os=unified&category=7004&uai=57d8a413d2d5654b3700adcc&saa=com.jellybtn.boardkings&sia=1116488672&edit=1&granularity=weekly&start_date=2025-10-27&end_date=2025-11-25&duration=P30D&measure=DAU&comparison_attribute=absolute&comparison_period=pop&country=US&country=AU&country=CA&country=CN&country=FR&country=DE&country=GB&country=IT&country=JP&country=RU&country=KR&country=DZ&country=AO&country=AR&country=AT&country=AZ&country=BH&country=BD&country=BY&country=BE&country=BJ&country=BO&country=BR&country=BG&country=BF&country=KH&country=CM&country=CL&country=CO&country=CG&country=CR&country=CI&country=HR&country=CY&country=CZ&country=DK&country=DO&country=EC&country=EG&country=SV&country=EE&country=FI&country=GE&country=GH&country=GR&country=GT&country=HK&country=HU&country=IN&country=ID&country=IQ&country=IE&country=IL&country=JO&country=KZ&country=KE&country=KW&country=LA&country=LV&country=LB&country=LY&country=LT&country=LU&country=MO&country=MY&country=ML&country=MT&country=MX&country=MA&country=MZ&country=MM&country=NL&country=NZ&country=NI&country=NG&country=NO&country=OM&country=PK&country=PA&country=PY&country=PE&country=PH&country=PL&country=PT&country=QA&country=RO&country=SA&country=SN&country=RS&country=SG&country=SK&country=SI&country=ZA&country=ES&country=LK&country=SE&country=CH&country=TW&country=TZ&country=TH&country=TN&country=TR&country=UG&country=UA&country=AE&country=UY&country=UZ&country=VE&country=VN&country=YE&country=ZM&country=ZW&device=iphone&device=ipad&device=android&page=1&page_size=25&custom_fields_filter_mode=include_unified_apps&period=day&custom_fields_filter_id=6908b8b5c5a19ebcfe1b0ea7) là hợp lý nhất
    
    ![image.png](The%20Ring%E2%80%99s%20Diary/image%205.png)
    

- Trong genre Board thì với gameplay hiện tại thì thấy gần hơn với subgenre [RPG / Strategy](https://app.sensortower.com/market-analysis/top-apps?metric=revenue&os=unified&category=7004&uai=57d8a413d2d5654b3700adcc&saa=com.jellybtn.boardkings&sia=1116488672&edit=1&granularity=weekly&start_date=2025-10-27&end_date=2025-11-25&duration=P30D&measure=DAU&comparison_attribute=absolute&comparison_period=pop&country=US&country=AU&country=CA&country=CN&country=FR&country=DE&country=GB&country=IT&country=JP&country=RU&country=KR&country=DZ&country=AO&country=AR&country=AT&country=AZ&country=BH&country=BD&country=BY&country=BE&country=BJ&country=BO&country=BR&country=BG&country=BF&country=KH&country=CM&country=CL&country=CO&country=CG&country=CR&country=CI&country=HR&country=CY&country=CZ&country=DK&country=DO&country=EC&country=EG&country=SV&country=EE&country=FI&country=GE&country=GH&country=GR&country=GT&country=HK&country=HU&country=IN&country=ID&country=IQ&country=IE&country=IL&country=JO&country=KZ&country=KE&country=KW&country=LA&country=LV&country=LB&country=LY&country=LT&country=LU&country=MO&country=MY&country=ML&country=MT&country=MX&country=MA&country=MZ&country=MM&country=NL&country=NZ&country=NI&country=NG&country=NO&country=OM&country=PK&country=PA&country=PY&country=PE&country=PH&country=PL&country=PT&country=QA&country=RO&country=SA&country=SN&country=RS&country=SG&country=SK&country=SI&country=ZA&country=ES&country=LK&country=SE&country=CH&country=TW&country=TZ&country=TH&country=TN&country=TR&country=UG&country=UA&country=AE&country=UY&country=UZ&country=VE&country=VN&country=YE&country=ZM&country=ZW&device=iphone&device=ipad&device=android&page=1&page_size=25&custom_fields_filter_mode=include_unified_apps&period=day&custom_fields_filter_id=690a4f18c5a19ebcfefa0d05)
    
    ![image.png](The%20Ring%E2%80%99s%20Diary/image%206.png)
    

- Nhưng nếu nhìn ở góc độ này thấy có 2 vấn đề
    - Đa số game top là của Trung Quốc
    - Phải vào tầm top 5 may ra mới có rev 30 days hơn $ 200k ⇒ Mức độ cạnh tranh khó hơn nhưng phần thưởng không tốt như ngách Idle

1 số game hot quan sát được: Trong 30 days Download tầm 300k-500k IAP Rev ~ 200K

| **Link** | **Downloads** | **Revenue** |
| --- | --- | --- |
| https://app.sensortower.com/overview/65c43f1eef45c458d5fd1073/6469621221?metric=revenue&os=unified&custom_fields_filter_id=60215cca241bc16eb86b0931&edit=1&granularity=weekly&start_date=2025-10-27&end_date=2025-11-25&duration=P30D&measure=DAU&comparison_attribute=absolute&comparison_period=pop&country=US&category=0&device=iphone&page=1&page_size=25&custom_fields_filter_mode=include_unified_apps&period=day | 419,565 | $205,757 |
| https://app.sensortower.com/overview/6610560dad4adb02de831cef?page=1&metric=revenue&os=unified&custom_fields_filter_id=60215cca241bc16eb86b0931&edit=1&granularity=weekly&start_date=2025-10-27&end_date=2025-11-25&duration=P30D&measure=DAU&comparison_attribute=absolute&comparison_period=pop&country=US&category=0&device=iphone&page_size=25&custom_fields_filter_mode=include_unified_apps&period=day | 2,392,427 | $167,510 |
| https://app.sensortower.com/overview/68c096c416a31e462a3d6858/6745514342?metric=downloads&os=unified&custom_fields_filter_id=600abc3e241bc16eb8502222&edit=1&granularity=weekly&start_date=2025-10-27&end_date=2025-11-25&duration=P30D&measure=DAU&comparison_attribute=absolute&comparison_period=pop&country=US&category=0&device=iphone&page=1&page_size=25&custom_fields_filter_mode=include_unified_apps&period=day | 200,633 | $240,842 |
| https://app.sensortower.com/overview/67413dc75b7bd5461b13a6ce/6733247800?metric=downloads&os=unified&edit=1&granularity=weekly&start_date=2025-10-27&end_date=2025-11-25&duration=P30D&measure=DAU&comparison_attribute=absolute&comparison_period=pop&country=US&category=0&device=iphone&page=1&page_size=25&custom_fields_filter_mode=include_unified_apps&period=day&custom_fields_filter_id=6019bb50241bc16eb8dacf0e | 181,054 | $326,805 |

![image.png](The%20Ring%E2%80%99s%20Diary/image%207.png)

Puzzle RPG

![image.png](The%20Ring%E2%80%99s%20Diary/image%208.png)

Idle RPG

## Mahjong: new land discovered!

![image.png](The%20Ring%E2%80%99s%20Diary/image%209.png)

![image.png](The%20Ring%E2%80%99s%20Diary/image%2010.png)

- Bất ngờ phát hiện theme Mahjong scale rất rốt ở US, last 30 days mua được 1m3 user US
- Không phải chỉ có 1 case, mà ở bảng xếp hạng Game/Board cũng thấy rất nhiều game theme Mahjong có biểu hiện tương tự ở US (https://app.sensortower.com/market-analysis/top-apps?metric=downloads&os=unified&category=7004&edit=1&granularity=weekly&start_date=2025-11-01&end_date=2025-11-30&duration=P30D&measure=DAU&comparison_attribute=absolute&comparison_period=pop&page=1&page_size=200&custom_fields_filter_mode=include_unified_apps&period=day&uai=57d8a413d2d5654b3700adcc&saa=com.jellybtn.boardkings&sia=1116488672&country=US&country=AU&country=CA&country=CN&country=FR&country=DE&country=GB&country=IT&country=JP&country=RU&country=KR&country=DZ&country=AO&country=AR&country=AT&country=AZ&country=BH&country=BD&country=BY&country=BE&country=BJ&country=BO&country=BR&country=BG&country=BF&country=KH&country=CM&country=CL&country=CO&country=CG&country=CR&country=CI&country=HR&country=CY&country=CZ&country=DK&country=DO&country=EC&country=EG&country=SV&country=EE&country=FI&country=GE&country=GH&country=GR&country=GT&country=HK&country=HU&country=IN&country=ID&country=IQ&country=IE&country=IL&country=JO&country=KZ&country=KE&country=KW&country=LA&country=LV&country=LB&country=LY&country=LT&country=LU&country=MO&country=MY&country=ML&country=MT&country=MX&country=MA&country=MZ&country=MM&country=NL&country=NZ&country=NI&country=NG&country=NO&country=OM&country=PK&country=PA&country=PY&country=PE&country=PH&country=PL&country=PT&country=QA&country=RO&country=SA&country=SN&country=RS&country=SG&country=SK&country=SI&country=ZA&country=ES&country=LK&country=SE&country=CH&country=TW&country=TZ&country=TH&country=TN&country=TR&country=UG&country=UA&country=AE&country=UY&country=UZ&country=VE&country=VN&country=YE&country=ZM&country=ZW&device=iphone&device=ipad&device=android)
    - Các game này không theo 1 gameplay nhất định, có sự hoán đổi gameplay
    - Nhưng đa phần thiên về dạng match cặp
- Logic flow
    - Tìm được theme có vẻ CPI rẻ (do thấy scale nhiều) ở US
    - Theme Mahjong này có vẻ mình làm và test cũng dễ

# Updated gameplay - 02/02

- Thêm một số yếu tố reference từ game He is Coming vô gameplay hiện tại, bao gồm
    - Cơ chế map rộng, không quy hoạch thành dạng từng level như trước
    - Cơ chế ngày/đêm + limit số ngày đến khi gặp boss
        - Mỗi lần user di chuyển sẽ tính là 1 turn
        - Mỗi ngày/đêm sẽ có số lượng limit turn
        - Sau N đêm thì boss sẽ spawn ra ⇒ Ép user phải tìm mọi cách để tối ưu sức mạnh trước khi gặp boss
    - Thêm một số POI (Point of Interest) cho phép user tương tác một số activity thú vị (đa số là stat check) để tăng sức mạnh

# Updated gameplay 25/02

- Thêm cơ chế tilemap editor để phục vụ dựng map quay clip creative nếu cần
    
    ![image.png](The%20Ring%E2%80%99s%20Diary/image%2011.png)
    

- Trong tool cho phép
    - Config size của map (W x H)
    - Chọn theme của map
        - Từ mỗi theme sẽ có thêm các element như: BaseTile (nền), Decor, Entity
    - Sau khi đặt map xong thì có thể export json ra đặt tên dicerogue-map.json trong folder DiceRogue để apply làm map chính

# Demo

https://vngms.sharepoint.com/:f:/s/prototypes/EmUia9fstABLl99whBZ8wWsBiCvXIijas3wuyTKQJqffNA?e=IMpBWx