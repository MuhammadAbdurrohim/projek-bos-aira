import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/loading';
import { useToast } from '../../lib/hooks';
import { api } from '../../lib/api';

export default function LiveStreamListPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('viewers');

  useEffect(() => {
    fetchStreams();
    fetchCategories();
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await api.get('/live-streams', {
        params: {
          status: 'live',
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortBy
        }
      });
      setStreams(response.data.data || []);
    } catch (err) {
      toast.addToast('Failed to load live streams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setLoading(true);
    fetchStreams();
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setLoading(true);
    fetchStreams();
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Streams</h1>
          <p className="mt-2 text-gray-600">
            Watch live shopping streams from your favorite sellers
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="block w-full sm:w-auto px-4 py-2 rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
          >
            <option value="viewers">Most Viewers</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Stream Grid */}
        {streams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {streams.map((stream) => (
              <Link
                key={stream.id}
                href={`/live/${stream.id}`}
                className="block group"
              >
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  {/* Thumbnail */}
                  <div className="relative aspect-video">
                    <img
                      src={stream.thumbnail || 'https://via.placeholder.com/400x225'}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-black/70 text-white">
                        <i className="fas fa-eye mr-1"></i>
                        {stream.viewer_count || 0}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-shrink-0">
                        {stream.user?.avatar ? (
                          <img
                            src={stream.user.avatar}
                            alt={stream.user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <i className="fas fa-user text-gray-400"></i>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {stream.user?.name}
                        </p>
                        {stream.category && (
                          <p className="text-xs text-gray-500 truncate">
                            {stream.category.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-medium text-gray-900 truncate group-hover:text-gray-600">
                      {stream.title}
                    </h3>

                    {stream.featured_products?.length > 0 && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <i className="fas fa-tag mr-1"></i>
                        {stream.featured_products.length} products
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fas fa-video text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Live Streams
            </h3>
            <p className="text-gray-500">
              There are no live streams at the moment.
              <br />
              Check back later or start your own stream!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
