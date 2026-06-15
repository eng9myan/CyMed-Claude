import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "CyMed — Neural Health OS", template: "%s · CyMed" },
  description: "World-class AI-powered healthcare ERP. FHIR R4, NPHIES, ZATCA compliant.",
  keywords: ["healthcare", "EHR", "HMRS", "hospital", "FHIR", "NPHIES", "Saudi Arabia", "AI", "clinical"],
  authors: [{ name: "CyMed Healthcare Technology" }],
  creator: "CyMed",
  robots: "noindex, nofollow",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#080d1a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen antialiased`}
        style={{ background: "oklch(0.09 0.015 250)", color: "oklch(0.94 0.008 240)" }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
