import AuthenticatedLayout from "../../Layouts/AuthenticatedLayout";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserMetaCard from "./UserMetaCard";
import UserInfoCard from "./UserInfoCard";

export default function Edit({ user }: any) {
  return (
    <AuthenticatedLayout>
      <PageMeta
        title="Pengaturan Akun | E-Surat"
        description="Halaman Pengaturan Akun"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard user={user} />
          <UserInfoCard user={user} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
