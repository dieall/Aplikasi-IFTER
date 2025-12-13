<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserMfa;
use App\Models\AuditLog;
use App\Models\AnomalyLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class MfaController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        if (! $user || ! $user->mfa_enabled) {
            return redirect()->route('dashboard');
        }

        $lastCode = $request->session()->get('mfa_demo_code');

        return view('auth.mfa-challenge', [
            'codeHint' => $lastCode,
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $record = UserMfa::where('user_id', $user->id)->latest()->first();

        if (! $record || $record->expires_at->isPast() || ! Hash::check($request->string('code'), $record->otp_code)) {
            AnomalyLog::create([
                'type' => 'mfa_failed',
                'severity' => 'medium',
                'description' => 'Kode MFA tidak valid atau kedaluwarsa',
                'context' => [
                    'user_id' => $user->id,
                    'ip' => $request->ip(),
                ],
            ]);

            return back()->withErrors(['code' => 'Kode tidak valid atau sudah kedaluwarsa']);
        }

        $record->update(['used_at' => now()]);

        $request->session()->put('mfa_verified', true);
        $request->session()->forget('mfa_demo_code');

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'mfa.verified',
            'description' => 'MFA berhasil diverifikasi',
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->intended(route('dashboard'));
    }

    public function toggle(Request $request)
    {
        $user = $request->user();
        $user->mfa_enabled = ! $user->mfa_enabled;
        $user->save();

        if ($user->mfa_enabled) {
            $code = $this->issueCode($user);
            $request->session()->put('mfa_verified', false);
            $request->session()->put('mfa_demo_code', $code); // hanya untuk demo lokal

            return redirect()->route('mfa.challenge')->with('status', 'MFA diaktifkan. Masukkan OTP untuk verifikasi.');
        }

        $request->session()->put('mfa_verified', true);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'mfa.disabled',
            'description' => 'MFA dinonaktifkan',
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('status', 'MFA dinonaktifkan.');
    }

    protected function issueCode($user): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        UserMfa::create([
            'user_id' => $user->id,
            'otp_code' => Hash::make($code),
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'mfa.issued',
            'description' => 'Kode MFA dikeluarkan',
        ]);

        return $code;
    }
}
