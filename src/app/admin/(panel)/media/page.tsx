import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { MediaLibrary } from "@/components/admin/media-library";

export default async function MediaPage() {
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <AdminHeader title="Media library" text="Upload JPG, PNG, WebP, or SVG files up to 5 MB. Images already used on the site cannot be deleted." />
      <MediaLibrary items={items.map((item) => ({ id: item.id, filename: item.filename, url: item.url, mimeType: item.mimeType, size: item.size, createdAt: item.createdAt.toISOString() }))} />
    </div>
  );
}
