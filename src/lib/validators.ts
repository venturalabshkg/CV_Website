import { z } from "zod";

const optionalText = z.string().trim().max(4000).optional().or(z.literal(""));
const emailAddress = z
  .string()
  .trim()
  .max(200)
  .regex(/^[^\s@]+@[^\s@]+$/, "Enter a valid email.");
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("/") ||
      value.startsWith("mailto:") ||
      /^https?:\/\//i.test(value),
    "Enter a valid URL.",
  );

export const loginSchema = z.object({
  email: emailAddress,
  password: z.string().min(1, "Enter your password.").max(200),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required.").max(120),
  initials: z.string().trim().min(1).max(4),
  title: z.string().trim().min(1, "Title is required.").max(160),
  introduction: z.string().trim().min(1).max(800),
  about: z.string().trim().max(8000),
  location: z.string().trim().max(120),
  timezone: z.string().trim().min(1).max(80),
  availability: z.string().trim().max(160),
  email: emailAddress,
  avatarUrl: optionalUrl,
  resumeUrl: optionalUrl,
  githubUsername: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-zA-Z0-9-]*$/, "GitHub usernames use letters, numbers, and hyphens."),
  linkedinUrl: optionalUrl,
  availableForWork: z.boolean(),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required.").max(80),
  visible: z.boolean().optional(),
});

export const technologySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(80),
  icon: z.string().trim().max(300).optional().or(z.literal("")),
  url: optionalUrl,
  categoryId: z.string().min(1, "Choose a category."),
  visible: z.boolean(),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(160),
  employmentType: z.string().trim().min(1).max(80),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean(),
  description: z.string().trim().max(4000),
  responsibilities: z.string().trim().max(8000),
  logoUrl: optionalUrl,
  visible: z.boolean(),
  technologyIds: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(8000),
  thumbnailUrl: optionalUrl,
  technologyIds: z.array(z.string()).default([]),
});

export const blogSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(100),
  excerpt: z.string().trim().min(1).max(400),
  content: z.string().trim().min(1).max(100000),
  coverUrl: optionalUrl,
  published: z.boolean(),
  featured: z.boolean(),
  publishedAt: z.string().optional().or(z.literal("")),
  seoTitle: z.string().trim().max(180).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().trim().min(1).max(160),
  degree: z.string().trim().min(1).max(160),
  field: z.string().trim().min(1).max(160),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  description: z.string().trim().max(4000),
  logoUrl: optionalUrl,
  visible: z.boolean(),
});

export const socialSchema = z.object({
  id: z.string().optional(),
  platform: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(40),
  url: z.string().trim().min(1).max(500),
  icon: z.string().trim().min(1).max(40),
  visible: z.boolean(),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(80),
  siteTitle: z.string().trim().min(1).max(160),
  logoText: z.string().trim().min(1).max(6),
  faviconUrl: optionalUrl,
  description: z.string().trim().max(400),
  defaultTheme: z.enum(["dark", "light"]),
  seoTitle: z.string().trim().min(1).max(180),
  seoDescription: z.string().trim().max(300),
  ogImageUrl: optionalUrl,
  contactEmail: emailAddress,
  accentColor: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/, "Use a hex color."),
  footerNote: z.string().trim().max(240),
  showOverview: z.boolean(),
  showGithub: z.boolean(),
  showAbout: z.boolean(),
  showStack: z.boolean(),
  showExperience: z.boolean(),
  showProjects: z.boolean(),
  showBlog: z.boolean(),
  showEducation: z.boolean(),
});

export const namedSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(80),
});

export function zodError(error: z.ZodError) {
  return error.issues[0]?.message || "Check the form and try again.";
}

export { optionalText };
