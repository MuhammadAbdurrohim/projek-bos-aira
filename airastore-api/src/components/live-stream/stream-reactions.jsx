import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../../lib/hooks';
import { api } from '../../lib/api';

const REACTIONS = [
  { emoji: '❤️', name: 'heart', color: 'bg-red-100 text-red-800' },
  { emoji: '👍', name: 'thumbs-up', color: 'bg-blue-100 text-blue-800' },
  { emoji: '🎉', name: 'party', color: 'bg-yellow-100 text-yellow-800' },
  { emoji: '👏', name: 'clap', color: 'bg-green-100 text-green-800' },
];

export default function StreamReactions({ 
  streamId, 
  isHost = false,
  isEnabled = true,
  onReactionReceived 
}) {
  const toast = useToast();
  const [reactions, setReactions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [recentReactions, setRecentReactions] = useState([]);
  const [reactionPollingRef, setReactionPollingRef] = useState(null);

  useEffect(() => {
    if (isEnabled) {
      fetchReactions();
      startReactionPolling();
    }
    return () => {
      if (reactionPollingRef) {
        clearInterval(reactionPollingRef);
      }
    };
  }, [streamId, isEnabled]);

  const fetchReactions = async () => {
    try {
      const response = await api.get(`/live-streams/${streamId}/reactions`);
      setReactions(response.data || {});
    } catch (err) {
      console.error('Failed to fetch reactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startReactionPolling = () => {
    const intervalId = setInterval(fetchReactions, 5000);
    setReactionPollingRef(intervalId);
  };

  const handleReaction = async (reactionName) => {
    try {
      const response = await api.post(`/live-streams/${streamId}/reactions`, {
        reaction: reactionName
      });

      // Update local state
      setReactions(prev => ({
        ...prev,
        [reactionName]: (prev[reactionName] || 0) + 1
      }));

      // Add to recent reactions with animation
      setRecentReactions(prev => [
        { id: Date.now(), reaction: reactionName },
        ...prev.slice(0, 9)
      ]);

      if (onReactionReceived) {
        onReactionReceived(reactionName);
      }
    } catch (err) {
      toast.addToast('Failed to send reaction', 'error');
    }
  };

  if (!isEnabled) {
    return (
      <Card className="p-4 text-center">
        <i className="fas fa-heart-broken text-4xl text-gray-300 mb-3"></i>
        <p className="text-sm text-gray-500">
          Reactions are disabled for this stream
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Reaction Stats */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Reactions
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {REACTIONS.map(({ emoji, name, color }) => (
            <div
              key={name}
              className={`p-2 rounded-lg ${color} text-center`}
            >
              <div className="text-lg mb-1">{emoji}</div>
              <div className="text-sm font-medium">
                {reactions[name] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reactions */}
      {!isHost && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {REACTIONS.map(({ emoji, name }) => (
              <Button
                key={name}
                onClick={() => handleReaction(name)}
                className="flex-1 min-w-[80px]"
              >
                <span className="text-xl mr-2">{emoji}</span>
                Send
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Reactions */}
      <div className="relative h-32 bg-gray-50">
        <div className="absolute inset-0 overflow-hidden">
          {recentReactions.map(({ id, reaction }) => {
            const reactionData = REACTIONS.find(r => r.name === reaction);
            return (
              <div
                key={id}
                className="absolute animate-float-up"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  bottom: '0',
                  animation: 'float-up 3s ease-out forwards'
                }}
              >
                <span className="text-2xl">
                  {reactionData?.emoji}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        </div>
      )}

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-120px) scale(1.5);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </Card>
  );
}
