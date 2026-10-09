import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillPassport — Proof, not promises",
  description: "A living portfolio that connects your skills to the work that proves them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
