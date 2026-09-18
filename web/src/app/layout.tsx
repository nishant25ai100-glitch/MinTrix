import type { Metadata } from "next";
import "./globals.css";
import { SiteProvider } from "@/context/site-context";
import DashboardShell from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "OreSight — MOIL Manganese Reserve & Shortfall Intelligence",
  description:
    "AI/ML and Space-Tech geospatial dashboard for MOIL Limited (SIH 26009) to map manganese reserves, forecast production shortfalls, and deliver actionable operational recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-gray-100 antialiased">
        <SiteProvider>
          <DashboardShell>{children}</DashboardShell>
        </SiteProvider>
      </body>
    </html>
  );
}
