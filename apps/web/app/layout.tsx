import "./globals.css";
import Script from "next/script";
import type { ReactNode } from "react";

export const metadata = {
  title: "SMM AI App",
  description: "Research, draft, review, approve, and publish content.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}