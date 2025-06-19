'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface LiveStream {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at: string;
  viewer_count: number;
  user: {
    id: number;
    name: string;
    avatar_url: string;
  };
}

export default function LiveStreamListPage() {
  const router = useRouter();
  const [liveStreams, setLiveStreams] = useState<{
    live: LiveStream[];
    upcoming: LiveStream[];
  }>({
    live: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLiveStreams();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchLiveStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStreams = async () => {
    try {
      // Fetch live streams
      const livesResponse = await fetch('http://localhost:8000/api/live-streams?live=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Fetch upcoming streams
      const upcomingResponse = await fetch('http://localhost:8000/api/live-streams?upcoming=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!livesResponse.ok || !upcomingResponse.ok) {
        throw new Error('Failed to fetch live streams');
      }

      const livesData = await livesResponse.json();
      const upcomingData = await upcomingResponse.json();

      setLiveStreams({
        live: livesData.data,
        upcoming: upcomingData.data
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const LiveStreamCard = ({ stream }: { stream: LiveStream }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video">
        <img
          src={`http://localhost:8000/storage/${stream.thumbnail}`}
          alt={stream.title}
          className="w-full h-full object-cover"
        />
        {stream.status === 'live' && (
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={stream.user.avatar_url}
            alt={stream.user.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">{stream.user.name}</span>
        </div>
        <h3 className="font-medium line-clamp-2">{stream.title}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{stream.description}</p>
        <div className="mt-2 flex items-center justify-between">
          {stream.status === 'live' ? (
            <div className="text-sm text-gray-500">
              {stream.viewer_count} watching
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Starts {format(new Date(stream.scheduled_at), 'PPp')}
            </div>
          )}
          <Button
            size="sm"
            onClick={() => router.push(`/live/${stream.id}`)}
          >
            {stream.status === 'live' ? 'Watch Now' : 'Set Reminder'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <Tabs defaultValue="live">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="live">Live Now</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="live">
          {liveStreams.live.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">No Live Streams</h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back later for live streams
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStreams.live.map(stream => (
                <LiveStreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {liveStreams.upcoming.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">No Upcoming Streams</h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back later for scheduled streams
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStreams.upcoming.map(stream => (
                <LiveStreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
