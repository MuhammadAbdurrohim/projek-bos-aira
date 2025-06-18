<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Api\BaseController;
use Closure;
use Illuminate\Http\Request;

class AdminMiddleware extends BaseController
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        return $this->handleUnauthorized(
            $request->user() && $request->user()->is_admin,
            fn() => $next($request),
            'Akses ditolak. Anda tidak memiliki hak akses admin.'
        );
    }
}
