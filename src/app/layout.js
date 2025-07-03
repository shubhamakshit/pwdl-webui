import { Geist, Geist_Mono } from "next/font/google";
import MUIProvider from "../components/MUIProvider";
import "./globals.css";
import {Box} from "@mui/material";
import Navbar from "@/components/Navbar";
import Script from 'next/script'; // Import Script component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PWDL-WEBUI",
  description: "Pw-downloader from hell",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
          <head>
            <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/shaka-player/4.3.4/controls.css" />
            </head>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>

        {/* Use Next.js Script component for shaka-player.ui.js */}
        <Script
            src="https://ajax.googleapis.com/ajax/libs/shaka-player/4.3.4/shaka-player.ui.js"
            strategy="beforeInteractive" // Or "afterInteractive" depending on your needs
        />

        <MUIProvider>
            <Navbar/>
            <div  suppressHydrationWarning={true}>
                <Box p={4}>
                    {children}
                </Box>
            </div>
        </MUIProvider>
        </body>
        </html>
    );
}