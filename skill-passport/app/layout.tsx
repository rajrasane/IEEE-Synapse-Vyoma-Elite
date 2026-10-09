import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillPassport — Skills You Can Prove",
  description: "Evidence-backed skill intelligence for students and recruiters.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
