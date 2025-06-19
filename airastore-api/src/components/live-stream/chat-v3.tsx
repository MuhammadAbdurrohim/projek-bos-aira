'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

interface ChatProps {
  roomId: string;
  userId: string;
  userName: string;
  token?: string;
}

export function ChatV3({ roomId, userId, userName, token }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const zegoRef = useRef<any>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0');
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '';

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          userId,
          userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zegoRef.current = zp;

        // Join room as audience with chat only
        await zp.joinRoom({
          container: null,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: {
              role: ZegoUIKitPrebuilt.Audience,
              enableChat: true,
            },
          },
          showPreJoinView: false,
        });

        // Listen for chat messages
        zp.on('IMRecvBroadcastMessage', (messages: any[]) => {
          const newMessages = messages.map(msg => ({
            id: msg.messageID,
            userId: msg.fromUser.userID,
            userName: msg.fromUser.userName,
            content: msg.message,
            timestamp: new Date()
          }));
          setMessages(prev => [...prev, ...newMessages]);
        });
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    initializeChat();

    return () => {
      // Cleanup
      if (zegoRef.current) {
        zegoRef.current.destroy();
      }
    };
  }, [roomId, userId, userName]);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !zegoRef.current) return;

    try {
      // Send message through ZegoCloud
      await zegoRef.current.sendBroadcastMessage(roomId, newMessage);

      // Add message to local state
      const msg: Message = {
        id: Date.now().toString(),
        userId,
        userName,
        content: newMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="font-medium">Live Chat V3</h3>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto"
      >
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.userId === userId ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{message.userName}</span>
              <span>•</span>
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div
              className={`mt-1 px-4 py-2 rounded-lg ${
                message.userId === userId
                  ? 'bg-black text-white'
                  : 'bg-gray-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
