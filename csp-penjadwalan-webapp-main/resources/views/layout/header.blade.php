<div class="row">
    {{-- baris 1 logo/header--}}
    <div class="col-2 ">
        <img height="50" width="75" src="{{ asset('img/logobootstrap.png') }}" alt="">
    </div>
</div>
<div class="row">
    {{-- baris 2 menu--}}
    <div class="col-12 ">
        <nav class="navbar navbar-expand-lg bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Navbar</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link @yield('menuMahasiswa')" aria-current="page" href="{{ route('admin.mahasiswa', $b=65) }}">Mahasiswa</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link @yield('menuDosen')" href="{{ route('admin.dosen') }}">Dosen</a>
                    </li>
                    
                </ul>
                </div>
            </div>
        </nav>
    </div>
</div>