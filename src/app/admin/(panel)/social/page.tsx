import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { SocialManager } from "@/components/admin/social-manager";

export default async function SocialPage() {
  const items = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <AdminHeader title="Social links" text="These appear in the profile, footer, and command palette." />
      <SocialManager items={items.map((item) => ({ id: item.id, platform: item.platform, label: item.label, url: item.url, icon: item.icon, visible: item.visible }))} />
    </div>
  );
}
