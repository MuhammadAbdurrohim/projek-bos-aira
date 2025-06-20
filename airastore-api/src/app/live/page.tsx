'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { useToast, ToastHook } from '@/lib/hooks';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  viewer_count: number;
  product_count: number;
  host: {
    name: string;
    avatar: string;
  };
}

export default function LiveStreamListPage() {
  const toast: ToastHook = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'live' | 'scheduled'>('all');

  useEffect(() => {
    fetchStreams();
    // Poll for live stream updates every 30 seconds
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await fetch('/api/live-streams/public');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch live streams');
      }

      setStreams(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredStreams = streams.filter(stream => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'live') return stream.status === 'live';
    if (selectedStatus === 'scheduled') return stream.status === 'scheduled';
    return false;
  });

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Shopping</h1>
          <p className="mt-2 text-lg text-gray-600">
            Watch live streams and shop your favorite products
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedStatus('all')}
            >
              All Streams
            </Button>
            <Button
              variant={selectedStatus === 'live' ? 'default' : 'outline'}
              onClick={() => setSelectedStatus('live')}
            >
              <span className="w-2 h-2 mr-2 bg-red-500 rounded-full animate-pulse"></span>
              Live Now
            </Button>
            <Button
              variant={selectedStatus === 'scheduled' ? 'default' : 'outline'}
              onClick={() => setSelectedStatus('scheduled')}
            >
              <i className="ri-calendar-line mr-2"></i>
              Upcoming
            </Button>
          </div>
        </div>

        {/* Stream Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStreams.map((stream) => (
            <Link key={stream.id} href={`/live/${stream.id}`}>
              <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-200">
                  {stream.thumbnail ? (
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-live-line text-4xl text-gray-400"></i>
                    </div>
                  )}
                  {stream.status === 'live' && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                  )}
                  {stream.status === 'scheduled' && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <i className="ri-calendar-line mr-1.5"></i>
                        UPCOMING
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {stream.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {stream.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
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
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900">
                          {stream.host.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stream.status === 'scheduled'
                            ? `Starts ${formatDate(stream.scheduled_at)}`
                            : stream.status === 'live'
                            ? `Started ${formatDate(stream.started_at!)}`
                            : `Ended ${formatDate(stream.ended_at!)}`}
                        </p>
                      </div>
                    </div>
                    {stream.status === 'live' && (
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="ri-eye-line mr-1"></i>
                        {stream.viewer_count}
                      </div>
                    )}
                  </div>

                  {stream.product_count > 0 && (
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <i className="ri-shopping-bag-line mr-1"></i>
                      {stream.product_count} products available
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredStreams.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-live-line text-5xl text-gray-400"></i>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No streams found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === 'live'
                ? 'There are no live streams at the moment'
                : selectedStatus === 'scheduled'
                ? 'There are no upcoming streams scheduled'
                : 'Check back later for new streams'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
