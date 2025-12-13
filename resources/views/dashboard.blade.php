<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <div class="text-sm text-slate-300">Welcome back, {{ auth()->user()->name }}</div>
                <h2 class="font-semibold text-2xl text-white leading-tight">
                    Sistem Informasi Kesehatan
                </h2>
                <div class="flex gap-2 mt-2 text-xs">
                    <span class="pill">RBAC</span>
                    <span class="pill">Audit Log</span>
                    <span class="pill">MFA</span>
                    <span class="pill">Zero-Trust API</span>
                </div>
            </div>
            <div class="text-right">
                <div class="badge">Role aktif: {{ auth()->user()->roles()->pluck('name')->join(', ') ?: 'N/A' }}</div>
                <div class="text-xs text-slate-300 mt-1">
                    MFA: {{ auth()->user()->mfa_enabled ? 'Aktif' : 'Nonaktif' }}
                </div>
            </div>
        </div>
    </x-slot>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-semibold text-lg">Data Pasien</h3>
                    <p class="text-sm text-slate-300">CRUD + audit log + RBAC</p>
                </div>
                <a href="{{ route('patients.index') }}" class="btn-secondary">Buka</a>
            </div>
            <div class="mt-4 flex gap-3 text-sm text-slate-300">
                <span class="badge">Encrypted notes</span>
                <span class="badge">Audit trail</span>
            </div>
        </div>

        <div class="card">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-semibold text-lg">MFA / OTP</h3>
                    <p class="text-sm text-slate-300">Tambahan faktor saat login</p>
                </div>
                <form method="POST" action="{{ route('mfa.toggle') }}">
                    @csrf
                    <button class="{{ auth()->user()->mfa_enabled ? 'btn-secondary border-rose-400/50 text-rose-100' : 'btn-primary' }}">
                        {{ auth()->user()->mfa_enabled ? 'Matikan MFA' : 'Aktifkan MFA' }}
                    </button>
                </form>
            </div>
            @if (session('status'))
                <div class="text-sm text-emerald-300 mt-2">{{ session('status') }}</div>
            @endif
            <div class="text-xs text-slate-400 mt-2">Catatan: kode OTP ditampilkan hanya untuk demo lokal, jangan gunakan di produksi.</div>
        </div>

        <div class="card md:col-span-2">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-lg">Zero-Trust API (Sanctum + Device/IP binding)</h3>
                <span class="badge">API</span>
            </div>
            <ol class="text-sm text-slate-200 list-decimal ml-5 space-y-1">
                <li>Buat token: <code class="bg-white/10 px-2 py-1 rounded">POST /api/tokens/create</code> body <code>device_id</code> (& optional <code>device_name</code>). Simpan <code>plainTextToken</code>.</li>
                <li>Panggil API dengan header <code class="bg-white/10 px-2 py-1 rounded">Authorization: Bearer &lt;token&gt;</code> dan <code class="bg-white/10 px-2 py-1 rounded">X-Device-Id: &lt;device_id&gt;</code>. IP harus sama dengan saat token dibuat.</li>
                <li>Endpoint: <code class="bg-white/10 px-2 py-1 rounded">GET/POST/PUT/DELETE /api/patients</code> (dengan audit log).</li>
                <li>Cabut token aktif: <code class="bg-white/10 px-2 py-1 rounded">POST /api/tokens/revoke</code>.</li>
            </ol>
        </div>
    </div>
</x-app-layout>
