<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sekretaris Yayasan
        $sekretarisYayasan = Role::firstOrCreate(
            ['name' => 'sekretaris_yayasan'],
            ['description' => 'Sekretaris pembuat surat tingkat yayasan']
        );
        $sekretarisYayasan->permissions()->sync(
            Permission::where('key', '!=', 'surat.approve')->pluck('id')
        );

        // Sekretaris Lembaga
        $sekretarisLembaga = Role::firstOrCreate(
            ['name' => 'sekretaris_lembaga'],
            ['description' => 'Sekretaris pembuat surat tingkat lembaga']
        );
        $sekretarisLembaga->permissions()->sync(
            Permission::whereIn('key', [
                'surat.index', 'surat.create', 'surat.show', 'surat.preview',
                'surat.placement', 'surat.submit', 'surat.replace-file'
            ])->pluck('id')
        );

        // Approver (Gus)
        $approver = Role::firstOrCreate(
            ['name' => 'approver'],
            ['description' => 'Penyetuju surat (Gus)']
        );
        $approver->permissions()->sync(
            Permission::whereIn('key', [
                'dashboard.view', 'surat.index', 'surat.show', 'surat.preview', 'surat.approve'
            ])->pluck('id')
        );

        // Admin
        $admin = Role::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Administrator sistem']
        );
        // Jika ada permission yang eksklusif selain approve, bisa dikecualikan. Admin diasumsikan tidak approve surat
        $admin->permissions()->sync(
            Permission::where('key', '!=', 'surat.approve')->pluck('id')
        );
    }
}
