"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { refreshSite } from "@/lib/revalidate";
import { parseDate, readingTime, slugify } from "@/lib/utils";
import { blogSchema } from "@/lib/validators";
import { actionError, type ActionResult } from "@/lib/action";

export async function savePost(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const data = blogSchema.parse(input);
    const slug = slugify(data.slug || data.title);
    const tags = await Promise.all(
      data.tags.map(async (name) => {
        const tagSlug = slugify(name);
        return prisma.blogTag.upsert({
          where: { slug: tagSlug },
          create: { name, slug: tagSlug },
          update: { name },
        });
      }),
    );

    const payload = {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverUrl: data.coverUrl || null,
      published: data.published,
      featured: data.featured,
      readingTime: readingTime(data.content),
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      categoryId: data.categoryId || null,
      publishedAt: data.published ? parseDate(data.publishedAt) ?? new Date() : null,
    };

    const record = data.id
      ? await prisma.blogPost.update({
          where: { id: data.id },
          data: {
            ...payload,
            tags: {
              deleteMany: {},
              create: tags.map((tag) => ({ tagId: tag.id })),
            },
          },
        })
      : await prisma.blogPost.create({
          data: {
            ...payload,
            tags: { create: tags.map((tag) => ({ tagId: tag.id })) },
          },
        });

    refreshSite([`/blog/${slug}`, "/blog"]);
    return { ok: true, data: { id: record.id, slug } };
  } catch (error) {
    return actionError(error, "Could not save the article.");
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const post = await prisma.blogPost.delete({ where: { id } });
    refreshSite([`/blog/${post.slug}`, "/blog"]);
    return { ok: true };
  } catch (error) {
    return actionError(error, "Could not delete the article.");
  }
}
