import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

export const useChat = (gameId: string) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on(`chat-message-${gameId}`, handleMessage);

    return () => {
      socket.off(`chat-message-${gameId}`, handleMessage);
    };
  }, [socket, gameId]);

  const sendMessage = (text: string) => {
    if (!socket) return;
    
    socket.emit('send-message', {
      gameId,
      message: text
    });
  };

  return {
    messages,
    sendMessage
  };
}; 