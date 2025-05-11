"use client";

import { ThemeProvider, CssBaseline } from '@mui/material';
import darkTheme from './theme';

export default function MUIProvider({ children }) {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
