import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { deleteProject, moveProject } from "@/actions/projects";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { revalidatePath } from "next/cache";

export default async function ProjectsAdminPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <AdminHeader title="Projects" text="Each project shows a title, description, skills, and portfolio image." action={<Link href="/admin/projects/new" className="on-fg px-3 py-2 text-sm">New project</Link>} />
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-line font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-3 py-2 font-normal">Title</th>
              <th className="px-3 py-2 font-normal">Order</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-line">
                <td className="px-3 py-3">
                  <Link href={`/admin/projects/${project.id}`} className="underline underline-offset-4">{project.title}</Link>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <form action={async () => { "use server"; await moveProject(project.id, "up"); revalidatePath("/admin/projects"); }}><button className="text-xs">Up</button></form>
                    <form action={async () => { "use server"; await moveProject(project.id, "down"); revalidatePath("/admin/projects"); }}><button className="text-xs">Down</button></form>
                    <ConfirmButton action={deleteProject.bind(null, project.id)} label="Delete" message={`Delete ${project.title}? This cannot be undone.`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
