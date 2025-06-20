'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { useToast, ToastHook } from '@/lib/hooks';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  thumbnail: string | File;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at: string;
  products: string[];
}

interface FormData extends Partial<LiveStream> {
  thumbnail?: string | File;
}

interface FormErrors {
  title?: string;
  description?: string;
  scheduled_at?: string;
  thumbnail?: string;
  products?: string;
  _error?: string;
}

export default function EditLiveStreamPage() {
  const params = useParams();
  const router = useRouter();
  const toast: ToastHook = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [selectedProducts, setSelectedProducts] = useState<Array<{id: string, name: string}>>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    fetchStreamDetails();
  }, [params.id]);

  const fetchStreamDetails = async () => {
    try {
      const response = await fetch(`/api/live-streams/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stream details');
      }

      if (data.status === 'live' || data.status === 'ended') {
        throw new Error(`Cannot edit ${data.status} stream`);
      }

      setFormData(data);
      if (data.products) {
        setSelectedProducts(data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
        })));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.scheduled_at) {
      errors.scheduled_at = 'Schedule date is required';
    } else {
      const scheduledDate = new Date(formData.scheduled_at);
      const now = new Date();
      if (scheduledDate <= now) {
        errors.scheduled_at = 'Schedule date must be in the future';
      }
    }

    if (selectedProducts.length === 0) {
      errors.products = 'At least one product must be selected';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'products') {
          formDataToSend.append(key, JSON.stringify(selectedProducts.map(p => p.id)));
        } else if (key === 'thumbnail' && value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== undefined) {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch(`/api/live-streams/${params.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update live stream');
      }

      toast.addToast('Live stream updated successfully', 'success');
      router.push('/dashboard/live-stream');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setFormErrors({ _error: errorMessage });
      toast.addToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          thumbnail: 'Please upload a valid image file (JPEG, PNG, or GIF)',
        }));
        return;
      }

      if (file.size > maxSize) {
        setFormErrors(prev => ({
          ...prev,
          thumbnail: 'Image size should be less than 2MB',
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        thumbnail: file,
      }));
      setFormErrors(prev => ({
        ...prev,
        thumbnail: undefined,
      }));
    }
  };

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Live Stream</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your scheduled live stream details
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {formErrors._error && (
          <ErrorMessage message={formErrors._error} />
        )}

        <Card className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  if (formErrors.title) {
                    setFormErrors(prev => ({ ...prev, title: undefined }));
                  }
                }}
                className={`mt-1 block w-full rounded-md ${
                  formErrors.title ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm`}
              />
              {formErrors.title && (
                <p className="mt-2 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  if (formErrors.description) {
                    setFormErrors(prev => ({ ...prev, description: undefined }));
                  }
                }}
                className={`mt-1 block w-full rounded-md ${
                  formErrors.description ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm`}
              />
              {formErrors.description && (
                <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            {/* Schedule */}
            <div>
              <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                id="scheduled_at"
                value={formData.scheduled_at || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, scheduled_at: e.target.value }));
                  if (formErrors.scheduled_at) {
                    setFormErrors(prev => ({ ...prev, scheduled_at: undefined }));
                  }
                }}
                className={`mt-1 block w-full rounded-md ${
                  formErrors.scheduled_at ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm`}
              />
              {formErrors.scheduled_at && (
                <p className="mt-2 text-sm text-red-600">{formErrors.scheduled_at}</p>
              )}
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thumbnail
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                  {formData.thumbnail ? (
                    typeof formData.thumbnail === 'string' ? (
                      <img
                        src={formData.thumbnail}
                        alt="Stream thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(formData.thumbnail)}
                        alt="Stream thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )
                  ) : (
                    <i className="ri-image-line text-4xl text-gray-400"></i>
                  )}
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('thumbnail-upload')?.click()}
                  >
                    Change Image
                  </Button>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF up to 2MB
                  </p>
                </div>
              </div>
              {formErrors.thumbnail && (
                <p className="mt-2 text-sm text-red-600">{formErrors.thumbnail}</p>
              )}
            </div>

            {/* Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Products
              </label>
              <div className="mt-1">
                {selectedProducts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProducts.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <span className="text-sm text-gray-900">{product.name}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProducts(prev => 
                              prev.filter(p => p.id !== product.id)
                            );
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No products selected</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setShowProductSelector(true)}
                >
                  <i className="ri-add-line mr-1"></i>
                  Add Products
                </Button>
                {formErrors.products && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.products}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
