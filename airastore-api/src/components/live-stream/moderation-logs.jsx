import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../../lib/hooks';
import { api } from '../../lib/api';

const ACTION_TYPES = {
  ban: { icon: 'fa-ban', color: 'text-red-600', bg: 'bg-red-100' },
  unban: { icon: 'fa-unlock', color: 'text-green-600', bg: 'bg-green-100' },
  mute: { icon: 'fa-microphone-slash', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  unmute: { icon: 'fa-microphone', color: 'text-green-600', bg: 'bg-green-100' },
  warning: { icon: 'fa-exclamation-triangle', color: 'text-orange-600', bg: 'bg-orange-100' },
  delete: { icon: 'fa-trash', color: 'text-red-600', bg: 'bg-red-100' },
  mod_add: { icon: 'fa-user-shield', color: 'text-blue-600', bg: 'bg-blue-100' },
  mod_remove: { icon: 'fa-user-minus', color: 'text-gray-600', bg: 'bg-gray-100' },
  report_handled: { icon: 'fa-check-circle', color: 'text-green-600', bg: 'bg-green-100' },
  word_filtered: { icon: 'fa-filter', color: 'text-purple-600', bg: 'bg-purple-100' }
};

export default function ModerationLogs({ streamId, isHost }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    actionType: 'all',
    moderator: 'all',
    dateRange: 'all'
  });
  const [moderators, setModerators] = useState([]);
  const [stats, setStats] = useState({
    total_actions: 0,
    actions_by_type: {},
    most_active_moderator: null,
    peak_action_hour: null
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isHost) {
      fetchInitialData();
    }
  }, [streamId, isHost]);

  useEffect(() => {
    if (isHost) {
      fetchLogs();
    }
  }, [filters, page]);

  const fetchInitialData = async () => {
    try {
      const [logsRes, moderatorsRes, statsRes] = await Promise.all([
        api.get(`/live-streams/${streamId}/moderation-logs`),
        api.get(`/live-streams/${streamId}/moderators`),
        api.get(`/live-streams/${streamId}/moderation-stats`)
      ]);

      setLogs(logsRes.data.logs);
      setModerators(moderatorsRes.data);
      setStats(statsRes.data);
      setHasMore(logsRes.data.has_more);
    } catch (err) {
      toast.addToast('Failed to load moderation logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        ...filters,
        page
      });

      const response = await api.get(`/live-streams/${streamId}/moderation-logs?${params}`);
      
      if (page === 1) {
        setLogs(response.data.logs);
      } else {
        setLogs(prev => [...prev, ...response.data.logs]);
      }
      
      setHasMore(response.data.has_more);
    } catch (err) {
      toast.addToast('Failed to load more logs', 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const exportLogs = async (format) => {
    try {
      const response = await api.get(`/live-streams/${streamId}/moderation-logs/export`, {
        params: { format },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moderation-logs-${streamId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.addToast('Failed to export logs', 'error');
    }
  };

  if (!isHost) return null;
  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Total Actions</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.total_actions}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Most Common Action</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {Object.entries(stats.actions_by_type)
              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Most Active Moderator</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.most_active_moderator?.name || 'None'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Peak Activity Hour</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.peak_action_hour ? `${stats.peak_action_hour}:00` : 'N/A'}
          </div>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filters.actionType}
              onChange={(e) => handleFilterChange('actionType', e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            >
              <option value="all">All Actions</option>
              {Object.keys(ACTION_TYPES).map(type => (
                <option key={type} value={type}>
                  {type.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </option>
              ))}
            </select>

            <select
              value={filters.moderator}
              onChange={(e) => handleFilterChange('moderator', e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            >
              <option value="all">All Moderators</option>
              {moderators.map(mod => (
                <option key={mod.id} value={mod.id}>{mod.name}</option>
              ))}
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => exportLogs('csv')}
            >
              <i className="fas fa-file-csv mr-2"></i>
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => exportLogs('pdf')}
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs List */}
      <Card className="divide-y divide-gray-200">
        {logs.map((log) => {
          const actionConfig = ACTION_TYPES[log.action_type] || {
            icon: 'fa-circle',
            color: 'text-gray-600',
            bg: 'bg-gray-100'
          };

          return (
            <div key={log.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${actionConfig.bg}`}>
                  <i className={`fas ${actionConfig.icon} ${actionConfig.color}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {log.moderator.name}
                    </p>
                    <time className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {log.action_description}
                  </p>
                  {log.target_user && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Target User:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {log.target_user.name}
                      </span>
                    </div>
                  )}
                  {log.details && (
                    <div className="mt-2 text-xs text-gray-500">
                      {log.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {logs.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No moderation logs found
          </div>
        )}

        {hasMore && (
          <div className="p-4 text-center">
            <Button
              variant="outline"
              onClick={() => setPage(prev => prev + 1)}
            >
              Load More
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
