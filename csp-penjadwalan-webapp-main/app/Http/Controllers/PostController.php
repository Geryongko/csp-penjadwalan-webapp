<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post as PostModel;
use App\Models\Comment as CommentModel;

class PostController extends Controller
{
    public function index(){
        $posts = PostModel::with('comments')->get();
        return view('post.index',compact('posts'));//dd($posts);
    }

    public function show($id){
        $post = PostModel::with('comments')
                 ->where('id',$id)
                 ->get();

        return view('post.show', compact('post'));
    }
    //
}
