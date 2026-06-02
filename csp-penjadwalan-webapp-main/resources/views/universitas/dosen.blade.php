@extends('layout.master')
@section('title','Menu dosen')
@section('menuDosen', 'disabled')

@section('konten')
<div class="row">
    {{-- bagian konten --}}
    <div class="col-8">
        <p>Ini adalah view dari Dosen</p>

        <a href="{{ route('admin.mahasiswa', $a=78) }}">Link Mahasiswa</a>

        <h1>Daftar Mahasiswa - Dosen</h1>
        <ol>

            @foreach ($mahasiswa as $index => $mhs )
                <li>{{ $mhs }} - {{ $jurusan[$index] }} - {{ $nilai[$index] }}</li>
            @endforeach

            <li>{{ $mahasiswa[0] }} - {{ $jurusan[0] }} - {{ $nilai[0] }}</li>
            <li>{{ $mahasiswa[1] }} - {{ $jurusan[1] }} - {{ $nilai[1] }}</li>
            <li>{{ $mahasiswa[2] }} - {{ $jurusan[2] }} - {{ $nilai[2] }}</li>
            <li>{{ $mahasiswa[3] }} - {{ $jurusan[3] }} - {{ $nilai[3] }}</li>
        </ol>

        @for ($i=0 ; $i<=10 ; $i++)
            {{ $i }}
        @endfor
    </div>
    <div class="col-4">
        <h1>Konten Berita</h1>
    </div>
</div>
@endsection