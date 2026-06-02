@extends('layout.master')
@section('title','Menu Mahasiswa')
@section('menuMahasiswa', 'disabled')

@section('konten')
<div class="row">
    {{-- baris 3 konten --}}
    <div class="col-8 ">
        {{-- konten kiri --}}
        <p>Ini adalah view mahasiswa</p>

        <a href="{{ route('admin.dosen') }}">Link Dosen</a>

        <h1>Daftar Mahasiswa</h1>
        <h2>Nilai : {{ $nilai }}</h2>
        @if ($nilai > 65)
            {{-- lulus --}}
            <div class="alert alert-success" role="alert">
                Selamat anda lulus !
            </div>
        @else
            {{-- tidak lulus --}}
            <div class="alert alert-danger" role="alert">
                Mohon maaf belum bisa lulus, silahkan coba lagi !
            </div>
        @endif


        <ol>

            <?php
                foreach ($mahasiswa as $index => $mhs) {
                    echo "<li>$mhs - $jurusan[$index]</li>";
                }
            ?>

            <li><?php echo $mahasiswa[0]." - ".$jurusan[0] ?></li>
            <li><?php echo $mahasiswa[1]." - ".$jurusan[1] ?></li>
            <li><?php echo $mahasiswa[2]." - ".$jurusan[2] ?></li>
        </ol>
    </div>
    <div class="col-4 ">
        {{-- konten kanan --}}
        <table class="table">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
                </tr>
                <tr>
                <th scope="row">2</th>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
                </tr>
                <tr>
                <th scope="row">3</th>
                <td colspan="2">Larry the Bird</td>
                <td>@twitter</td>
                </tr>
            </tbody>
            </table>
    </div>
</div>
@endsection

@section('list')
<ul>
    <li>Nasi Goreng</li>
    <li>Nasi Liwet</li>
    <li>Nasi Uduk</li>
</ul>
@endsection