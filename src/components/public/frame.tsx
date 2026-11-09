import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { SocialIcon } from "@/components/public/icons";
import type { PaletteItem } from "@/components/public/command-palette";
import type { getPublicPortfolio } from "@/lib/queries";

type Portfolio = Awaited<ReturnType<typeof getPublicPortfolio>>;

export function paletteFor(data: Portfolio): PaletteItem[] {
  const profile = data.profile;
  const items: PaletteItem[] = [
    { id: "overview", group: "Navigate", label: "Overview", href: "/#overview" },
    { id: "about", group: "Navigate", label: "About", href: "/#about" },
    { id: "stack", group: "Navigate", label: "Technologies", href: "/#stack" },
    { id: "experience", group: "Navigate", label: "Experience", href: "/#experience" },
    { id: "projects", group: "Navigate", label: "Projects", href: "/projects" },
    { id: "blog", group: "Navigate", label: "Blog", href: "/blog" },
    { id: "education", group: "Navigate", label: "Education", href: "/#education" },
    { id: "theme-dark", group: "Theme", label: "Use dark theme", action: "theme-dark" },
    { id: "theme-light", group: "Theme", label: "Use light theme", action: "theme-light" },
  ];
  if (profile?.email) items.push({ id: "email", group: "Contact", label: "Email", hint: profile.email, href: `mailto:${profile.email}`, external: true });
  for (const social of data.socials) {
    items.push({ id: social.id, group: "Contact", label: social.label, hint: social.platform, href: social.url, external: true });
  }
  for (const project of data.projects) {
    items.push({ id: project.id, group: "Projects", label: project.title, hint: project.category?.name, href: `/projects/${project.slug}` });
  }
  for (const post of data.posts) {
    items.push({ id: post.id, group: "Blog", label: post.title, href: `/blog/${post.slug}` });
  }
  return items;
}

export function SiteFrame({ data, children }: { data: Portfolio; children: React.ReactNode }) {
  const settings = data.settings;
  const profile = data.profile;
  if (!settings || !profile) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Setup</p>
        <h1 className="mt-3 text-3xl tracking-tight">The database is not ready.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Run <code className="font-mono">npm run setup</code> from the project folder, then reload this page.</p>
      </main>
    );
  }

  const firstName = profile.fullName.split(" ")[0] || settings.siteName;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="mx-auto min-h-screen max-w-6xl border-x border-line">
        <SiteHeader logo={settings.logoText.slice(0, 4)} items={paletteFor(data)} />
        <main>{children}</main>
        <footer className="border-t border-line">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
            <div className="space-y-1">
              <a className="text-sm hover:underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              <p className="font-mono text-[11px] text-muted">{settings.footerNote}</p>
            </div>
            <div className="flex items-center gap-2">
              {data.socials.map((social) => (
                <a key={social.id} href={social.url} target={social.url.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" aria-label={social.label} className="grid size-9 place-items-center border border-line hover:bg-chip">
                  <SocialIcon name={social.icon} className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-3 font-mono text-[11px] text-muted">
            <p>© {new Date().getFullYear()} {profile.fullName}</p>
            <a href="#top" className="inline-flex items-center gap-1 hover:text-fg">
              <ArrowUp className="size-3" /> Back to top
            </a>
          </div>
          <div className="overflow-hidden border-t border-line px-4 py-6">
            <p className="wordmark text-[18vw] font-medium sm:text-[9.5rem]">{firstName}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
