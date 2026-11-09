"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { refreshSite } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";
import { projectSchema } from "@/lib/validators";
import { actionError, type ActionResult } from "@/lib/action";

export async function saveProject(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const data = projectSchema.parse(input);
    const slug = await uniqueProjectSlug(slugify(data.title), data.id);
    const payload = {
      title: data.title,
      slug,
      summary: data.description.slice(0, 400),
      description: data.description,
      thumbnailUrl: data.thumbnailUrl || null,
      published: true,
      featured: true,
    };
    const skills = data.technologyIds.map((technologyId) => ({ technologyId }));

    const record = data.id
      ? await prisma.project.update({
          where: { id: data.id },
          data: {
            ...payload,
            publishedAt: undefined,
            technologies: { deleteMany: {}, create: skills },
          },
        })
      : await prisma.project.create({
          data: {
            ...payload,
            publishedAt: new Date(),
            order: ((await prisma.project.findFirst({ orderBy: { order: "desc" } }))?.order ?? -1) + 1,
            technologies: { create: skills },
          },
        });

    refreshSite([`/projects/${slug}`, "/projects"]);
    return { ok: true, data: { id: record.id, slug } };
  } catch (error) {
    return actionError(error, "Could not save the project.");
  }
}

async function uniqueProjectSlug(base: string, id?: string) {
  const root = base || "project";
  let slug = root;
  let suffix = 2;
  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (!existing || existing.id === id) return slug;
    slug = `${root}-${suffix++}`;
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const project = await prisma.project.delete({ where: { id } });
    refreshSite([`/projects/${project.slug}`, "/projects"]);
    return { ok: true };
  } catch (error) {
    return actionError(error, "Could not delete the project.");
  }
}

export async function moveProject(id: string, direction: "up" | "down"): Promise<ActionResult> {
  try {
    await requireAdmin();
    const items = await prisma.project.findMany({ orderBy: { order: "asc" } });
    const ids = items.map((item) => item.id);
    const index = ids.indexOf(id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= ids.length) return { ok: true };
    const next = [...ids];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    await prisma.$transaction(next.map((itemId, order) => prisma.project.update({ where: { id: itemId }, data: { order } })));
    refreshSite(["/projects"]);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
