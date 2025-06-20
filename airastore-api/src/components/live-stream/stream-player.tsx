import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { useToast, ToastHook } from '@/lib/hooks';

interface StreamPlayerProps {
  streamId: string;
  isHost?: boolean;
  onError?: (error: string) => void;
}

interface StreamInfo {
  id: string;
  title: string;
  status: 'connecting' | 'live' | 'ended';
  viewer_count: number;
  host: {
    name: string;
    avatar: string;
  };
}

interface ChatMessage {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
}

export default function StreamPlayer({ streamId, isHost = false, onError }: StreamPlayerProps) {
  const toast: ToastHook = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    initializeStream();
    return () => {
      // Cleanup stream connection
      cleanupStream();
    };
  }, [streamId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeStream = async () => {
    try {
      // Initialize stream connection
      const response = await fetch(`/api/live-streams/${streamId}/connect`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect to stream');
      }

      setStreamInfo(data.stream);
      
      // Initialize WebRTC connection
      await setupWebRTC(data.stream_url);
      
      // Connect to chat websocket
      connectToChat();
      
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize stream';
      setError(errorMessage);
      onError?.(errorMessage);
      toast.addToast(errorMessage, 'error');
    }
  };

  const setupWebRTC = async (streamUrl: string) => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isHost,
        audio: isHost,
      });

      if (isHost) {
        videoRef.current.srcObject = stream;
      } else {
        // Connect to stream URL for viewers
        videoRef.current.src = streamUrl;
      }
    } catch (err) {
      throw new Error('Failed to access media devices');
    }
  };

  const connectToChat = () => {
    // Initialize WebSocket connection for chat
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/live-streams/${streamId}/chat`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    ws.onerror = () => {
      toast.addToast('Failed to connect to chat', 'error');
    };
  };

  const cleanupStream = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    // Send message through WebSocket
    fetch(`/api/live-streams/${streamId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: newMessage }),
    }).then(() => {
      setNewMessage('');
    }).catch(() => {
      toast.addToast('Failed to send message', 'error');
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorMessage message={error} />;
  if (!streamInfo) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full"
              autoPlay
              playsInline
              controls={false}
            />
            
            {/* Stream Info Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {streamInfo.host.avatar ? (
                      <img
                        src={streamInfo.host.avatar}
                        alt={streamInfo.host.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <i className="ri-user-line text-gray-400"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{streamInfo.title}</h3>
                    <p className="text-white/80 text-sm">{streamInfo.host.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                  <span className="text-white text-sm">
                    <i className="ri-eye-line mr-1"></i>
                    {streamInfo.viewer_count}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/10"
                  >
                    <i className={`ri-volume-${isMuted ? 'mute' : 'up'}-line text-xl`}></i>
                  </Button>
                  <div className="w-24">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full"
                    />
                  </div>
                </div>
                {isHost && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-500/10"
                  >
                    <i className="ri-live-line mr-1"></i>
                    End Stream
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Chat */}
      <div className="lg:col-span-1">
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {message.user.avatar ? (
                    <img
                      src={message.user.avatar}
                      alt={message.user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="ri-user-line text-gray-400"></i>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {message.user.name}
                  </p>
                  <p className="text-sm text-gray-500">{message.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 min-w-0 rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
