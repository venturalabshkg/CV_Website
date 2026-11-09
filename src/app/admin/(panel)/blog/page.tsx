import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/nav";
import { deletePost } from "@/actions/blog";
import { deleteBlogCategory, deleteBlogTag, saveBlogCategory } from "@/actions/content";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { formatDate } from "@/lib/utils";

export default async function BlogAdminPage() {
  const [posts, categories, tags] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true } }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.blogTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <AdminHeader title="Blog" text="Write in Markdown. Drafts are only visible while you are signed in." action={<Link href="/admin/blog/new" className="on-fg px-3 py-2 text-sm">New article</Link>} />
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-line font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-3 py-2 font-normal">Title</th>
              <th className="px-3 py-2 font-normal">Status</th>
              <th className="px-3 py-2 font-normal">Date</th>
              <th className="px-3 py-2 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-line">
                <td className="px-3 py-3">
                  <Link href={`/admin/blog/${post.id}`} className="underline underline-offset-4">{post.title}</Link>
                  <p className="text-xs text-muted">{post.category?.name}</p>
                </td>
                <td className="px-3 py-3">{post.published ? "Published" : "Draft"}</td>
                <td className="px-3 py-3 text-muted">{post.publishedAt ? formatDate(post.publishedAt) : "—"}</td>
                <td className="px-3 py-3">
                  <ConfirmButton action={deletePost.bind(null, post.id)} label="Delete" message={`Delete ${post.title}?`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-lg tracking-tight">Categories</h2>
          <ul className="mt-3 border-t border-line">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between border-b border-line py-2 text-sm">
                {category.name}
                <ConfirmButton action={deleteBlogCategory.bind(null, category.id)} label="Delete" message={`Delete the ${category.name} category?`} />
              </li>
            ))}
          </ul>
          <form className="mt-3 flex gap-2" action={async (formData) => { "use server"; await saveBlogCategory({ name: String(formData.get("name") || "") }); }}>
            <input name="name" required placeholder="New category" className="w-full border border-line bg-transparent px-3 py-2 text-sm" />
            <button className="border border-line px-3 text-sm">Add</button>
          </form>
        </section>
        <section>
          <h2 className="text-lg tracking-tight">Tags</h2>
          <ul className="mt-3 border-t border-line">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between border-b border-line py-2 text-sm">
                {tag.name}
                <ConfirmButton action={deleteBlogTag.bind(null, tag.id)} label="Delete" message={`Delete the ${tag.name} tag?`} />
              </li>
            ))}
            {tags.length === 0 && <li className="py-2 text-sm text-muted">Tags are created when you save an article.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
