<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;
use App\Models\UserMfa;
use App\Models\AuditLog;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'login.success',
            'description' => 'User login berhasil',
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($user->mfa_enabled) {
            $code = $this->issueMfaCode($user);
            $request->session()->put('mfa_verified', false);
            $request->session()->put('mfa_demo_code', $code); // demo lokal

            return redirect()->route('mfa.challenge');
        }

        $request->session()->put('mfa_verified', true);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'logout',
            'description' => 'User logout',
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect('/');
    }

    protected function issueMfaCode($user): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        UserMfa::create([
            'user_id' => $user->id,
            'otp_code' => Hash::make($code),
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        return $code;
    }
}
