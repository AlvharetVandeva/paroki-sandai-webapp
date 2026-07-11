import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paroki Sandai",
  description: "Website resmi dan kalender pelayanan Paroki Sandai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body
        className={`${geist.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}
      >
        <TooltipProvider>
          <main className="flex-grow">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
