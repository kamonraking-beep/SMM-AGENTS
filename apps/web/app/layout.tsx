import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "SMM AI App",
  description: "Research, draft, review, approve, and publish content.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}