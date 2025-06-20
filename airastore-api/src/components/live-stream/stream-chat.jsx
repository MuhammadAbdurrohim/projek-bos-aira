import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../../lib/hooks';
import { api } from '../../lib/api';

export default function StreamChat({ 
  streamId, 
  isHost = false,
  isChatEnabled = true,
  onMessageReceived 
}) {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef(null);
  const messagePollingRef = useRef(null);

  useEffect(() => {
    if (isChatEnabled) {
      fetchMessages();
      startMessagePolling();
    }
    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
      }
    };
  }, [streamId, isChatEnabled]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/live-streams/${streamId}/messages`);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const startMessagePolling = () => {
    messagePollingRef.current = setInterval(fetchMessages, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await api.post(`/live-streams/${streamId}/messages`, {
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      if (onMessageReceived) {
        onMessageReceived(response.data);
      }
    } catch (err) {
      toast.addToast('Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (!isChatEnabled) {
    return (
      <Card className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <i className="fas fa-comment-slash text-4xl text-gray-300 mb-3"></i>
          <p className="text-sm text-gray-500">
            Chat is disabled for this stream
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            Live Chat
          </h3>
          <span className="text-xs text-gray-500">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            {message.user?.avatar ? (
              <img
                src={message.user.avatar}
                alt={message.user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <i className="fas fa-user text-gray-400"></i>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  {message.user?.name}
                </p>
                {message.user?.is_host && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Host
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 break-words">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              No messages yet. Be the first to chat!
            </p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 min-w-0 rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </form>
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {500 - newMessage.length} characters remaining
          </p>
          {isHost && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
