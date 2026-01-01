const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const notificationController = require('../controllers/notificationController');
const uploadController = require('../controllers/uploadController');
const reactionController = require('../controllers/reactionController');
const scheduledMessageController = require('../controllers/scheduledMessageController');
const authMiddleware = require('../middleware/auth');

router.get('/conversations', authMiddleware, chatController.getConversations);
router.post('/conversations', authMiddleware, chatController.createConversation);
router.get('/conversations/:conversationId/messages', authMiddleware, chatController.getMessages);
router.post('/messages', authMiddleware, chatController.sendMessage);
router.put('/conversations/:conversationId/read', authMiddleware, chatController.markAsRead);

router.post('/conversations/:conversationId/members', authMiddleware, chatController.addMember);
router.delete('/conversations/:conversationId/members/:userId', authMiddleware, chatController.removeMember);
router.put('/conversations/:conversationId/members/:userId/role', authMiddleware, chatController.updateMemberRole);
router.get('/conversations/:conversationId/members', authMiddleware, chatController.getMembers);
router.put('/conversations/:conversationId/info', authMiddleware, chatController.updateGroupInfo);
router.post('/conversations/:conversationId/leave', authMiddleware, chatController.leaveGroup);

router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.put('/notifications/:notificationId/read', authMiddleware, notificationController.markAsRead);
router.put('/notifications/read-all', authMiddleware, notificationController.markAllAsRead);
router.delete('/notifications/:notificationId', authMiddleware, notificationController.deleteNotification);

router.post('/conversations/:conversationId/threads', authMiddleware, chatController.createThread);
router.get('/conversations/:conversationId/threads', authMiddleware, chatController.getThreads);
router.get('/conversations/:conversationId/threads/:threadId/messages', authMiddleware, chatController.getThreadMessages);

router.post('/conversations/:conversationId/pin', authMiddleware, chatController.pinMessage);
router.delete('/conversations/:conversationId/pin/:messageId', authMiddleware, chatController.unpinMessage);
router.get('/conversations/:conversationId/pinned', authMiddleware, chatController.getPinnedMessages);

router.post('/upload', authMiddleware, uploadController.uploadFile);
router.get('/download', authMiddleware, uploadController.downloadFile);

// Reactions
router.post('/messages/:messageId/reactions', authMiddleware, reactionController.addReaction);
router.delete('/messages/:messageId/reactions', authMiddleware, reactionController.removeReaction);
router.get('/messages/:messageId/reactions', authMiddleware, reactionController.getReactions);

// Scheduled messages
router.post('/scheduled-messages', authMiddleware, scheduledMessageController.createScheduledMessage);
router.get('/scheduled-messages', authMiddleware, scheduledMessageController.getScheduledMessages);
router.put('/scheduled-messages/:id', authMiddleware, scheduledMessageController.updateScheduledMessage);
router.delete('/scheduled-messages/:id', authMiddleware, scheduledMessageController.cancelScheduledMessage);

module.exports = router;
