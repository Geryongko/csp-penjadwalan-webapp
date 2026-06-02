<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Jurusan as JurusanModel;

class JurusanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        JurusanModel::create([
            'nama_jurusan' => 'Teknik Informatika'
        ]);
        JurusanModel::create([
            'nama_jurusan' => 'Sistem Informasi'
        ]);
        JurusanModel::create([
            'nama_jurusan' => 'Ilmu Komputer'
        ]);
        JurusanModel::create([
            'nama_jurusan' => 'Teknik Komputer'
        ]);
        JurusanModel::create([
            'nama_jurusan' => 'Teknik Telekomunikasi'
        ]);
    }
}
