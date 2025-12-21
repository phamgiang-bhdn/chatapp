'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const messages = [
      { id: 1, conversationId: 1, senderId: 1, content: 'Chào Bình! Bạn khỏe không?', type: 'text', createdAt: new Date(Date.now() - 3600000), updatedAt: new Date(Date.now() - 3600000) },
      { id: 2, conversationId: 1, senderId: 2, content: 'Chào An! Mình khỏe, cảm ơn bạn! Còn bạn thì sao?', type: 'text', createdAt: new Date(Date.now() - 3540000), updatedAt: new Date(Date.now() - 3540000) },
      { id: 3, conversationId: 1, senderId: 1, content: 'Mình cũng ổn! Đang làm tính năng mới. Bạn muốn xem cùng không?', type: 'text', createdAt: new Date(Date.now() - 3480000), updatedAt: new Date(Date.now() - 3480000) },
      { id: 4, conversationId: 1, senderId: 2, content: 'Được chứ! Gửi mình xem nhé.', type: 'text', createdAt: new Date(Date.now() - 300000), updatedAt: new Date(Date.now() - 300000) },
      { id: 5, conversationId: 1, senderId: 1, content: 'Tốt! Mình sẽ gửi tài liệu thiết kế cho bạn.', type: 'text', createdAt: new Date(Date.now() - 60000), updatedAt: new Date(Date.now() - 60000) },
      { id: 6, conversationId: 2, senderId: 1, content: 'Cường, bạn đã xem các cập nhật mới nhất chưa?', type: 'text', createdAt: new Date(Date.now() - 7200000), updatedAt: new Date(Date.now() - 7200000) },
      { id: 7, conversationId: 2, senderId: 3, content: 'Rồi! Nhìn ổn đấy. Chúng ta sẽ thảo luận trong cuộc họp nhé.', type: 'text', createdAt: new Date(Date.now() - 7140000), updatedAt: new Date(Date.now() - 7140000) },
      { id: 8, conversationId: 2, senderId: 1, content: 'Nghe hay đấy 👍', type: 'text', createdAt: new Date(Date.now() - 600000), updatedAt: new Date(Date.now() - 600000) },
      { id: 9, conversationId: 3, senderId: 1, content: 'Team, chúng ta có buổi lên kế hoạch sprint vào ngày mai lúc 10 giờ sáng.', type: 'text', createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 86400000) },
      { id: 10, conversationId: 3, senderId: 5, content: 'Hiểu rồi! Mình sẽ chuẩn bị các backlog items.', type: 'text', createdAt: new Date(Date.now() - 86340000), updatedAt: new Date(Date.now() - 86340000) },
      { id: 11, conversationId: 3, senderId: 7, content: 'Tốt! Mình đang làm tài liệu API.', type: 'text', createdAt: new Date(Date.now() - 86280000), updatedAt: new Date(Date.now() - 86280000) },
      { id: 12, conversationId: 3, senderId: 3, content: 'Làm tốt lắm mọi người! Hẹn gặp lại ngày mai.', type: 'text', createdAt: new Date(Date.now() - 86220000), updatedAt: new Date(Date.now() - 86220000) },
      { id: 13, conversationId: 3, senderId: 1, content: 'Đừng quên review các PR trước cuộc họp nhé!', type: 'text', createdAt: new Date(Date.now() - 3600000), updatedAt: new Date(Date.now() - 3600000) },
      { id: 14, conversationId: 4, senderId: 2, content: 'Chào các designer! Xem mockup mới mình vừa tạo này.', type: 'text', createdAt: new Date(Date.now() - 43200000), updatedAt: new Date(Date.now() - 43200000) },
      { id: 15, conversationId: 4, senderId: 6, content: 'Wow, nhìn đẹp quá! Mình thích bảng màu này.', type: 'text', createdAt: new Date(Date.now() - 43140000), updatedAt: new Date(Date.now() - 43140000) },
      { id: 16, conversationId: 4, senderId: 8, content: 'Đồng ý! Typography cũng rất ổn.', type: 'text', createdAt: new Date(Date.now() - 43080000), updatedAt: new Date(Date.now() - 43080000) },
      { id: 17, conversationId: 4, senderId: 4, content: 'Đây chính xác là những gì chúng ta cần. Làm tốt lắm!', type: 'text', createdAt: new Date(Date.now() - 43020000), updatedAt: new Date(Date.now() - 43020000) },
      { id: 18, conversationId: 4, senderId: 2, content: 'Cảm ơn mọi người! Hãy hoàn thiện nó trước thứ Sáu nhé.', type: 'text', createdAt: new Date(Date.now() - 1800000), updatedAt: new Date(Date.now() - 1800000) },
      { id: 19, conversationId: 5, senderId: 3, content: 'Dung, bạn đã có số liệu marketing sẵn chưa?', type: 'text', createdAt: new Date(Date.now() - 7200000), updatedAt: new Date(Date.now() - 7200000) },
      { id: 20, conversationId: 5, senderId: 4, content: 'Sắp xong rồi! Mình sẽ gửi trong một giờ nữa.', type: 'text', createdAt: new Date(Date.now() - 7140000), updatedAt: new Date(Date.now() - 7140000) },
      { id: 21, conversationId: 5, senderId: 3, content: 'Tốt, cảm ơn bạn!', type: 'text', createdAt: new Date(Date.now() - 3600000), updatedAt: new Date(Date.now() - 3600000) },
      { id: 22, conversationId: 6, senderId: 5, content: 'Ai muốn đi leo núi vào thứ Bảy này không?', type: 'text', createdAt: new Date(Date.now() - 172800000), updatedAt: new Date(Date.now() - 172800000) },
      { id: 23, conversationId: 6, senderId: 1, content: 'Mình tham gia! Mấy giờ vậy?', type: 'text', createdAt: new Date(Date.now() - 172740000), updatedAt: new Date(Date.now() - 172740000) },
      { id: 24, conversationId: 6, senderId: 2, content: 'Mình cũng tham gia! Bắt đầu sớm nhé, khoảng 7 giờ sáng?', type: 'text', createdAt: new Date(Date.now() - 172680000), updatedAt: new Date(Date.now() - 172680000) },
      { id: 25, conversationId: 6, senderId: 6, content: '7 giờ sáng nghe ổn đấy! Mình sẽ mang đồ ăn nhẹ.', type: 'text', createdAt: new Date(Date.now() - 172620000), updatedAt: new Date(Date.now() - 172620000) },
      { id: 26, conversationId: 6, senderId: 5, content: 'Tuyệt vời! Gặp nhau ở điểm xuất phát lúc 7 giờ sáng đúng nhé!', type: 'text', createdAt: new Date(Date.now() - 7200000), updatedAt: new Date(Date.now() - 7200000) }
    ];

    await queryInterface.bulkInsert('messages', messages);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('messages', null, {});
  }
};
