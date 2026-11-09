"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export type BlogCard = {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl?: string | null;
  publishedAt?: string | null;
  readingTime: number;
  category?: string | null;
  tags: string[];
  featured: boolean;
};

export function BlogBrowser({ posts }: { posts: BlogCard[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tag, setTag] = useState("All");
  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category).filter((item): item is string => Boolean(item))))];
  const tags = ["All", ...Array.from(new Set(posts.flatMap((post) => post.tags)))];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesQuery = !needle || `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase().includes(needle);
      const matchesCategory = category === "All" || post.category === category;
      const matchesTag = tag === "All" || post.tags.includes(tag);
      return matchesQuery && matchesCategory && matchesTag;
    });
  }, [posts, query, category, tag]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 border border-line p-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles"
          className="w-full bg-transparent px-2 py-1.5 text-sm outline-none"
          aria-label="Search articles"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent px-2 py-1.5 text-sm outline-none" aria-label="Filter by category">
          {categories.map((item) => (
            <option key={item} value={item}>{item === "All" ? "All categories" : item}</option>
          ))}
        </select>
        <select value={tag} onChange={(event) => setTag(event.target.value)} className="bg-transparent px-2 py-1.5 text-sm outline-none" aria-label="Filter by tag">
          {tags.map((item) => (
            <option key={item} value={item}>{item === "All" ? "All tags" : item}</option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted">No articles match that filter.</p>
      ) : (
        <ul className="border-t border-line">
          {filtered.map((post) => (
            <li key={post.slug} className="border-b border-line">
              <Link href={`/blog/${post.slug}`} className="grid gap-4 py-5 sm:grid-cols-[140px_1fr] sm:items-center">
                {post.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverUrl} alt="" className="h-24 w-full border border-line object-cover sm:h-20" />
                ) : (
                  <span className="hidden h-20 border border-line hatch sm:block" />
                )}
                <span>
                  <span className="font-mono text-[11px] text-muted">
                    {post.category ? `${post.category} · ` : ""}
                    {post.publishedAt ? formatDate(post.publishedAt) : "Undated"} · {post.readingTime} min
                    {post.featured ? " · Featured" : ""}
                  </span>
                  <span className="mt-1 block text-lg tracking-tight">{post.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted">{post.excerpt}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
