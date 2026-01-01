const MessageReaction = require('../models/MessageReaction');
const Message = require('../models/Message');
const ConversationParticipant = require('../models/ConversationParticipant');
const ioInstance = require('../socket/ioInstance');
const { SOCKET_EVENTS } = require('../constants/socketEvents');

// Add reaction to message
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    // Find message
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { 
        conversationId: message.conversationId, 
        userId, 
        isActive: true 
      }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if reaction already exists
    const existingReaction = await MessageReaction.findOne({
      where: { messageId, userId, emoji }
    });

    if (existingReaction) {
      return res.status(400).json({ message: 'Reaction already exists' });
    }

    // Create reaction
    const reaction = await MessageReaction.create({
      messageId,
      userId,
      emoji
    });

    // Get all reactions for this message
    const allReactions = await getMessageReactions(messageId);

    // Emit to all participants
    const participants = await ConversationParticipant.findAll({
      where: { conversationId: message.conversationId, isActive: true }
    });

    const io = ioInstance.getIO();
    for (const p of participants) {
      io.to(`user_${p.userId}`).emit(SOCKET_EVENTS.REACTION_UPDATED, {
        messageId: parseInt(messageId),
        conversationId: message.conversationId,
        reactions: allReactions
      });
    }

    res.json({ 
      message: 'Reaction added',
      reaction: reaction.toJSON(),
      allReactions
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove reaction from message
exports.removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    // Find message
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { 
        conversationId: message.conversationId, 
        userId, 
        isActive: true 
      }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find and delete reaction
    const reaction = await MessageReaction.findOne({
      where: { messageId, userId, emoji }
    });

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    await reaction.destroy();

    // Get all reactions for this message
    const allReactions = await getMessageReactions(messageId);

    // Emit to all participants
    const participants = await ConversationParticipant.findAll({
      where: { conversationId: message.conversationId, isActive: true }
    });

    const io = ioInstance.getIO();
    for (const p of participants) {
      io.to(`user_${p.userId}`).emit(SOCKET_EVENTS.REACTION_UPDATED, {
        messageId: parseInt(messageId),
        conversationId: message.conversationId,
        reactions: allReactions
      });
    }

    res.json({ 
      message: 'Reaction removed',
      allReactions
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reactions for a message
exports.getReactions = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    // Find message
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { 
        conversationId: message.conversationId, 
        userId, 
        isActive: true 
      }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reactions = await getMessageReactions(messageId);

    res.json({ reactions });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get grouped reactions
async function getMessageReactions(messageId) {
  const reactions = await MessageReaction.findAll({
    where: { messageId },
    order: [['createdAt', 'ASC']]
  });

  // Group by emoji with user IDs
  const grouped = {};
  for (const r of reactions) {
    if (!grouped[r.emoji]) {
      grouped[r.emoji] = {
        emoji: r.emoji,
        count: 0,
        userIds: []
      };
    }
    grouped[r.emoji].count++;
    grouped[r.emoji].userIds.push(r.userId);
  }

  return Object.values(grouped);
}

module.exports.getMessageReactions = getMessageReactions;

