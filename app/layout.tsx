import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Green Numbers - Capital Call Calculator",
  description: "Calculate LP capital calls based on ownership percentage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
