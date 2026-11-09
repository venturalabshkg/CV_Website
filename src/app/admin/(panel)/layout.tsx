import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-bg text-fg md:grid md:grid-cols-[230px_1fr]">
      <AdminNav email={user.email} />
      <div className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}
