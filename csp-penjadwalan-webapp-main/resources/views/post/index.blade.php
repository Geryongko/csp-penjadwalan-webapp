@extends('layout.master')


@section('konten')
<div class="row">
    <div class="col-12">
        <h1>Ini adalah halaman Post</h1>

        <table class="table">
            <tr>
                <th>No</th>
                <th>Title</th>
                <th>Body</th>
                <th>Comment</th>
                <th>Action</th>
            </tr>
            @foreach ($posts as $index=>$p)
                <tr>
                    <td>{{ ($index+1) }}</td>
                    <td>{{ $p->title }}</td>
                    <td>{{ $p->body }}</td>
                    <td>
                        <ul>
                            @foreach ($p->comments as $c)
                                <li>{{ $c->body }}</li>
                            @endforeach
                        </ul>
                    </td>
                    <td>
                        <a class="btn btn-primary" href="{{ route('post.show', $id=$p->id) }}">Detail</a>
                    </td>
                </tr>
            @endforeach
        </table>
    </div>
</div>
@endsection