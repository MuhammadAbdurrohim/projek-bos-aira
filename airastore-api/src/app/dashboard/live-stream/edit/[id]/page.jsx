import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { LoadingOverlay } from '../../../../../components/ui/loading';
import { useToast } from '../../../../../lib/hooks';
import { api } from '../../../../../lib/api';
import ProductSelectModal from '../../../../../components/live-stream/product-select-modal';
import ConfirmModal from '../../../../../components/live-stream/confirm-modal';

export default function EditLiveStreamPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    settings: {
      chat_enabled: true,
      reactions_enabled: true,
      product_showcase_enabled: true
    }
  });

  useEffect(() => {
    fetchStreamData();
  }, [id]);

  const fetchStreamData = async () => {
    try {
      const response = await api.get(`/live-streams/${id}`);
      const stream = response.data;

      setFormData({
        title: stream.title,
        description: stream.description || '',
        scheduled_at: stream.scheduled_at ? new Date(stream.scheduled_at).toISOString().slice(0, 16) : '',
        settings: {
          chat_enabled: stream.settings?.chat_enabled ?? true,
          reactions_enabled: stream.settings?.reactions_enabled ?? true,
          product_showcase_enabled: stream.settings?.product_showcase_enabled ?? true
        }
      });

      setSelectedProducts(stream.featured_products || []);
      setLoading(false);
    } catch (err) {
      toast.addToast('Failed to load stream data', 'error');
      router.push('/dashboard/live-stream');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.addToast('Image size should be less than 2MB', 'error');
        return;
      }
      setFormData(prev => ({
        ...prev,
        thumbnail: file
      }));
    }
  };

  const handleProductSelect = useCallback((products) => {
    setSelectedProducts(products);
  }, []);

  const openProductModal = () => {
    if (!formData.settings.product_showcase_enabled) {
      toast.addToast('Enable product showcase first', 'warning');
      return;
    }
    setIsProductModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'settings') {
          formPayload.append(key, JSON.stringify(formData[key]));
        } else if (key === 'thumbnail' && formData[key]) {
          formPayload.append(key, formData[key]);
        } else {
          formPayload.append(key, formData[key]);
        }
      });

      if (selectedProducts.length > 0) {
        formPayload.append('products', JSON.stringify(selectedProducts));
      }

      await api.post(`/live-streams/${id}`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.addToast('Live stream updated successfully', 'success');
      router.push('/dashboard/live-stream');
    } catch (err) {
      toast.addToast(err.response?.data?.message || 'Failed to update live stream', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/live-streams/${id}`);
      toast.addToast('Live stream deleted successfully', 'success');
      router.push('/dashboard/live-stream');
    } catch (err) {
      toast.addToast('Failed to delete live stream', 'error');
      setIsDeleting(false);
    }
    setIsDeleteModalOpen(false);
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Live Stream</h1>
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <i className="fas fa-trash mr-2"></i>
            Delete Stream
          </Button>
        </div>

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Live Stream"
          message="Are you sure you want to delete this live stream? This action cannot be undone and all associated data will be permanently removed."
          confirmText="Delete Stream"
          confirmVariant="danger"
          isLoading={isDeleting}
        />

        <form onSubmit={handleSubmit}>
          <Card className="divide-y divide-gray-200">
            {/* Basic Information */}
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                    placeholder="Enter stream title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                    placeholder="Describe your stream"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_at"
                    value={formData.scheduled_at}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Update Thumbnail
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to keep current thumbnail. Max size: 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Stream Settings */}
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Stream Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.chat_enabled"
                    checked={formData.settings.chat_enabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable live chat
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.reactions_enabled"
                    checked={formData.settings.reactions_enabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable reactions
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.product_showcase_enabled"
                    checked={formData.settings.product_showcase_enabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable product showcase
                  </label>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Featured Products</h2>
                <Button
                  type="button"
                  onClick={openProductModal}
                  disabled={!formData.settings.product_showcase_enabled}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Update Products
                </Button>
              </div>

              <ProductSelectModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSelect={handleProductSelect}
                selectedProducts={selectedProducts}
              />

              {selectedProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {selectedProducts.map(product => (
                    <Card key={product.id} className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/100'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Rp {parseInt(product.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="fas fa-box text-4xl text-gray-300 mb-3"></i>
                  <p className="text-sm text-gray-500">
                    No products selected. Click "Update Products" to feature products in your stream.
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="p-6 flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
