import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { EducationManager } from "@/components/admin/education-manager";
import { dateInput } from "@/lib/utils";

export default async function EducationPage() {
  const items = await prisma.education.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <AdminHeader title="Education" text="Add only institutions and dates you want displayed." />
      <EducationManager
        items={items.map((item) => ({
          id: item.id,
          institution: item.institution,
          degree: item.degree,
          field: item.field,
          startDate: dateInput(item.startDate),
          endDate: dateInput(item.endDate),
          description: item.description,
          logoUrl: item.logoUrl || "",
          visible: item.visible,
        }))}
      />
    </div>
  );
}
