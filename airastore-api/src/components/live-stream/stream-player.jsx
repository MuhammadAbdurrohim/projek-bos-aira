import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingOverlay } from '../ui/loading';
import ErrorMessage from '../ui/error';
import { useToast } from '../../lib/hooks';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';

export default function StreamPlayer({ streamId, isHost = false, onError }) {
  const toast = useToast();
  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamInfo, setStreamInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [zegoEngine, setZegoEngine] = useState(null);

  useEffect(() => {
    initializeStream();
    return () => {
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
      // Get stream info
      const response = await fetch(`/api/live-streams/${streamId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect to stream');
      }

      setStreamInfo(data.stream);
      
      // Initialize ZEGO Engine
      await initializeZegoCloud();
      
      setLoading(false);
    } catch (err) {
      const errorMessage = err?.message || 'Failed to initialize stream';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      toast.addToast(errorMessage, 'error');
    }
  };

  const initializeZegoCloud = async () => {
    try {
      // Get ZEGO token
      const tokenResponse = await fetch('/api/zego/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: streamId,
          role: isHost ? 'host' : 'audience'
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.message || 'Failed to get streaming token');
      }

      // Initialize ZEGO Engine
      const appID = parseInt(process.env.REACT_PUBLIC_ZEGO_APP_ID);
      const engine = new ZegoExpressEngine(appID, process.env.REACT_PUBLIC_ZEGO_SERVER_SECRET);
      
      // Set up event handlers
      engine.on('roomStreamUpdate', (roomID, updateType, streamList) => {
        if (updateType === 'ADD') {
          const firstStream = streamList[0];
          if (firstStream && !isHost) {
            engine.startPlayingStream(firstStream.streamID, {
              container: videoRef.current
            });
          }
        }
      });

      // Join room
      await engine.loginRoom(streamId, tokenData.token, {
        userID: tokenData.user_id.toString(),
        userName: tokenData.user_name
      });

      if (isHost) {
        // Start publishing for host
        await engine.startPublishingStream(streamId);
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        engine.pushPublishAudioStream(localStream.getAudioTracks()[0]);
        engine.pushPublishVideoStream(localStream.getVideoTracks()[0]);
      }

      setZegoEngine(engine);

    } catch (err) {
      throw new Error('Failed to initialize streaming: ' + (err?.message || 'Unknown error'));
    }
  };

  const cleanupStream = () => {
    if (zegoEngine) {
      zegoEngine.logoutRoom();
      zegoEngine.destroyEngine();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      // Send message through WebSocket or ZEGO's message channel
      if (zegoEngine) {
        await zegoEngine.sendBroadcastMessage(streamId, newMessage);
      }
      
      setNewMessage('');
    } catch (err) {
      toast.addToast('Failed to send message', 'error');
    }
  };

  const handleVolumeChange = (e) => {
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
                    {streamInfo.host?.avatar ? (
                      <img
                        src={streamInfo.host.avatar}
                        alt={streamInfo.host.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <i className="fas fa-user text-gray-400"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{streamInfo.title}</h3>
                    <p className="text-white/80 text-sm">{streamInfo.host?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                  <span className="text-white text-sm">
                    <i className="fas fa-eye mr-1"></i>
                    {streamInfo.viewer_count || 0}
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
                    <i className={`fas fa-volume-${isMuted ? 'mute' : 'up'} text-xl`}></i>
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
                    onClick={cleanupStream}
                  >
                    <i className="fas fa-broadcast-tower mr-1"></i>
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
                  {message.user?.avatar ? (
                    <img
                      src={message.user.avatar}
                      alt={message.user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {message.user?.name}
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
