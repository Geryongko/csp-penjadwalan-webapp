<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Post as PostModel;
use App\Models\Comment as CommentModel;
use Faker\Factory as Faker;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $faker = Faker::create('id_ID');

        for($i=1; $i<=50 ; $i++){

            $post=PostModel::create([
                'title' => $faker->sentence(),
                'body' => $faker->paragraph(3)
            ]);

            $commentCount = rand(3,6);
            for($j=1; $j<=$commentCount; $j++){
                CommentModel::create([
                    'post_id' => $post->id,
                    'body' => $faker->sentence(10)
                ]);
            }

        }
    }
}
