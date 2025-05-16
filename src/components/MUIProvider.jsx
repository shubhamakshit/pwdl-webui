"use client";

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import WebSettingsManager from "@/lib/WebSettingsManager";

export default function MUIProvider({ children }) {
    return (
        <ThemeProvider theme={ theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
