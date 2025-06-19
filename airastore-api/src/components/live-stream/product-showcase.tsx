'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  image_url: string;
  stock: number;
  order: number;
  is_highlighted: boolean;
}

interface ProductShowcaseProps {
  products: Product[];
  isHost?: boolean;
  onHighlight?: (productId: number) => void;
  onReorder?: (productId: number, newOrder: number) => void;
}

export function ProductShowcase({ 
  products, 
  isHost = false,
  onHighlight,
  onReorder 
}: ProductShowcaseProps) {
  const [reordering, setReordering] = useState(false);

  const handleHighlight = async (productId: number) => {
    if (onHighlight) {
      onHighlight(productId);
    }
  };

  const moveProduct = (productId: number, direction: 'up' | 'down') => {
    if (!onReorder) return;

    const currentIndex = products.findIndex(p => p.id === productId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= products.length) return;

    onReorder(productId, products[newIndex].order);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Featured Products</CardTitle>
        {isHost && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReordering(!reordering)}
          >
            {reordering ? 'Done' : 'Reorder'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`p-4 rounded-lg border transition-all ${
                product.is_highlighted ? 'border-black bg-gray-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  {product.discount_price && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl">
                      Sale
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{product.name}</h4>
                  <div className="mt-1 flex items-baseline gap-2">
                    {product.discount_price ? (
                      <>
                        <span className="text-red-500 font-medium">
                          Rp {product.discount_price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          Rp {product.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium">
                        Rp {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 truncate">
                    {product.description}
                  </p>
                  {product.stock < 10 && (
                    <p className="mt-1 text-sm text-red-500">
                      Only {product.stock} left!
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {isHost && (
                    <>
                      {reordering ? (
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveProduct(product.id, 'up')}
                            disabled={products[0].id === product.id}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveProduct(product.id, 'down')}
                            disabled={products[products.length - 1].id === product.id}
                          >
                            ↓
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant={product.is_highlighted ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleHighlight(product.id)}
                        >
                          {product.is_highlighted ? 'Featured' : 'Feature'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
