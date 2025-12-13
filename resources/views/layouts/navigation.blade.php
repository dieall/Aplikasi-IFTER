<nav x-data="{ open: false }" class="sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div class="glass rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <a href="{{ route('dashboard') }}" class="flex items-center gap-2 font-semibold text-slate-100">
                    <div class="w-9 h-9 rounded-xl bg-green-500/20 border border-green-400/40 grid place-items-center text-green-300 font-bold">
                        SIH
                    </div>
                    <div class="leading-tight">
                        <div class="text-sm">Sistem Informasi Kesehatan</div>
                        <div class="text-xs text-slate-300">RBAC • Audit • MFA • API</div>
                    </div>
                </a>
                <div class="hidden space-x-4 sm:flex sm:ms-6 text-sm">
                    <x-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')" class="text-slate-200">
                        Dashboard
                    </x-nav-link>
                    <x-nav-link :href="route('patients.index')" :active="request()->routeIs('patients.*')" class="text-slate-200">
                        Pasien
                    </x-nav-link>
                    <x-nav-link :href="route('audit.index')" :active="request()->routeIs('audit.index')" class="text-slate-200">
                        Audit Log
                    </x-nav-link>
                </div>
            </div>

            <div class="hidden sm:flex sm:items-center sm:ms-6">
                <x-dropdown align="right" width="48">
                    <x-slot name="trigger">
                        <button class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10">
                            <div class="text-left">
                                <div>{{ Auth::user()->name }}</div>
                                <div class="text-[11px] text-slate-300">{{ Auth::user()->email }}</div>
                            </div>
                            <svg class="w-4 h-4 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        <x-dropdown-link :href="route('profile.edit')">
                            {{ __('Profile') }}
                        </x-dropdown-link>

                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <x-dropdown-link :href="route('logout')"
                                onclick="event.preventDefault(); this.closest('form').submit();">
                                {{ __('Log Out') }}
                            </x-dropdown-link>
                        </form>
                    </x-slot>
                </x-dropdown>
            </div>

            <div class="flex items-center sm:hidden">
                <button @click="open = ! open" class="inline-flex items-center justify-center p-2 rounded-md text-slate-100 hover:bg-white/10 border border-white/10">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{'hidden': open, 'inline-flex': ! open }" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path :class="{'hidden': ! open, 'inline-flex': open }" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <div :class="{'block': open, 'hidden': ! open}" class="hidden sm:hidden px-4">
        <div class="glass rounded-2xl mt-2 p-4 space-y-2 text-sm text-slate-100">
            <x-responsive-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')">
                Dashboard
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('patients.index')" :active="request()->routeIs('patients.*')">
                Pasien
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('audit.index')" :active="request()->routeIs('audit.index')">
                Audit Log
            </x-responsive-nav-link>

            <div class="pt-2 border-t border-white/10">
                <div class="font-semibold">{{ Auth::user()->name }}</div>
                <div class="text-xs text-slate-300">{{ Auth::user()->email }}</div>
            </div>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <x-responsive-nav-link :href="route('logout')"
                    onclick="event.preventDefault(); this.closest('form').submit();">
                    {{ __('Log Out') }}
                </x-responsive-nav-link>
            </form>
        </div>
    </div>
</nav>
