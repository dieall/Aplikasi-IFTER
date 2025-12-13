<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AnomalyLog;

class ZeroTrustContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->user()?->currentAccessToken();
        $deviceId = $request->header('X-Device-Id');
        $ip = $request->ip();

        if (! $token || ! $deviceId) {
            abort(Response::HTTP_UNAUTHORIZED, 'Token atau device ID tidak valid');
        }

        $abilities = collect($token->abilities);
        $deviceMatch = $abilities->first(fn ($a) => str_starts_with($a, 'device:')) === 'device:'.$deviceId;
        $ipMatch = $abilities->first(fn ($a) => str_starts_with($a, 'ip:')) === 'ip:'.$ip;

        if (! $deviceMatch || ! $ipMatch) {
            AnomalyLog::create([
                'type' => 'zero_trust_block',
                'severity' => 'high',
                'description' => 'Konteks device/IP tidak cocok',
                'context' => [
                    'expected' => $abilities,
                    'device_id' => $deviceId,
                    'ip' => $ip,
                ],
            ]);

            abort(Response::HTTP_FORBIDDEN, 'Konteks akses tidak valid');
        }

        return $next($request);
    }
}
