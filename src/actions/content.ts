"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { refreshSite } from "@/lib/revalidate";
import { parseDate, slugify } from "@/lib/utils";
import {
  categorySchema,
  educationSchema,
  experienceSchema,
  namedSchema,
  profileSchema,
  settingsSchema,
  socialSchema,
  technologySchema,
} from "@/lib/validators";
import { actionError, type ActionResult } from "@/lib/action";

export async function saveProfile(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = profileSchema.parse(input);
    await prisma.profile.upsert({
      where: { id: "profile" },
      create: { id: "profile", ...blankToNull(data) },
      update: blankToNull(data),
    });
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error, "Could not save the profile.");
  }
}

function blankToNull<T extends { avatarUrl?: string; resumeUrl?: string; githubUsername?: string; linkedinUrl?: string }>(
  data: T,
) {
  return {
    ...data,
    avatarUrl: data.avatarUrl || null,
    resumeUrl: data.resumeUrl || null,
    githubUsername: data.githubUsername || null,
    linkedinUrl: data.linkedinUrl || null,
  };
}

export async function saveSettings(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = settingsSchema.parse(input);
    await prisma.websiteSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...data, faviconUrl: data.faviconUrl || null, ogImageUrl: data.ogImageUrl || null },
      update: { ...data, faviconUrl: data.faviconUrl || null, ogImageUrl: data.ogImageUrl || null },
    });
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error, "Could not save settings.");
  }
}

export async function saveTechnologyCategory(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = categorySchema.parse(input);
    const slug = slugify(data.name);
    if (data.id) {
      await prisma.technologyCategory.update({
        where: { id: data.id },
        data: { name: data.name, slug, visible: data.visible ?? true },
      });
    } else {
      const last = await prisma.technologyCategory.findFirst({ orderBy: { order: "desc" } });
      await prisma.technologyCategory.create({
        data: { name: data.name, slug, visible: data.visible ?? true, order: (last?.order ?? -1) + 1 },
      });
    }
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error, "Could not save the category.");
  }
}

export async function deleteTechnologyCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const count = await prisma.technology.count({ where: { categoryId: id } });
    if (count > 0) return { ok: false, error: "Move or delete the technologies in this category first." };
    await prisma.technologyCategory.delete({ where: { id } });
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error, "Could not delete the category.");
  }
}

export async function moveTechnologyCategory(id: string, direction: "up" | "down"): Promise<ActionResult> {
  try {
    await requireAdmin();
    const items = await prisma.technologyCategory.findMany({ orderBy: { order: "asc" } });
    const next = moveIds(items.map((item) => item.id), id, direction);
    await prisma.$transaction(next.map((itemId, order) => prisma.technologyCategory.update({ where: { id: itemId }, data: { order } })));
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveTechnology(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = technologySchema.parse(input);
    const slug = slugify(data.name);
    const payload = {
      name: data.name,
      slug,
      icon: data.icon || null,
      url: data.url || null,
      categoryId: data.categoryId,
      visible: data.visible,
    };
    if (data.id) {
      await prisma.technology.update({ where: { id: data.id }, data: payload });
    } else {
      const last = await prisma.technology.findFirst({
        where: { categoryId: data.categoryId },
        orderBy: { order: "desc" },
      });
      await prisma.technology.create({ data: { ...payload, order: (last?.order ?? -1) + 1 } });
    }
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error, "Could not save the technology.");
  }
}

export async function deleteTechnology(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.technology.delete({ where: { id } });
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error, "Could not delete the technology.");
  }
}

export async function moveTechnology(id: string, direction: "up" | "down"): Promise<ActionResult> {
  try {
    await requireAdmin();
    const current = await prisma.technology.findUnique({ where: { id } });
    if (!current) return { ok: false, error: "Technology not found." };
    const items = await prisma.technology.findMany({
      where: { categoryId: current.categoryId },
      orderBy: { order: "asc" },
    });
    const next = moveIds(items.map((item) => item.id), id, direction);
    await prisma.$transaction(next.map((itemId, order) => prisma.technology.update({ where: { id: itemId }, data: { order } })));
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveExperience(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = experienceSchema.parse(input);
    const payload = {
      company: data.company,
      title: data.title,
      employmentType: data.employmentType,
      location: data.location || null,
      startDate: parseDate(data.startDate) ?? new Date(),
      endDate: data.current ? null : parseDate(data.endDate),
      current: data.current,
      description: data.description,
      responsibilities: data.responsibilities,
      logoUrl: data.logoUrl || null,
      visible: data.visible,
    };
    const id = data.id
      ? (
          await prisma.experience.update({
            where: { id: data.id },
            data: {
              ...payload,
              technologies: {
                deleteMany: {},
                create: data.technologyIds.map((technologyId) => ({ technologyId })),
              },
            },
          })
        ).id
      : (
          await prisma.experience.create({
            data: {
              ...payload,
              order: ((await prisma.experience.findFirst({ orderBy: { order: "desc" } }))?.order ?? -1) + 1,
              technologies: { create: data.technologyIds.map((technologyId) => ({ technologyId })) },
            },
          })
        ).id;
    refreshSite();
    return { ok: true, data: { id } };
  } catch (error) {
    return actionError(error, "Could not save experience.");
  }
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.experience.delete({ where: { id } });
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function moveExperience(id: string, direction: "up" | "down"): Promise<ActionResult> {
  try {
    await requireAdmin();
    const items = await prisma.experience.findMany({ orderBy: { order: "asc" } });
    const next = moveIds(items.map((item) => item.id), id, direction);
    await prisma.$transaction(next.map((itemId, order) => prisma.experience.update({ where: { id: itemId }, data: { order } })));
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveEducation(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = educationSchema.parse(input);
    const payload = {
      institution: data.institution,
      degree: data.degree,
      field: data.field,
      startDate: parseDate(data.startDate),
      endDate: parseDate(data.endDate),
      description: data.description,
      logoUrl: data.logoUrl || null,
      visible: data.visible,
    };
    const record = data.id
      ? await prisma.education.update({ where: { id: data.id }, data: payload })
      : await prisma.education.create({
          data: {
            ...payload,
            order: ((await prisma.education.findFirst({ orderBy: { order: "desc" } }))?.order ?? -1) + 1,
          },
        });
    refreshSite();
    return { ok: true, data: { id: record.id } };
  } catch (error) {
    return actionError(error, "Could not save education.");
  }
}

export async function deleteEducation(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.education.delete({ where: { id } });
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function moveEducation(id: string, direction: "up" | "down"): Promise<ActionResult> {
  try {
    await requireAdmin();
    const items = await prisma.education.findMany({ orderBy: { order: "asc" } });
    const next = moveIds(items.map((item) => item.id), id, direction);
    await prisma.$transaction(next.map((itemId, order) => prisma.education.update({ where: { id: itemId }, data: { order } })));
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveSocial(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = socialSchema.parse(input);
    const payload = {
      platform: data.platform,
      label: data.label,
      url: data.url,
      icon: data.icon,
      visible: data.visible,
    };
    if (data.id) {
      await prisma.socialLink.update({ where: { id: data.id }, data: payload });
    } else {
      const last = await prisma.socialLink.findFirst({ orderBy: { order: "desc" } });
      await prisma.socialLink.create({ data: { ...payload, order: (last?.order ?? -1) + 1 } });
    }
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error, "Could not save the social link.");
  }
}

export async function deleteSocial(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.socialLink.delete({ where: { id } });
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function moveSocial(id: string, direction: "up" | "down"): Promise<ActionResult> {
  try {
    await requireAdmin();
    const items = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
    const next = moveIds(items.map((item) => item.id), id, direction);
    await prisma.$transaction(next.map((itemId, order) => prisma.socialLink.update({ where: { id: itemId }, data: { order } })));
    refreshSite();
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveProjectCategory(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = namedSchema.parse(input);
    const slug = slugify(data.name);
    if (data.id) await prisma.projectCategory.update({ where: { id: data.id }, data: { name: data.name, slug } });
    else {
      const last = await prisma.projectCategory.findFirst({ orderBy: { order: "desc" } });
      await prisma.projectCategory.create({ data: { name: data.name, slug, order: (last?.order ?? -1) + 1 } });
    }
    refreshSite(["/projects"]);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteProjectCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.projectCategory.delete({ where: { id } });
    refreshSite(["/projects"]);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveBlogCategory(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = namedSchema.parse(input);
    const slug = slugify(data.name);
    if (data.id) await prisma.blogCategory.update({ where: { id: data.id }, data: { name: data.name, slug } });
    else await prisma.blogCategory.create({ data: { name: data.name, slug } });
    refreshSite(["/blog"]);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteBlogCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.blogCategory.delete({ where: { id } });
    refreshSite(["/blog"]);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteBlogTag(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.blogTag.delete({ where: { id } });
    refreshSite(["/blog"]);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

function moveIds(ids: string[], id: string, direction: "up" | "down") {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return ids;
  const next = [...ids];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}
