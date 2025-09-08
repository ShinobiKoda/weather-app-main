import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dm_sans = DM_Sans({
  variable: "--font-dm_sans",
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
});


export const metadata: Metadata = {
  title: "Weather Now",
  description: "........",
  icons: {
    icon: "/images/icon-sunny.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dm_sans.className} antialiased bg-neutral-900`}>
        {children}
      </body>
    </html>
  );
}
