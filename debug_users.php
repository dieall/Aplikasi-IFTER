<?php

// Bootstrap Laravel for a small debug script
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Patient;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

$emails = ['admin@example.com', 'doctor@example.com', 'nurse@example.com', 'clerk@example.com'];
$result = [];
foreach ($emails as $email) {
    $user = User::where('email', $email)->first();
    if (! $user) {
        $result[$email] = ['exists' => false];
        continue;
    }

    $passwordCheck = Hash::check('Password123!', $user->password);

    $result[$email] = [
        'exists' => true,
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'email_verified_at' => $user->email_verified_at?->toDateTimeString(),
        'mfa_enabled' => $user->mfa_enabled,
        'roles' => $user->roles->pluck('name')->toArray(),
        'password_matches_Password123!' => $passwordCheck,
    ];
}

$patients = Patient::whereIn('mrn', ['MRN001', 'MRN002'])->get()->map(function ($p) {
    return [
        'id' => $p->id,
        'mrn' => $p->mrn,
        'name' => $p->name,
        'dob' => $p->dob?->toDateString(),
        'created_by' => $p->created_by,
    ];
});

$data = ['users' => $result, 'patients' => $patients];

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

// Quick programmatic auth test
$authAttempt = Auth::attempt(['email' => 'admin@example.com', 'password' => 'Password123!']);
echo PHP_EOL . "auth_attempt_admin: " . ($authAttempt ? 'SUCCESS' : 'FAIL') . PHP_EOL;
// also check for wrong password
$authAttemptWrong = Auth::attempt(['email' => 'admin@example.com', 'password' => 'wrongpassword']);
echo "auth_attempt_admin_wrong: " . ($authAttemptWrong ? 'SUCCESS' : 'FAIL') . PHP_EOL;
