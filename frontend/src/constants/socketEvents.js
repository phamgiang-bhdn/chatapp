export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  GET_ONLINE_USERS: 'get_online_users',
  ONLINE_USERS: 'online_users',
  USER_STATUS_CHANGE: 'user_status_change',

  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',

  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  MARK_AS_READ: 'mark_as_read',
  MESSAGES_READ: 'messages_read',

  TYPING: 'typing',
  USER_TYPING: 'user_typing',

  NOTIFICATION: 'notification',

  THREAD_CREATED: 'thread_created',

  // Reaction events
  REACTION_UPDATED: 'reaction_updated',
  
  // Scheduled message events
  SCHEDULED_MESSAGE_SENT: 'scheduled_message_sent',

  ERROR: 'error'
};

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  FOLLOW: 'follow',
  GROUP_INVITE: 'group_invite',
  GROUP_ADD: 'group_add',
  GROUP_REMOVE: 'group_remove',
  MENTION: 'mention',
  SYSTEM: 'system'
};
