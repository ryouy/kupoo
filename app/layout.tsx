import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KUPOO",
    template: "%s | KUPOO"
  },
  description: "KUPOOは、会津大学の非公式お絵描きサークルのWebギャラリーです。",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="doodle-backdrop font-sans antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
