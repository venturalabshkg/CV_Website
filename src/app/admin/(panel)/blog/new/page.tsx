import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { BlogForm } from "@/components/admin/blog-form";

export default async function NewPostPage() {
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <AdminHeader title="New article" text="Markdown is stored as written and rendered safely on the public page." />
      <BlogForm
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        post={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverUrl: "",
          published: false,
          featured: false,
          publishedAt: "",
          seoTitle: "",
          seoDescription: "",
          categoryId: "",
          tags: "",
        }}
      />
    </div>
  );
}
