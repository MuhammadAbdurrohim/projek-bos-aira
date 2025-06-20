import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { useToast } from '@/components/ui/toast';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PaymentConfirmationsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmations, setConfirmations] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchConfirmations();
  }, []);

  const fetchConfirmations = async () => {
    try {
      const response = await fetch('/api/payment-confirmations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment confirmations');
      }

      setConfirmations(data);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (confirmationId, newStatus) => {
    try {
      const response = await fetch(`/api/payment-confirmations/${confirmationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update confirmation status');
      }

      // Update confirmation in state
      setConfirmations(confirmations.map(confirmation => 
        confirmation.id === confirmationId ? { ...confirmation, status: newStatus } : confirmation
      ));

      addToast('Status updated successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredConfirmations = confirmations.filter(confirmation => {
    const matchesStatus = selectedStatus === 'all' || confirmation.status === selectedStatus;
    const matchesSearch = 
      confirmation.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      confirmation.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = (!dateRange.start || new Date(confirmation.created_at) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(confirmation.created_at) <= new Date(dateRange.end));
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Payment Confirmations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and verify payment confirmations from customers
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by order number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      {/* Confirmations List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConfirmations.map((confirmation) => (
                <tr key={confirmation.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      #{confirmation.order_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {confirmation.customer_name}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(confirmation.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {confirmation.bank_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {confirmation.account_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {confirmation.account_holder}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(confirmation.payment_date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(confirmation.created_at, true)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(confirmation.status)
                    }`}>
                      {confirmation.status.charAt(0).toUpperCase() + confirmation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {confirmation.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(confirmation.id, 'verified')}
                            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                          >
                            <i className="ri-checkbox-circle-line mr-1"></i>
                            Verify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(confirmation.id, 'rejected')}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <i className="ri-close-circle-line mr-1"></i>
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(confirmation.proof_image, '_blank')}
                      >
                        <i className="ri-image-line mr-1"></i>
                        View Proof
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredConfirmations.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No payment confirmations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
