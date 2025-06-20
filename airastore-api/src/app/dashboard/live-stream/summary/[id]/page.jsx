import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { LoadingOverlay } from '../../../../../components/ui/loading';
import { useToast } from '../../../../../lib/hooks';
import { api } from '../../../../../lib/api';

export default function StreamSummaryPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, [id]);

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/live-streams/${id}/summary`);
      setSummary(response.data);
    } catch (err) {
      toast.addToast('Failed to load stream summary', 'error');
      router.push('/dashboard/live-stream');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/live-streams/${id}/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stream-summary-${id}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.addToast('Failed to export summary', 'error');
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!summary) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Stream Summary
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(summary.ended_at).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
            >
              <i className="fas fa-file-csv mr-2"></i>
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Export PDF
            </Button>
          </div>
        </div>

        {/* Overview */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Stream Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {summary.duration}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {summary.total_views}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Peak Viewers</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {summary.peak_viewers}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Watch Time</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {summary.avg_watch_time}
              </p>
            </div>
          </div>
        </Card>

        {/* Engagement */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Engagement Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Chat Messages</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {summary.chat_messages}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reactions</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {summary.reactions}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {summary.engagement_rate}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unique Chatters</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {summary.unique_chatters}
              </p>
            </div>
          </div>
        </Card>

        {/* Product Performance */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Product Performance
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Product Views</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {summary.product_views}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Click Rate</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {summary.product_click_rate}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {summary.orders}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  Rp {parseInt(summary.revenue).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Top Products */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Top Products
              </h3>
              <div className="divide-y divide-gray-200">
                {summary.top_products.map((product) => (
                  <div key={product.id} className="py-3 flex items-center">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.views} views • {product.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Rp {parseInt(product.revenue).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.conversion_rate}% conversion
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Viewer Demographics */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Viewer Demographics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Top Locations
              </h3>
              <div className="space-y-2">
                {summary.viewer_locations.map((location) => (
                  <div key={location.city} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{location.city}</span>
                    <span className="text-sm text-gray-500">{location.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Devices
              </h3>
              <div className="space-y-2">
                {summary.viewer_devices.map((device) => (
                  <div key={device.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{device.type}</span>
                    <span className="text-sm text-gray-500">{device.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/live-stream')}
          >
            Back to Streams
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/live-stream/edit/${id}`)}
          >
            Edit Stream
          </Button>
        </div>
      </div>
    </div>
  );
}
