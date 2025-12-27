import type { Metadata } from "next";
import "./globals.css";
import StyledComponentsRegistry from "../lib/styled-components-registry";

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
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}