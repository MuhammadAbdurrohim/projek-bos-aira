'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StreamPlayer } from '@/components/live-stream/stream-player';

interface LiveStream {
  id: number;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended';
  room_id: string;
  stream_key: string;
  viewer_count: number;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  user: {
    id: number;
    name: string;
  };
}

export default function LiveStreamDetailPage() {
  const params = useParams();
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLiveStream();
  }, []);

  const fetchLiveStream = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch live stream details');
      }

      const data = await response.json();
      setLiveStream(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndStream = async () => {
    if (!confirm('Are you sure you want to end this live stream?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${params.id}/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to end live stream');
      }

      // Refresh live stream data
      fetchLiveStream();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!liveStream) {
    return <div className="p-4">Live stream not found</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{liveStream.title}</CardTitle>
            <p className="mt-1 text-sm text-gray-500">{liveStream.description}</p>
          </div>
          {liveStream.status === 'live' && (
            <Button
              variant="destructive"
              onClick={handleEndStream}
            >
              End Stream
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {liveStream.status === 'live' && (
                <StreamPlayer
                  roomId={liveStream.room_id}
                  userId={`user-${Date.now()}`}
                  userName="Viewer"
                  role="Audience"
                  token=""
                />
              )}
              {liveStream.status === 'scheduled' && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Stream Starting Soon</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Scheduled for {new Date(liveStream.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {liveStream.status === 'ended' && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Stream Ended</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This live stream has ended
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="h-[600px]">
              {liveStream.status === 'live' && (
                <div className="h-full">
                  <div id="zego-chat" className="h-full" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stream Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  liveStream.status === 'live'
                    ? 'bg-red-100 text-red-800'
                    : liveStream.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {liveStream.status.charAt(0).toUpperCase() + liveStream.status.slice(1)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Streamer</dt>
              <dd className="mt-1">{liveStream.user.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Scheduled At</dt>
              <dd className="mt-1">{new Date(liveStream.scheduled_at).toLocaleString()}</dd>
            </div>
            {liveStream.started_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Started At</dt>
                <dd className="mt-1">{new Date(liveStream.started_at).toLocaleString()}</dd>
              </div>
            )}
            {liveStream.ended_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Ended At</dt>
                <dd className="mt-1">{new Date(liveStream.ended_at).toLocaleString()}</dd>
              </div>
            )}
            {liveStream.status === 'live' && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Viewers</dt>
                <dd className="mt-1">{liveStream.viewer_count}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
