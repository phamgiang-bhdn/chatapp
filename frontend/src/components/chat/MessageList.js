import React, { useEffect, useRef } from 'react';
import { List, ListItem } from '@mui/material';
import { MessageItem } from './MessageItem';

export const MessageList = ({
  messages,
  messageSenders,
  user,
  pinnedMessages,
  conversation,
  onPinMessage,
  onUnpinMessage,
  onReply,
  onCreateThread,
  onDownloadFile,
  onAvatarClick
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <List sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>
      {messages.map((message) => {
        const isPinned = pinnedMessages.some(pm => pm.messageId === message.id);
        const isOwnMessage = message.senderId === user.id;
        const sender = messageSenders[message.senderId] || message.sender;

        return (
          <ListItem key={message.id} sx={{ p: 0, display: 'block' }}>
            <MessageItem
              message={message}
              isOwnMessage={isOwnMessage}
              sender={sender}
              user={user}
              isPinned={isPinned}
              conversation={conversation}
              pinnedMessages={pinnedMessages}
              onPinMessage={onPinMessage}
              onUnpinMessage={onUnpinMessage}
              onReply={onReply}
              onCreateThread={onCreateThread}
              onDownloadFile={onDownloadFile}
              onAvatarClick={onAvatarClick}
              messageSenders={messageSenders}
            />
          </ListItem>
        );
      })}
      <div ref={messagesEndRef} />
    </List>
  );
};

