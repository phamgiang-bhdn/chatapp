# Chat Application - Microservices Architecture

Hệ thống chat real-time với follow system, group chat, và thông báo được xây dựng với kiến trúc microservices.

## 🏗️ Kiến trúc

### Backend (Node.js + MySQL)
- **API Gateway** (Port 8000) - Điểm vào duy nhất cho tất cả API
- **Auth Service** (Port 8001) - Xử lý đăng ký, đăng nhập, xác thực
- **User Service** (Port 8002) - Quản lý người dùng, follow system
- **Chat Service** (Port 8003) - Xử lý tin nhắn, group chat, thông báo, WebSocket

### Frontend (React.js)
- React 18 + Material-UI + Socket.IO Client

## 📋 Yêu cầu

- **Docker Desktop** (khuyến nghị)
- Node.js >= 14 (cho scripts)
- **Cloudinary Account** (miễn phí) - để upload hình ảnh và file

## 🚀 Cài đặt và Chạy

### Bước 1: Cài đặt Docker Desktop
- Tải từ https://www.docker.com/products/docker-desktop
- Cài đặt và khởi động Docker Desktop
- Đợi đến khi biểu tượng Docker hiển thị "Running"

### Bước 1.5: Cấu hình Cloudinary (Tùy chọn nhưng khuyến nghị)

Hệ thống sử dụng Cloudinary để lưu trữ hình ảnh và file. Nếu không cấu hình, upload sẽ bị lỗi.

1. Đăng ký tài khoản miễn phí tại: https://cloudinary.com/users/register/free
2. Vào Dashboard, copy các thông tin sau:
   - Cloud Name
   - API Key
   - API Secret

3. Tạo file `.env` trong thư mục gốc (cùng cấp với docker-compose.yml) hoặc thêm vào file `.env` hiện có:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Lưu ý**: Docker Compose sẽ tự động đọc file `.env` trong cùng thư mục.

### Bước 2: Chạy ứng dụng
```bash
npm start
```

Script này sẽ:
- Kiểm tra Docker đang chạy
- Build Docker images
- Khởi động tất cả services
- Hiển thị trạng thái và URLs

### Bước 3: Đợi khởi động
- Lần đầu: ~2-3 phút (tải images, build)
- Các lần sau: ~30 giây

### Bước 4: Mở trình duyệt
Truy cập: **http://localhost:9000**

## 🛑 Dừng ứng dụng

```bash
npm run stop
```

## 📝 Commands hữu ích

### Start/Stop
```bash
npm start              # Khởi động tất cả services
npm run stop           # Dừng tất cả services
npm run restart        # Restart tất cả services
```

### Restart từng service
```bash
npm run restart:frontend    # Restart frontend
npm run restart:api-gateway # Restart API Gateway
npm run restart:auth        # Restart Auth Service
npm run restart:user        # Restart User Service
npm run restart:chat        # Restart Chat Service
npm run restart:mysql       # Restart MySQL
npm run restart:backend     # Restart tất cả backend services
```

### Rebuild từng service (sau khi sửa code)
```bash
npm run rebuild:frontend    # Rebuild frontend
npm run rebuild:api-gateway # Rebuild API Gateway
npm run rebuild:auth        # Rebuild Auth Service
npm run rebuild:user        # Rebuild User Service
npm run rebuild:chat        # Rebuild Chat Service
```

### Logs
```bash
npm run logs           # Xem logs tất cả services
npm run logs:frontend  # Xem logs frontend
npm run logs:auth      # Xem logs auth service
npm run logs:user      # Xem logs user service
npm run logs:chat      # Xem logs chat service
npm run logs:mysql     # Xem logs MySQL
npm run logs:backend   # Xem logs tất cả backend services
```

### Status
```bash
npm run status         # Kiểm tra trạng thái containers
```

### Database
```bash
npm run seed           # Chạy seeder (có xác nhận)
npm run seed:force     # Chạy seeder không cần xác nhận
```

### Docker commands (nếu cần)
```bash
docker-compose down -v  # Xóa toàn bộ (kể cả database)
```

## 🌐 URLs

- **Frontend**: http://localhost:9000
- **API Gateway**: http://localhost:8000
- **MySQL**: localhost:3307

## 🎯 Tính năng

### ✨ Tính năng chính

#### 1. Xác thực & Người dùng
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập
- ✅ JWT Authentication
- ✅ Quản lý profile
- ✅ Tìm kiếm người dùng
- ✅ **Follow/Unfollow người dùng**
- ✅ **Xem danh sách followers/following**
- ✅ Cập nhật trạng thái (online/offline/away)

#### 2. Chat 1-1
- ✅ Tạo cuộc trò chuyện riêng tư
- ✅ Gửi/Nhận tin nhắn real-time
- ✅ Lịch sử tin nhắn
- ✅ Hiển thị online/offline status

#### 3. Group Chat
- ✅ **Tạo nhóm chat**
- ✅ **Đặt tên và mô tả nhóm**
- ✅ **Thêm thành viên vào nhóm**
- ✅ **Xóa thành viên khỏi nhóm**
- ✅ **Phân quyền Admin/Member**
- ✅ **Xem danh sách thành viên**
- ✅ **Rời khỏi nhóm**
- ✅ **Cập nhật thông tin nhóm**
- ✅ Tin nhắn nhóm real-time

#### 4. Real-time Features
- ✅ WebSocket với Socket.IO
- ✅ Nhận tin nhắn ngay lập tức
- ✅ Thông báo tin nhắn mới
- ✅ Trạng thái user online/offline

## 🗄️ Database

- **Host**: localhost:3307
- **User**: root
- **Password**: root_password_123
- **Database**: chat_app

### Connect vào MySQL
```bash
docker exec -it chat-mysql mysql -uroot -proot_password_123 chat_app
```

### Test Accounts (sau khi chạy seed)
Tất cả accounts có password: `12345678`

- user01 / user01@example.com (Nguyễn Văn An)
- user02 / user02@example.com (Trần Thị Bình)
- user03 / user03@example.com (Lê Văn Cường)
- user04 / user04@example.com (Phạm Thị Dung)
- user05 / user05@example.com (Hoàng Văn Đức)
- user06 / user06@example.com (Vũ Thị Em)
- user07 / user07@example.com (Đỗ Văn Phong)
- user08 / user08@example.com (Bùi Thị Giang)

## 🚀 Cách sử dụng

### 1. Chat 1-1
1. Click nút "+" -> "Chat 1-1"
2. Tìm và chọn người dùng
3. Bắt đầu chat

### 2. Tạo nhóm
1. Click nút "+" -> "Tạo nhóm"
2. Nhập tên nhóm và mô tả
3. Chọn thành viên
4. Click "Tạo nhóm"

### 3. Quản lý nhóm
1. Mở conversation nhóm
2. Click menu (⋮) -> "Xem thành viên"
3. Admins có thể:
   - Thêm thành viên
   - Xóa thành viên
   - Phân quyền admin
   - Cập nhật thông tin nhóm
4. Tất cả thành viên có thể rời nhóm

### 4. Follow người dùng
1. Tìm kiếm người dùng
2. Click vào profile
3. Click "Theo dõi"
4. Xem danh sách followers/following

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/verify` - Xác thực token

### Users & Follow
- `GET /api/users/search?query=` - Tìm kiếm user
- `GET /api/users/:id` - Lấy thông tin user
- `PUT /api/users/profile` - Cập nhật profile
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/unfollow` - Unfollow user
- `GET /api/users/:userId/followers` - Danh sách followers
- `GET /api/users/:userId/following` - Danh sách following

### Chat & Groups
- `GET /api/chat/conversations` - Danh sách conversations
- `POST /api/chat/conversations` - Tạo conversation
- `GET /api/chat/conversations/:id/messages` - Lấy tin nhắn
- `POST /api/chat/messages` - Gửi tin nhắn
- `POST /api/chat/conversations/:id/members` - Thêm thành viên
- `DELETE /api/chat/conversations/:id/members/:userId` - Xóa thành viên
- `PUT /api/chat/conversations/:id/members/:userId/role` - Đổi role
- `GET /api/chat/conversations/:id/members` - Danh sách thành viên
- `PUT /api/chat/conversations/:id/info` - Cập nhật thông tin nhóm
- `POST /api/chat/conversations/:id/leave` - Rời nhóm

### Notifications
- `GET /api/chat/notifications` - Lấy thông báo
- `PUT /api/chat/notifications/:id/read` - Đánh dấu đã đọc
- `PUT /api/chat/notifications/read-all` - Đọc tất cả

## 🔌 WebSocket Events

### Client → Server
- `join_conversation` - Tham gia conversation
- `send_message` - Gửi tin nhắn
- `get_online_users` - Lấy danh sách online

### Server → Client
- `new_message` - Tin nhắn mới
- `notification` - Thông báo mới
- `user_status_change` - User online/offline
- `online_users` - Danh sách users online

## 🐛 Troubleshooting

### Docker không khởi động?
- Kiểm tra Docker Desktop đã chạy: `docker --version`
- Xem logs: `npm run logs`

### Port đã được sử dụng?
```bash
# Windows - tìm và kill process
netstat -ano | findstr :9000
taskkill /PID <PID> /F
```

### MySQL không kết nối được?
- Đợi MySQL khởi động hoàn toàn (khoảng 30-60 giây)
- Xem logs: `docker-compose logs mysql`
- Restart: `docker-compose restart mysql`

### Frontend không load?
- Clear browser cache (Ctrl+Shift+R)
- Kiểm tra backend: `npm run status`
- Xem logs: `npm run logs:frontend`

### Services không khởi động?
```bash
# Xem logs để tìm lỗi
npm run logs

# Restart tất cả
npm run restart
```

## 📁 Cấu trúc dự án

```
chat/
├── docker-compose.yml
├── package.json          # NPM scripts
├── scripts/
│   ├── start.js         # Start script
│   └── seed.js          # Seed script
├── database/
│   ├── init.sql
│   ├── migrations/
│   └── seeders/
├── backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   └── chat-service/
└── frontend/
    └── src/
```

## 🛠️ Công nghệ

- **Backend**: Express.js, Sequelize ORM, MySQL, Socket.IO, JWT, Cloudinary
- **Frontend**: React 18, Material-UI, Socket.IO Client
- **DevOps**: Docker & Docker Compose
- **Storage**: Cloudinary (cho hình ảnh và file)

## 📝 License

MIT
