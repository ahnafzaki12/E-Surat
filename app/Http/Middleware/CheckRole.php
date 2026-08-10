<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Middleware ini memeriksa apakah user yang login memiliki role
     * yang sesuai dengan parameter yang diberikan.
     *
     * Penggunaan di routes:
     *   ->middleware('role:sekretaris')
     *   ->middleware('role:approver')
     *   ->middleware('role:admin')
     *   ->middleware('role:sekretaris,admin')  // multi-role
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Pastikan user sudah login dan memiliki relasi role
        if (! $user || ! $user->role) {
            abort(403, 'Akses ditolak: role tidak ditemukan.');
        }

        $userRole = $user->role->name;

        if (! in_array($userRole, $roles)) {
            abort(403, 'Akses ditolak: Anda tidak memiliki izin untuk halaman ini.');
        }

        return $next($request);
    }
}
