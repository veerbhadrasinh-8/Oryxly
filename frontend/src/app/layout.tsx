import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppNav } from "@/components/AppNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORYXLY",
  description: "Email campaigns for Indian SMBs — by Oryxus",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AppNav />
          {children}
          <footer className="border-t border-neutral-200 dark:border-neutral-800 py-4 mt-8">
            <p className="text-center text-xs text-neutral-500">
              Developed by{" "}
              <a
                href="https://oryxus.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-neutral-100 transition-colors underline underline-offset-2"
              >
                Oryxus
              </a>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
