import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { useToast, ToastHook } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

type StreamStatus = 'scheduled' | 'live' | 'ended';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: StreamStatus;
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

export default function LiveStreamPage() {
  const toast: ToastHook = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | StreamStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await fetch('/api/live-streams');
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

  const handleDelete = async (streamId: string) => {
    if (!window.confirm('Are you sure you want to delete this live stream?')) {
      return;
    }

    try {
      const response = await fetch(`/api/live-streams/${streamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete live stream');
      }

      setStreams(streams.filter(stream => stream.id !== streamId));
      toast.addToast('Live stream deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.addToast(errorMessage, 'error');
    }
  };

  const getStatusColor = (status: StreamStatus): string => {
    const colors: Record<StreamStatus, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      live: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const getStreamDate = (stream: LiveStream): string => {
    switch (stream.status) {
      case 'scheduled':
        return `Scheduled for ${formatDate(stream.scheduled_at)}`;
      case 'live':
        return `Started ${formatDate(stream.started_at || '')}`;
      case 'ended':
        return `Ended ${formatDate(stream.ended_at || '')}`;
      default:
        return '';
    }
  };

  const filteredStreams = streams.filter(stream => {
    const matchesStatus = selectedStatus === 'all' || stream.status === selectedStatus;
    const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Live Streams</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your live shopping streams
          </p>
        </div>
        <Link href="/dashboard/live-stream/tambah">
          <Button>
            <i className="ri-live-line mr-2"></i>
            Create Live Stream
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search live streams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StreamStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Live Streams Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStreams.map((stream) => (
          <Card key={stream.id} className="overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {stream.thumbnail ? (
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center">
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
            </div>

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
                      {getStreamDate(stream)}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getStatusColor(stream.status)
                }`}>
                  {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <i className="ri-eye-line mr-1"></i>
                  {stream.viewer_count} viewers
                </div>
                <div className="flex items-center">
                  <i className="ri-shopping-bag-line mr-1"></i>
                  {stream.product_count} products
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2">
                {stream.status === 'scheduled' && (
                  <Link href={`/dashboard/live-stream/start/${stream.id}`}>
                    <Button variant="outline" size="sm">
                      <i className="ri-broadcast-line mr-1"></i>
                      Start Stream
                    </Button>
                  </Link>
                )}
                {stream.status === 'live' && (
                  <Link href={`/dashboard/live-stream/${stream.id}`}>
                    <Button variant="outline" size="sm">
                      <i className="ri-live-line mr-1"></i>
                      View Stream
                    </Button>
                  </Link>
                )}
                <Link href={`/dashboard/live-stream/edit/${stream.id}`}>
                  <Button variant="outline" size="sm">
                    <i className="ri-edit-line mr-1"></i>
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(stream.id)}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <i className="ri-delete-bin-line mr-1"></i>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredStreams.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-live-line text-5xl text-gray-400"></i>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No live streams</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new live stream
          </p>
          <div className="mt-6">
            <Link href="/dashboard/live-stream/tambah">
              <Button>
                <i className="ri-live-line mr-2"></i>
                Create Live Stream
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
