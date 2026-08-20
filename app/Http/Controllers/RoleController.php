<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

use App\Models\Role;
use App\Models\Permission;

class RoleController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:roles.index', only: ['index']),
            new Middleware('permission:roles.create', only: ['store']),
            new Middleware('permission:roles.edit', only: ['update']),
            new Middleware('permission:roles.delete', only: ['destroy']),
        ];
    }
    public function index()
    {
        return Inertia::render('Roles/Index', [
            'roles' => Role::with('permissions')->orderBy('id', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string'
        ]);

        $role = Role::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        if ($request->has('permissions')) {
            $permissionIds = Permission::whereIn('key', $request->permissions)->pluck('id');
            $role->permissions()->sync($permissionIds);
        }

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string'
        ]);

        $role->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        if ($request->has('permissions')) {
            $permissionIds = Permission::whereIn('key', $request->permissions)->pluck('id');
            $role->permissions()->sync($permissionIds);
        } else {
            $role->permissions()->sync([]);
        }

        return redirect()->back();
    }

    public function destroy($id)
    {
        Role::findOrFail($id)->delete();
        return redirect()->back();
    }
}
