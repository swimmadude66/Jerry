import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthManagerProvider } from '@jerry/managers/auth/react';
import { HeaderBar } from '@jerry/components/header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthManagerProvider>
      <html lang="en">
        <head>
          <script src="https://accounts.google.com/gsi/client" async></script>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <HeaderBar />
          {children}
        </body>
      </html>
    </AuthManagerProvider>

  );
}
