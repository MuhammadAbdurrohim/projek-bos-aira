import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../../lib/hooks';
import { api } from '../../lib/api';

export default function ModerationTrends({ streamId, isHost }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('hour');
  const [trends, setTrends] = useState({
    actions: [],
    userBehavior: {
      repeat_offenders: [],
      warning_to_ban_ratio: 0,
      most_reported_reasons: []
    },
    chatMetrics: {
      message_volume: [],
      filtered_messages: [],
      user_engagement: []
    },
    moderationEfficiency: {
      response_times: [],
      resolution_rates: [],
      action_effectiveness: []
    }
  });

  useEffect(() => {
    if (isHost) {
      fetchTrends();
    }
  }, [streamId, timeframe, isHost]);

  const fetchTrends = async () => {
    try {
      const response = await api.get(`/live-streams/${streamId}/moderation-trends`, {
        params: { timeframe }
      });
      setTrends(response.data);
    } catch (err) {
      toast.addToast('Failed to load moderation trends', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderTimeSeriesChart = (data, label, color = 'blue') => (
    <div className="h-32 relative">
      <div className="absolute inset-0 flex items-end space-x-1">
        {data.map((point, index) => (
          <div
            key={index}
            className="flex-1 group relative"
          >
            <div
              className={`bg-${color}-100 hover:bg-${color}-200 transition-colors rounded-t`}
              style={{ height: `${(point.value / Math.max(...data.map(p => p.value))) * 100}%` }}
            >
              <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                {point.value} {label} at {point.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isHost) return null;
  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Moderation Trends
          </h2>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          >
            <option value="hour">Last Hour</option>
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </Card>

      {/* Action Trends */}
      <Card className="divide-y divide-gray-200">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Moderation Actions Over Time
          </h3>
          {renderTimeSeriesChart(trends.actions, 'actions')}
        </div>

        {/* User Behavior Analysis */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            User Behavior Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Top Repeat Offenders
              </h4>
              <div className="space-y-2">
                {trends.userBehavior.repeat_offenders.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-900">{user.name}</span>
                    <span className="text-gray-500">{user.violations} violations</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Most Common Report Reasons
              </h4>
              <div className="space-y-2">
                {trends.userBehavior.most_reported_reasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-900">{reason.name}</span>
                    <span className="text-gray-500">{reason.count} reports</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Metrics */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Chat Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Message Volume
              </h4>
              {renderTimeSeriesChart(trends.chatMetrics.message_volume, 'messages', 'green')}
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Filtered Messages
              </h4>
              {renderTimeSeriesChart(trends.chatMetrics.filtered_messages, 'filtered', 'red')}
            </div>
          </div>
        </div>

        {/* Moderation Efficiency */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Moderation Efficiency
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Average Response Time
              </h4>
              <div className="text-2xl font-semibold text-gray-900">
                {Math.round(
                  trends.moderationEfficiency.response_times.reduce((a, b) => a + b.value, 0) /
                  trends.moderationEfficiency.response_times.length
                )}s
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Resolution Rate
              </h4>
              <div className="text-2xl font-semibold text-gray-900">
                {Math.round(
                  (trends.moderationEfficiency.resolution_rates.reduce((a, b) => a + b.value, 0) /
                  trends.moderationEfficiency.resolution_rates.length) * 100
                )}%
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Action Effectiveness
              </h4>
              <div className="text-2xl font-semibold text-gray-900">
                {Math.round(
                  (trends.moderationEfficiency.action_effectiveness.reduce((a, b) => a + b.value, 0) /
                  trends.moderationEfficiency.action_effectiveness.length) * 100
                )}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Key Insights
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="mt-1">
              <i className="fas fa-chart-line text-blue-500"></i>
            </div>
            <div>
              <p className="text-sm text-gray-900">
                Message volume is {
                  trends.chatMetrics.message_volume[trends.chatMetrics.message_volume.length - 1]?.value >
                  trends.chatMetrics.message_volume[0]?.value ? 'increasing' : 'decreasing'
                }
              </p>
              <p className="text-xs text-gray-500">
                Consider adjusting chat settings if volume becomes unmanageable
              </p>
            </div>
          </div>

          {trends.userBehavior.warning_to_ban_ratio > 0.5 && (
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <i className="fas fa-exclamation-triangle text-yellow-500"></i>
              </div>
              <div>
                <p className="text-sm text-gray-900">
                  High warning-to-ban ratio detected
                </p>
                <p className="text-xs text-gray-500">
                  Consider reviewing moderation guidelines for consistency
                </p>
              </div>
            </div>
          )}

          {Math.max(...trends.chatMetrics.filtered_messages.map(m => m.value)) > 20 && (
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <i className="fas fa-filter text-red-500"></i>
              </div>
              <div>
                <p className="text-sm text-gray-900">
                  High number of filtered messages
                </p>
                <p className="text-xs text-gray-500">
                  Review chat filter settings and blocked words list
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
