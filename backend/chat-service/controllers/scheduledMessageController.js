const ScheduledMessage = require('../models/ScheduledMessage');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ConversationParticipant = require('../models/ConversationParticipant');
const ioInstance = require('../socket/ioInstance');
const { SOCKET_EVENTS, NOTIFICATION_TYPES } = require('../constants/socketEvents');
const { Op } = require('sequelize');

// Create scheduled message
exports.createScheduledMessage = async (req, res) => {
  try {
    const { conversationId, content, type, fileUrl, scheduledAt } = req.body;
    const userId = req.user.userId;

    if (!conversationId || !content || !scheduledAt) {
      return res.status(400).json({ message: 'conversationId, content and scheduledAt are required' });
    }

    // Validate scheduledAt is in future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ message: 'Scheduled time must be in the future' });
    }

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const scheduledMessage = await ScheduledMessage.create({
      conversationId,
      senderId: userId,
      content,
      type: type || 'text',
      fileUrl,
      scheduledAt: scheduledDate,
      status: 'pending'
    });

    res.status(201).json({ 
      message: 'Message scheduled successfully',
      scheduledMessage: scheduledMessage.toJSON()
    });
  } catch (error) {
    console.error('Create scheduled message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's scheduled messages
exports.getScheduledMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.query;

    const where = { 
      senderId: userId,
      status: 'pending'
    };

    if (conversationId) {
      where.conversationId = conversationId;
    }

    const scheduledMessages = await ScheduledMessage.findAll({
      where,
      include: [{
        model: Conversation,
        attributes: ['id', 'name', 'type']
      }],
      order: [['scheduledAt', 'ASC']]
    });

    res.json({ scheduledMessages });
  } catch (error) {
    console.error('Get scheduled messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel scheduled message
exports.cancelScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const scheduledMessage = await ScheduledMessage.findOne({
      where: { id, senderId: userId, status: 'pending' }
    });

    if (!scheduledMessage) {
      return res.status(404).json({ message: 'Scheduled message not found' });
    }

    scheduledMessage.status = 'cancelled';
    await scheduledMessage.save();

    res.json({ message: 'Scheduled message cancelled' });
  } catch (error) {
    console.error('Cancel scheduled message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update scheduled message
exports.updateScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, scheduledAt } = req.body;
    const userId = req.user.userId;

    const scheduledMessage = await ScheduledMessage.findOne({
      where: { id, senderId: userId, status: 'pending' }
    });

    if (!scheduledMessage) {
      return res.status(404).json({ message: 'Scheduled message not found' });
    }

    if (content) {
      scheduledMessage.content = content;
    }

    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ message: 'Scheduled time must be in the future' });
      }
      scheduledMessage.scheduledAt = scheduledDate;
    }

    await scheduledMessage.save();

    res.json({ 
      message: 'Scheduled message updated',
      scheduledMessage: scheduledMessage.toJSON()
    });
  } catch (error) {
    console.error('Update scheduled message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Process and send scheduled messages (called by scheduler)
exports.processScheduledMessages = async () => {
  try {
    const now = new Date();
    
    const pendingMessages = await ScheduledMessage.findAll({
      where: {
        status: 'pending',
        scheduledAt: { [Op.lte]: now }
      }
    });

    console.log(`[Scheduler] Found ${pendingMessages.length} messages to send`);

    for (const scheduled of pendingMessages) {
      try {
        // Create actual message
        const message = await Message.create({
          conversationId: scheduled.conversationId,
          senderId: scheduled.senderId,
          content: scheduled.content,
          type: scheduled.type,
          fileUrl: scheduled.fileUrl
        });

        // Update conversation lastMessageAt
        await Conversation.update(
          { lastMessageAt: new Date() },
          { where: { id: scheduled.conversationId } }
        );

        // Update scheduled message status
        scheduled.status = 'sent';
        scheduled.sentAt = new Date();
        await scheduled.save();

        // Emit to participants
        const io = ioInstance.getIO();
        if (io) {
          const participants = await ConversationParticipant.findAll({
            where: { conversationId: scheduled.conversationId, isActive: true }
          });

          const messageData = message.toJSON();

          for (const p of participants) {
            io.to(`user_${p.userId}`).emit(SOCKET_EVENTS.NEW_MESSAGE, {
              message: messageData
            });

            // Notify sender that scheduled message was sent
            if (p.userId === scheduled.senderId) {
              io.to(`user_${p.userId}`).emit(SOCKET_EVENTS.SCHEDULED_MESSAGE_SENT, {
                scheduledMessageId: scheduled.id,
                message: messageData
              });
            }
          }
        }

        console.log(`[Scheduler] Sent scheduled message ${scheduled.id}`);
      } catch (err) {
        console.error(`[Scheduler] Failed to send message ${scheduled.id}:`, err);
        scheduled.status = 'failed';
        await scheduled.save();
      }
    }
  } catch (error) {
    console.error('[Scheduler] Process scheduled messages error:', error);
  }
};

