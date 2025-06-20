<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZegoTokenController extends Controller
{
    use ApiResponse;

    private function generateToken04($appId, $userId, $secret, $effectiveTimeInSeconds, $payload = '')
    {
        $currentTime = time();
        $tokenInfo = [
            'app_id' => $appId,
            'user_id' => $userId,
            'nonce' => mt_rand(),
            'ctime' => $currentTime,
            'expire' => $currentTime + $effectiveTimeInSeconds,
            'payload' => $payload
        ];

        // Convert token info to string
        $originalString = implode('', array_map(function ($value) {
            return (string)$value;
        }, $tokenInfo));

        // Calculate signature
        $signature = hash_hmac('sha256', $originalString, $secret, true);
        $encodedSignature = base64_encode($signature);

        // Combine token info
        $tokenInfo['signature'] = $encodedSignature;
        
        // Encode final token
        return base64_encode(json_encode($tokenInfo));
    }

    public function generateToken(Request $request)
    {
        try {
            $request->validate([
                'room_id' => 'required|string',
                'role' => 'required|in:host,audience'
            ]);

            $appId = (int)env('REACT_PUBLIC_ZEGO_APP_ID');
            $serverSecret = env('REACT_PUBLIC_ZEGO_SERVER_SECRET');
            
            if (!$appId || !$serverSecret) {
                throw new \Exception('ZEGO credentials not configured');
            }

            $userId = (string)auth()->id();
            $effectiveTimeInSeconds = 3600; // Token valid for 1 hour
            
            // Create payload with room_id and role
            $payload = json_encode([
                'room_id' => $request->room_id,
                'role' => $request->role,
                'user_name' => auth()->user()->name
            ]);

            $token = $this->generateToken04(
                $appId,
                $userId,
                $serverSecret,
                $effectiveTimeInSeconds,
                $payload
            );

            return $this->successResponse([
                'token' => $token,
                'user_id' => $userId,
                'app_id' => $appId,
                'room_id' => $request->room_id,
                'role' => $request->role,
                'expires_at' => time() + $effectiveTimeInSeconds
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating ZEGO token: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to generate streaming token: ' . $e->getMessage(),
                500
            );
        }
    }
}
