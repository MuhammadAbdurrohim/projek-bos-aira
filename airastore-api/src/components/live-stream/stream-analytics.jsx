import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { api } from '../../lib/api';

export default function StreamAnalytics({ streamId }) {
  const [stats, setStats] = useState({
    currentViewers: 0,
    peakViewers: 0,
    totalViews: 0,
    chatMessages: 0,
    reactions: 0,
    productClicks: 0,
    duration: '00:00:00',
    engagement: 0
  });
  const [chartData, setChartData] = useState({
    viewers: [],
    reactions: [],
    messages: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [streamId]);

  const fetchInitialData = async () => {
    try {
      const [statsResponse, analyticsResponse] = await Promise.all([
        api.get(`/live-streams/${streamId}/stats`),
        api.get(`/live-streams/${streamId}/analytics`)
      ]);

      setStats(statsResponse.data);
      setChartData(analyticsResponse.data);
    } catch (err) {
      console.error('Failed to fetch stream analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/live-streams/${streamId}/stats`);
      setStats(prev => ({
        ...prev,
        ...response.data
      }));

      // Update chart data
      setChartData(prev => ({
        viewers: [...prev.viewers, { time: new Date(), count: response.data.currentViewers }].slice(-30),
        reactions: [...prev.reactions, { time: new Date(), count: response.data.reactions }].slice(-30),
        messages: [...prev.messages, { time: new Date(), count: response.data.chatMessages }].slice(-30)
      }));
    } catch (err) {
      console.error('Failed to fetch stream stats:', err);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-gray-200">
      {/* Overview Stats */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Stream Analytics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Current Viewers</p>
              <i className="fas fa-users text-gray-400"></i>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.currentViewers}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Peak: {stats.peakViewers}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <i className="fas fa-eye text-gray-400"></i>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.totalViews}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Duration: {stats.duration}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Engagement</p>
              <i className="fas fa-chart-line text-gray-400"></i>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.engagement}%
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {stats.reactions} reactions
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Product Interest</p>
              <i className="fas fa-shopping-bag text-gray-400"></i>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.productClicks}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Product clicks
            </p>
          </div>
        </div>
      </div>

      {/* Engagement Timeline */}
      <div className="p-6">
        <h4 className="text-sm font-medium text-gray-500 mb-4">
          Last 5 Minutes Activity
        </h4>
        <div className="relative h-48">
          <div className="absolute inset-0">
            <div className="h-full flex items-end space-x-1">
              {chartData.viewers.map((point, index) => (
                <div
                  key={index}
                  className="w-2 bg-blue-200 rounded-t"
                  style={{
                    height: `${(point.count / stats.peakViewers) * 100}%`,
                    minHeight: '4px'
                  }}
                >
                  <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded">
                    {point.count} viewers
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.chatMessages}
            </p>
            <p className="text-sm text-gray-500">Chat Messages</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.reactions}
            </p>
            <p className="text-sm text-gray-500">Reactions</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {Math.round((stats.productClicks / stats.totalViews) * 100) || 0}%
            </p>
            <p className="text-sm text-gray-500">Click Rate</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
