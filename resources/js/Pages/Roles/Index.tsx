import { useState, useMemo } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
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
import { showToast, showAlert, showConfirm } from "../../utils/notifications";
import AuthenticatedLayout from "../../Layouts/AuthenticatedLayout";

interface Role {
  id: number;
  name: string;
  description: string | null;
}

type SortConfig = {
  key: keyof Role;
  direction: "asc" | "desc" | null;
};

export default function RoleManagement() {
  const { roles } = usePage<{ roles: Role[] }>().props;

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

  return (
    <AuthenticatedLayout>
      <PageMeta
        title="Role Management | JAS Airport Services"
        description="Manage user roles"
      />
      <PageBreadcrumb pageTitle="Role Management" />

      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 mt-4">
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <LuSearch className="size-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search roles..."
                  className="pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-transparent outline-none focus:border-blue-500 dark:border-gray-800 dark:text-white transition-all w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                startIcon={<LuPlus className="size-5" />}
                onClick={() => handleOpenModal()}
                className="rounded-xl shadow-lg shadow-brand-500/20"
              >
                Add Role
              </Button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
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
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                            title="Edit Role"
                          >
                            <LuPencil className="size-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                            title="Delete Role"
                          >
                            <LuTrash2 className="size-4.5" />
                          </button>
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
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-[500px]"
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
                  {editingId ? "Update role details." : "Create a new user role."}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 lg:px-8 lg:py-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <div className="space-y-4">
              <div>
                <Label>Role Name</Label>
                <Input
                  placeholder="e.g. Admin"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="mt-1.5"
                  error={missingFields.includes("name")}
                />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  rows={3}
                  className="w-full mt-1.5 rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:text-white/90 dark:focus:border-brand-500 transition-all focus:ring-4 focus:ring-brand-500/10 shadow-sm"
                  placeholder="Optional description"
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                />
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
