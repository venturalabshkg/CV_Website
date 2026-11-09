import type { Metadata } from "next";
import { SiteFrame } from "@/components/public/frame";
import { BlogBrowser } from "@/components/public/blog-browser";
import { getPublicPortfolio } from "@/lib/queries";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const data = await getPublicPortfolio();
  return (
    <SiteFrame data={data}>
      <div className="px-5 py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Writing</p>
        <h1 className="mt-2 text-4xl tracking-tight">Blog</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Notes on software, applied AI, and the systems around them.</p>
        <div className="mt-8">
          <BlogBrowser
            posts={data.posts.map((post) => ({
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              coverUrl: post.coverUrl,
              publishedAt: post.publishedAt?.toISOString() ?? null,
              readingTime: post.readingTime,
              category: post.category?.name,
              tags: post.tags.map((tag) => tag.tag.name),
              featured: post.featured,
            }))}
          />
        </div>
      </div>
    </SiteFrame>
  );
}
