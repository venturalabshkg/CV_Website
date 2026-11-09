import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { ProjectForm } from "@/components/admin/project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, technologies] = await Promise.all([
    prisma.project.findUnique({ where: { id }, include: { technologies: true } }),
    prisma.technology.findMany({ orderBy: { name: "asc" }, include: { category: true } }),
  ]);
  if (!project) notFound();

  return (
    <div>
      <AdminHeader title={project.title} text="Title, description, skills, and the portfolio image are what appear on the site." />
      <ProjectForm
        technologies={technologies.map((tech) => ({ id: tech.id, name: tech.name, category: tech.category.name }))}
        project={{
          id: project.id,
          title: project.title,
          description: project.description,
          thumbnailUrl: project.thumbnailUrl || "",
          technologyIds: project.technologies.map((tech) => tech.technologyId),
        }}
      />
    </div>
  );
}
