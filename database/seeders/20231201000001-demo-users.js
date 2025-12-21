'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('12345678', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'user01',
        email: 'user01@example.com',
        password: hashedPassword,
        fullName: 'Nguyễn Văn An',
        avatar: 'https://i.pravatar.cc/150?img=1',
        bio: 'Lập trình viên và đam mê công nghệ',
        status: 'online',
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: 'user02',
        email: 'user02@example.com',
        password: hashedPassword,
        fullName: 'Trần Thị Bình',
        avatar: 'https://i.pravatar.cc/150?img=2',
        bio: 'Thiết kế UX với niềm đam mê sáng tạo',
        status: 'online',
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        username: 'user03',
        email: 'user03@example.com',
        password: hashedPassword,
        fullName: 'Lê Văn Cường',
        avatar: 'https://i.pravatar.cc/150?img=3',
        bio: 'Quản lý sản phẩm và yêu thích cà phê',
        status: 'away',
        lastSeen: new Date(Date.now() - 600000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        username: 'user04',
        email: 'user04@example.com',
        password: hashedPassword,
        fullName: 'Phạm Thị Dung',
        avatar: 'https://i.pravatar.cc/150?img=4',
        bio: 'Chuyên viên marketing và mạng xã hội',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        username: 'user05',
        email: 'user05@example.com',
        password: hashedPassword,
        fullName: 'Hoàng Văn Đức',
        avatar: 'https://i.pravatar.cc/150?img=5',
        bio: 'Nhà khoa học dữ liệu khám phá AI và ML',
        status: 'online',
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        username: 'user06',
        email: 'user06@example.com',
        password: hashedPassword,
        fullName: 'Vũ Thị Em',
        avatar: 'https://i.pravatar.cc/150?img=6',
        bio: 'Người sáng tạo nội dung và nhiếp ảnh gia',
        status: 'online',
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        username: 'user07',
        email: 'user07@example.com',
        password: hashedPassword,
        fullName: 'Đỗ Văn Phong',
        avatar: 'https://i.pravatar.cc/150?img=7',
        bio: 'Full-stack developer và đóng góp mã nguồn mở',
        status: 'away',
        lastSeen: new Date(Date.now() - 1800000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        username: 'user08',
        email: 'user08@example.com',
        password: hashedPassword,
        fullName: 'Bùi Thị Giang',
        avatar: 'https://i.pravatar.cc/150?img=8',
        bio: 'Thiết kế đồ họa với con mắt tinh tế',
        status: 'offline',
        lastSeen: new Date(Date.now() - 7200000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
