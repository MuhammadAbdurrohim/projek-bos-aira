'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface LiveStreamData {
  title: string;
  description: string;
  thumbnail: string;
  scheduled_at: string;
  settings: {
    chat_enabled: boolean;
    reactions_enabled: boolean;
    product_showcase_enabled: boolean;
  };
  products: Array<{
    id: number;
    order: number;
    is_highlighted: boolean;
  }>;
}

export default function EditLiveStreamPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<LiveStreamData>({
    title: '',
    description: '',
    thumbnail: '',
    scheduled_at: '',
    settings: {
      chat_enabled: true,
      reactions_enabled: true,
      product_showcase_enabled: true
    },
    products: []
  });
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);

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
        throw new Error('Failed to fetch live stream');
      }

      const data = await response.json();
      const liveStream = data.data;

      setFormData({
        title: liveStream.title,
        description: liveStream.description,
        thumbnail: liveStream.thumbnail,
        scheduled_at: format(new Date(liveStream.scheduled_at), "yyyy-MM-dd'T'HH:mm"),
        settings: liveStream.settings || {
          chat_enabled: true,
          reactions_enabled: true,
          product_showcase_enabled: true
        },
        products: liveStream.products || []
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('scheduled_at', formData.scheduled_at);
      formDataToSend.append('settings', JSON.stringify(formData.settings));
      formDataToSend.append('products', JSON.stringify(formData.products));
      
      if (newThumbnail) {
        formDataToSend.append('thumbnail', newThumbnail);
      }

      const response = await fetch(`http://localhost:8000/api/live-streams/${params.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to update live stream');
      }

      router.push('/dashboard/live-stream');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewThumbnail(e.target.files[0]);
    }
  };

  const handleSettingChange = (setting: keyof typeof formData.settings) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: !prev.settings[setting]
      }
    }));
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Live Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule Date & Time</label>
              <Input
                name="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={handleChange}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Thumbnail (Optional)</label>
              <Input
                name="thumbnail"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
              {formData.thumbnail && !newThumbnail && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Current thumbnail:</p>
                  <img
                    src={`http://localhost:8000/storage/${formData.thumbnail}`}
                    alt="Current thumbnail"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
              {newThumbnail && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">New thumbnail preview:</p>
                  <img
                    src={URL.createObjectURL(newThumbnail)}
                    alt="New thumbnail preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Settings</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.chat_enabled}
                    onChange={() => handleSettingChange('chat_enabled')}
                    className="rounded border-gray-300"
                  />
                  <span>Enable Chat</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.reactions_enabled}
                    onChange={() => handleSettingChange('reactions_enabled')}
                    className="rounded border-gray-300"
                  />
                  <span>Enable Reactions</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.product_showcase_enabled}
                    onChange={() => handleSettingChange('product_showcase_enabled')}
                    className="rounded border-gray-300"
                  />
                  <span>Enable Product Showcase</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Live Stream'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
