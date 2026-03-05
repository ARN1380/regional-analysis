import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: 'Payesh',
  description: 'Daily monitoring of regional war',
  icons: {
    icon: '/favicon.ico', // standard favicon
    apple: '/apple-touch-icon.png', // for iPhone homescreens
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
