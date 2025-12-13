@csrf
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label class="block text-sm font-semibold text-slate-100">MRN</label>
        <input name="mrn" value="{{ old('mrn', $patient->mrn ?? '') }}" required
               class="mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:ring-emerald-400 focus:border-emerald-400" />
        @error('mrn') <div class="text-sm text-red-400">{{ $message }}</div> @enderror
    </div>
    <div>
        <label class="block text-sm font-semibold text-slate-100">Nama</label>
        <input name="name" value="{{ old('name', $patient->name ?? '') }}" required
               class="mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:ring-emerald-400 focus:border-emerald-400" />
        @error('name') <div class="text-sm text-red-400">{{ $message }}</div> @enderror
    </div>
    <div>
        <label class="block text-sm font-semibold text-slate-100">Tanggal Lahir</label>
        <input type="date" name="dob" value="{{ old('dob', optional($patient->dob ?? null)->format('Y-m-d')) }}"
               class="mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:ring-emerald-400 focus:border-emerald-400" />
        @error('dob') <div class="text-sm text-red-400">{{ $message }}</div> @enderror
    </div>
    <div>
        <label class="block text-sm font-semibold text-slate-100">Telepon</label>
        <input name="phone" value="{{ old('phone', $patient->phone ?? '') }}"
               class="mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:ring-emerald-400 focus:border-emerald-400" />
        @error('phone') <div class="text-sm text-red-400">{{ $message }}</div> @enderror
    </div>
    <div>
        <label class="block text-sm font-semibold text-slate-100">No. Asuransi</label>
        <input name="insurance_number" value="{{ old('insurance_number', $patient->insurance_number ?? '') }}"
               class="mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:ring-emerald-400 focus:border-emerald-400" />
        @error('insurance_number') <div class="text-sm text-red-400">{{ $message }}</div> @enderror
    </div>
    <div>
        <label class="block text-sm font-semibold text-slate-100">Alamat</label>
        <textarea name="address" class="mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:ring-emerald-400 focus:border-emerald-400" rows="2">{{ old('address', $patient->address ?? '') }}</textarea>
        @error('address') <div class="text-sm text-red-400">{{ $message }}</div> @enderror
    </div>
    <div class="md:col-span-2">
        <label class="block text-sm font-semibold text-slate-100">Catatan (terenkripsi)</label>
        <textarea name="notes" class="mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:ring-emerald-400 focus:border-emerald-400" rows="3">{{ old('notes', $patient->notes ?? '') }}</textarea>
        @error('notes') <div class="text-sm text-red-400">{{ $message }}</div> @enderror
    </div>
</div>

<div class="mt-4">
    <button class="btn-primary">
        Simpan
    </button>
    <a href="{{ route('patients.index') }}" class="ml-2 text-slate-300 hover:text-white">Batal</a>
</div>

