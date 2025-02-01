import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SocketProvider } from "@/providers/SocketProvider";
import { UserProvider } from "@/providers/UserProvider";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Anynomous Chat",
  description: "Video Call + chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SocketProvider>
          <UserProvider>

            {children}

          </UserProvider>
        </SocketProvider>

      </body>
    </html>
  );
}
