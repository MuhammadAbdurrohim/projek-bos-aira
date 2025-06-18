<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends BaseController
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        return $this->handleValidation($validator, function () use ($request) {
            return $this->handleTry(function () use ($request) {
                // Upload avatar if provided
                $avatarPath = null;
                if ($request->hasFile('avatar')) {
                    $avatar = $request->file('avatar');
                    $avatarName = time() . '.' . $avatar->getClientOriginalExtension();
                    $avatar->storeAs('public/avatars', $avatarName);
                    $avatarPath = 'avatars/' . $avatarName;
                }

                // Create user
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'phone' => $request->phone,
                    'whatsapp' => $request->whatsapp,
                    'avatar' => $avatarPath,
                ]);

                // Create token
                $token = $user->createToken('auth_token')->plainTextToken;

                return $this->successResponse([
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ], 'Registrasi berhasil', 201);
            }, 'Terjadi kesalahan saat registrasi');
        });
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        return $this->handleValidation($validator, function () use ($request) {
            return $this->handleTry(function () use ($request) {
                $user = User::where('email', $request->email)->first();

                if (!$user || !Hash::check($request->password, $user->password)) {
                    return $this->errorResponse('Email atau password salah', 401);
                }

                $token = $user->createToken('auth_token')->plainTextToken;

                return $this->successResponse([
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ], 'Login berhasil');
            }, 'Terjadi kesalahan saat login');
        });
    }

    public function logout(Request $request)
    {
        return $this->handleTry(function () use ($request) {
            $request->user()->currentAccessToken()->delete();
            return $this->messageResponse('Logout berhasil');
        }, 'Terjadi kesalahan saat logout');
    }

    public function profile(Request $request)
    {
        return $this->handleTry(function () use ($request) {
            return $this->successResponse($request->user(), 'Profile berhasil diambil');
        }, 'Terjadi kesalahan saat mengambil profile');
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        return $this->handleValidation($validator, function () use ($request) {
            return $this->handleTry(function () use ($request) {
                $user = $request->user();
                
                // Upload new avatar if provided
                if ($request->hasFile('avatar')) {
                    // Delete old avatar
                    if ($user->avatar) {
                        Storage::delete('public/' . $user->avatar);
                    }

                    $avatar = $request->file('avatar');
                    $avatarName = time() . '.' . $avatar->getClientOriginalExtension();
                    $avatar->storeAs('public/avatars', $avatarName);
                    $user->avatar = 'avatars/' . $avatarName;
                }

                $user->name = $request->name;
                $user->phone = $request->phone;
                $user->whatsapp = $request->whatsapp;
                $user->save();

                return $this->successResponse($user, 'Profile berhasil diupdate');
            }, 'Terjadi kesalahan saat mengupdate profile');
        });
    }

    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        return $this->handleValidation($validator, function () use ($request) {
            return $this->handleTry(function () use ($request) {
                $user = $request->user();

                if (!Hash::check($request->current_password, $user->password)) {
                    return $this->errorResponse('Password saat ini salah', 401);
                }

                $user->password = Hash::make($request->password);
                $user->save();

                return $this->messageResponse('Password berhasil diupdate');
            }, 'Terjadi kesalahan saat mengupdate password');
        });
    }
}
