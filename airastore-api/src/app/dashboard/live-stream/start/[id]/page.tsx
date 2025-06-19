'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StreamPlayer } from '@/components/live-stream/stream-player';
import { ProductShowcase } from '@/components/live-stream/product-showcase';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  image_url: string;
  stock: number;
  order: number;
  is_highlighted: boolean;
}

interface LiveStream {
  id: number;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended';
  room_id: string;
  stream_key: string;
  scheduled_at: string;
  settings: {
    chat_enabled: boolean;
    reactions_enabled: boolean;
    product_showcase_enabled: boolean;
  };
  products: Product[];
}

export default function StartLiveStreamPage() {
  const router = useRouter();
  const params = useParams();
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    fetchLiveStream();
    if (liveStream?.status === 'live') {
      // Poll viewer count every 10 seconds when live
      const interval = setInterval(fetchViewerCount, 10000);
      return () => clearInterval(interval);
    }
  }, [liveStream?.status]);

  const fetchLiveStream = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch live stream details');
      }

      const data = await response.json();
      setLiveStream(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewerCount = async () => {
    if (!liveStream) return;

    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${params.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch viewer count');
      }

      const data = await response.json();
      setViewerCount(data.data.viewer_count);
    } catch (err) {
      console.error('Failed to fetch viewer count:', err);
    }
  };

  const handleStartStream = async () => {
    if (!liveStream) return;
    
    setIsStarting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${params.id}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start live stream');
      }

      // Refresh live stream data
      fetchLiveStream();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndStream = async () => {
    if (!liveStream || !confirm('Are you sure you want to end this live stream?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${params.id}/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to end live stream');
      }

      router.push('/dashboard/live-stream');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleHighlightProduct = async (productId: number) => {
    if (!liveStream) return;

    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${params.id}/products/${productId}/highlight`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to highlight product');
      }

      // Refresh live stream data to get updated product list
      fetchLiveStream();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReorderProduct = async (productId: number, newOrder: number) => {
    if (!liveStream) return;

    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${params.id}/products/${productId}/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: newOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder product');
      }

      // Refresh live stream data to get updated product list
      fetchLiveStream();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!liveStream) {
    return <div className="p-4">Live stream not found</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{liveStream.title}</CardTitle>
            <p className="mt-1 text-sm text-gray-500">{liveStream.description}</p>
          </div>
          <div className="flex items-center gap-4">
            {liveStream.status === 'live' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">{viewerCount} watching</span>
              </div>
            )}
            {liveStream.status === 'scheduled' && (
              <Button
                onClick={handleStartStream}
                disabled={isStarting}
              >
                {isStarting ? 'Starting...' : 'Start Stream'}
              </Button>
            )}
            {liveStream.status === 'live' && (
              <Button
                variant="destructive"
                onClick={handleEndStream}
              >
                End Stream
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {liveStream.status === 'live' && (
                <StreamPlayer
                  roomId={liveStream.room_id}
                  userId={`host-${liveStream.id}`}
                  userName="Host"
                  role="Host"
                  token=""
                />
              )}
              {liveStream.status === 'scheduled' && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Ready to Start</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Click the Start Stream button when you're ready to go live
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {liveStream.settings.product_showcase_enabled && (
                <ProductShowcase
                  products={liveStream.products}
                  isHost={true}
                  onHighlight={handleHighlightProduct}
                  onReorder={handleReorderProduct}
                />
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Stream Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Stream Key</dt>
                      <dd className="mt-1 font-mono bg-gray-50 p-2 rounded">
                        {liveStream.stream_key}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Room ID</dt>
                      <dd className="mt-1 font-mono bg-gray-50 p-2 rounded">
                        {liveStream.room_id}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Settings</dt>
                      <dd className="mt-1">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Chat: {liveStream.settings.chat_enabled ? 'Enabled' : 'Disabled'}</li>
                          <li>Reactions: {liveStream.settings.reactions_enabled ? 'Enabled' : 'Disabled'}</li>
                          <li>Product Showcase: {liveStream.settings.product_showcase_enabled ? 'Enabled' : 'Disabled'}</li>
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
