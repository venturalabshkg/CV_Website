import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { ProjectForm } from "@/components/admin/project-form";

export default async function NewProjectPage() {
  const technologies = await prisma.technology.findMany({ orderBy: { name: "asc" }, include: { category: true } });

  return (
    <div>
      <AdminHeader title="New project" text="Add a title, description, skills, and a portfolio image." />
      <ProjectForm
        technologies={technologies.map((tech) => ({ id: tech.id, name: tech.name, category: tech.category.name }))}
        project={{
          title: "",
          description: "",
          thumbnailUrl: "",
          technologyIds: [],
        }}
      />
    </div>
  );
}
