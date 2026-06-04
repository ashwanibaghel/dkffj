import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DK Foundation of Freedom and Justice",
  description: "Human Rights Protection organization registered by the Ministry of Corporate Affairs, Govt. of India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-[#0F4C81]/10 selection:text-[#0F4C81]">
        {children}
      </body>
    </html>
  );
}
