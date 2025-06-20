'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { useToast, ToastHook } from '@/lib/hooks';
import StreamPlayer from '@/components/live-stream/stream-player';
import ProductShowcase from '@/components/live-stream/product-showcase';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended';
  started_at: string;
  viewer_count: number;
  chat_enabled: boolean;
  products_enabled: boolean;
  host: {
    name: string;
    avatar: string;
  };
}

export default function ViewLiveStreamPage() {
  const params = useParams();
  const router = useRouter();
  const toast: ToastHook = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  useEffect(() => {
    fetchStreamDetails();
    // Poll for stream updates every 10 seconds
    const interval = setInterval(fetchStreamDetails, 10000);
    return () => clearInterval(interval);
  }, [params.id]);

  const fetchStreamDetails = async () => {
    try {
      const response = await fetch(`/api/live-streams/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stream details');
      }

      if (data.status === 'scheduled') {
        router.push(`/dashboard/live-stream/start/${params.id}`);
        return;
      }

      if (data.status === 'ended') {
        router.push('/dashboard/live-stream');
        return;
      }

      setStream(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndStream = async () => {
    if (!stream) return;

    setIsEnding(true);
    try {
      const response = await fetch(`/api/live-streams/${stream.id}/end`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to end live stream');
      }

      toast.addToast('Live stream ended successfully', 'success');
      router.push('/dashboard/live-stream');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.addToast(errorMessage, 'error');
      setIsEnding(false);
    }
  };

  const toggleFeature = async (feature: 'chat' | 'products') => {
    if (!stream) return;

    try {
      const response = await fetch(`/api/live-streams/${stream.id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [feature === 'chat' ? 'chat_enabled' : 'products_enabled']: 
            feature === 'chat' ? !stream.chat_enabled : !stream.products_enabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle ${feature}`);
      }

      setStream(prev => prev ? {
        ...prev,
        [feature === 'chat' ? 'chat_enabled' : 'products_enabled']: 
          feature === 'chat' ? !prev.chat_enabled : !prev.products_enabled,
      } : null);

      toast.addToast(`${feature.charAt(0).toUpperCase() + feature.slice(1)} ${
        feature === 'chat' 
          ? stream.chat_enabled ? 'disabled' : 'enabled'
          : stream.products_enabled ? 'disabled' : 'enabled'
      }`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.addToast(errorMessage, 'error');
    }
  };

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorMessage message={error} />;
  if (!stream) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Live Stream</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your live stream and interact with viewers
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <i className="ri-eye-line mr-1"></i>
            {stream.viewer_count} viewers
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <i className="ri-time-line mr-1"></i>
            Live for {formatDuration(new Date(stream.started_at))}
          </div>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            onClick={() => setShowConfirmEnd(true)}
            disabled={isEnding}
          >
            {isEnding ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Ending Stream...
              </>
            ) : (
              <>
                <i className="ri-live-line mr-2"></i>
                End Stream
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stream Player */}
          <Card className="overflow-hidden">
            <div className="aspect-video bg-black">
              <StreamPlayer
                streamId={stream.id}
                isHost={true}
                onError={(error) => toast.addToast(error, 'error')}
              />
            </div>
          </Card>

          {/* Stream Info */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {stream.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {stream.description}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {stream.host.avatar ? (
                    <img
                      src={stream.host.avatar}
                      alt={stream.host.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="ri-user-line text-gray-400"></i>
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {stream.host.name}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Controls */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Stream Controls
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chat</p>
                  <p className="text-sm text-gray-500">
                    Enable viewer chat
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeature('chat')}
                >
                  {stream.chat_enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Products</p>
                  <p className="text-sm text-gray-500">
                    Show product showcase
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeature('products')}
                >
                  {stream.products_enabled ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Products */}
          {stream.products_enabled && (
            <ProductShowcase
              streamId={stream.id}
              isHost={true}
            />
          )}
        </div>
      </div>

      {/* End Stream Confirmation */}
      {showConfirmEnd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              End Live Stream?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to end this live stream? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmEnd(false)}
                disabled={isEnding}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEndStream}
                disabled={isEnding}
                className="bg-red-600 hover:bg-red-700"
              >
                {isEnding ? 'Ending...' : 'End Stream'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function formatDuration(startDate: Date): string {
  const diff = Date.now() - startDate.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
