CREATE DATABASE IF NOT EXISTS chat_app;
USE chat_app;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(100),
  avatar VARCHAR(255),
  bio TEXT,
  status ENUM('online', 'offline', 'away') DEFAULT 'offline',
  lastSeen TIMESTAMP NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS user_follows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  followerId INT NOT NULL,
  followingId INT NOT NULL,
  status ENUM('pending', 'accepted', 'blocked') DEFAULT 'accepted',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_follower (followerId),
  INDEX idx_following (followingId),
  INDEX idx_status (status),
  UNIQUE KEY unique_follow (followerId, followingId),
  CHECK (followerId != followingId)
);

CREATE TABLE IF NOT EXISTS conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('private', 'group') DEFAULT 'private',
  name VARCHAR(100),
  description TEXT,
  avatar VARCHAR(255),
  createdBy INT NOT NULL,
  lastMessageAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_lastMessageAt (lastMessageAt),
  INDEX idx_createdBy (createdBy)
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversationId INT NOT NULL,
  userId INT NOT NULL,
  role ENUM('admin', 'member') DEFAULT 'member',
  lastReadAt TIMESTAMP NULL,
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  leftAt TIMESTAMP NULL,
  isActive BOOLEAN DEFAULT TRUE,
  addedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_conversationId (conversationId),
  INDEX idx_role (role),
  INDEX idx_isActive (isActive),
  UNIQUE KEY unique_participant (conversationId, userId)
);

CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversationId INT NOT NULL,
  senderId INT NOT NULL,
  content TEXT NOT NULL,
  type ENUM('text', 'image', 'file') DEFAULT 'text',
  fileUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_conversationId (conversationId),
  INDEX idx_senderId (senderId),
  INDEX idx_createdAt (createdAt)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type ENUM('message', 'follow', 'group_invite', 'group_add', 'group_remove', 'mention', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSON,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_createdAt (createdAt)
);
