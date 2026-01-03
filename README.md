# Chat Application - Microservices Architecture

Hệ thống chat real-time với follow system, group chat, và thông báo được xây dựng với kiến trúc microservices.

## ⚡ Quick Start (Tóm tắt nhanh)

```bash
# 1. Đảm bảo Docker Desktop đang chạy
# 2. Clone repository và vào thư mục
cd chat

# 3. (Tùy chọn) Tạo file .env với Cloudinary credentials
# Xem chi tiết ở Bước 3 bên dưới

# 4. Khởi động ứng dụng
npm start

# 5. Đợi ~2-3 phút, sau đó chạy migration
npm run migrate

# 6. (Tùy chọn) Chạy seeder để có dữ liệu test
npm run seed:force

# 7. Mở http://localhost:9000
```

**Xem hướng dẫn chi tiết bên dưới nếu gặp vấn đề.**

---

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- ✅ **Docker Desktop** - [Tải về](https://www.docker.com/products/docker-desktop)
  - Bắt buộc để chạy ứng dụng
  - Sau khi cài, khởi động Docker Desktop và đợi đến khi trạng thái hiển thị "Running"
  
- ✅ **Node.js >= 14** - [Tải về](https://nodejs.org/)
  - Cần để chạy các npm scripts (start, migrate, seed, v.v.)
  - Kiểm tra: `node --version`
  
- ✅ **Git** - Để clone repository (nếu chưa có code)

## 🚀 Hướng dẫn cài đặt và chạy (Cho người mới clone)

### Bước 1: Clone repository (nếu chưa có)

```bash
git clone <repository-url>
cd chat
```

### Bước 2: Cài đặt Docker Desktop

1. Tải Docker Desktop từ: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop
3. Đợi đến khi biểu tượng Docker hiển thị trạng thái "Running"
4. Kiểm tra Docker đã hoạt động:
   ```bash
   docker --version
   docker-compose --version
   ```

### Bước 3: Cấu hình Cloudinary (Tùy chọn nhưng khuyến nghị)

Hệ thống sử dụng Cloudinary để lưu trữ hình ảnh và file. Nếu không cấu hình, tính năng upload sẽ bị lỗi.

1. Đăng ký tài khoản miễn phí tại: https://cloudinary.com/users/register/free
2. Vào Dashboard, copy các thông tin sau:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

3. Tạo file `.env` trong thư mục gốc (cùng cấp với `docker-compose.yml`):
   ```bash
   # Windows (PowerShell)
   New-Item .env
   
   # Linux/Mac
   touch .env
   ```

4. Thêm nội dung sau vào file `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   **Lưu ý**: Thay `your_cloud_name`, `your_api_key`, `your_api_secret` bằng thông tin thực tế từ Cloudinary Dashboard.

### Bước 4: Khởi động ứng dụng

**Lưu ý**: Nếu chưa cài Node.js, bạn vẫn có thể chạy trực tiếp với Docker Compose (xem Cách 2).

#### Cách 1: Sử dụng NPM script (Khuyến nghị - Cần Node.js)

```bash
npm start
```

Script này sẽ tự động:
- ✅ Kiểm tra Docker đang chạy
- ✅ Build Docker images
- ✅ Khởi động tất cả services
- ✅ Hiển thị trạng thái và URLs

**Nếu chưa cài Node.js**, cài đặt dependencies ở thư mục gốc trước:
```bash
npm install
```

#### Cách 2: Chạy trực tiếp với Docker Compose (Không cần Node.js)

```bash
# Build và khởi động tất cả services
docker-compose up -d --build
```

**Lưu ý**: 
- Lần đầu chạy nên dùng `--build` để đảm bảo images được build đúng
- `-d` flag chạy services ở chế độ background
- Nếu dùng cách này, bạn sẽ cần chạy migration thủ công (xem Bước 6)

### Bước 5: Đợi services khởi động

- ⏱️ **Lần đầu**: ~2-3 phút (tải images, build)
- ⏱️ **Các lần sau**: ~30-60 giây
- ⏱️ **MySQL**: Cần đợi khoảng 30-60 giây để khởi động hoàn toàn

Kiểm tra trạng thái services:
```bash
npm run status
# hoặc
docker-compose ps
```

### Bước 6: Chạy Database Migration (Bắt buộc!)

Sau khi MySQL đã khởi động hoàn toàn (đợi ít nhất 60 giây), chạy migration để tạo các bảng trong database:

**Cách 1: Dùng npm script (Cần Node.js)**
```bash
npm run migrate
```

**Cách 2: Chạy thủ công trong container**
```bash
# Vào container database
docker exec -it chat-mysql bash

# Hoặc chạy trực tiếp từ host (nếu đã cài sequelize-cli)
cd database
npm install
npm run migrate
```

**Lưu ý quan trọng**: 
- ⚠️ Migration **PHẢI** chạy sau khi MySQL đã sẵn sàng (đợi ít nhất 60 giây sau `docker-compose up`)
- ⚠️ Nếu thấy lỗi "Connection refused" hoặc "ECONNREFUSED", đợi thêm 30-60 giây rồi thử lại
- ✅ Migration chỉ cần chạy một lần sau khi khởi động lần đầu
- ✅ Kiểm tra MySQL đã sẵn sàng: `docker-compose logs mysql | grep "ready for connections"`

### Bước 7: Chạy Seeder (Tùy chọn - Khuyến nghị cho lần đầu)

Để có dữ liệu mẫu để test, chạy seeder:

**Cách 1: Dùng npm script (Cần Node.js)**
```bash
npm run seed
```

Hoặc chạy không cần xác nhận:
```bash
npm run seed:force
```

**Cách 2: Chạy thủ công**
```bash
node scripts/seed.js --force
```

Seeder sẽ tạo 8 tài khoản test (xem thông tin đăng nhập ở phần [Test Accounts](#-test-accounts-sau-khi-chạy-seed))

**Lưu ý**: Seeder chỉ chạy được sau khi đã chạy migration thành công.

### Bước 8: Mở ứng dụng

Truy cập: **http://localhost:9000**

🎉 **Xong!** Bạn đã sẵn sàng sử dụng ứng dụng chat.

---

### ✅ Checklist cài đặt

Sử dụng checklist này để đảm bảo bạn đã hoàn thành tất cả các bước:

- [ ] Đã cài đặt Docker Desktop và đang chạy
- [ ] Đã cài đặt Node.js >= 14 (nếu muốn dùng npm scripts)
- [ ] Đã clone repository và vào thư mục `chat`
- [ ] (Tùy chọn) Đã tạo file `.env` với Cloudinary credentials
- [ ] Đã chạy `npm start` hoặc `docker-compose up -d --build`
- [ ] Đã đợi MySQL khởi động hoàn toàn (ít nhất 60 giây)
- [ ] Đã chạy `npm run migrate` thành công
- [ ] (Tùy chọn) Đã chạy `npm run seed:force` để có dữ liệu test
- [ ] Đã mở http://localhost:9000 và thấy giao diện đăng nhập

---

## 🏗️ Kiến trúc

### Backend (Node.js + MySQL)
- **API Gateway** (Port 8000) - Điểm vào duy nhất cho tất cả API
- **Auth Service** (Port 8001) - Xử lý đăng ký, đăng nhập, xác thực
- **User Service** (Port 8002) - Quản lý người dùng, follow system
- **Chat Service** (Port 8003) - Xử lý tin nhắn, group chat, thông báo, WebSocket

### Frontend (React.js)
- React 18 + Material-UI + Socket.IO Client

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
npm run migrate        # Chạy database migrations
npm run seed           # Chạy seeder (có xác nhận)
npm run seed:force     # Chạy seeder không cần xác nhận
```

### Docker commands (nếu cần)
```bash
# Khởi động services
docker-compose up -d              # Khởi động ở chế độ background
docker-compose up -d --build      # Build lại và khởi động

# Dừng services
docker-compose down               # Dừng và xóa containers
docker-compose down -v            # Dừng và xóa containers + volumes (xóa cả database)

# Xem logs
docker-compose logs -f            # Xem logs tất cả services
docker-compose logs -f mysql      # Xem logs MySQL

# Xem trạng thái
docker-compose ps                 # Xem trạng thái containers

# Restart
docker-compose restart            # Restart tất cả services
docker-compose restart mysql      # Restart MySQL
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

Sau khi chạy `npm run seed`, bạn sẽ có 8 tài khoản test để đăng nhập:

**Tất cả accounts có password:** `12345678`

| Username | Email | Tên |
|----------|-------|-----|
| user01 | user01@example.com | Nguyễn Văn An |
| user02 | user02@example.com | Trần Thị Bình |
| user03 | user03@example.com | Lê Văn Cường |
| user04 | user04@example.com | Phạm Thị Dung |
| user05 | user05@example.com | Hoàng Văn Đức |
| user06 | user06@example.com | Vũ Thị Em |
| user07 | user07@example.com | Đỗ Văn Phong |
| user08 | user08@example.com | Bùi Thị Giang |

**Cách sử dụng:**
1. Mở http://localhost:9000
2. Đăng nhập với bất kỳ tài khoản nào ở trên
3. Bắt đầu chat!

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
```bash
# Kiểm tra Docker đã cài đặt
docker --version
docker-compose --version

# Kiểm tra Docker Desktop đang chạy
docker info

# Nếu lỗi, khởi động Docker Desktop và đợi đến khi "Running"
```

### Port đã được sử dụng?

**Windows (PowerShell):**
```powershell
# Tìm process đang dùng port 9000
netstat -ano | findstr :9000

# Kill process (thay <PID> bằng số PID tìm được)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Tìm và kill process
lsof -ti:9000 | xargs kill -9
```

### MySQL không kết nối được?
```bash
# Đợi MySQL khởi động hoàn toàn (khoảng 30-60 giây)
# Xem logs để kiểm tra
npm run logs:mysql

# Nếu vẫn lỗi, restart MySQL
npm run restart:mysql

# Đợi thêm 30 giây rồi thử lại migration
npm run migrate
```

### Migration bị lỗi "Connection refused"?
- ⏱️ Đợi MySQL khởi động hoàn toàn (ít nhất 60 giây sau khi `docker-compose up`)
- Kiểm tra MySQL đã sẵn sàng:
  ```bash
  docker-compose logs mysql | grep "ready for connections"
  ```
- Thử lại migration:
  ```bash
  npm run migrate
  ```

### Frontend không load?
```bash
# 1. Clear browser cache (Ctrl+Shift+R hoặc Cmd+Shift+R)
# 2. Kiểm tra backend services
npm run status

# 3. Xem logs frontend
npm run logs:frontend

# 4. Restart frontend
npm run restart:frontend
```

### Services không khởi động?
```bash
# Xem logs để tìm lỗi
npm run logs

# Hoặc xem logs từng service
npm run logs:frontend
npm run logs:api-gateway
npm run logs:auth
npm run logs:user
npm run logs:chat

# Restart tất cả services
npm run restart

# Nếu vẫn lỗi, rebuild lại
docker-compose down
docker-compose up -d --build
```

### Lỗi "Cannot find module" hoặc "npm install"?
Nếu gặp lỗi khi chạy scripts, cài đặt dependencies ở thư mục gốc:
```bash
npm install
```

### Xóa toàn bộ và bắt đầu lại
```bash
# Dừng và xóa tất cả containers, volumes (bao gồm cả database)
docker-compose down -v

# Khởi động lại từ đầu
npm start
npm run migrate
npm run seed:force
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
