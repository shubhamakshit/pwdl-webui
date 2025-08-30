import { Geist, Geist_Mono } from "next/font/google";
import MUIProvider from "../components/MUIProvider";
import "./globals.css";
import {Box} from "@mui/material";
import Navbar from "@/components/Navbar";
import Script from 'next/script';
import { CommandPaletteProvider } from "@/hooks/useCommandPalette.js";
import CommandPaletteInitializer from "@/components/CommandPaletteInitializer.jsx";
import { commands } from "@/lib/commands.js";
import { JSExecutionProvider } from "@/hooks/useJSExecution.js";

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

        <Script
            src="https://ajax.googleapis.com/ajax/libs/shaka-player/4.3.4/shaka-player.ui.js"
            strategy="beforeInteractive"
        />

        <MUIProvider>
            <JSExecutionProvider>
                <CommandPaletteProvider>
                    <CommandPaletteInitializer />
                    <Navbar/>
                    <div  suppressHydrationWarning={true}>
                        <Box p={4}>
                            {children}
                        </Box>
                    </div>
                </CommandPaletteProvider>
            </JSExecutionProvider>
        </MUIProvider>
        </body>
        </html>
    );
}