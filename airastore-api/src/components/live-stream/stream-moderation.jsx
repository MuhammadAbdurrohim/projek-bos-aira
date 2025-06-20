import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../../lib/hooks';
import { api } from '../../lib/api';

export default function StreamModeration({ streamId, isHost }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [moderators, setModerators] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [newModeratorEmail, setNewModeratorEmail] = useState('');
  const [selectedTab, setSelectedTab] = useState('moderators');

  useEffect(() => {
    if (isHost) {
      fetchModerationData();
      const interval = setInterval(fetchReports, 10000);
      return () => clearInterval(interval);
    }
  }, [streamId, isHost]);

  const fetchModerationData = async () => {
    try {
      const [
        moderatorsRes,
        bannedRes,
        mutedRes,
        reportsRes
      ] = await Promise.all([
        api.get(`/live-streams/${streamId}/moderators`),
        api.get(`/live-streams/${streamId}/banned-users`),
        api.get(`/live-streams/${streamId}/muted-users`),
        api.get(`/live-streams/${streamId}/reports`)
      ]);

      setModerators(moderatorsRes.data);
      setBannedUsers(bannedRes.data);
      setMutedUsers(mutedRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      toast.addToast('Failed to load moderation data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get(`/live-streams/${streamId}/reports`);
      setReports(response.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  const handleAddModerator = async (e) => {
    e.preventDefault();
    if (!newModeratorEmail.trim()) return;

    try {
      const response = await api.post(`/live-streams/${streamId}/moderators`, {
        email: newModeratorEmail
      });
      setModerators([...moderators, response.data]);
      setNewModeratorEmail('');
      toast.addToast('Moderator added successfully', 'success');
    } catch (err) {
      toast.addToast('Failed to add moderator', 'error');
    }
  };

  const handleRemoveModerator = async (moderatorId) => {
    try {
      await api.delete(`/live-streams/${streamId}/moderators/${moderatorId}`);
      setModerators(moderators.filter(mod => mod.id !== moderatorId));
      toast.addToast('Moderator removed successfully', 'success');
    } catch (err) {
      toast.addToast('Failed to remove moderator', 'error');
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await api.post(`/live-streams/${streamId}/user-action`, {
        user_id: userId,
        action
      });

      // Update local state based on action
      switch (action) {
        case 'ban':
          const user = mutedUsers.find(u => u.id === userId);
          if (user) {
            setMutedUsers(mutedUsers.filter(u => u.id !== userId));
            setBannedUsers([...bannedUsers, user]);
          }
          break;
        case 'unban':
          setBannedUsers(bannedUsers.filter(u => u.id !== userId));
          break;
        case 'mute':
          setMutedUsers([...mutedUsers, reports.find(r => r.user.id === userId).user]);
          break;
        case 'unmute':
          setMutedUsers(mutedUsers.filter(u => u.id !== userId));
          break;
      }

      toast.addToast(`User ${action}ed successfully`, 'success');
    } catch (err) {
      toast.addToast(`Failed to ${action} user`, 'error');
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      await api.post(`/live-streams/${streamId}/reports/${reportId}/${action}`);
      setReports(reports.filter(r => r.id !== reportId));
      toast.addToast('Report handled successfully', 'success');
    } catch (err) {
      toast.addToast('Failed to handle report', 'error');
    }
  };

  if (!isHost) return null;
  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <Card className="divide-y divide-gray-200">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-900">
          Stream Moderation
        </h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {['moderators', 'reports', 'banned', 'muted'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 text-sm font-medium ${
                selectedTab === tab
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'reports' && reports.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {reports.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4">
        {selectedTab === 'moderators' && (
          <div className="space-y-4">
            <form onSubmit={handleAddModerator} className="flex space-x-2">
              <input
                type="email"
                value={newModeratorEmail}
                onChange={(e) => setNewModeratorEmail(e.target.value)}
                placeholder="Enter moderator email"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
              <Button type="submit">
                Add Moderator
              </Button>
            </form>

            <div className="divide-y divide-gray-200">
              {moderators.map((mod) => (
                <div key={mod.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {mod.avatar ? (
                      <img
                        src={mod.avatar}
                        alt={mod.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <i className="fas fa-user text-gray-400"></i>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mod.name}</p>
                      <p className="text-sm text-gray-500">{mod.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveModerator(mod.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'reports' && (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {report.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      {report.reason}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReportAction(report.id, 'dismiss')}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUserAction(report.user.id, 'ban')}
                    >
                      Ban User
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No reports to show
              </div>
            )}
          </div>
        )}

        {selectedTab === 'banned' && (
          <div className="space-y-4">
            {bannedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      Banned {new Date(user.banned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserAction(user.id, 'unban')}
                >
                  Unban
                </Button>
              </div>
            ))}

            {bannedUsers.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No banned users
              </div>
            )}
          </div>
        )}

        {selectedTab === 'muted' && (
          <div className="space-y-4">
            {mutedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      Muted {new Date(user.muted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUserAction(user.id, 'unmute')}
                  >
                    Unmute
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUserAction(user.id, 'ban')}
                  >
                    Ban
                  </Button>
                </div>
              </div>
            ))}

            {mutedUsers.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No muted users
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
