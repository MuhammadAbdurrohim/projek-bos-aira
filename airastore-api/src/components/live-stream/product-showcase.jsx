import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingOverlay } from '../ui/loading';
import { useToast } from '../../lib/hooks';

export default function ProductShowcase({ streamId, onProductSelect }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
  }, [streamId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/live-streams/${streamId}/products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      setProducts(data.data || []);
      
      // Set first product as highlighted if exists
      if (data.data && data.data.length > 0) {
        setHighlightedProduct(data.data[0]);
      }
    } catch (err) {
      toast.addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHighlight = (product) => {
    setHighlightedProduct(product);
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Highlighted Product */}
      {highlightedProduct && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={highlightedProduct.image_url || 'https://via.placeholder.com/150'}
                alt={highlightedProduct.name}
                className="w-32 h-32 object-cover rounded-lg shadow-sm"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {highlightedProduct.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {highlightedProduct.description}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-gray-900">
                    Rp {parseInt(highlightedProduct.price).toLocaleString()}
                  </span>
                  <Button
                    onClick={() => window.open(`/produk/${highlightedProduct.id}`, '_blank')}
                    className="mt-2"
                  >
                    <i className="fas fa-shopping-cart mr-2"></i>
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          All Products
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                highlightedProduct?.id === product.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleHighlight(product)}
            >
              <div className="p-2">
                <img
                  src={product.image_url || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md"
                />
                <div className="mt-2">
                  <h5 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h5>
                  <div className="flex items-baseline mt-1">
                    <span className="text-sm font-semibold text-gray-900">
                      Rp {parseInt(product.price).toLocaleString()}
                    </span>
                    {product.discount > 0 && (
                      <span className="ml-2 text-xs text-red-500 line-through">
                        Rp {parseInt(product.original_price).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-box-open text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500">No products available</p>
          </div>
        )}
      </div>
    </div>
  );
}
