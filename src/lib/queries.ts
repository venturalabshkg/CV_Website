import { prisma } from "@/lib/db";

export async function getSettings() {
  return prisma.websiteSettings.findUnique({ where: { id: "default" } });
}

export async function getProfile() {
  return prisma.profile.findUnique({ where: { id: "profile" } });
}

export async function getPublicPortfolio() {
  const [settings, profile, categories, experiences, projects, posts, education, socials] = await Promise.all([
    getSettings(),
    getProfile(),
    prisma.technologyCategory.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      include: {
        technologies: { where: { visible: true }, orderBy: { order: "asc" } },
      },
    }),
    prisma.experience.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      include: { technologies: { include: { technology: true } } },
    }),
    prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        technologies: { include: { technology: true } },
      },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: { category: true, tags: { include: { tag: true } } },
    }),
    prisma.education.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    prisma.socialLink.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
  ]);

  return {
    settings,
    profile,
    categories: categories.filter((category) => category.technologies.length > 0),
    experiences,
    projects,
    posts,
    education,
    socials,
  };
}

export const projectInclude = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  technologies: { include: { technology: true } },
};

export const postInclude = {
  category: true,
  tags: { include: { tag: true } },
};
