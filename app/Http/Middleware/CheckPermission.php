<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user || !$user->role) {
            abort(403, 'Unauthorized action.');
        }

        // admin bypasses permission checks
        if ($user->role->name === 'admin') {
            return $next($request);
        }

        $userPermissions = $user->role->permissions->pluck('key')->toArray();

        if (!in_array($permission, $userPermissions)) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Unauthorized action.'], 403);
            }
            
            // Fallback safe route (if back() doesn't exist or we hit a redirect loop)
            $fallback = route('dashboard');
            if (!in_array('dashboard.view', $userPermissions)) {
                $fallback = url('/');
            }
            
            $previous = url()->previous($fallback);
            if ($previous === $request->url()) {
                $previous = $fallback;
            }
            
            return redirect($previous)->with('error', 'unauthorized');
        }

        return $next($request);
    }
}
