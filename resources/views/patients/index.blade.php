<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h2 class="font-semibold text-2xl text-white leading-tight">
                    Data Pasien
                </h2>
                <p class="text-sm text-slate-300">CRUD + audit trail + catatan terenkripsi</p>
            </div>
            <div class="space-x-2">
                <a href="{{ route('patients.create') }}" class="btn-primary">Tambah Pasien</a>
                <a href="{{ route('audit.index') }}" class="btn-secondary">Audit Log</a>
            </div>
        </div>
    </x-slot>

    @if (session('status'))
        <div class="glass border border-emerald-400/40 text-emerald-100 rounded-2xl p-3">
            {{ session('status') }}
        </div>
    @endif

    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="table-neo">
                <thead class="bg-white/5">
                    <tr>
                        <th>MRN</th>
                        <th>Nama</th>
                        <th>Tanggal Lahir</th>
                        <th>Telepon</th>
                        <th>Asuransi</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($patients as $patient)
                        <tr class="hover:bg-white/5">
                            <td class="font-mono text-xs">{{ $patient->mrn }}</td>
                            <td>{{ $patient->name }}</td>
                            <td>{{ optional($patient->dob)->format('Y-m-d') }}</td>
                            <td>{{ $patient->phone }}</td>
                            <td>{{ $patient->insurance_number }}</td>
                            <td class="space-x-2">
                                <a class="text-emerald-300 hover:underline" href="{{ route('patients.edit', $patient) }}">Edit</a>
                                <form action="{{ route('patients.destroy', $patient) }}" method="POST" class="inline">
                                    @csrf
                                    @method('DELETE')
                                    <button class="text-rose-300 hover:underline" onclick="return confirm('Hapus pasien?')">Hapus</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-3 py-4 text-center text-slate-300">Belum ada data</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">
            {{ $patients->links() }}
        </div>
    </div>
</x-app-layout>

