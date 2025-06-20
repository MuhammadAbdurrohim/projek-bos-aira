import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card } from '../../../components/ui/card';
import { LoadingOverlay } from '../../../components/ui/loading';
import { useToast } from '../../../lib/hooks';
import { api } from '../../../lib/api';
import StreamPlayer from '../../../components/live-stream/stream-player';
import ProductShowcase from '../../../components/live-stream/product-showcase';

export default function ViewLiveStreamPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    fetchStreamData();
    const viewerInterval = setInterval(updateViewerCount, 30000); // Update every 30s
    return () => clearInterval(viewerInterval);
  }, [id]);

  const fetchStreamData = async () => {
    try {
      const response = await api.get(`/live-streams/${id}`);
      const streamData = response.data;

      if (streamData.status !== 'live') {
        toast.addToast('This stream is not currently live', 'error');
        router.push('/live');
        return;
      }

      setStream(streamData);
      setViewerCount(streamData.viewer_count || 0);
      setLoading(false);
    } catch (err) {
      toast.addToast('Failed to load stream', 'error');
      router.push('/live');
    }
  };

  const updateViewerCount = async () => {
    try {
      const response = await api.get(`/live-streams/${id}`);
      setViewerCount(response.data.viewer_count || 0);
    } catch (err) {
      console.error('Failed to update viewer count:', err);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!stream) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stream Player */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {stream.title}
                    </h1>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <i className="fas fa-user mr-1"></i>
                        {stream.user?.name}
                      </span>
                      <span className="flex items-center">
                        <i className="fas fa-eye mr-1"></i>
                        {viewerCount} watching
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <span className="w-2 h-2 mr-2 bg-red-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                </div>
              </div>

              <StreamPlayer
                streamId={id}
                isHost={false}
                onError={(error) => toast.addToast(error, 'error')}
              />

              {/* Stream Description */}
              {stream.description && (
                <div className="p-4 border-t border-gray-200">
                  <h2 className="text-sm font-medium text-gray-500 mb-2">
                    About this stream
                  </h2>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {stream.description}
                  </p>
                </div>
              )}
            </Card>

            {/* Stream Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <i className="fas fa-clock text-blue-600 text-xl"></i>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Started</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(stream.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <i className="fas fa-users text-purple-600 text-xl"></i>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Peak Viewers</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stream.max_viewer_count || 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streamer Info */}
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {stream.user?.avatar ? (
                    <img
                      src={stream.user.avatar}
                      alt={stream.user.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-user text-gray-400 text-2xl"></i>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-medium text-gray-900 truncate">
                    {stream.user?.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {stream.user?.followers_count || 0} followers
                  </p>
                </div>
                <button className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  <i className="fas fa-user-plus mr-2"></i>
                  Follow
                </button>
              </div>
            </Card>

            {/* Product Showcase */}
            {stream.settings?.product_showcase_enabled && (
              <ProductShowcase
                streamId={id}
                onProductSelect={null} // Viewers can't highlight products
              />
            )}

            {/* Share */}
            <Card className="p-4">
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                Share Stream
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <i className="fab fa-facebook-f mr-2"></i>
                  Share
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = `Watch ${stream.title} live on AiraStore!`;
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                  }}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <i className="fab fa-twitter mr-2"></i>
                  Tweet
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.addToast('Stream URL copied to clipboard', 'success');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <i className="fas fa-link mr-2"></i>
                  Copy
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
