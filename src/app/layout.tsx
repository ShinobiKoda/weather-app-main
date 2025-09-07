import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";


const dm_sans = DM_Sans({
  variable: "--font-dm_sans",
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"]
})

// const bricolage_grotesque = Bricolage_Grotesque({
//   variable: "--font-bricolage-grotesque",
//   subsets: ["latin"],
//   weight: ["700"]
// })


export const metadata: Metadata = {
  title: "Weather Now",
  description: "........",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dm_sans.variable} antialiased bg-neutral-900`}
      >
        {children}
      </body>
    </html>
  );
}
