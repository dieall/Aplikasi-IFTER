<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Models\AnomalyLog;

class TokenController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'device_id' => ['required', 'string', 'max:255'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $token = $user->createToken(
            $data['device_name'] ?? 'device-token',
            [
                'device:'.$data['device_id'],
                'ip:'.$request->ip(),
            ]
        );

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'api.token.created',
            'description' => 'Token API dibuat',
            'metadata' => $data,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'token' => $token->plainTextToken,
            'abilities' => $token->accessToken->abilities,
        ]);
    }

    public function revoke(Request $request)
    {
        $token = $request->user()->currentAccessToken();
        if ($token) {
            $token->delete();

            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'api.token.revoked',
                'description' => 'Token API dicabut',
                'ip' => $request->ip(),
            ]);

            return response()->json(['message' => 'Token dicabut']);
        }

        AnomalyLog::create([
            'type' => 'api.token.missing',
            'severity' => 'low',
            'description' => 'Percobaan mencabut token tanpa token aktif',
            'context' => ['ip' => $request->ip()],
        ]);

        return response()->json(['message' => 'Tidak ada token aktif'], 400);
    }
}
