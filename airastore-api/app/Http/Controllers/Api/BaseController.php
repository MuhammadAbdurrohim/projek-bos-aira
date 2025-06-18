<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

class BaseController extends Controller
{
    use ApiResponse;

    /**
     * Handle try-catch blocks with a standard error response
     */
    protected function handleTry(callable $callback, string $errorMessage = 'Terjadi kesalahan')
    {
        try {
            return $callback();
        } catch (\Exception $e) {
            return $this->errorResponse(
                $errorMessage, 
                500, 
                config('app.debug') ? $e->getMessage() : null
            );
        }
    }

    /**
     * Handle validation with standard response
     */
    protected function handleValidation($validator, callable $callback)
    {
        if ($validator->fails()) {
            return $this->validationErrorResponse($validator);
        }

        return $callback();
    }

    /**
     * Handle model not found with standard response
     */
    protected function handleNotFound($model, callable $callback, string $message = 'Data tidak ditemukan')
    {
        if (!$model) {
            return $this->notFoundResponse($message);
        }

        return $callback();
    }

    /**
     * Handle unauthorized access with standard response
     */
    protected function handleUnauthorized($condition, callable $callback, string $message = 'Tidak memiliki akses')
    {
        if (!$condition) {
            return $this->unauthorizedResponse($message);
        }

        return $callback();
    }
}
