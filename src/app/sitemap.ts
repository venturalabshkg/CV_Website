import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [projects, posts] = await Promise.all([
    prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/projects`, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    ...projects.map((project) => ({ url: `${base}/projects/${project.slug}`, lastModified: project.updatedAt })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.updatedAt })),
  ];
}
