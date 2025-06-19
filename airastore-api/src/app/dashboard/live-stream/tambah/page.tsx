'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function AddLiveStreamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    thumbnail: null as File | null,
    products: [] as { id: number; order: number; is_highlighted: boolean }[],
    settings: {
      chat_enabled: true,
      reactions_enabled: true,
      product_showcase_enabled: true
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('scheduled_at', formData.scheduled_at);
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      formDataToSend.append('products', JSON.stringify(formData.products));
      formDataToSend.append('settings', JSON.stringify(formData.settings));

      const response = await fetch('http://localhost:8000/api/live-streams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create live stream');
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
      setFormData(prev => ({
        ...prev,
        thumbnail: e.target.files![0]
      }));
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

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Live Stream</CardTitle>
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
              <label className="text-sm font-medium">Thumbnail</label>
              <Input
                name="thumbnail"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                required
              />
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
                {loading ? 'Creating...' : 'Create Live Stream'}
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
