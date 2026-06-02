<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Mahasiswa as MahasiswaModel;
use App\Models\Jurusan as JurusanModel;

class BiodataController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //untuk menampilkan list data Mahasiswa
        $students = MahasiswaModel::with('jurusan')->get();
        return view('student.index', compact('students'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // ini untuk panggil form inputan tambah data
        $jurusan = JurusanModel::all();
        return view('student.create', compact('jurusan'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $rules = [
            'nim' => 'required|numeric|digits_between:5,10|unique:mahasiswa',
            'nama' => 'required|min:3|max:40',
            'email' => 'required|email',
            'jenis_kelamin' => 'required|in:L,P',
            'jurusan' => 'required|not_in:0',
            'alamat' => 'required|min:3|max:200'
        ];

        $messages = [
            'required' => ':attribute wajib diisi',
            'numeric' => ':attribute harus diisi dengan angka',
            'unique' => ':attribut sudah digunakan',
            'email' => ':attribute harus diisi dengan email yang valid',
            'max' => ':attribute maksimal berisi :max karakter',
            'min' => ':attribute minimal berisi :min karakter',
            'digits_between' => ':attribute harus sesuai dengan rentang 5-10 karakter'

        ];

        $validator = Validator::make($request->all(), $rules,$messages);

        if($validator->fails()){
            //jika true maka form ada error
            return redirect()->back()
            ->withInput() //utk melempar data lama user
            ->withErrors($validator) //untuk melempar notif error pada input
            ->with('danger','Pastikan semua field diisi'); //untuk lempar notif
        }else
        {
        // jika kondisi tidak ada error
        // dd($request->all());

            $student = MahasiswaModel::findOrFail($id);

            $student -> update([
                'nim' => $request->nim,
                'nama' => $request->nama,
                'email' => $request->email,
                'jenis_kelamin' => $request->jenis_kelamin,
                'jurusan_id' => $request->jurusan,
                'alamat' => $request->alamat
            ]);

            return redirect()->route('student.index')->with('success','Data Mahasiswa berhasil disimpan');

        }

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        //
        $student= MahasiswaModel::findOrFail($id);
        $jurusan = JurusanModel::all();
        return view('student.edit', compact('student'))
            ->with('jurusan', $jurusan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        MahasiswaModel::where('id',$id)->delete();
        return redirect()->route('student.index')->with('success','Data mahasiswa berhasil dihapus');
    }
}
