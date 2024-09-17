import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

export const aeonikBold = localFont({
  src: "./fonts/Aeonik-Bold.woff",
  variable: "--font-aeonik-sans",
  weight: "600",
});

export const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
