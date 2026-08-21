import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { useModal } from "../../Hooks/useModal";
import { Modal } from "../../components/UI/modal";
import Button from "../../components/UI/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

export default function UserMetaCard({ user }: { user: any }) {
  const { isOpen, openModal, closeModal } = useModal();
  
  const { data, setData, post, processing, errors, clearErrors } = useForm({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    avatar: null as File | null,
    remove_avatar: false,
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [previewUrl, setPreviewUrl] = useState<string>(user.avatar ? `/storage/${user.avatar}` : "");

  useEffect(() => {
    if (isOpen) {
      setData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: null,
        remove_avatar: false,
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setPreviewUrl(user.avatar ? `/storage/${user.avatar}` : "");
      clearErrors();
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData("avatar", file);
      setPreviewUrl(URL.createObjectURL(file));
      setData("remove_avatar", false);
    }
  };

  const handleRemovePhoto = () => {
    setData("avatar", null);
    setPreviewUrl("");
    setData("remove_avatar", true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("profile.update"), {
      preserveScroll: true,
      onSuccess: () => {
        closeModal();
      },
    });
  };

  const nameParts = (user?.name || "User").split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-row items-center w-full gap-6">
            {user?.avatar ? (
              <img
                src={`/storage/${user.avatar}`}
                alt="User Profile"
                className="h-20 w-20 shrink-0 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[28px] font-medium text-white">
                {(firstName?.[0] || "U").toUpperCase()}{(lastName?.[0] || "").toUpperCase()}
              </div>
            )}
            <div className="flex-grow">
              <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                {user?.name || "User Name"}
              </h4>
              <div className="flex flex-row items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <p className="capitalize">
                  {user?.role?.name || "-"}
                </p>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <p>
                  {user?.lembaga ? user.lembaga.lemb_name : "-"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Pengaturan Akun
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Perbarui detail profil Anda di bawah ini.
            </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col">
            <div className="custom-scrollbar overflow-y-auto px-2 pb-3 max-h-[60vh]">
              
              {/* Profile Photos Section */}
              <div className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
                <h5 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Foto Profil
                </h5>
                <div className="flex items-center gap-5">
                  <div className="relative h-20 w-20 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[28px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800">
                        {data.name ? data.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex gap-3">
                      <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                        <span>Upload Baru</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      {previewUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 dark:border-red-900/30 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-950/20"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    {errors.avatar && <p className="mt-2 text-xs text-red-500">{errors.avatar}</p>}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      JPG, GIF atau PNG. Maksimal 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Informasi Personal
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nama Lengkap</Label>
                    <Input 
                      type="text" 
                      value={data.name} 
                      onChange={(e: any) => setData("name", e.target.value)} 
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      value={data.email} 
                      onChange={(e: any) => setData("email", e.target.value)} 
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nomor Telepon</Label>
                    <Input 
                      type="text" 
                      value={data.phone} 
                      onChange={(e: any) => setData("phone", e.target.value)} 
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                  
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Role / Status</Label>
                    <Input 
                      type="text" 
                      value={`${user?.role?.name || "-"} / ${user?.status || "-"}`} 
                      disabled 
                    />
                  </div>
                </div>
              </div>
              
              {/* Password Section */}
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Ubah Kata Sandi
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Kata Sandi Saat Ini</Label>
                    <Input 
                      type="password" 
                      value={data.current_password} 
                      onChange={(e: any) => setData("current_password", e.target.value)} 
                      placeholder="Masukkan jika ingin mengubah kata sandi"
                    />
                    {errors.current_password && <p className="mt-1 text-xs text-red-500">{errors.current_password}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Kata Sandi Baru</Label>
                    <Input 
                      type="password" 
                      value={data.password} 
                      onChange={(e: any) => setData("password", e.target.value)} 
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Konfirmasi Kata Sandi Baru</Label>
                    <Input 
                      type="password" 
                      value={data.password_confirmation} 
                      onChange={(e: any) => setData("password_confirmation", e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={processing}>
                Tutup
              </Button>
              <button type="submit" disabled={processing} className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50">
                {processing ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
