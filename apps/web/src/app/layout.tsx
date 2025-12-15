import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "../lib/styled-components-registry";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}