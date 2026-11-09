import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { getSettings } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings?.seoTitle || "Portfolio";
  const description = settings?.seoDescription || settings?.description || "";
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s · ${settings?.siteName || "Portfolio"}` },
    description,
    openGraph: {
      title,
      description,
      images: settings?.ogImageUrl ? [settings.ogImageUrl] : undefined,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const theme = settings?.defaultTheme === "light" ? "light" : "dark";

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${theme}`} suppressHydrationWarning>
      <body style={{ ["--accent" as string]: settings?.accentColor || "#d4d4d8" }}>
        <Providers defaultTheme={theme}>{children}</Providers>
      </body>
    </html>
  );
}
