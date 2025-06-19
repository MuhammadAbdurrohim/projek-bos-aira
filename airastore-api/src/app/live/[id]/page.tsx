'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  settings: {
    chat_enabled: boolean;
    reactions_enabled: boolean;
    product_showcase_enabled: boolean;
  };
  products: Product[];
  user: {
    id: number;
    name: string;
    avatar_url: string;
  };
}

export default function WatchLiveStreamPage() {
  const params = useParams();
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId] = useState(`viewer-${Date.now()}`);

  useEffect(() => {
    fetchLiveStream();
    // Poll for live stream updates every 30 seconds
    const interval = setInterval(fetchLiveStream, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleAddToCart = async (productId: number) => {
    try {
      const response = await fetch('http://localhost:8000/api/cart/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add product to cart');
      }

      // Show success message or update cart count
      alert('Product added to cart!');
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
            <div className="mt-2 flex items-center gap-2">
              <img
                src={liveStream.user.avatar_url}
                alt={liveStream.user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium">{liveStream.user.name}</span>
              {liveStream.status === 'live' && (
                <>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm">{liveStream.viewer_count} watching</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {liveStream.status === 'live' && (
                <StreamPlayer
                  roomId={liveStream.room_id}
                  userId={userId}
                  userName="Viewer"
                  role="Audience"
                  token=""
                />
              )}
              {liveStream.status === 'scheduled' && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Stream Starting Soon</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Scheduled for {new Date(liveStream.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {liveStream.status === 'ended' && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Stream Ended</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This live stream has ended
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h3 className="font-medium">About this stream</h3>
                <p className="mt-2 text-sm text-gray-600">{liveStream.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {liveStream.settings.product_showcase_enabled && liveStream.products.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {liveStream.products.map((product) => (
                        <div
                          key={product.id}
                          className={`p-4 rounded-lg border ${
                            product.is_highlighted ? 'border-black bg-gray-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{product.name}</h4>
                              <div className="mt-1 flex items-baseline gap-2">
                                {product.discount_price ? (
                                  <>
                                    <span className="text-red-500 font-medium">
                                      Rp {product.discount_price.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      Rp {product.price.toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-medium">
                                    Rp {product.price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {product.stock > 0 ? (
                                <Button
                                  className="mt-2"
                                  size="sm"
                                  onClick={() => handleAddToCart(product.id)}
                                >
                                  Add to Cart
                                </Button>
                              ) : (
                                <p className="mt-2 text-sm text-red-500">Out of Stock</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {liveStream.status === 'live' && liveStream.settings.chat_enabled && (
                <div id="zego-chat" className="h-[500px]" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
