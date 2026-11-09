import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">404</p>
      <h1 className="mt-3 text-4xl tracking-tight">This page is not on the site.</h1>
      <Link href="/" className="mt-6 text-sm underline underline-offset-4">Back to the overview</Link>
    </main>
  );
}
