<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Mahasiswa as MahasiswaModel;
use App\Models\Jurusan as JurusanModel;
use phpseclib3\File\ASN1\Maps\Validity;

class MahasiswaController extends Controller
{
    //
    public function index($nilai){

        $arrMahasiswa = ["Risa Lestari","Rudi Hermawan","Bambang Kusumo","Lisa Permata"];
        $arrJurusan = ['Teknik Informatika','Sistem Informasi','Manajemen', 'DKV'];
        // $nilai = 90;

        return view('universitas.mahasiswa',
        [
            'mahasiswa' => $arrMahasiswa,
            'jurusan' => $arrJurusan,
            'nilai' => $nilai
        ]);
    }

    public function all(){
        $result = MahasiswaModel::all();
        // dd($result);
        foreach ($result as $mhs) {
            echo $mhs->id."</br>";
            echo $mhs->nim."</br>";
            echo $mhs->nama."</br>";
            echo $mhs->jurusan."</br>";
            echo $mhs->alamat."</br>";

            echo "<br>";
        }
    }

    public function form(){
        $jurusan = JurusanModel::all();
        return view('mahasiswa.form', compact('jurusan'));
    }

    public function create(Request $request){


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
            $mahasiswa = MahasiswaModel::create([
                'nim' => $request->nim,
                'nama' => $request->nama,
                'email' => $request->email,
                'jenis_kelamin' => $request->jenis_kelamin,
                'jurusan_id' => $request->jurusan,
                'alamat' => $request->alamat
            ]);

        }

        // dd($request->all());

        // MahasiswaModel::create([
        //     'nim' => '1111111111',
        //     'nama' => 'Kevin Agus',
        //     'email' => 'kevin.agus@binus.ac.id',
        //     'jurusan' => 'IT',
        //     'alamat' => 'Jalan sukses menuju mahasiswa berprestasi'
        // ]);

        return "Data berhasil disimpan";
    }

    public function edit(){

    }

    public function delete($id){
        $mhs = MahasiswaModel::find($id);
        $mhs->delete();

        return "Data berhasil dihapus";
    }

}
