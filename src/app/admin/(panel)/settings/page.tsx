import { getSettings } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/nav";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();
  if (!settings) return <p>Run npm run setup first.</p>;

  return (
    <div>
      <AdminHeader title="Website settings" text="Identity, SEO, contact, and which public sections are visible." />
      <SettingsForm
        settings={{
          siteName: settings.siteName,
          siteTitle: settings.siteTitle,
          logoText: settings.logoText,
          faviconUrl: settings.faviconUrl || "",
          description: settings.description,
          defaultTheme: settings.defaultTheme === "light" ? "light" : "dark",
          seoTitle: settings.seoTitle,
          seoDescription: settings.seoDescription,
          ogImageUrl: settings.ogImageUrl || "",
          contactEmail: settings.contactEmail,
          accentColor: settings.accentColor,
          footerNote: settings.footerNote,
          showOverview: settings.showOverview,
          showGithub: settings.showGithub,
          showAbout: settings.showAbout,
          showStack: settings.showStack,
          showExperience: settings.showExperience,
          showProjects: settings.showProjects,
          showBlog: settings.showBlog,
          showEducation: settings.showEducation,
        }}
      />
    </div>
  );
}
