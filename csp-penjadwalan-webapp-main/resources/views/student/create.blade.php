@extends('layout.master')


@section('konten')
<div class="row">
    <div class="col-12">
        <h1>Pendaftaran Mahasiswa</h1>
        <hr>

        @include('partial.dangeralert')
        <form action="{{ route('student.store') }}" method="POST">
            @csrf
            <div class="form-group">
                <label for="nim">NIM</label>
                <input type="text" class="form-control @error('nim') is-invalid @enderror" id="nim" name="nim" value="{{ old('nim') }}">
                @error('nim')
                    <div class="invalid-feedback" role='alert'>
                        {{ $message }}
                    </div>
                @enderror
            </div>

            <div class="form-group">
                <label for="nama">Nama Lengkap</label>
                <input type="text" class="form-control @error('nama') is-invalid @enderror" id="nama" name="nama" value="{{ old('nama') }}">
                @error('nama')
                    <div class="invalid-feedback" role='alert'>
                        {{ $message }}
                    </div>
                @enderror
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="text" class="form-control @error('email') is-invalid @enderror" id="email" name="email" value="{{ old('email') }}">
                @error('email')
                    <div class="invalid-feedback" role='alert'>
                        {{ $message }}
                    </div>
                @enderror
            </div>

            <div class="form-group">
                <label>Jenis Kelamin</label>
                <div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input @error('jenis_kelamin') is-invalid @enderror" 
                            type="radio" 
                            name="jenis_kelamin" 
                            id="laki_laki" 
                            value="L"
                            {{ old('jenis_kelamin') == 'L' ? 'checked':'' }}
                        >
                        <label class="form-check-label" for="laki_laki">Laki-laki</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input @error('jenis_kelamin') is-invalid @enderror" 
                            type="radio" 
                            name="jenis_kelamin"
                            id="perempuan" 
                            value="P"
                            {{ old('jenis_kelamin') == 'P' ? 'checked':'' }}
                        >
                        <label class="form-check-label" for="perempuan">Perempuan</label>
                    </div>
                    @error('jenis_kelamin')
                        <div class="invalid-feedback d-block" role='alert'>
                            {{ $message }}
                        </div>
                    @enderror
                </div>
            </div>

            <div class="form-group">
                <label for="jurusan">Jurusan</label>
                <select class="form-control @error('jurusan') is-invalid @enderror" name="jurusan" id="jurusan">
                    <option value="">-- Pilih Jurusan --</option>

                @foreach ($jurusan as $jur)
                    <option value="{{ $jur->id }}" {{ old('jurusan') == $jur->id ? 'selected':'' }}>{{ $jur->nama_jurusan }}</option>
                @endforeach
                </select>
                @error('jurusan')
                    <div class="invalid-feedback" role='alert'>
                        {{ $message }}
                    </div>
                @enderror
            </div>

            <div class="form-group">
                <label for="alamat">Alamat</label>
                <textarea class="form-control @error('alamat') is-invalid @enderror" id="alamat" rows="3" name="alamat">
                    {{ old('alamat') }}
                </textarea>
                @error('alamat')
                    <div class="invalid-feedback" role='alert'>
                        {{ $message }}
                    </div>
                @enderror
            </div>

            <button type="submit" class="btn btn-primary mb-2">Daftar</button>
        </form>

    </div>
</div>
@endsection