import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { TechnologyManager } from "@/components/admin/technology-manager";

export default async function TechnologiesPage() {
  const categories = await prisma.technologyCategory.findMany({
    orderBy: { order: "asc" },
    include: { technologies: { orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <AdminHeader title="Technologies" text="Categories and skills shown in the public stack section. The starter list is editable and not a verified résumé." />
      <TechnologyManager
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          visible: category.visible,
          technologies: category.technologies.map((tech) => ({
            id: tech.id,
            name: tech.name,
            icon: tech.icon || "",
            url: tech.url || "",
            visible: tech.visible,
            categoryId: tech.categoryId,
          })),
        }))}
      />
    </div>
  );
}
