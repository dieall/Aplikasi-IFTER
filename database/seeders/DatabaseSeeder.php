<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Patient;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = ['admin', 'doctor', 'nurse', 'clerk'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Create users for each role with known credentials (development/demo only)
        $seedUsers = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => 'Password123!',
                'role' => 'admin',
            ],
            [
                'name' => 'Dr. Alice',
                'email' => 'doctor@example.com',
                'password' => 'Password123!',
                'role' => 'doctor',
            ],
            [
                'name' => 'Nurse Nancy',
                'email' => 'nurse@example.com',
                'password' => 'Password123!',
                'role' => 'nurse',
            ],
            [
                'name' => 'Clerk Carl',
                'email' => 'clerk@example.com',
                'password' => 'Password123!',
                'role' => 'clerk',
            ],
        ];

        $createdUsers = [];
        foreach ($seedUsers as $u) {
            // Ensure we update password & name for existing accounts in development
            $user = User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => Hash::make($u['password']),
                    'mfa_enabled' => false,
                ]
            );
            $user->assignRole($u['role']);
            $createdUsers[$u['role']] = $user;
        }

        // Create a couple of sample patients assigned to admin and doctor
        Patient::firstOrCreate(
            ['mrn' => 'MRN001'],
            [
                'name' => 'John Doe',
                'dob' => '1990-01-01',
                'phone' => '081234567890',
                'insurance_number' => 'INS-001',
                'address' => 'Jl. Contoh No.1',
                'notes' => 'Seeding default patient',
                'created_by' => $createdUsers['admin']->id ?? null,
            ]
        );

        Patient::firstOrCreate(
            ['mrn' => 'MRN002'],
            [
                'name' => 'Jane Patient',
                'dob' => '1985-06-15',
                'phone' => '081198765432',
                'insurance_number' => 'INS-002',
                'address' => 'Jl. Sehat No.2',
                'notes' => 'Seeding another patient',
                'created_by' => $createdUsers['doctor']->id ?? null,
            ]
        );
    }
}
