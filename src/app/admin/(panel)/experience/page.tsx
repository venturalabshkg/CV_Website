import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { ExperienceManager } from "@/components/admin/experience-manager";
import { dateInput } from "@/lib/utils";

export default async function ExperiencePage() {
  const [items, technologies] = await Promise.all([
    prisma.experience.findMany({ orderBy: { order: "asc" }, include: { technologies: true } }),
    prisma.technology.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <AdminHeader title="Experience" text="Leave this empty until you add real roles. The public page explains that nothing has been published yet." />
      <ExperienceManager
        technologies={technologies.map((tech) => ({ id: tech.id, name: tech.name }))}
        items={items.map((item) => ({
          id: item.id,
          company: item.company,
          title: item.title,
          employmentType: item.employmentType,
          location: item.location || "",
          startDate: dateInput(item.startDate),
          endDate: dateInput(item.endDate),
          current: item.current,
          description: item.description,
          responsibilities: item.responsibilities,
          logoUrl: item.logoUrl || "",
          visible: item.visible,
          technologyIds: item.technologies.map((tech) => tech.technologyId),
        }))}
      />
    </div>
  );
}
