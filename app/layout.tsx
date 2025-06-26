import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LC Waikiki OneSearch",
  description: "AI Sohbet Asistanı Projesi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
