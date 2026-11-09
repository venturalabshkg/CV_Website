import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFrame } from "@/components/public/frame";
import { ShareLinks } from "@/components/public/share-links";
import { getPublicPortfolio, postInclude } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Article" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: { images: post.coverUrl ? [post.coverUrl] : undefined },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [data, post, session] = await Promise.all([
    getPublicPortfolio(),
    prisma.blogPost.findUnique({ where: { slug }, include: postInclude }),
    getSession(),
  ]);
  if (!post || (!post.published && !session)) notFound();

  const related = data.posts.filter((item) => item.slug !== post.slug && item.categoryId === post.categoryId).slice(0, 3);

  return (
    <SiteFrame data={data}>
      <article className="px-5 py-10">
        <Link href="/blog" className="font-mono text-[11px] text-muted hover:text-fg">All articles</Link>
        {!post.published && <p className="mt-4 inline-block border border-line px-2 py-1 font-mono text-[11px]">Draft preview</p>}
        <p className="mt-4 font-mono text-[11px] text-muted">
          {post.category?.name ? `${post.category.name} · ` : ""}
          {post.publishedAt ? formatDate(post.publishedAt) : "Unpublished"} · {post.readingTime} min read
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{post.excerpt}</p>
        {post.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverUrl} alt="" className="mt-8 max-h-[460px] w-full border border-line object-cover" />
        )}
        <div className="prose-custom mt-8 max-w-3xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag.tagId} className="border border-line px-2 py-1 font-mono text-[11px] text-muted">{tag.tag.name}</span>
          ))}
        </div>
        <div className="mt-8">
          <ShareLinks title={post.title} path={`/blog/${post.slug}`} />
        </div>
        {related.length > 0 && (
          <aside className="mt-12 border-t border-line pt-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Related</h2>
            <ul className="mt-3">
              {related.map((item) => (
                <li key={item.id} className="border-b border-line py-3">
                  <Link href={`/blog/${item.slug}`} className="hover:underline">{item.title}</Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </SiteFrame>
  );
}
