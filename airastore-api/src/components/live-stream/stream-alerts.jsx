import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../../lib/hooks';
import { api } from '../../lib/api';

const MILESTONE_THRESHOLDS = {
  viewers: [10, 50, 100, 500, 1000],
  reactions: [50, 100, 500, 1000],
  revenue: [100000, 500000, 1000000, 5000000], // In Rupiah
  engagement: [10, 25, 50, 75] // Percentage
};

const ALERT_THRESHOLDS = {
  viewerDrop: -20, // 20% drop in viewers
  engagementDrop: -30, // 30% drop in engagement
  connectionIssues: 3, // Number of connection issues
  lowBandwidth: 1000 // Minimum required bandwidth in Kbps
};

export default function StreamAlerts({ 
  streamId, 
  isHost = false,
  onAlert = () => {} 
}) {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [stats, setStats] = useState({
    viewers: 0,
    reactions: 0,
    revenue: 0,
    engagement: 0,
    bandwidth: 0,
    connectionQuality: 'good'
  });
  const [pollingRef, setPollingRef] = useState(null);
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => {
    if (isHost) {
      startPolling();
    }
    return () => {
      if (pollingRef) {
        clearInterval(pollingRef);
      }
    };
  }, [streamId, isHost]);

  const startPolling = () => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 5000);
    setPollingRef(intervalId);
  };

  const fetchData = async () => {
    try {
      const response = await api.get(`/live-streams/${streamId}/real-time-stats`);
      const newStats = response.data;
      
      // Check for milestones
      checkMilestones(newStats);
      
      // Check for alerts
      checkAlerts(newStats);
      
      setStats(newStats);
    } catch (err) {
      console.error('Failed to fetch stream stats:', err);
    }
  };

  const checkMilestones = (newStats) => {
    // Check viewer milestones
    MILESTONE_THRESHOLDS.viewers.forEach(threshold => {
      if (newStats.viewers >= threshold && stats.viewers < threshold) {
        addMilestone('viewers', threshold);
      }
    });

    // Check reaction milestones
    MILESTONE_THRESHOLDS.reactions.forEach(threshold => {
      if (newStats.reactions >= threshold && stats.reactions < threshold) {
        addMilestone('reactions', threshold);
      }
    });

    // Check revenue milestones
    MILESTONE_THRESHOLDS.revenue.forEach(threshold => {
      if (newStats.revenue >= threshold && stats.revenue < threshold) {
        addMilestone('revenue', threshold);
      }
    });

    // Check engagement milestones
    MILESTONE_THRESHOLDS.engagement.forEach(threshold => {
      if (newStats.engagement >= threshold && stats.engagement < threshold) {
        addMilestone('engagement', threshold);
      }
    });
  };

  const checkAlerts = (newStats) => {
    // Check for viewer drop
    if (stats.viewers > 0) {
      const viewerChange = ((newStats.viewers - stats.viewers) / stats.viewers) * 100;
      if (viewerChange <= ALERT_THRESHOLDS.viewerDrop) {
        addAlert('viewer-drop', 'Significant viewer drop detected');
      }
    }

    // Check for engagement drop
    if (stats.engagement > 0) {
      const engagementChange = ((newStats.engagement - stats.engagement) / stats.engagement) * 100;
      if (engagementChange <= ALERT_THRESHOLDS.engagementDrop) {
        addAlert('engagement-drop', 'Engagement rate is dropping');
      }
    }

    // Check connection quality
    if (newStats.connectionQuality !== 'good') {
      addAlert('connection', 'Stream connection quality issues detected');
    }

    // Check bandwidth
    if (newStats.bandwidth < ALERT_THRESHOLDS.lowBandwidth) {
      addAlert('bandwidth', 'Low bandwidth detected');
    }
  };

  const addMilestone = (type, value) => {
    const milestone = {
      id: Date.now(),
      type,
      value,
      timestamp: new Date(),
      message: getMilestoneMessage(type, value)
    };

    setMilestones(prev => [milestone, ...prev].slice(0, 10));
    toast.addToast(milestone.message, 'success');
    onAlert({ type: 'milestone', ...milestone });
  };

  const addAlert = (type, message) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    };

    setAlerts(prev => [alert, ...prev].slice(0, 10));
    toast.addToast(message, 'warning');
    onAlert({ type: 'alert', ...alert });
  };

  const getMilestoneMessage = (type, value) => {
    switch (type) {
      case 'viewers':
        return `🎉 Reached ${value} viewers!`;
      case 'reactions':
        return `💫 Achieved ${value} reactions!`;
      case 'revenue':
        return `💰 Revenue milestone: Rp ${value.toLocaleString()}!`;
      case 'engagement':
        return `🔥 ${value}% engagement rate reached!`;
      default:
        return 'New milestone achieved!';
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  if (!isHost) return null;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">
            Stream Alerts
          </h3>
          <div className={`w-2 h-2 rounded-full ${
            stats.connectionQuality === 'good' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            <i className={`fas fa-chevron-${showAlerts ? 'up' : 'down'} mr-1`}></i>
            {showAlerts ? 'Hide' : 'Show'}
          </Button>
          {alerts.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearAlerts}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {showAlerts && (
        <div className="divide-y divide-gray-200">
          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="p-4 bg-red-50">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Active Alerts
              </h4>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-center space-x-2 text-sm text-red-700"
                  >
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{alert.message}</span>
                    <span className="text-red-500 text-xs">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Milestones */}
          {milestones.length > 0 && (
            <div className="p-4 bg-green-50">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                Recent Milestones
              </h4>
              <div className="space-y-2">
                {milestones.map(milestone => (
                  <div
                    key={milestone.id}
                    className="flex items-center space-x-2 text-sm text-green-700"
                  >
                    <i className="fas fa-trophy"></i>
                    <span>{milestone.message}</span>
                    <span className="text-green-500 text-xs">
                      {new Date(milestone.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Alerts */}
          {alerts.length === 0 && milestones.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <i className="fas fa-check-circle text-2xl text-gray-300 mb-2"></i>
              <p className="text-sm">No active alerts or milestones</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
