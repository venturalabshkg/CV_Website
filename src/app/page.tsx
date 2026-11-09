import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { SiteFrame } from "@/components/public/frame";
import { GithubGraph } from "@/components/public/github-graph";
import { CopyButton, LocalTime } from "@/components/public/meta";
import { ExperienceList } from "@/components/public/experience-list";
import { SocialIcon } from "@/components/public/icons";
import { getPublicPortfolio } from "@/lib/queries";
import { getContributions } from "@/lib/github";
import { formatMonth, lines } from "@/lib/utils";

export default async function HomePage() {
  const data = await getPublicPortfolio();
  const profile = data.profile;
  const settings = data.settings;
  const graph = profile ? await getContributions(profile.githubUsername) : null;
  const projects = data.projects.slice(0, 6);
  const posts = data.posts.slice(0, 4);

  return (
    <SiteFrame data={data}>
      <div id="top">
        {settings?.showOverview !== false && profile && (
          <section id="overview" className="scroll-mt-16">
            <div className="relative overflow-hidden border-b border-line">
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
                  backgroundSize: "72px 72px",
                  maskImage: "linear-gradient(to bottom, black, transparent 85%)",
                }}
              />
              <div className="relative grid gap-8 px-5 py-10 lg:grid-cols-[auto_1fr] lg:items-end">
                <div className="relative size-28 shrink-0 border border-line bg-bg sm:size-36">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={profile.fullName} className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center font-mono text-2xl">{profile.initials}</span>
                  )}
                  <span className="absolute -left-px -top-px size-2 border-l border-t border-fg" />
                  <span className="absolute -bottom-px -right-px size-2 border-b border-r border-fg" />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">01 — Profile</p>
                  <h1 className="mt-3 text-4xl tracking-tight sm:text-6xl">{profile.fullName}</h1>
                  <p className="mt-3 max-w-xl text-muted">{profile.title}</p>
                </div>
              </div>
            </div>
            <div className="hatch h-8 border-b border-line" />
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">
              <span className="mr-2 font-mono text-[11px] text-muted">Links</span>
              {data.socials.map((social) => (
                <a key={social.id} href={social.url} aria-label={social.label} target={social.url.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" className="grid size-9 place-items-center border border-line hover:bg-chip">
                  <SocialIcon name={social.icon} className="size-4" />
                </a>
              ))}
            </div>
            <div className="grid border-b border-line md:grid-cols-2">
              <div className="space-y-3 px-5 py-5 text-sm">
                <p className="flex items-center gap-2"><span className="font-mono text-muted">{"</>"}</span> {profile.title}</p>
                <p className="flex items-center gap-2 text-muted"><MapPin className="size-4" /> {profile.location}</p>
                <p className="flex flex-wrap items-center gap-3">
                  <Mail className="size-4 text-muted" />
                  <a className="hover:underline" href={`mailto:${profile.email}`}>{profile.email}</a>
                  <CopyButton value={profile.email} />
                </p>
              </div>
              <div className="flex items-center gap-4 border-t border-line px-5 py-5 md:border-l md:border-t-0">
                <span className={`size-2 rounded-full ${profile.availableForWork ? "bg-accent" : "bg-muted"}`} />
                <div>
                  <p className="text-sm">{profile.availability}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted">
                    <LocalTime timeZone={profile.timezone} /> · {profile.timezone}
                  </p>
                </div>
              </div>
            </div>
            <p className="max-w-3xl px-5 py-8 text-base leading-7 text-muted sm:text-lg">{profile.introduction}</p>
          </section>
        )}

        {settings?.showGithub !== false && (
          <section className="border-t border-line px-5 py-8">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">02 — GitHub activity</h2>
              {profile?.githubUsername && (
                <a className="font-mono text-[11px] text-muted hover:text-fg" href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer">
                  @{profile.githubUsername}
                </a>
              )}
            </div>
            <GithubGraph graph={graph} />
          </section>
        )}

        {settings?.showAbout !== false && profile && (
          <section id="about" className="scroll-mt-16 border-t border-line px-5 py-10">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">03 — About</h2>
            <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-7">
              {lines(profile.about).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} className="mt-6 inline-flex items-center gap-1 text-sm underline underline-offset-4">
                Resume <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </section>
        )}

        {settings?.showStack !== false && (
          <section id="stack" className="scroll-mt-16 border-t border-line px-5 py-10">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">04 — Technologies</h2>
            <div className="mt-6 space-y-6">
              {data.categories.length === 0 && <p className="text-sm text-muted">Technologies added in the admin dashboard will appear here.</p>}
              {data.categories.map((category) => (
                <div key={category.id}>
                  <h3 className="mb-3 text-sm text-muted">{category.name}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {category.technologies.map((tech) => (
                      <li key={tech.id}>
                        {tech.url ? (
                          <a href={tech.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-line px-2.5 py-1.5 text-sm hover:bg-chip">
                            <TechMark icon={tech.icon} name={tech.name} />
                            {tech.name}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 border border-line px-2.5 py-1.5 text-sm">
                            <TechMark icon={tech.icon} name={tech.name} />
                            {tech.name}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {settings?.showExperience !== false && (
          <section id="experience" className="scroll-mt-16 border-t border-line px-5 py-10">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">05 — Experience</h2>
            <div className="mt-6">
              <ExperienceList
                items={data.experiences.map((item) => ({
                  id: item.id,
                  company: item.company,
                  title: item.title,
                  employmentType: item.employmentType,
                  location: item.location,
                  startLabel: formatMonth(item.startDate),
                  endLabel: formatMonth(item.endDate),
                  current: item.current,
                  description: item.description,
                  responsibilities: item.responsibilities,
                  logoUrl: item.logoUrl,
                  technologies: item.technologies.map((tech) => tech.technology.name),
                }))}
              />
            </div>
          </section>
        )}

        {settings?.showProjects !== false && (
          <section id="projects" className="scroll-mt-16 border-t border-line px-5 py-10">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">06 — Projects</h2>
              <Link href="/projects" className="font-mono text-[11px] text-muted hover:text-fg">All projects</Link>
            </div>
            {projects.length === 0 ? (
              <p className="text-sm text-muted">Published projects will appear here.</p>
            ) : (
              <div className="grid gap-px bg-line sm:grid-cols-2">
                {projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.slug}`} className="bg-bg p-4 transition-colors hover:bg-chip">
                    <div className="mb-4 aspect-[16/8] border border-line">
                      {project.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.thumbnailUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="hatch size-full" />
                      )}
                    </div>
                    <h3 className="text-xl tracking-tight">{project.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span key={tech.technologyId} className="border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">{tech.technology.name}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {settings?.showBlog !== false && (
          <section id="blog" className="scroll-mt-16 border-t border-line px-5 py-10">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">07 — Blog</h2>
              <Link href="/blog" className="font-mono text-[11px] text-muted hover:text-fg">All articles</Link>
            </div>
            {posts.length === 0 ? (
              <p className="text-sm text-muted">Published articles will appear here.</p>
            ) : (
              <ul className="border-t border-line">
                {posts.map((post) => (
                  <li key={post.id} className="border-b border-line">
                    <Link href={`/blog/${post.slug}`} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                      <span className="text-lg tracking-tight">{post.title}</span>
                      <span className="font-mono text-[11px] text-muted">{post.publishedAt ? formatMonth(post.publishedAt) : ""} · {post.readingTime} min</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {settings?.showEducation !== false && (
          <section id="education" className="scroll-mt-16 border-t border-line px-5 py-10">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">08 — Education</h2>
            {data.education.length === 0 ? (
              <p className="mt-5 text-sm text-muted">Education records added in the admin dashboard will appear here.</p>
            ) : (
              <ul className="mt-5 border-t border-line">
                {data.education.map((item) => (
                  <li key={item.id} className="flex gap-4 border-b border-line py-4">
                    {item.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.logoUrl} alt="" className="size-10 border border-line object-cover" />
                    ) : (
                      <span className="grid size-10 shrink-0 place-items-center border border-line font-mono text-[10px]">{item.institution.slice(0, 2).toUpperCase()}</span>
                    )}
                    <div>
                      <h3 className="font-medium">{item.institution}</h3>
                      <p className="text-sm text-muted">{item.degree} · {item.field}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted">
                        {formatMonth(item.startDate)}{item.endDate ? ` — ${formatMonth(item.endDate)}` : ""}
                      </p>
                      {item.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{item.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </SiteFrame>
  );
}

function TechMark({ icon, name }: { icon?: string | null; name: string }) {
  if (icon && (icon.startsWith("/") || icon.startsWith("http"))) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt="" className="size-4 object-contain" />;
  }
  return <span className="font-mono text-[10px] text-muted">{icon || name.slice(0, 2).toUpperCase()}</span>;
}
