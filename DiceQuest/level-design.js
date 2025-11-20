// DiceQuest Level Design Configuration
// Level Design Format:
// - 'P' = Player starting position
// - Negative numbers (-1, -3, -5, -8, etc.) = Enemy (value = abs(number), icon auto-assigned)
// - Positive numbers (1, 2, 3, 5, etc.) = Item (value = number, icon auto-assigned)
// - 'B' = Box (obstacle)
// - 'L' = Lava
// - 'S' = Swamp
// - 'C' = Canon
// - 'R' = Princess (must be rescued to spawn portal)
// - '.' or ' ' or 0 = Empty cell

const LEVEL_DESIGN = {
    LEVELS: [
        {
            level: 1,
            name: 'Đồng Cỏ Khởi Hành',
            playerStartValue: 2,
            description: 'Màn mở đầu cực kỳ an toàn để người chơi làm quen với di chuyển, nhặt đồ và nhìn thấy kẻ địch từ xa.',
            goldPerLevel: 12,
            goldPerBag: 6,
            minItems: 1,
            maxItems: 3,
            spawnTurns: 3,            designIntent: 'Màn 1 tập trung tạo cảm giác an toàn và dễ hiểu: người chơi thấy rõ kẻ địch nhưng không bị ép chiến đấu sớm, có thời gian làm quen nhịp lăn xúc xắc và đếm bước di chuyển. Các hộp được đặt vừa đủ để gợi ý rằng không phải ô nào cũng đi qua được, nhưng không tạo thành mê cung rối rắm. Vật phẩm nằm trên đường đi tương đối tự nhiên để người chơi tự khám phá niềm vui “nhặt là mạnh hơn” mà không cần giải thích nhiều.',
            optimalStrategy: 'Ở giai đoạn mở đầu, người chơi nên di chuyển theo đường cong nhẹ từ dưới lên trên, ưu tiên nhặt vật phẩm gần trước rồi mới lại gần kẻ địch. Khi đã có ít nhất một lần tăng sức mạnh, họ có thể chủ động chọn đánh một kẻ địch đứng lẻ để trải nghiệm combat mà vẫn an toàn. Sau đó, người chơi chỉ cần tránh đứng giữa hai kẻ địch cùng lúc, mở đường về phía bên phải nơi công chúa đang đợi. Nguyên tắc quan trọng mà màn 1 muốn khắc vào người chơi là: nhặt đồ trước, đánh sau, và luôn để ý hướng tiếp cận của kẻ địch.',
            layout: [
                [0, 0, "B", 0, 0, "B", 0, 0],
                [0, 0, 0, 0, 0, -2, 0, 0],
                [0, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, "B", 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, -2, 0, 0, 0, 0],
                [0, 0, "B", 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                ["P", 0, 1, 0, 0, 0, "R", 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ]            
        },

        {
            level: 2,
            name: 'Lối Mòn Bên Dòng Dung Nham',
            playerStartValue: 2,
            description: 'Màn giới thiệu ô dung nham L và khái niệm đánh đổi máu để rút ngắn quãng đường.',
            goldPerLevel: 16,
            goldPerBag: 8,
            minItems: 1,
            maxItems: 3,
            spawnTurns: 3,            designIntent: 'Màn 2 thêm dung nham L để dạy người chơi rằng máu là một loại tài nguyên có thể dùng để đổi lấy vị trí tốt hơn. L được đặt ở các đường tắt hấp dẫn để chính người chơi phát hiện ra: đi qua thì đau nhưng lại nhanh hơn và né được một số kẻ địch. Kẻ địch vẫn tương đối yếu, đóng vai trò tạo áp lực nhẹ để người chơi không thể mãi đứng yên suy nghĩ nhưng cũng không bị dọa sập moral.',
            optimalStrategy: 'Giai đoạn mở màn, người chơi nên quan sát toàn bản đồ để xem các cụm L nằm trên những đường nào và đánh dấu trong đầu đường an toàn, đường nhanh nhưng tốn máu. Họ nên nhặt ít nhất một vật phẩm dễ tiếp cận ở nửa trên trước khi nghĩ đến việc cắt ngang qua dung nham. Khi đã mạnh hơn, người chơi có thể chấp nhận bước qua một ô L để tránh phải vòng qua chỗ kẻ địch đứng chờ. Cuối cùng, đường đến công chúa nên là kết hợp giữa một chút rủi ro L và việc tránh bị hai kẻ địch dồn lại một lúc, nhắc người chơi rằng quyết định di chuyển luôn là lựa chọn giữa an toàn và tốc độ.',
            layout: [
                [0, "B", 0, 0, 0, 0, "B", 0],
                [0, 0, 0, "L", 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, -2, 0, 0, 0],
                [0, 0, "B", 0, 0, 0, "L", 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, -2, 0, 1],
                ["P", 0, 0, "L", 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 0, -2, "R"]
            ]            
        },

        {
            level: 3,
            name: 'Ngã Ba Rừng Sâu',
            playerStartValue: 2,
            description: 'Màn phân nhánh với nhiều lựa chọn đường đi và cụm vật phẩm rõ ràng ở các hướng khác nhau.',
            goldPerLevel: 18,
            goldPerBag: 8,
            minItems: 1,
            maxItems: 4,
            spawnTurns: 3,            designIntent: 'Màn 3 chuyển từ đường đi tuyến tính sang cấu trúc phân nhánh thực sự, nơi người chơi phải chọn ưu tiên: đi nhánh có nhiều vật phẩm nhưng gần kẻ địch, hay nhánh an toàn hơn nhưng ít phần thưởng. Hai ô L được đặt ở vị trí khiến đường thẳng trở nên rủi ro, khuyến khích người chơi học cách đánh giá đường vòng. Đây cũng là màn đầu tiên mà việc bỏ bớt một vật phẩm đôi khi lại là quyết định đúng, giúp người chơi thoát khỏi tư duy “phải nhặt hết mọi thứ”.',
            optimalStrategy: 'Ở giai đoạn mở đầu, người chơi nên lùi một nhịp để đọc vị trí ba kẻ địch và các cụm vật phẩm, sau đó quyết định tập trung vào cánh trái hay phải thay vì lang thang giữa map. Họ nên nhặt ít nhất một vật phẩm gần P để tăng sức mạnh cơ bản, rồi mới tiếp cận nhánh có kẻ địch mạnh hơn ở nửa dưới bản đồ. Trong giao chiến, người chơi nên dụ từng kẻ ra khu vực trống, tránh đối đầu ngay gần những ô L dễ gây mất máu vô nghĩa khi phải chạy. Cuối cùng, khi đã xử lý hoặc tránh được kẻ trấn giữ gần R, đường đến công chúa sẽ rõ ràng hơn, giúp người chơi nhận ra giá trị của việc chọn đường ngay từ đầu.',
            layout: [
                [0, "B", 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, "L", 0, 0, 0, 0],
                [0, 0, 0, 0, -3, 0, 0, 0],
                [0, "B", 0, 0, 0, 0, "L", 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                ["P", 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, -3, 0, 0],
                [0, 0, 2, 0, 0, 0, -3, "R"]
            ]            
        },

        {
            level: 4,
            name: 'Đầm Lầy Tăm Tối',
            playerStartValue: 2,
            description: 'Màn giới thiệu đầm lầy S với trừng phạt máu nặng hơn, buộc người chơi tính toán kỹ từng bước.',
            goldPerLevel: 22,
            goldPerBag: 9,
            minItems: 1,
            maxItems: 4,
            spawnTurns: 3,            designIntent: 'Màn 4 nâng độ căng bằng việc thêm đầm lầy S với sát thương 2, tạo ra những ô mà người chơi gần như “không muốn chạm vào” trừ khi thật sự bí. S được đặt ở các điểm cổ chai, buộc người chơi phải cân nhắc giữa việc đi vòng xa hay hi sinh một lượng máu đáng kể. Kẻ địch khỏe hơn và phân bố từ giữa map trở xuống, làm cho việc giữ máu cho giai đoạn cuối trở nên quan trọng.',
            optimalStrategy: 'Đầu màn, người chơi nên ưu tiên nhặt vật phẩm an toàn ở phía trên và tránh lao xuống khu vực có S khi chưa cần thiết. Khi bắt đầu chạm mặt đám kẻ địch ở giữa và dưới map, họ cần chủ động chọn mặt trận thuận lợi, dụ từng con ra khu vực rộng để tránh vừa phải lùi vừa dẫm lên S hoặc L. Lý tưởng là người chơi chỉ chấp nhận qua S trong một vài tình huống bắt buộc, ví dụ khi đó là con đường duy nhất để kịp đến R trước khi bị bao vây. Màn này dạy rõ một điều: chỉ vì một ô có thể bước lên được không có nghĩa là nên bước lên nó.',
            layout: [
                [0, "B", 0, 0, 0, 0, 0, 0],
                [0, 2, 0, "L", 0, 0, 0, 0],
                [0, 0, "S", 0, 0, 0, 0, 0],
                [0, 0, 0, 0, -3, 0, 0, 0],
                [0, "B", 0, 0, 0, 0, "L", 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, -3, 1],
                ["P", 0, 0, "S", 0, 0, 0, 0],
                [0, 0, 2, 0, 0, -3, 0, 0],
                [0, 0, 0, 0, 2, 0, -3, "R"]
            ]            
        },

        {
            level: 5,
            name: 'Hẻm Núi Xoắn Ốc',
            playerStartValue: 2,
            description: 'Màn mid-game kết hợp áp lực kẻ địch, địa hình nguy hiểm và định tuyến nhiều lớp.',
            goldPerLevel: 26,
            goldPerBag: 10,
            minItems: 2,
            maxItems: 5,
            spawnTurns: 3,            designIntent: 'Màn 5 đánh dấu cảm giác “mid-game thực sự” khi người chơi bắt đầu thấy nếu đi sai vài bước là có thể toang cả ván. Địa hình xoắn ốc khiến họ phải đi vòng qua nhiều lớp, đối diện, lùi lại, rồi lại mở hướng mới, thay vì chỉ đi thẳng một mạch xuống dưới. Sự kết hợp giữa L, S và các kẻ địch có sức mạnh khác nhau buộc người chơi phải phối hợp cả quản lý máu, sức mạnh tấn công và kiểm soát vị trí.',
            optimalStrategy: 'Giai đoạn đầu, người chơi nên nhặt nhanh vật phẩm 3 ở gần và thêm một vài vật phẩm dọc đường xoắn ốc để nâng sức mạnh lên mức đủ an tâm cho các trận đánh dài hơn. Khi bắt đầu gặp kẻ địch, nên ưu tiên xử lý những con đứng chắn các nút cổ chai, tránh để chúng chặn đường rồi bị buộc phải dẫm lên L hoặc S khi lùi. Ở đoạn cuối, việc chọn lối tiếp cận công chúa cần dựa trên lượng máu còn lại: nếu máu đủ dày, có thể chấp nhận ăn một lần L để rút ngắn đường; nếu máu mỏng, nên chọn đường vòng nhưng ít rủi ro hơn. Màn này nhấn mạnh cảm giác “quy hoạch hành trình” thay vì xử lý từng lượt một cách bản năng.',
            layout: [
                [0, "B", 0, 0, 0, 0, 0, 0],
                [0, 3, 0, "L", 0, 0, 0, 0],
                [0, 0, "S", 0, 0, 0, -3, 0],
                [2, 0, 0, 0, 0, 0, "B", 0],
                [0, "B", 0, 0, 0, 0, "L", 0],
                [0, 0, 2, 0, 0, 0, 0, 0],
                ["P", 0, 0, 0, 0, 0, -3, 2],
                [0, 0, "L", 0, 0, "S", 0, 0],
                ["B", 0, 0, 0, -4, 0, 1, 0],
                [0, 0, 0, 0, -3, 0, -3, "R"]
            ]            
        },

        {
            level: 6,
            name: 'Tháp Dịch Chuyển',
            playerStartValue: 2,
            description: 'Màn đầu tiên giới thiệu ô C (Canon) để người chơi trải nghiệm dịch chuyển chiến thuật.',
            goldPerLevel: 28,
            goldPerBag: 10,
            minItems: 2,
            maxItems: 5,
            spawnTurns: 3,            designIntent: 'Màn 6 tập trung vào việc giới thiệu cơ chế dịch chuyển chiến thuật thông qua ô C. Người chơi học cách lợi dụng dịch chuyển để vượt chướng ngại vật hoặc thoát khỏi các tình huống bị dồn. Bản đồ được thiết kế với nhiều khe hẹp, khiến việc đi bộ thông thường tốn nhiều lượt, tạo động lực để thử nghiệm Canon.',
            optimalStrategy: 'Đầu màn, người chơi nên nhặt vật phẩm an toàn ở nửa trên trước khi tiến tới ô C. Khi dùng Canon, nên dịch chuyển đến khu vực ít kẻ địch để mở góc quan sát và thuận lợi nhặt các vật phẩm còn lại. Trong giao tranh, cần cẩn thận vì một số kẻ đứng ở vị trí chokepoint rất dễ khiến người chơi bị ép lùi vào L hoặc S. Đường cuối đến công chúa sẽ dễ dàng hơn nhiều nếu người chơi tận dụng tốt vị trí sau khi dịch chuyển.',
            layout: [
                [0, "B", 0, "L", 0, 0, 0, 0],
                [0, 3, 0, 0, 0, "B", 0, 0],
                [0, 0, "S", 0, 0, 0, 0, 0],
                ["C", 0, 0, 0, -4, 0, 0, 0],
                [0, "B", 0, 0, 0, 0, "L", 0],
                [0, 0, 2, 0, 0, 0, 0, 0],
                ["P", 0, 0, 0, 0, 0, -4, 2],
                [0, 0, "L", 0, 1, "S", 0, 0],
                ["B", 0, 0, 0, -4, 0, 1, 0],
                [0, 0, 0, 0, -3, 0, -3, "R"]
            ]            
        },

        {
            level: 7,
            name: 'Cánh Cổng Vực Đen',
            playerStartValue: 2,
            description: 'Màn nâng cấp độ khó với nhiều kẻ địch mạnh và hai ô C để tạo nhiều hướng tiếp cận.',
            goldPerLevel: 30,
            goldPerBag: 12,
            minItems: 2,
            maxItems: 6,
            spawnTurns: 3,            designIntent: 'Màn 7 tạo ra cảm giác như một bản đồ \'đa tuyến\', nơi người chơi có thể chọn dịch chuyển qua lại giữa hai đầu map để tái cấu trúc hành trình. Các kẻ địch mạnh hơn ở nửa dưới tạo áp lực lớn, buộc người chơi phải cân nhắc việc nâng sức mạnh qua nhiều vật phẩm hơn trước khi lao vào vùng nguy hiểm.',
            optimalStrategy: 'Người chơi nên bắt đầu bằng cách gom đủ vật phẩm ở phía trái và phía trên, sau đó dùng ô C đầu tiên để đến vùng an toàn mới ở giữa map. Khi đã quan sát thế trận, có thể tiếp cận cụm vật phẩm lớn ở bên phải để tăng power trước khi đánh những kẻ mạnh gần cuối map. Một cú dịch chuyển cuối qua ô C thứ hai sẽ giúp người chơi tránh phải băng qua dãy L và S dày đặc để đến công chúa.',
            layout: [
                [0, "B", 0, "L", 0, 0, 0, 0],
                [0, 3, 0, 0, 0, "B", 0, 0],
                ["C", 0, "S", 0, 0, 0, 0, 0],
                [0, 0, 0, 0, -5, 0, 0, 0],
                [0, "B", 0, 0, 0, 0, "L", 0],
                [1, 0, 2, 0, 0, 0, 0, 0],
                ["P", 0, 0, "C", 0, 0, -4, 2],
                [0, 0, "L", 0, 1, "S", 0, 0],
                ["B", 0, 0, 0, -5, 0, 1, 0],
                [0, 0, 2, 0, -4, 0, -3, "R"]
            ]            
        },

        {
            level: 8,
            name: 'Hành Lang Đá Sụp',
            playerStartValue: 2,
            description: 'Màn tập trung vào quản lý lộ trình với nhiều Box tạo thành các đường hẹp và bẫy di chuyển.',
            goldPerLevel: 34,
            goldPerBag: 12,
            minItems: 3,
            maxItems: 7,
            spawnTurns: 3,            designIntent: 'Màn 8 bắt đầu tạo cảm giác \'nghẹt thở\' hơn với các hành lang hẹp khiến người chơi dễ bị dồn góc. Người chơi phải đọc được các vùng an toàn tạm thời và tiến từng bước có tính toán. Số lượng Box lớn tạo nhiều dead-end nhằm thử khả năng ra quyết định và quan sát trước khi hành động.',
            optimalStrategy: 'Ngay từ đầu, người chơi nên tìm một chuỗi vật phẩm dễ nhặt mà không lao vào hành lang có kẻ địch. Khi phải đi vào đường hẹp, họ cần dụ từng kẻ ra khu vực rộng trước khi quay lại thu thập vật phẩm giữa map. Việc sử dụng ô C đúng lúc có thể giúp bỏ qua một đoạn hành lang cực nguy hiểm. Khi đã tích đủ sức mạnh, việc phá vòng vây cuối cùng và đến với công chúa sẽ trở nên dễ hơn, nhưng chỉ nếu người chơi còn đủ máu sau các bẫy L và S.',
            layout: [
                ["B", "B", 0, 0, "B", 0, 0, 0],
                [0, 3, 0, "L", 0, "B", 0, 0],
                [0, 0, "S", 0, 0, 0, 0, 0],
                ["C", 0, 0, 0, -5, 0, 0, 0],
                [0, "B", 0, 0, 1, 0, "L", 0],
                [0, 0, 2, 0, 0, 0, 0, 0],
                ["P", 0, 0, 0, 0, 0, -6, 2],
                [0, "B", "L", 0, 1, "S", 0, 0],
                ["B", 0, 0, 0, -6, 0, 1, 0],
                [0, 0, 2, 0, -5, 0, -3, "R"]
            ]            
        },

        {
            level: 9,
            name: 'Miền Săn Lùng',
            playerStartValue: 2,
            description: 'Màn gần cuối với rất nhiều kẻ địch rải khắp map, tạo áp lực di chuyển liên tục.',
            goldPerLevel: 40,
            goldPerBag: 14,
            minItems: 3,
            maxItems: 7,
            spawnTurns: 3,            designIntent: 'Màn 9 đưa người chơi vào tình trạng \'bị săn\' thực sự: kẻ địch xuất hiện dày đặc, máu bị đe dọa liên tục và đường đi gần như không còn an toàn tuyệt đối. Người chơi buộc phải chủ động tấn công hoặc chạy có kế hoạch để không bị bao vây.',
            optimalStrategy: 'Người chơi cần nhanh chóng nhặt 2–3 vật phẩm gần nhất rồi tìm điểm dịch chuyển để mở không gian tẩu thoát. Trong quá trình đánh, họ nên ưu tiên hạ những kẻ có khả năng chặn đường trước khi chúng dồn ép. Khi đã xoay sở qua nửa map, hãy tận dụng ô C để tiến thẳng đến khu vực ít kẻ địch và tránh vùng dày đặc Swamp. Mục tiêu cuối cùng là tiếp cận công chúa bằng đường vòng ổn định thay vì đâm thẳng qua cụm địch mạnh.',
            layout: [
                [0, "B", 0, 0, "B", 0, 0, -5],
                [0, 3, 0, "L", 0, "B", 0, 0],
                ["C", 0, "S", 0, 0, 0, 0, 0],
                [0, 2, 0, 0, -6, 0, 0, 0],
                [0, "B", 0, 0, 1, 0, "L", 0],
                [0, 0, 2, 0, 0, 0, -6, 0],
                ["P", 0, 0, "C", 0, 0, -5, 2],
                [0, "B", "L", 0, 1, "S", 0, 0],
                ["B", 0, 0, 0, -6, 0, 1, 0],
                [0, 0, 2, 0, -5, 0, -4, "R"]
            ]            
        },

        {
            level: 10,
            name: 'Vương Thành Hồi Kết',
            playerStartValue: 2,
            description: 'Màn cuối cùng—đỉnh điểm thử thách về điều hướng, chiến đấu và quản lý tài nguyên.',
            goldPerLevel: 50,
            goldPerBag: 15,
            minItems: 3,
            maxItems: 7,
            spawnTurns: 3,            designIntent: 'Màn 10 là nơi tất cả kỹ năng người chơi đã học được trong suốt hành trình đều được kiểm tra. Địa hình phức tạp và số lượng kẻ địch rất cao tạo ra áp lực liên tục khiến mỗi quyết định đều quan trọng. Đây là thử thách cuối cùng để người chơi chứng minh khả năng đọc bản đồ, quản lý máu và lựa chọn giao tranh.',
            optimalStrategy: 'Người chơi cần nhặt những vật phẩm quan trọng nhất trước khi chạm vào vùng trung tâm đầy kẻ mạnh. Cần sử dụng Canon thật thông minh để tạo lối đi tắt và thoát khỏi những vùng chết. Trong chiến đấu, nên hạ những kẻ có sát thương cao nhất trước, tránh để chúng giữ chokepoint. Đường cuối đến công chúa sẽ yêu cầu người chơi giữ lượng máu ổn định và biết rõ thời điểm nên đánh và thời điểm nên chạy.',
            layout: [
                ["B", "B", 0, "L", "B", 0, 0, -6],
                [0, 3, 0, "L", 0, "B", -5, 0],
                ["C", 0, "S", 0, 1, 0, 0, 0],
                [0, 2, 0, 0, -7, 0, 0, 0],
                [0, "B", 0, 0, 1, "S", "L", 0],
                [0, 0, 2, 0, "L", 0, -7, 0],
                ["P", 0, 0, "C", 0, 0, -6, 2],
                [0, "B", "L", 0, 1, "S", 0, 0],
                ["B", 0, 0, 0, -7, 0, 1, 0],
                [0, 0, 2, 0, -6, 0, -5, "R"]
            ]            
        }
        
    ]
};

// Attach LEVELS to CONFIG for backward compatibility
if (typeof CONFIG !== 'undefined') {
    CONFIG.LEVELS = LEVEL_DESIGN.LEVELS;
}