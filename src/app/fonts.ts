import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const aeonikBold = localFont({
  src: "./fonts/Aeonik-Bold.woff",
  variable: "--font-aeonik-sans",
  weight: "600",
});

export const inter = Inter({ subsets: ['latin'] })