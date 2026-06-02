<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Mahasiswa;
use Faker\Factory as Faker;

class MahasiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        //Eloquent ORM

        // cara 1
        // $mhs1 = new Mahasiswa;
        // $mhs1->nim = 2612345678;
        // $mhs1->nama = 'Agung Budi';
        // $mhs1->email = 'agung.budi@binus.ac.id';
        // $mhs1->jurusan = 'IT';
        // $mhs1->alamat = 'Jalan mahasiswa menuju IPK 4';
        // $mhs1->save();

        for($i =1; $i <= 50; $i++){
            // cara 2
            Mahasiswa::create([
                'nim' => $faker->numberBetween(1111111111,9999999999),
                'nama' => $faker->name ,
                'email' => $faker->email,
                'jurusan' => $faker->randomElement($array=['IT','SI','AK']),
                'alamat' => $faker->address
            ]);
        }
        
    }
}
