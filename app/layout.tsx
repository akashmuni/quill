import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quill",
  description: "Write less. Say more.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Quill - Smart Content Assistant",
    description: "Transform any text into summaries, professional rewrites, and key bullet points instantly.",
    url: "https://quill.akashmuni.com",
    siteName: "Quill",
    images: [
      {
        url: "https://quill.akashmuni.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Quill - Smart Content Assistant",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quill - Smart Content Assistant",
    description: "Transform any text into summaries, professional rewrites, and key bullet points instantly.",
    images: ["https://quill.akashmuni.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="quill-ui-theme"
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
