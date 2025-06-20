import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { useToast, ToastHook } from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  featured?: boolean;
}

interface ProductShowcaseProps {
  streamId: string;
  isHost?: boolean;
  onProductSelect?: (productId: string) => void;
}

export default function ProductShowcase({ streamId, isHost = false, onProductSelect }: ProductShowcaseProps) {
  const toast: ToastHook = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [showAll, setShowAll] = useState(false);

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

      setProducts(data);
      const featured = data.find((p: Product) => p.featured);
      if (featured) {
        setFeaturedProduct(featured);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/live-streams/${streamId}/products/${productId}/feature`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to feature product');
      }

      const updatedProducts = products.map(p => ({
        ...p,
        featured: p.id === productId,
      }));

      setProducts(updatedProducts);
      setFeaturedProduct(products.find(p => p.id === productId) || null);
      toast.addToast('Product featured successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.addToast(errorMessage, 'error');
    }
  };

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Featured Product */}
      {featuredProduct && (
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={featuredProduct.image}
              alt={featuredProduct.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <i className="ri-star-fill mr-1"></i>
                Featured
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {featuredProduct.name}
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(featuredProduct.price)}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {featuredProduct.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {featuredProduct.stock} in stock
              </p>
              <Button
                onClick={() => onProductSelect?.(featuredProduct.id)}
                disabled={featuredProduct.stock === 0}
              >
                {featuredProduct.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Product Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {showAll ? 'All Products' : 'Available Products'}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'Show All'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(showAll ? products : products.slice(0, 4)).map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-medium text-gray-900 truncate">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(product.price)}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  {isHost ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeatureProduct(product.id)}
                      disabled={product.featured}
                    >
                      {product.featured ? 'Featured' : 'Feature'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onProductSelect?.(product.id)}
                      disabled={product.stock === 0}
                    >
                      Buy Now
                    </Button>
                  )}
                  <span className="text-xs text-gray-500">
                    {product.stock} left
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
