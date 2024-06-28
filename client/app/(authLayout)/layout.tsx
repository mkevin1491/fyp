import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import SideNavbar from "@/components/SideNavbar";
import { MaterialTailwindControllerProvider } from "@/components/context";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("flex min-h-screen bg-gray-100", inter.className)}>
        <MaterialTailwindControllerProvider>
          <SideNavbar />
          <main className="flex-1 p-8 ml-[calc(100vw-80px)] transition-all duration-300 md:ml-72">
          <Navbar />
            {children}
          </main>
        </MaterialTailwindControllerProvider>
      </body>
    </html>
  );
}