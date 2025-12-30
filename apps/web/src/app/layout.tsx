import type { Metadata } from "next";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/styled-components-registry";
import GoogleAnalytics from "../components/GoogleAnalytics";
import CookieConsent from "../components/CookieConsent";

export const metadata: Metadata = {
  title: "Interview Project",
  description: "A modern interview project built with Next.js and monorepo architecture",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <GoogleAnalytics />
        <CookieConsent />
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
