'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('conversations', [
      {
        id: 1,
        type: 'private',
        name: null,
        description: null,
        avatar: null,
        createdBy: 1,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        type: 'private',
        name: null,
        description: null,
        avatar: null,
        createdBy: 1,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        type: 'group',
        name: 'Nhóm Phát Triển',
        description: 'Thảo luận cho nhóm phát triển',
        avatar: 'https://i.pravatar.cc/150?img=20',
        createdBy: 1,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        type: 'group',
        name: 'Đội Thiết Kế',
        description: 'Những bộ óc sáng tạo cùng nhau!',
        avatar: 'https://i.pravatar.cc/150?img=21',
        createdBy: 2,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        type: 'private',
        name: null,
        description: null,
        avatar: null,
        createdBy: 3,
        lastMessageAt: new Date(Date.now() - 3600000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        type: 'group',
        name: 'Cuối Tuần Vui Vẻ',
        description: 'Lên kế hoạch hoạt động cuối tuần ở đây',
        avatar: 'https://i.pravatar.cc/150?img=22',
        createdBy: 5,
        lastMessageAt: new Date(Date.now() - 7200000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('conversations', null, {});
  }
};
