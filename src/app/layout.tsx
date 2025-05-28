import MainNav from "@/components/Sidebar";
import Providers from "@/lib/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lems",
  description: "Leased Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="h-screen grid grid-cols-[1fr_5fr] grid-rows-[auto_1fr]">
            <div className="bg-white h-16 flex items-center px-8 col-span-full">
              Header
            </div>
            <div className="bg-white border-r h-full overflow-y-auto">
              <MainNav />
            </div>
            <main className="overflow-auto bg-gray-100 p-16">
              <div className="mx-auto flex max-w-screen-xl flex-col gap-8">
                {children}
              </div>
            </main>
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
