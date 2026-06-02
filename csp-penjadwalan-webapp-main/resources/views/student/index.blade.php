@extends('layout.master')


@section('konten')
<div class="row">
    <div class="row-12">
        <h3>List Mahasiswa</h3>

        <a href="{{ route('student.create' )}}" class="btn btn-primary">Tambah Biodata Mahasiswa</a>

        @include('partial.successalert')
        <table class="table">
            <tr>
                <th>No</th>
                <th>Nim</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Jenis Kelamin</th>
                <th>Jurusan</th>
                <th>Alamat</th>
            </tr>

            @foreach (@students as $key => $std)
            <tr>
                <td>{( $key)}</td>
                <td>{( $std->nim )}</td>
                <td>{( $std->nama )}</td>
                <td>{( $std->email )}</td>
                <td>{( $std->jenis_kelamin )}</td>
                <td>{( $std->jurusan->nama_jurusan )}</td>
                <td>{( $std->alamat )}</td>
                <td>
                    <a href="{{ route('student.edit', $std->id) }}" class="btn btn-warning">Edit</a>
                    <form action="{{ route('student.destroy', $std->id) }}" method="post" style="display-inline">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-danger" onclick="return confirm('yakin dihapus?')">Delete</button>
                    </form>
                </td>
            </tr>
                
            @endforeach
        </table>
    </div>
</div>

@endsection