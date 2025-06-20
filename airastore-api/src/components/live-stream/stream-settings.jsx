import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../../lib/hooks';
import { api } from '../../lib/api';

export default function StreamSettings({ streamId, onUpdate }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    stream: {
      title: '',
      description: '',
      thumbnail: null,
      scheduled_at: '',
      is_private: false,
      requires_auth: true
    },
    chat: {
      enabled: true,
      slow_mode: false,
      slow_mode_delay: 5,
      followers_only: false,
      blocked_words: [],
      max_message_length: 200
    },
    products: {
      showcase_enabled: true,
      auto_highlight: false,
      highlight_duration: 30,
      max_featured_products: 10
    },
    alerts: {
      sound_enabled: true,
      desktop_notifications: true,
      milestone_alerts: true,
      performance_alerts: true,
      viewer_milestones: [10, 50, 100, 500, 1000],
      revenue_milestones: [100000, 500000, 1000000],
      alert_thresholds: {
        viewer_drop: 20,
        engagement_drop: 30,
        low_bandwidth: 1000
      }
    }
  });

  useEffect(() => {
    fetchSettings();
  }, [streamId]);

  const fetchSettings = async () => {
    try {
      const response = await api.get(`/live-streams/${streamId}/settings`);
      setSettings(response.data);
    } catch (err) {
      toast.addToast('Failed to load stream settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, field, value) => {
    try {
      const arrayValue = value.split(',').map(v => 
        field.includes('milestone') ? parseInt(v.trim()) : v.trim()
      ).filter(Boolean);
      
      handleChange(section, field, arrayValue);
    } catch (err) {
      toast.addToast('Invalid input format', 'error');
    }
  };

  const handleThresholdChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        alert_thresholds: {
          ...prev.alerts.alert_thresholds,
          [field]: parseInt(value)
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/live-streams/${streamId}/settings`, settings);
      toast.addToast('Settings saved successfully', 'success');
      if (onUpdate) onUpdate(settings);
    } catch (err) {
      toast.addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Stream Settings */}
        <Card className="divide-y divide-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Stream Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={settings.stream.title}
                  onChange={(e) => handleChange('stream', 'title', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={settings.stream.description}
                  onChange={(e) => handleChange('stream', 'description', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.stream.is_private}
                    onChange={(e) => handleChange('stream', 'is_private', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Private Stream
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.stream.requires_auth}
                    onChange={(e) => handleChange('stream', 'requires_auth', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Require Authentication
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Settings */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Chat Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.chat.enabled}
                    onChange={(e) => handleChange('chat', 'enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Chat
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.chat.slow_mode}
                    onChange={(e) => handleChange('chat', 'slow_mode', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Slow Mode
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slow Mode Delay (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.chat.slow_mode_delay}
                  onChange={(e) => handleChange('chat', 'slow_mode_delay', parseInt(e.target.value))}
                  className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Blocked Words (comma-separated)
                </label>
                <input
                  type="text"
                  value={settings.chat.blocked_words.join(', ')}
                  onChange={(e) => handleArrayChange('chat', 'blocked_words', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Product Settings */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Product Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.products.showcase_enabled}
                    onChange={(e) => handleChange('products', 'showcase_enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Product Showcase
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.products.auto_highlight}
                    onChange={(e) => handleChange('products', 'auto_highlight', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Auto-highlight Products
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Highlight Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={settings.products.highlight_duration}
                    onChange={(e) => handleChange('products', 'highlight_duration', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Featured Products
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.products.max_featured_products}
                    onChange={(e) => handleChange('products', 'max_featured_products', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Alert Settings
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.sound_enabled}
                    onChange={(e) => handleChange('alerts', 'sound_enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Sound Alerts
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.desktop_notifications}
                    onChange={(e) => handleChange('alerts', 'desktop_notifications', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Desktop Notifications
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Viewer Milestones (comma-separated)
                </label>
                <input
                  type="text"
                  value={settings.alerts.viewer_milestones.join(', ')}
                  onChange={(e) => handleArrayChange('alerts', 'viewer_milestones', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Revenue Milestones (comma-separated)
                </label>
                <input
                  type="text"
                  value={settings.alerts.revenue_milestones.join(', ')}
                  onChange={(e) => handleArrayChange('alerts', 'revenue_milestones', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Viewer Drop Alert (%)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={settings.alerts.alert_thresholds.viewer_drop}
                    onChange={(e) => handleThresholdChange('viewer_drop', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Engagement Drop Alert (%)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={settings.alerts.alert_thresholds.engagement_drop}
                    onChange={(e) => handleThresholdChange('engagement_drop', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Low Bandwidth Alert (Kbps)
                  </label>
                  <input
                    type="number"
                    min="500"
                    max="5000"
                    value={settings.alerts.alert_thresholds.low_bandwidth}
                    onChange={(e) => handleThresholdChange('low_bandwidth', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchSettings()}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
