'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { useToast, ToastHook } from '@/lib/hooks';
import StreamPlayer from '@/components/live-stream/stream-player';
import ProductShowcase from '@/components/live-stream/product-showcase';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
}

export default function StartLiveStreamPage() {
  const params = useParams();
  const router = useRouter();
  const toast: ToastHook = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showPreChecks, setShowPreChecks] = useState(true);
  const [checks, setChecks] = useState({
    camera: false,
    microphone: false,
    internet: false,
    products: false,
  });

  useEffect(() => {
    fetchStreamDetails();
    runPreflightChecks();
  }, [params.id]);

  const fetchStreamDetails = async () => {
    try {
      const response = await fetch(`/api/live-streams/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stream details');
      }

      if (data.status === 'live') {
        router.push(`/dashboard/live-stream/${params.id}`);
        return;
      }

      if (data.status === 'ended') {
        throw new Error('This stream has already ended');
      }

      setStream(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const runPreflightChecks = async () => {
    // Check camera access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setChecks(prev => ({ ...prev, camera: true }));
    } catch {
      setChecks(prev => ({ ...prev, camera: false }));
    }

    // Check microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setChecks(prev => ({ ...prev, microphone: true }));
    } catch {
      setChecks(prev => ({ ...prev, microphone: false }));
    }

    // Check internet connection
    interface NetworkInformation extends EventTarget {
      readonly downlink: number;
      readonly effectiveType: string;
      readonly rtt: number;
      readonly saveData: boolean;
      readonly type: string;
    }

    interface NavigatorWithConnection extends Navigator {
      connection?: NetworkInformation;
    }

    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection;
    
    // Consider connection good if:
    // 1. Network Information API not available (assume good connection)
    // 2. Downlink >= 1Mbps and RTT <= 100ms
    const isGoodConnection = !connection || 
      (connection.downlink >= 1 && connection.rtt <= 100);
    
    setChecks(prev => ({ ...prev, internet: isGoodConnection }));
  };

  const startStream = async () => {
    if (!stream) return;

    setIsStarting(true);
    try {
      const response = await fetch(`/api/live-streams/${stream.id}/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start live stream');
      }

      router.push(`/dashboard/live-stream/${stream.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.addToast(errorMessage, 'error');
      setIsStarting(false);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorMessage message={error} />;
  if (!stream) return null;

  const allChecksPass = Object.values(checks).every(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Start Live Stream
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Complete the pre-stream checklist before going live
            </p>
          </div>

          {showPreChecks ? (
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Pre-Stream Checklist
              </h2>
              <div className="space-y-4">
                {/* Camera Check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="ri-camera-line text-xl mr-3"></i>
                    <div>
                      <p className="font-medium">Camera Access</p>
                      <p className="text-sm text-gray-500">
                        Check if your camera is working
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center ${
                    checks.camera ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <i className={`ri-${checks.camera ? 'check' : 'close'}-circle-fill text-xl`}></i>
                  </div>
                </div>

                {/* Microphone Check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="ri-mic-line text-xl mr-3"></i>
                    <div>
                      <p className="font-medium">Microphone Access</p>
                      <p className="text-sm text-gray-500">
                        Check if your microphone is working
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center ${
                    checks.microphone ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <i className={`ri-${checks.microphone ? 'check' : 'close'}-circle-fill text-xl`}></i>
                  </div>
                </div>

                {/* Internet Check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="ri-wifi-line text-xl mr-3"></i>
                    <div>
                      <p className="font-medium">Internet Connection</p>
                      <p className="text-sm text-gray-500">
                        Check if your connection is stable
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center ${
                    checks.internet ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <i className={`ri-${checks.internet ? 'check' : 'close'}-circle-fill text-xl`}></i>
                  </div>
                </div>

                {/* Products Check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="ri-shopping-bag-line text-xl mr-3"></i>
                    <div>
                      <p className="font-medium">Products Ready</p>
                      <p className="text-sm text-gray-500">
                        {stream.products.length} products available for sale
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center ${
                    stream.products.length > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <i className={`ri-${stream.products.length > 0 ? 'check' : 'close'}-circle-fill text-xl`}></i>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowPreChecks(false)}
                  disabled={!allChecksPass}
                >
                  Continue to Preview
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Stream Preview */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-black">
                  <StreamPlayer
                    streamId={stream.id}
                    isHost={true}
                    onError={(error) => toast.addToast(error, 'error')}
                  />
                </div>
              </Card>

              {/* Stream Info */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {stream.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {stream.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="ri-calendar-line mr-1"></i>
                      Scheduled for {new Date(stream.scheduled_at).toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="ri-shopping-bag-line mr-1"></i>
                      {stream.products.length} products
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreChecks(true)}
                  >
                    Back to Checklist
                  </Button>
                  <Button
                    onClick={startStream}
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Starting Stream...
                      </>
                    ) : (
                      <>
                        <i className="ri-broadcast-line mr-2"></i>
                        Go Live
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
