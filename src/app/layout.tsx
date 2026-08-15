import type { Metadata } from "next";
import "./globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import AdminQuickAccessBar from "@/components/AdminQuickAccessBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://dkffj.org"),
  title: {
    default: "DK FOUNDATION OF FREEDOM AND JUSTICE | HUMAN RIGHTS PROTECTION",
    template: "%s | DKFFJ Human Rights Protection"
  },
  description: "Human Rights Protection organization registered by the Ministry of Corporate Affairs, Govt. of India. CIN: U88900UP2023NPL185611. Join as an active member or volunteer today.",
  keywords: ["DKFFJ", "DK Foundation of Freedom and Justice", "Human Rights Protection", "NGO India", "Kanpur NGO", "Membership Registration", "Social Welfare"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo-mix.png",
  },
  openGraph: {
    title: "DK FOUNDATION OF FREEDOM AND JUSTICE | HUMAN RIGHTS PROTECTION",
    description: "Human Rights Protection organization registered by the Ministry of Corporate Affairs, Govt. of India. Regd No. CIN: U88900UP2023NPL185611.",
    url: "https://dkffj.org",
    siteName: "DK Foundation of Freedom and Justice",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DK Foundation of Freedom and Justice - Human Rights Protection",
      },
      {
        url: "/logo-mix.png",
        width: 500,
        height: 500,
        alt: "DKFFJ Emblem Logo",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DK FOUNDATION OF FREEDOM AND JUSTICE | HUMAN RIGHTS PROTECTION",
    description: "Human Rights Protection organization registered by the Ministry of Corporate Affairs, Govt. of India.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@600;700;800&family=UnifrakturMaguntia&family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-[#001C55]/10 selection:text-[#001C55]">
        <AdminQuickAccessBar />
        {children}
        <ScrollProgress />
      </body>
    </html>
  );
}
