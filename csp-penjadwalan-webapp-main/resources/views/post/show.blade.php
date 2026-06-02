@extends('layout.master')


@section('konten')
<div class="row">
    <div class="col-12">
        <h1>Detail Post</h1>

        @foreach ($post as $p)
            <h2>{{ $p->title }}</h2>
            <p>{{ $p->body }}</p>
            
            <ul>
                @foreach ($p->comments as $c )
                    <li>{{ $c->body }}</li>
                @endforeach
            </ul>
        @endforeach
    </div>
</div>
@endsection