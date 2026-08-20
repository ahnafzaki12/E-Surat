<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

use App\Models\Lembaga;

class LembagaController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:stations.index', only: ['index']),
            new Middleware('permission:stations.create', only: ['store']),
            new Middleware('permission:stations.edit', only: ['update']),
            new Middleware('permission:stations.delete', only: ['destroy']),
        ];
    }
    public function index()
    {
        return Inertia::render('Stations/Index', [
            'stations' => Lembaga::orderBy('lemb_id', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'lemb_name' => 'required|string|max:255',
        ]);

        Lembaga::create([
            'lemb_name' => $request->lemb_name,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $lembaga = Lembaga::findOrFail($id);
        
        $request->validate([
            'lemb_name' => 'required|string|max:255',
        ]);

        $lembaga->update([
            'lemb_name' => $request->lemb_name,
        ]);

        return redirect()->back();
    }

    public function destroy($id)
    {
        Lembaga::findOrFail($id)->delete();
        return redirect()->back();
    }
}
