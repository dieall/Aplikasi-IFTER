<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="font-semibold text-2xl text-white leading-tight">
                    Audit Log
                </h2>
                <p class="text-sm text-slate-300">Jejak aktivitas & keamanan</p>
            </div>
            <span class="badge">Readonly</span>
        </div>
    </x-slot>

    <div class="card">
        <div class="overflow-x-auto">
            <table class="table-neo">
                <thead class="bg-white/5">
                    <tr>
                        <th>Waktu</th>
                        <th>User</th>
                        <th>Aksi</th>
                        <th>Entitas</th>
                        <th>IP</th>
                        <th>Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($logs as $log)
                        <tr class="hover:bg-white/5">
                            <td class="text-xs text-slate-300">{{ $log->created_at }}</td>
                            <td>{{ $log->user?->email ?? '-' }}</td>
                            <td class="font-mono text-xs">{{ $log->action }}</td>
                            <td class="text-xs">{{ $log->entity_type }}#{{ $log->entity_id }}</td>
                            <td class="text-xs">{{ $log->ip }}</td>
                            <td>{{ $log->description }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-3">
            {{ $logs->links() }}
        </div>
    </div>
</x-app-layout>

