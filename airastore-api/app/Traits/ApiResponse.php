<?php

namespace App\Traits;

trait ApiResponse
{
    /**
     * Success response with data
     */
    protected function successResponse($data, string $message = '', int $code = 200)
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Success response without data
     */
    protected function messageResponse(string $message, int $code = 200)
    {
        return response()->json([
            'status' => 'success',
            'message' => $message
        ], $code);
    }

    /**
     * Error response
     */
    protected function errorResponse(string $message, int $code = 400, $errors = null)
    {
        $response = [
            'status' => 'error',
            'message' => $message
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Validation error response
     */
    protected function validationErrorResponse($validator, int $code = 422)
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Validasi gagal',
            'errors' => $validator->errors()
        ], $code);
    }

    /**
     * Not found response
     */
    protected function notFoundResponse(string $message = 'Data tidak ditemukan')
    {
        return response()->json([
            'status' => 'error',
            'message' => $message
        ], 404);
    }

    /**
     * Unauthorized response
     */
    protected function unauthorizedResponse(string $message = 'Tidak memiliki akses')
    {
        return response()->json([
            'status' => 'error',
            'message' => $message
        ], 403);
    }
}
