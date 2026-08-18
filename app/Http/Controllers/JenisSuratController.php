<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\JenisSurat;

class JenisSuratController extends Controller
{
    public function index()
    {
        return Inertia::render('Classifications/Index', [
            'classifications' => JenisSurat::orderBy('id', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string'
        ]);

        JenisSurat::create([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'kode' => 'KODE-'.rand(1000,9999) // just a placeholder since kode is usually required
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $jenisSurat = JenisSurat::findOrFail($id);
        
        $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string'
        ]);

        $jenisSurat->update([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi
        ]);

        return redirect()->back();
    }

    public function destroy($id)
    {
        JenisSurat::findOrFail($id)->delete();
        return redirect()->back();
    }
}
