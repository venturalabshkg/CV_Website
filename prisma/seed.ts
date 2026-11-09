import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function loadEnv() {
  const text = readFileSync(path.join(process.cwd(), ".env"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const prisma = new PrismaClient();

const stack: { name: string; items: string[] }[] = [
  { name: "Frontend Development", items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS"] },
  { name: "Backend Development", items: ["Python", "Node.js", "FastAPI", "Django", "PostgreSQL", "Redis"] },
  { name: "AI & Machine Learning", items: ["OpenAI API", "Anthropic Claude", "LangChain", "LangGraph", "PyTorch", "Computer Vision", "RAG", "AI Agents"] },
  { name: "Data Engineering", items: ["Apache Spark", "Airflow", "Kafka", "Pandas", "SQL", "ETL Pipelines"] },
  { name: "Cloud & DevOps", items: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"] },
];

const projectCategories = [
  "AI Applications",
  "AI Agents & Automation",
  "Computer Vision",
  "SaaS Platforms",
  "Data Engineering",
  "Web Applications",
];

const projects = [
  ["Sample AI Application", "AI Applications", "A placeholder for an applied AI product. Replace the copy, images, and links with your own work.", ["TypeScript", "Next.js", "OpenAI API", "RAG"]],
  ["Sample Agent Workflow", "AI Agents & Automation", "A placeholder for an agent or automation system. Edit this record from the admin dashboard.", ["Python", "LangGraph", "AI Agents", "FastAPI"]],
  ["Sample Vision System", "Computer Vision", "A placeholder for a computer vision project. Add the real problem, approach, and screenshots when you have them.", ["Python", "PyTorch", "Computer Vision"]],
  ["Sample SaaS Platform", "SaaS Platforms", "A placeholder for a multi-user product. Swap in the actual architecture and demo when it is ready.", ["Next.js", "PostgreSQL", "Tailwind CSS"]],
  ["Sample Data Pipeline", "Data Engineering", "A placeholder for a data pipeline or platform. Document the real sources, transforms, and checks here.", ["Python", "Airflow", "PostgreSQL", "ETL Pipelines"]],
  ["Sample Web Product", "Web Applications", "A placeholder for a web application. Use the project editor to publish the finished case study.", ["React", "TypeScript", "Node.js"]],
] as const;

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters in .env before seeding.");
  }

  const users = await prisma.adminUser.count();
  if (users === 0) {
    await prisma.adminUser.create({
      data: { email, passwordHash: await bcrypt.hash(password, 12), name: "Site admin" },
    });
  }

  await prisma.websiteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "Portfolio",
      siteTitle: "Freelance software developer",
      logoText: "YN",
      description: "Personal site for an independent developer working across software, AI, and data systems.",
      defaultTheme: "dark",
      seoTitle: "Freelance software developer",
      seoDescription: "Software development, applied AI, data engineering, and digital products.",
      contactEmail: "hello@example.com",
      accentColor: "#d4d4d8",
      footerNote: "Independent software development.",
    },
  });

  await prisma.profile.upsert({
    where: { id: "profile" },
    update: {},
    create: {
      id: "profile",
      fullName: "Your Name",
      initials: "YN",
      title: "Freelance Software Developer",
      introduction:
        "I work independently across software development, AI, data engineering, and digital products. The work is usually a mix of product interfaces, backend systems, and applied machine learning.",
      about:
        "I am a freelance software developer. Most projects sit somewhere between a working product and the systems behind it: application code, data pipelines, models, and the automation that connects them.\n\nI am interested in software that stays understandable after the first release. That includes APIs, internal tools, AI agents, computer vision, and the data work required to feed them reliable inputs.\n\nI prefer small, direct interfaces and explicit system boundaries. A useful product should make the hard part legible: what the system is responsible for, what it stores, and how it fails.\n\nThe kinds of systems I take on include web applications, backend services, retrieval and agent workflows, vision pipelines, and the data infrastructure around them. Replace this text with your own background from the admin dashboard.",
      location: "Add your city",
      timezone: "UTC",
      availability: "Available for freelance work",
      email: "hello@example.com",
      availableForWork: true,
      githubUsername: process.env.GITHUB_USERNAME || null,
    },
  });

  if ((await prisma.technologyCategory.count()) === 0) {
    for (const [categoryIndex, category] of stack.entries()) {
      await prisma.technologyCategory.create({
        data: {
          name: category.name,
          slug: slug(category.name),
          order: categoryIndex,
          technologies: {
            create: category.items.map((name, order) => ({
              name,
              slug: slug(name),
              icon: name.slice(0, 2).toUpperCase(),
              order,
            })),
          },
        },
      });
    }
  }

  if ((await prisma.projectCategory.count()) === 0) {
    await prisma.projectCategory.createMany({
      data: projectCategories.map((name, order) => ({ name, slug: slug(name), order })),
    });
  }

  if ((await prisma.project.count()) === 0) {
    const categories = await prisma.projectCategory.findMany();
    const technologies = await prisma.technology.findMany();
    for (const [order, project] of projects.entries()) {
      const [title, categoryName, summary, techNames] = project;
      const category = categories.find((item) => item.name === categoryName);
      await prisma.project.create({
        data: {
          title,
          slug: slug(title),
          summary,
          description:
            "This is a starter project so the portfolio has a complete structure. Replace the summary, narrative, screenshots, and links with a real engagement. Nothing here describes shipped work.",
          problem: "Describe the constraint, user, or system this project had to address.",
          challenges: "Note the technical constraints worth remembering: data quality, latency, tenancy, evaluation, or operations.",
          approach: "Explain the implementation in plain language once the real project is ready.",
          architecture: "Sketch the main services, data stores, and how they communicate.",
          featured: true,
          published: true,
          publishedAt: new Date(),
          order,
          categoryId: category?.id,
          technologies: {
            create: techNames
              .map((name) => technologies.find((item) => item.name === name))
              .filter((item): item is NonNullable<typeof item> => Boolean(item))
              .map((item) => ({ technologyId: item.id })),
          },
        },
      });
    }
  }

  if ((await prisma.blogCategory.count()) === 0) {
    await prisma.blogCategory.createMany({
      data: [
        { name: "Engineering", slug: "engineering" },
        { name: "AI", slug: "ai" },
        { name: "Data", slug: "data" },
      ],
    });
  }

  if ((await prisma.blogPost.count()) === 0) {
    const engineering = await prisma.blogCategory.findUnique({ where: { slug: "engineering" } });
    const data = await prisma.blogCategory.findUnique({ where: { slug: "data" } });
    const notes = await prisma.blogTag.create({ data: { name: "Notes", slug: "notes" } });
    const practice = await prisma.blogTag.create({ data: { name: "Practice", slug: "practice" } });

    await prisma.blogPost.create({
      data: {
        title: "Sample: Notes on shipping applied AI",
        slug: "sample-notes-on-shipping-applied-ai",
        excerpt: "A starter article. Replace it with your own writing, or delete it from the admin dashboard.",
        content: sampleArticle,
        published: true,
        featured: true,
        publishedAt: new Date("2026-03-12T00:00:00.000Z"),
        readingTime: 3,
        seoTitle: "Notes on shipping applied AI",
        seoDescription: "A short sample article about scoping applied AI work.",
        categoryId: engineering?.id,
        tags: { create: [{ tagId: notes.id }, { tagId: practice.id }] },
      },
    });

    await prisma.blogPost.create({
      data: {
        title: "Sample draft: A checklist for data pipelines",
        slug: "sample-draft-data-pipeline-checklist",
        excerpt: "An unpublished draft you can edit or discard.",
        content:
          "This draft is private until you publish it.\n\nUse it to test the editor, or replace it with a real note about a pipeline you have operated: sources, contracts, retries, and how you knew the data was late.",
        published: false,
        featured: false,
        readingTime: 1,
        categoryId: data?.id,
        tags: { create: [{ tagId: notes.id }] },
      },
    });
  }

  if ((await prisma.socialLink.count()) === 0) {
    await prisma.socialLink.createMany({
      data: [
        { platform: "GitHub", label: "GitHub", url: "https://github.com", icon: "github", order: 0 },
        { platform: "LinkedIn", label: "LinkedIn", url: "https://www.linkedin.com", icon: "linkedin", order: 1 },
        { platform: "Email", label: "Email", url: "mailto:hello@example.com", icon: "mail", order: 2 },
      ],
    });
  }
}

const sampleArticle = `This is a sample article so the blog has a published page to edit. It is not a claim about a specific project.

Applied AI work gets easier to ship when the boundary is small. A useful first version usually does one job, against one source of data, with a way to tell that the answer was wrong.

I tend to write that boundary down before choosing a model:

- What decision or draft is the system allowed to produce?
- Which data is in scope, and which data must stay out?
- What does a person review before anything is sent or stored?
- How will we know the feature got worse next month?

The model is rarely the part that makes the system hard to maintain. The hard part is the contract around it: inputs, tools, retries, and the path a person uses when the output is not good enough.

Replace this article with something you actually want to publish.`;

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
