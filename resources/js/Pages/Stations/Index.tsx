import { useState, useMemo } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/UI/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
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
  MapPin as LuMapPin,
} from "lucide-react";
import { showToast, showAlert, showConfirm } from "../../Utils/notifications";
import AuthenticatedLayout from "../../Layouts/AuthenticatedLayout";

interface Station {
  lemb_id: number;
  lemb_name: string;
}

type SortConfig = {
  key: keyof Station;
  direction: "asc" | "desc" | null;
};

export default function StationManagement() {
  const { stations, auth } = usePage<{ stations: Station[], auth: any }>().props;
  const userPermissions = auth?.user?.role?.permissions || [];
  
  const canCreate = userPermissions.includes('stations.create');
  const canEdit = userPermissions.includes('stations.edit');
  const canDelete = userPermissions.includes('stations.delete');

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "lemb_id",
    direction: "asc",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data, setData, post, put, processing, reset, clearErrors } = useForm({
    lemb_name: "",
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

  const filteredAndSortedStations = useMemo(() => {
    let result = [...stations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (st) =>
          st.lemb_name.toLowerCase().includes(term) ||
          String(st.lemb_id).includes(term)
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
  }, [stations, sortConfig, searchTerm]);

  const handleOpenModal = (station?: Station) => {
    setMissingFields([]);
    clearErrors();
    if (station) {
      setEditingId(station.lemb_id);
      setData({
        lemb_name: station.lemb_name,
      });
    } else {
      setEditingId(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const missing = [];
    if (!data.lemb_name.trim()) missing.push("lemb_name");

    setMissingFields(missing);

    if (missing.length > 0) {
      showAlert("error", "Validation Error", "Please fill in all required fields.");
      return;
    }

    if (editingId) {
      const result = await showConfirm(
        'Update Station?',
        'Are you sure you want to update this station?',
        'Yes, update station'
      );
      if (!result.isConfirmed) return;

      put(route('stations.update', editingId), {
        onSuccess: () => {
          showToast('success', 'Station updated successfully');
          setIsModalOpen(false);
          reset();
        },
        onError: (errors: any) => {
          showAlert('error', 'Update Failed', errors.message || 'An error occurred');
        }
      });
    } else {
      post(route('stations.store'), {
        onSuccess: () => {
          showToast('success', 'Station created successfully');
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
      'Delete Station?',
      'This action cannot be undone. Make sure no users or activities are currently assigned to this station.',
      'Yes, delete station'
    );

    if (!result.isConfirmed) return;

    router.delete(route('stations.destroy', id), {
      onSuccess: () => {
        showToast('success', 'Station deleted successfully');
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
        title="Station Management | JAS Airport Services"
        description="Manage airport stations"
      />
      <PageBreadcrumb pageTitle="Station Management" />

      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 mt-4">
          {/* Header: Title + Search + Add Button */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Stations
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage airport stations and locations.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <LuSearch className="size-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search stations..."
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
                  Add Station
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
                    onClick={() => handleSort("lemb_id")}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon("lemb_id")}
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[70%] py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    onClick={() => handleSort("lemb_name")}
                  >
                    <div className="flex items-center">
                      Station Name
                      {getSortIcon("lemb_name")}
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
                {filteredAndSortedStations.length > 0 ? (
                  filteredAndSortedStations.map((item) => (
                    <TableRow key={item.lemb_id}>
                      <TableCell className="py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.lemb_id}
                      </TableCell>
                      <TableCell className="py-4 text-gray-800 font-medium text-theme-sm dark:text-white/90">
                        {item.lemb_name}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                              title="Edit Station"
                            >
                              <LuPencil className="size-4.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.lemb_id)}
                              className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                              title="Delete Station"
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
                    <TableCell colSpan={3} className="py-10 text-center text-gray-500">
                      No stations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Tablet & Mobile Card Layout (< lg) ── */}
          <div className="lg:hidden">
            {filteredAndSortedStations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAndSortedStations.map((item) => (
                  <div
                    key={item.lemb_id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center size-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 shrink-0">
                      <LuMapPin className="size-5" />
                    </div>

                    {/* Name + ID */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white/90 text-sm truncate">
                        {item.lemb_name}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">
                        ID #{item.lemb_id}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                          title="Edit Station"
                        >
                          <LuPencil className="size-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(item.lemb_id)}
                          className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                          title="Delete Station"
                        >
                          <LuTrash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center text-gray-400 dark:text-gray-500 text-sm">
                No stations found.
              </div>
            )}
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
                <LuMapPin className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {editingId ? "Edit Station" : "Add New Station"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingId ? "Update station details." : "Create a new station location."}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 lg:px-8 lg:py-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <div className="space-y-4">
              <div>
                <Label>Station Name / Location</Label>
                <Input
                  placeholder="e.g. CGK (Jakarta)"
                  value={data.lemb_name}
                  onChange={(e) => setData("lemb_name", e.target.value)}
                  className="mt-1.5"
                  error={missingFields.includes("lemb_name")}
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
              {processing ? "Saving..." : editingId ? "Update Station" : "Create Station"}
            </Button>
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
