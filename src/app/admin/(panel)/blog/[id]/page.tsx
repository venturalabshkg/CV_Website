import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { BlogForm } from "@/components/admin/blog-form";
import { dateInput } from "@/lib/utils";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <div>
      <AdminHeader title={post.title} text="Preview the public page before you publish." />
      <BlogForm
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverUrl: post.coverUrl || "",
          published: post.published,
          featured: post.featured,
          publishedAt: dateInput(post.publishedAt),
          seoTitle: post.seoTitle || "",
          seoDescription: post.seoDescription || "",
          categoryId: post.categoryId || "",
          tags: post.tags.map((tag) => tag.tag.name).join(", "),
        }}
      />
    </div>
  );
}
