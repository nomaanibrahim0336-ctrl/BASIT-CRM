import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krea8Digital",
  description: "Operations dashboard for the graphic design selling business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-discord-bg font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
