
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
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
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
              border: '1px solid #374151',
              borderRadius: '0.75rem',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '500px',
              textAlign: 'center',
            },
            success: {
              style: {
                background: '#064E3B',
                color: '#D1FAE5',
                border: '1px solid #10B981',
              },
              iconTheme: {
                primary: '#10B981',
                secondary: '#D1FAE5',
              },
            },
            error: {
              style: {
                background: '#7F1D1D',
                color: '#FEE2E2',
                border: '1px solid #EF4444',
              },
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FEE2E2',
              },
            },
            loading: {
              style: {
                background: '#1E3A8A',
                color: '#DBEAFE',
                border: '1px solid #3B82F6',
              },
              iconTheme: {
                primary: '#3B82F6',
                secondary: '#DBEAFE',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
