
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gold Trading Analysis",
  description: "แอปบันทึกและวิเคราะห์ประวัติการเทรดทองคำ พร้อม AI Analysis",
  icons: {
    icon: '/image/favicon.png',
    shortcut: '/image/favicon.png',
    apple: '/image/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/image/favicon.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/image/favicon.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/image/favicon.jpg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
