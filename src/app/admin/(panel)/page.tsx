import Link from "next/link";
import { prisma } from "@/lib/db";
import { getProfile } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/nav";

export default async function DashboardPage() {
  const [projects, posts, experiences, education, profile, media] = await Promise.all([
    prisma.project.findMany({ select: { published: true } }),
    prisma.blogPost.findMany({ select: { published: true } }),
    prisma.experience.count(),
    prisma.education.count(),
    getProfile(),
    prisma.media.count(),
  ]);

  const checks = [
    Boolean(profile && profile.fullName !== "Your Name"),
    Boolean(profile?.avatarUrl),
    Boolean(profile?.githubUsername),
    Boolean(profile?.about && profile.about.length > 80),
    projects.some((project) => project.published),
    experiences > 0,
    education > 0,
    posts.some((post) => post.published),
  ];
  const complete = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const publishedProjects = projects.filter((project) => project.published).length;
  const publishedPosts = posts.filter((post) => post.published).length;

  const stats = [
    ["Projects", projects.length],
    ["Published projects", publishedProjects],
    ["Draft projects", projects.length - publishedProjects],
    ["Articles", posts.length],
    ["Published articles", publishedPosts],
    ["Draft articles", posts.length - publishedPosts],
    ["Experience records", experiences],
    ["Media files", media],
  ];

  return (
    <div>
      <AdminHeader title="Dashboard" text="Everything on the public site is edited from these sections." />
      <div className="mb-8 border border-line p-4">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Profile completion</p>
          <p className="font-mono text-sm">{complete}%</p>
        </div>
        <div className="mt-3 h-1.5 bg-chip">
          <div className="h-full bg-fg" style={{ width: `${complete}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted">Add a name, portrait, GitHub username, about text, experience, education, and at least one published project and article.</p>
      </div>
      <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-bg p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
            <p className="mt-2 text-3xl tracking-tight">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/projects/new" className="on-fg px-3 py-2 text-sm">Add project</Link>
        <Link href="/admin/blog/new" className="border border-line px-3 py-2 text-sm">Write article</Link>
        <Link href="/admin/profile" className="border border-line px-3 py-2 text-sm">Update profile</Link>
        <Link href="/admin/experience" className="border border-line px-3 py-2 text-sm">Add experience</Link>
      </div>
    </div>
  );
}
