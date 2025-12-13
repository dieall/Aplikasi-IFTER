<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Tambah Pasien
        </h2>
    </x-slot>

    <div class="card max-w-4xl mx-auto">
        <form method="POST" action="{{ route('patients.store') }}">
            @include('patients.form')
        </form>
    </div>
</x-app-layout>

