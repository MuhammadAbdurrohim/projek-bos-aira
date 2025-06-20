import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingOverlay } from '../ui/loading';
import { useToast } from '../../lib/hooks';
import { api } from '../../lib/api';

export default function ProductSelectModal({ isOpen, onClose, onSelect, selectedProducts = [] }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set(selectedProducts.map(p => p.id)));

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: {
          status: 'active',
          search: search || undefined,
          per_page: 50
        }
      });
      setProducts(response.data.data || []);
    } catch (err) {
      toast.addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setLoading(true);
    fetchProducts();
  };

  const toggleProduct = (product) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(product.id)) {
      newSelectedIds.delete(product.id);
    } else {
      newSelectedIds.add(product.id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSave = () => {
    const selectedProductsList = products.filter(p => selectedIds.has(p.id));
    onSelect(selectedProductsList);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="relative w-full max-w-4xl bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Select Products
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Product List */}
          <div className="p-4 h-[60vh] overflow-y-auto">
            {loading ? (
              <LoadingOverlay />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product)}
                    className={`
                      cursor-pointer rounded-lg border-2 transition-all
                      ${selectedIds.has(product.id)
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="p-3">
                      <div className="relative aspect-square mb-3">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/150'}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {selectedIds.has(product.id) && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                              <i className="fas fa-check text-white text-sm"></i>
                            </div>
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Rp {parseInt(product.price).toLocaleString()}
                      </p>
                      {product.stock < 10 && (
                        <p className="mt-1 text-xs text-orange-600">
                          Only {product.stock} left
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-box text-2xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or add new products first.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {selectedIds.size} products selected
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={selectedIds.size === 0}
              >
                Save Selection
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
