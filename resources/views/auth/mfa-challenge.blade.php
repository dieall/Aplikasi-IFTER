<x-guest-layout>
    <div class="text-center mb-4">
        <h2 class="text-xl font-semibold text-white">Verifikasi MFA</h2>
        <p class="text-sm text-slate-300">Masukkan kode OTP untuk menyelesaikan login.</p>
    </div>

    @if (session('status'))
        <div class="mb-4 font-medium text-sm text-emerald-300">
            {{ session('status') }}
        </div>
    @endif

    @if ($codeHint)
        <div class="mb-4 text-sm text-amber-300">
            Kode demo (jangan gunakan di produksi): <strong>{{ $codeHint }}</strong>
        </div>
    @endif

    <form method="POST" action="{{ route('mfa.verify') }}" class="space-y-4">
        @csrf

        <div>
            <label class="block font-medium text-sm text-slate-100">Kode OTP</label>
            <input id="code" class="block mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:ring-emerald-400 focus:border-emerald-400"
                   type="text" name="code" required autofocus maxlength="6" />
            @error('code')
                <div class="text-sm text-red-400 mt-1">{{ $message }}</div>
            @enderror
        </div>

        <div class="flex items-center justify-end">
            <button class="btn-primary">
                Verifikasi
            </button>
        </div>
    </form>
</x-guest-layout>

