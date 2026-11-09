import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFrame } from "@/components/public/frame";
import { getPublicPortfolio, projectInclude } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return { title: "Project" };
  return { title: project.title, description: project.description.slice(0, 160) };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [data, project, session] = await Promise.all([
    getPublicPortfolio(),
    prisma.project.findUnique({ where: { slug }, include: projectInclude }),
    getSession(),
  ]);
  if (!project || (!project.published && !session)) notFound();

  return (
    <SiteFrame data={data}>
      <article className="px-5 py-10">
        <Link href="/projects" className="font-mono text-[11px] text-muted hover:text-fg">All projects</Link>
        <h1 className="mt-4 max-w-3xl text-4xl tracking-tight sm:text-5xl">{project.title}</h1>
        <div className="mt-8 aspect-[16/8] border border-line">
          {project.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnailUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="hatch size-full" />
          )}
        </div>
        <p className="mt-8 max-w-3xl whitespace-pre-wrap leading-7">{project.description}</p>
        {project.technologies.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span key={tech.technologyId} className="border border-line px-2 py-1 font-mono text-[11px]">{tech.technology.name}</span>
            ))}
          </div>
        )}
      </article>
    </SiteFrame>
  );
}
