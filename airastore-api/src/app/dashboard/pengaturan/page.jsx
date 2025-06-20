import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { useToast } from '@/components/ui/toast';
import { rules, validateForm } from '@/lib/form';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    store: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      currency: 'IDR',
      logo: null,
    },
    payment: {
      bank_name: '',
      account_number: '',
      account_holder: '',
    },
    notification: {
      email_notifications: true,
      order_notifications: true,
      stock_alerts: true,
      stock_threshold: '10',
    },
    appearance: {
      theme: 'light',
      primary_color: '#000000',
      accent_color: '#ffffff',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch settings');
      }

      setSettings(data);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        addToast('Please upload a valid image file (JPEG, PNG, or GIF)', 'error');
        return;
      }

      if (file.size > maxSize) {
        addToast('Image size should be less than 2MB', 'error');
        return;
      }

      setSettings(prev => ({
        ...prev,
        store: {
          ...prev.store,
          logo: file,
        },
      }));
    }
  };

  const handleSubmit = async (section) => {
    setSaving(true);

    try {
      const formData = new FormData();
      
      // Append section data
      Object.entries(settings[section]).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(`${section}[${key}]`, value);
        }
      });

      const response = await fetch(`/api/settings/${section}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }

      addToast('Settings saved successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your store settings and preferences
        </p>
      </div>

      {/* Store Settings */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Store Information</h2>
          <p className="mt-1 text-sm text-gray-500">
            Basic information about your store
          </p>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Store Logo
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                {settings.store.logo ? (
                  <img
                    src={typeof settings.store.logo === 'string' ? settings.store.logo : URL.createObjectURL(settings.store.logo)}
                    alt="Store logo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <i className="ri-store-2-line text-4xl text-gray-400"></i>
                )}
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload').click()}
                >
                  Change Logo
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF up to 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">
              Store Name
            </label>
            <input
              type="text"
              id="store-name"
              value={settings.store.name}
              onChange={(e) => handleChange('store', 'name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={settings.store.description}
              onChange={(e) => handleChange('store', 'description', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={settings.store.email}
                onChange={(e) => handleChange('store', 'email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={settings.store.phone}
                onChange={(e) => handleChange('store', 'phone', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              rows={3}
              value={settings.store.address}
              onChange={(e) => handleChange('store', 'address', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSubmit('store')}
              loading={saving}
            >
              Save Store Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Settings */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure your payment settings
          </p>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bank-name" className="block text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                id="bank-name"
                value={settings.payment.bank_name}
                onChange={(e) => handleChange('payment', 'bank_name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="account-number" className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                id="account-number"
                value={settings.payment.account_number}
                onChange={(e) => handleChange('payment', 'account_number', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="account-holder" className="block text-sm font-medium text-gray-700">
              Account Holder Name
            </label>
            <input
              type="text"
              id="account-holder"
              value={settings.payment.account_holder}
              onChange={(e) => handleChange('payment', 'account_holder', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSubmit('payment')}
              loading={saving}
            >
              Save Payment Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure your notification preferences
          </p>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={settings.notification.email_notifications}
                  onChange={(e) => handleChange('notification', 'email_notifications', e.target.checked)}
                  className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Order Notifications</h3>
                <p className="text-sm text-gray-500">Get notified about new orders</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="order-notifications"
                  checked={settings.notification.order_notifications}
                  onChange={(e) => handleChange('notification', 'order_notifications', e.target.checked)}
                  className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Stock Alerts</h3>
                <p className="text-sm text-gray-500">Get notified about low stock</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="stock-alerts"
                  checked={settings.notification.stock_alerts}
                  onChange={(e) => handleChange('notification', 'stock_alerts', e.target.checked)}
                  className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label htmlFor="stock-threshold" className="block text-sm font-medium text-gray-700">
                Stock Alert Threshold
              </label>
              <input
                type="number"
                id="stock-threshold"
                value={settings.notification.stock_threshold}
                onChange={(e) => handleChange('notification', 'stock_threshold', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Get notified when product stock falls below this number
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSubmit('notification')}
              loading={saving}
            >
              Save Notification Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Appearance</h2>
          <p className="mt-1 text-sm text-gray-500">
            Customize your store's appearance
          </p>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select
              id="theme"
              value={settings.appearance.theme}
              onChange={(e) => handleChange('appearance', 'theme', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="color"
                  id="primary-color"
                  value={settings.appearance.primary_color}
                  onChange={(e) => handleChange('appearance', 'primary_color', e.target.value)}
                  className="h-8 w-8 rounded-md border border-gray-300"
                />
                <input
                  type="text"
                  value={settings.appearance.primary_color}
                  onChange={(e) => handleChange('appearance', 'primary_color', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="accent-color" className="block text-sm font-medium text-gray-700">
                Accent Color
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="color"
                  id="accent-color"
                  value={settings.appearance.accent_color}
                  onChange={(e) => handleChange('appearance', 'accent_color', e.target.value)}
                  className="h-8 w-8 rounded-md border border-gray-300"
                />
                <input
                  type="text"
                  value={settings.appearance.accent_color}
                  onChange={(e) => handleChange('appearance', 'accent_color', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSubmit('appearance')}
              loading={saving}
            >
              Save Appearance Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
