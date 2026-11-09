"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children, defaultTheme }: { children: React.ReactNode; defaultTheme: "dark" | "light" }) {
  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem={false} disableTransitionOnChange>
      {children}
      <Toaster position="bottom-right" closeButton />
    </ThemeProvider>
  );
}
