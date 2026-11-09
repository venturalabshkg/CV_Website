import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image." }, { status: 400 });
  const extension = TYPES[file.type];
  if (!extension) return NextResponse.json({ error: "Use JPG, PNG, WebP, SVG, or PDF." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (extension === "svg" && !safeSvg(bytes.toString("utf8"))) {
    return NextResponse.json({ error: "This SVG contains unsupported markup." }, { status: 400 });
  }

  const filename = `${crypto.randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes);
  const url = `/uploads/${filename}`;

  const media = await prisma.media.create({
    data: {
      filename: file.name.slice(0, 180),
      url,
      mimeType: file.type,
      size: file.size,
      alt: String(form.get("alt") || ""),
    },
  });

  return NextResponse.json({ id: media.id, url: media.url, filename: media.filename, size: media.size });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = (await request.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing image." }, { status: 400 });
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return NextResponse.json({ error: "Image not found." }, { status: 404 });
  if (!media.url.startsWith("/uploads/") || media.url.includes("..")) {
    return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
  }

  const inUse = await imageInUse(media.url);
  if (inUse) return NextResponse.json({ error: "This image is still used on the site." }, { status: 409 });

  await prisma.media.delete({ where: { id } });
  await unlink(path.join(process.cwd(), "public", media.url)).catch(() => undefined);
  return NextResponse.json({ ok: true });
}

function safeSvg(source: string) {
  const lowered = source.toLowerCase();
  return !/script|onload|onerror|onclick|javascript:|foreignobject|data:text\/html/.test(lowered);
}

async function imageInUse(url: string) {
  const [profile, settings, project, image, post, experience, education, mentioned] = await Promise.all([
    prisma.profile.findFirst({ where: { OR: [{ avatarUrl: url }, { resumeUrl: url }] } }),
    prisma.websiteSettings.findFirst({ where: { OR: [{ faviconUrl: url }, { ogImageUrl: url }] } }),
    prisma.project.findFirst({ where: { OR: [{ thumbnailUrl: url }, { description: { contains: url } }] } }),
    prisma.projectImage.findFirst({ where: { url } }),
    prisma.blogPost.findFirst({ where: { OR: [{ coverUrl: url }, { content: { contains: url } }] } }),
    prisma.experience.findFirst({ where: { logoUrl: url } }),
    prisma.education.findFirst({ where: { logoUrl: url } }),
    prisma.technology.findFirst({ where: { icon: url } }),
  ]);
  return Boolean(profile || settings || project || image || post || experience || education || mentioned);
}
