import { useState, useMemo } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/UI/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Checkbox from "../../components/form/input/Checkbox";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/UI/table";
import { Modal } from "../../components/UI/modal";
import {
  Plus as LuPlus,
  Pencil as LuPencil,
  Trash2 as LuTrash2,
  Search as LuSearch,
  ArrowUpDown as LuArrowUpDown,
  ArrowUp as LuArrowUp,
  ArrowDown as LuArrowDown,
  Shield as LuShield,
} from "lucide-react";
import { showToast, showAlert, showConfirm } from "../../Utils/notifications";
import AuthenticatedLayout from "../../Layouts/AuthenticatedLayout";

interface Permission {
  id: number;
  key: string;
  label: string;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions?: Permission[];
}

type SortConfig = {
  key: keyof Role;
  direction: "asc" | "desc" | null;
};

const PERMISSION_GROUPS = [
  {
    name: "Dashboard",
    permissions: [
      { key: "dashboard.view", label: "Lihat Dashboard" },
    ]
  },
  {
    name: "Daftar Surat",
    permissions: [
      { key: "surat.index", label: "Lihat Daftar Surat" },
      { key: "surat.create", label: "Buat/Upload Surat" },
      { key: "surat.show", label: "Lihat Detail Surat" },
      { key: "surat.preview", label: "Preview PDF Draft" },
      { key: "surat.placement", label: "Atur Posisi QR (Placement Editor)" },
      { key: "surat.submit", label: "Ajukan Surat ke Approval" },
      { key: "surat.replace-file", label: "Ganti File Draft (Revisi Surat Ditolak)" },
    ]
  },
  {
    name: "Manajemen Pengguna",
    permissions: [
      { key: "users.index", label: "Lihat Daftar User" },
      { key: "users.create", label: "Tambah User" },
      { key: "users.edit", label: "Edit User" },
      { key: "users.delete", label: "Hapus User" },
    ]
  },
  {
    name: "Peran",
    permissions: [
      { key: "roles.index", label: "Lihat Daftar Peran" },
      { key: "roles.create", label: "Tambah Peran" },
      { key: "roles.edit", label: "Edit Peran & Hak Akses" },
      { key: "roles.delete", label: "Hapus Peran" },
    ]
  },
  {
    name: "Jenis Surat",
    permissions: [
      { key: "classifications.index", label: "Lihat Daftar Jenis Surat" },
      { key: "classifications.create", label: "Tambah Jenis Surat" },
      { key: "classifications.edit", label: "Edit Jenis Surat" },
      { key: "classifications.delete", label: "Hapus Jenis Surat" },
    ]
  },
  {
    name: "Lembaga",
    permissions: [
      { key: "stations.index", label: "Lihat Daftar Lembaga" },
      { key: "stations.create", label: "Tambah Lembaga" },
      { key: "stations.edit", label: "Edit Lembaga" },
      { key: "stations.delete", label: "Hapus Lembaga" },
    ]
  }
];

export default function RoleManagement() {
  const { roles, auth } = usePage<{ roles: Role[], auth: any }>().props;
  const userPermissions = auth?.user?.role?.permissions || [];
  
  const canCreate = userPermissions.includes('roles.create');
  const canEdit = userPermissions.includes('roles.edit');
  const canDelete = userPermissions.includes('roles.delete');

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "id",
    direction: "asc",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, setData, post, put, processing, reset, clearErrors } = useForm({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handleSort = (key: SortConfig["key"]) => {
    let direction: SortConfig["direction"] = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedRoles = useMemo(() => {
    let result = [...roles];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (role) =>
          role.name.toLowerCase().includes(term) ||
          String(role.id).includes(term)
      );
    }

    if (sortConfig.direction) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) aValue = "";
        if (bValue === null || bValue === undefined) bValue = "";

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [roles, sortConfig, searchTerm]);

  const handleOpenModal = (role?: Role) => {
    setMissingFields([]);
    clearErrors();
    if (role) {
      setEditingId(role.id);
      setData({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions?.map((p) => p.key) || [],
      });
    } else {
      setEditingId(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const missing = [];
    if (!data.name.trim()) missing.push("name");

    setMissingFields(missing);

    if (missing.length > 0) {
      showAlert("error", "Validation Error", "Please fill in the role name.");
      return;
    }

    if (editingId) {
      const result = await showConfirm(
        'Update Role?',
        'Are you sure you want to update this role?',
        'Yes, update role'
      );
      if (!result.isConfirmed) return;

      put(route('roles.update', editingId), {
        onSuccess: () => {
          showToast('success', 'Role updated successfully');
          setIsModalOpen(false);
          reset();
        },
        onError: (errors: any) => {
          showAlert('error', 'Update Failed', errors.message || 'An error occurred');
        }
      });
    } else {
      post(route('roles.store'), {
        onSuccess: () => {
          showToast('success', 'Role created successfully');
          setIsModalOpen(false);
          reset();
        },
        onError: (errors: any) => {
          showAlert('error', 'Creation Failed', errors.message || 'An error occurred');
        }
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirm(
      'Delete Role?',
      'This action cannot be undone. Make sure no users are currently assigned to this role.',
      'Yes, delete role'
    );

    if (!result.isConfirmed) return;

    router.delete(route('roles.destroy', id), {
      onSuccess: () => {
        showToast('success', 'Role deleted successfully');
      },
      onError: (errors: any) => {
        showAlert('error', 'Delete Failed', errors.message || 'An error occurred');
      }
    });
  };

  const getSortIcon = (key: SortConfig["key"]) => {
    if (sortConfig.key !== key || !sortConfig.direction) {
      return <LuArrowUpDown className="ml-1 size-3.5 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <LuArrowUp className="ml-1 size-3.5 text-brand-500" />
    ) : (
      <LuArrowDown className="ml-1 size-3.5 text-brand-500" />
    );
  };

  const handleTogglePermission = (permissionKey: string, checked: boolean) => {
    if (checked) {
      setData("permissions", [...data.permissions, permissionKey]);
    } else {
      setData("permissions", data.permissions.filter((k) => k !== permissionKey));
    }
  };

  const handleToggleGroup = (groupIndex: number, checked: boolean) => {
    const groupKeys = PERMISSION_GROUPS[groupIndex].permissions.map(p => p.key);
    let newPermissions = [...data.permissions];

    if (checked) {
      // Add all group keys that aren't already included
      groupKeys.forEach(key => {
        if (!newPermissions.includes(key)) {
          newPermissions.push(key);
        }
      });
    } else {
      // Remove all group keys
      newPermissions = newPermissions.filter(key => !groupKeys.includes(key));
    }

    setData("permissions", newPermissions);
  };

  const isGroupFullySelected = (groupIndex: number) => {
    const groupKeys = PERMISSION_GROUPS[groupIndex].permissions.map(p => p.key);
    return groupKeys.every(key => data.permissions.includes(key));
  };


  return (
    <AuthenticatedLayout>
      <PageMeta
        title="Role Management | JAS Airport Services"
        description="Manage user roles"
      />
      <PageBreadcrumb pageTitle="Role Management" />

      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 mt-4">
          {/* Header: Title + Search + Add Button */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Roles
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage user roles and permissions.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <LuSearch className="size-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search roles..."
                  className="pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-transparent outline-none focus:border-blue-500 dark:border-gray-800 dark:text-white transition-all w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {canCreate && (
                <Button
                  variant="primary"
                  size="sm"
                  startIcon={<LuPlus className="size-5" />}
                  onClick={() => handleOpenModal()}
                  className="rounded-xl shadow-lg shadow-brand-500/20 w-full sm:w-auto justify-center"
                >
                  Add Role
                </Button>
              )}
            </div>
          </div>

          {/* ── Desktop Table (lg+) ── */}
          <div className="hidden lg:block max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell
                    isHeader
                    className="w-[15%] py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon("id")}
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[35%] py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Role Name
                      {getSortIcon("name")}
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[35%] py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center">
                      Description
                      {getSortIcon("description")}
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[15%] py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredAndSortedRoles.length > 0 ? (
                  filteredAndSortedRoles.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.id}
                      </TableCell>
                      <TableCell className="py-4 text-gray-800 font-medium text-theme-sm dark:text-white/90">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.description || "-"}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                              title="Edit Role"
                            >
                              <LuPencil className="size-4.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                              title="Delete Role"
                            >
                              <LuTrash2 className="size-4.5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-gray-500">
                      No roles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Tablet & Mobile Card Layout (< lg) ── */}
          <div className="lg:hidden">
            {filteredAndSortedRoles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAndSortedRoles.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                  >
                    {/* Card Top: Icon + Name + Actions */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 shrink-0">
                        <LuShield className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white/90 text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">
                          ID #{item.id}
                        </p>
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {canEdit && (
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                            title="Edit Role"
                          >
                            <LuPencil className="size-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                            title="Delete Role"
                          >
                            <LuTrash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom: Description */}
                    {item.description && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Description</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}
                    {!item.description && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-400 italic">No description</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center text-gray-400 dark:text-gray-500 text-sm">
                No roles found.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-[700px] w-full"
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 lg:px-8 lg:py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
                <LuShield className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {editingId ? "Edit Role" : "Add New Role"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingId ? "Update role details and permissions." : "Create a new user role."}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 lg:px-8 lg:py-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Role Name</Label>
                  <Input
                    placeholder="e.g. sekretaris_lembaga"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="mt-1.5"
                    error={missingFields.includes("name")}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    rows={2}
                    className="w-full mt-1.5 rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:text-white/90 dark:focus:border-brand-500 transition-all focus:ring-4 focus:ring-brand-500/10 shadow-sm"
                    placeholder="Optional description"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                  />
                </div>
              </div>

              {/* Permissions Section */}
              <div className="pt-2">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                  Hak Akses Menu & Fitur
                </h4>

                <div className="space-y-6">
                  {PERMISSION_GROUPS.map((group, groupIndex) => (
                    <div key={group.name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="text-brand-500 text-xs">▸</span> {group.name}
                        </h5>
                        <button
                          type="button"
                          onClick={() => handleToggleGroup(groupIndex, !isGroupFullySelected(groupIndex))}
                          className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
                        >
                          {isGroupFullySelected(groupIndex) ? "Batal Pilih Semua" : "Pilih Semua"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800 ml-1">
                        {group.permissions.map((permission) => (
                          <div key={permission.key} className="flex items-start gap-3">
                            <Checkbox
                              checked={data.permissions.includes(permission.key)}
                              onChange={(checked) => handleTogglePermission(permission.key, checked)}
                              label={permission.label}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="px-6 py-5 lg:px-8 lg:py-6 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] rounded-b-3xl">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={processing}
              className="px-8 rounded-xl shadow-lg shadow-brand-500/25"
            >
              {processing ? "Saving..." : editingId ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
