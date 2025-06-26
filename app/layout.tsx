import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LCW OneSearch",
  description: "AI-powered search and chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-[#1e2a38] text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
