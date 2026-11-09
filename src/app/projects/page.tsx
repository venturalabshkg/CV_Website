import type { Metadata } from "next";
import Link from "next/link";
import { SiteFrame } from "@/components/public/frame";
import { getPublicPortfolio } from "@/lib/queries";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const data = await getPublicPortfolio();
  return (
    <SiteFrame data={data}>
      <div className="px-5 py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Work</p>
        <h1 className="mt-2 text-4xl tracking-tight">Projects</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Published case studies. Drafts stay in the admin dashboard until they are ready.</p>
        <div className="mt-8 grid gap-px bg-line sm:grid-cols-2">
          {data.projects.length === 0 && <p className="bg-bg p-6 text-sm text-muted">No published projects yet.</p>}
          {data.projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="bg-bg p-4 transition-colors hover:bg-chip">
              <div className="mb-4 aspect-[16/8] border border-line">
                {project.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.thumbnailUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="hatch size-full" />
                )}
              </div>
              <h2 className="text-xl tracking-tight">{project.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{project.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span key={tech.technologyId} className="border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">{tech.technology.name}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteFrame>
  );
}
