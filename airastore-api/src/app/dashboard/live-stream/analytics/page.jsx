import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { LoadingOverlay } from '../../../../components/ui/loading';
import { useToast } from '../../../../lib/hooks';
import { api } from '../../../../lib/api';

export default function StreamAnalyticsDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30');
  const [analytics, setAnalytics] = useState({
    overview: {
      total_streams: 0,
      total_views: 0,
      total_duration: '00:00:00',
      total_revenue: 0,
      avg_viewers: 0,
      avg_engagement: 0
    },
    streams: [],
    performance: {
      views_trend: [],
      engagement_trend: [],
      revenue_trend: []
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/live-streams/analytics?range=${dateRange}`);
      setAnalytics(response.data);
    } catch (err) {
      toast.addToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Stream Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Performance overview of your live streams
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            >
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/live-stream/tambah')}
            >
              <i className="fas fa-plus mr-2"></i>
              New Stream
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Streams
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {analytics.overview.total_streams}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-video text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Total Duration: {analytics.overview.total_duration}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Views
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {analytics.overview.total_views}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-eye text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Avg. Viewers: {analytics.overview.avg_viewers}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  Rp {parseInt(analytics.overview.total_revenue).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fas fa-coins text-yellow-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Avg. Engagement: {analytics.overview.avg_engagement}%
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Streams */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Streams
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {analytics.streams.map((stream) => (
              <div key={stream.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {stream.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stream.status === 'ended' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {stream.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{new Date(stream.started_at).toLocaleDateString()}</span>
                      <span>{stream.duration}</span>
                      <span>{stream.total_views} views</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Rp {parseInt(stream.revenue).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {stream.orders} orders
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/live-stream/summary/${stream.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Trends */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Views Trend
            </h3>
            <div className="h-48">
              {/* Simple bar chart for views trend */}
              <div className="h-full flex items-end space-x-2">
                {analytics.performance.views_trend.map((point, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-100 rounded-t hover:bg-blue-200 transition-colors"
                    style={{ height: `${(point.views / Math.max(...analytics.performance.views_trend.map(p => p.views))) * 100}%` }}
                  >
                    <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded">
                      {point.views} views
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Engagement Trend
            </h3>
            <div className="h-48">
              {/* Simple line chart for engagement trend */}
              <div className="h-full flex items-end space-x-2">
                {analytics.performance.engagement_trend.map((point, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-green-100 rounded-t hover:bg-green-200 transition-colors"
                    style={{ height: `${point.rate}%` }}
                  >
                    <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded">
                      {point.rate}% engagement
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Revenue Trend
            </h3>
            <div className="h-48">
              {/* Simple bar chart for revenue trend */}
              <div className="h-full flex items-end space-x-2">
                {analytics.performance.revenue_trend.map((point, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-yellow-100 rounded-t hover:bg-yellow-200 transition-colors"
                    style={{ height: `${(point.revenue / Math.max(...analytics.performance.revenue_trend.map(p => p.revenue))) * 100}%` }}
                  >
                    <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded">
                      Rp {parseInt(point.revenue).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
