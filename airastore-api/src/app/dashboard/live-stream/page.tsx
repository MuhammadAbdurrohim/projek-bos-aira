'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface LiveStream {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  max_viewer_count: number;
}

export default function LiveStreamPage() {
  const router = useRouter();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLiveStreams();
  }, []);

  const fetchLiveStreams = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/live-streams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch live streams');
      }

      const data = await response.json();
      setLiveStreams(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500">Live</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'ended':
        return <Badge className="bg-gray-500">Ended</Badge>;
      default:
        return null;
    }
  };

  const handleStart = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${id}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start live stream');
      }

      // Refresh live streams list
      fetchLiveStreams();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEnd = async (id: number) => {
    if (!confirm('Are you sure you want to end this live stream?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/live-streams/${id}/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to end live stream');
      }

      // Refresh live streams list
      fetchLiveStreams();
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

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Live Streams</CardTitle>
          <Button onClick={() => router.push('/dashboard/live-stream/tambah')}>
            Schedule Live Stream
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Thumbnail</th>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Scheduled At</th>
                  <th className="py-3 px-4 text-left">Viewers</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {liveStreams.map((stream) => (
                  <tr key={stream.id} className="border-b">
                    <td className="py-3 px-4">
                      <img
                        src={`http://localhost:8000/storage/${stream.thumbnail}`}
                        alt={stream.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{stream.title}</div>
                        <div className="text-sm text-gray-500">{stream.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(stream.status)}
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(stream.scheduled_at), 'PPp')}
                    </td>
                    <td className="py-3 px-4">
                      {stream.status === 'live' ? (
                        <div>
                          <div>Current: {stream.viewer_count}</div>
                          <div className="text-sm text-gray-500">
                            Max: {stream.max_viewer_count}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {stream.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/live-stream/edit/${stream.id}`)}
                          >
                            Edit
                          </Button>
                        )}
                        {stream.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => handleStart(stream.id)}
                          >
                            Start
                          </Button>
                        )}
                        {stream.status === 'live' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/dashboard/live-stream/${stream.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleEnd(stream.id)}
                            >
                              End
                            </Button>
                          </>
                        )}
                        {stream.status === 'ended' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/live-stream/${stream.id}`)}
                          >
                            View Stats
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
