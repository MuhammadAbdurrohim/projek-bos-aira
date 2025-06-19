'use client';

import { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface StreamPlayerProps {
  roomId: string;
  userId: string;
  userName: string;
  role: 'Host' | 'Audience';
  token: string;
}

export function StreamPlayer({ roomId, userId, userName, role, token }: StreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initializeStream = async () => {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0'),
        process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '',
        roomId,
        userId,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      if (role === 'Host') {
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: {
              role: ZegoUIKitPrebuilt.Host,
            },
          },
          showPreJoinView: false,
        });
      } else {
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: {
              role: ZegoUIKitPrebuilt.Audience,
            },
          },
          showPreJoinView: false,
        });
      }
    };

    initializeStream();
  }, [roomId, userId, userName, role, token]);

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
