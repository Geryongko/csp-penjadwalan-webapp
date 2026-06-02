<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    use HasFactory;

    protected $table = 'mahasiswa';

    //mass assignment => pengaturan utk field mana aja yg bisa diisi
    // 1. fillable
    // 2. guarded

    // protected $fillable = ['nim','nama','email','jurusan','alamat'];
    protected $guarded = [];

    public function jurusan(){
        return $this->belongsTo(Jurusan::class);
    }
}
