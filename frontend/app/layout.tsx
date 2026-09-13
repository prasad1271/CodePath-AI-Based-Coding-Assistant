import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/lib/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodePath – AI Programming & Career Assistant for Engineering Students",
  description: "Learn to Code. Build Projects. Become Career Ready. The intelligent programming mentor and career ecosystem for engineering students.",
  keywords: ["engineering", "programming", "DSA", "coding practice", "AI mentor", "technical interview", "placement prep", "resume ATS"],
  openGraph: {
    title: "CodePath – AI Programming & Career Assistant",
    description: "Learn to Code. Build Projects. Become Career Ready.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
