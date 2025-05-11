import { Geist, Geist_Mono } from "next/font/google";
import MUIProvider from "../components/MUIProvider";
import "./globals.css";
import {Box} from "@mui/material";
import Navbar from "@/components/Navbar";

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

        <body className={`${geistSans.variable} ${geistMono.variable}`}>

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
