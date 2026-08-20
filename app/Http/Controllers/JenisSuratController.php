<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

use App\Models\JenisSurat;

class JenisSuratController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:classifications.index', only: ['index']),
            new Middleware('permission:classifications.create', only: ['store']),
            new Middleware('permission:classifications.edit', only: ['update']),
            new Middleware('permission:classifications.delete', only: ['destroy']),
        ];
    }
    public function index()
    {
        return Inertia::render('Classifications/Index', [
            'classifications' => JenisSurat::orderBy('id', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode' => 'required|string|max:255|unique:jenis_surats,kode',
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string'
        ]);

        JenisSurat::create([
            'kode' => $request->kode,
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $jenisSurat = JenisSurat::findOrFail($id);
        
        $request->validate([
            'kode' => "required|string|max:255|unique:jenis_surats,kode,{$jenisSurat->id}",
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string'
        ]);

        $jenisSurat->update([
            'kode' => $request->kode,
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
