import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

interface ChatBoxProps {
  socket: Socket;
  gameId: string;
  currentUserId: string;
  currentUsername: string;
}

const Container = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 400px;
  width: 100%;
  max-width: 400px;
`;

const Header = styled.div`
  background-color: #34495e;
  color: white;
  padding: 12px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  font-weight: bold;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #bdc3c7;
    border-radius: 4px;
  }
`;

const MessageBubble = styled.div<{ isCurrentUser: boolean }>`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: ${({ isCurrentUser }) => isCurrentUser ? '#3498db' : '#ecf0f1'};
  color: ${({ isCurrentUser }) => isCurrentUser ? 'white' : '#2c3e50'};
  align-self: ${({ isCurrentUser }) => isCurrentUser ? 'flex-end' : 'flex-start'};
  word-break: break-word;
`;

const MessageInfo = styled.div<{ isCurrentUser: boolean }>`
  font-size: 0.8em;
  color: ${({ isCurrentUser }) => isCurrentUser ? '#fff' : '#7f8c8d'};
  margin-bottom: 4px;
`;

const InputContainer = styled.div`
  padding: 12px;
  border-top: 1px solid #ecf0f1;
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1em;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SendButton = styled.button<{ isValid: boolean }>`
  padding: 8px 16px;
  background-color: ${({ isValid }) => isValid ? '#3498db' : '#bdc3c7'};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: ${({ isValid }) => isValid ? 'pointer' : 'not-allowed'};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ isValid }) => isValid ? '#2980b9' : '#bdc3c7'};
  }
`;

const SystemMessage = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9em;
  margin: 8px 0;
`;

const ChatBox: React.FC<ChatBoxProps> = ({
  socket,
  gameId,
  currentUserId,
  currentUsername
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for new messages
    socket.on('chat-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for system messages (player joined/left)
    socket.on('player-joined', ({ username }) => {
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        userId: 'system',
        username: 'System',
        text: `${username} joined the game`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('player-left', ({ username }) => {
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        userId: 'system',
        username: 'System',
        text: `${username} left the game`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    return () => {
      socket.off('chat-message');
      socket.off('player-joined');
      socket.off('player-left');
    };
  }, [socket]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
      userId: currentUserId,
      username: currentUsername,
      text: newMessage.trim()
    };

    socket.emit('send-message', {
      gameId,
      message
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newMessage.trim() !== '') {
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container>
      <Header>Game Chat</Header>
      <MessageList ref={messageListRef}>
        {messages.map(message => (
          message.userId === 'system' ? (
            <SystemMessage key={message.id}>
              {message.text}
            </SystemMessage>
          ) : (
            <MessageBubble
              key={message.id}
              isCurrentUser={message.userId === currentUserId}
            >
              <MessageInfo isCurrentUser={message.userId === currentUserId}>
                {message.userId === currentUserId ? 'You' : message.username}
                {' • '}
                {formatTimestamp(message.timestamp)}
              </MessageInfo>
              {message.text}
            </MessageBubble>
          )
        ))}
      </MessageList>
      <InputContainer>
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SendButton
          isValid={newMessage.trim() !== ''}
          onClick={handleSendMessage}
          disabled={newMessage.trim() === ''}
        >
          Send
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default ChatBox; 