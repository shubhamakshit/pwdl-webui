"use client";
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import UtilitiesIcon from '@mui/icons-material/Build';
import AlbumIcon from '@mui/icons-material/Album';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WebSettingsManager from '@/lib/WebSettingsManager';
import Link from 'next/link';
import darkTheme from "@/components/theme";
import Stack from "@mui/material/Stack";

const links = [
    { label: 'HOME', href: '/', icon: <HomeIcon /> },
    // { label: 'UTILITY', href: '/util', icon: <UtilitiesIcon /> },
    { label: 'SESSIONS', href: '/sessions', icon: <AlbumIcon /> },
    { label: 'SETTINGS', href: '/settings', icon: <SettingsIcon /> },
    // { label: 'HELP', href: '/help', icon: <HelpIcon /> },
    { label: 'LIBRARY', href: '/boss', icon: <AssuredWorkloadIcon /> }
];

if (WebSettingsManager.getValue('admin_enabled')) {
    links.push({ label: 'ADMIN', href: '/admin', icon: <AdminIcon /> });
}

if (WebSettingsManager.getValue('login_enabled')) {
    if (typeof window !== 'undefined' && localStorage.getItem('token_context')) {
        links.push({ label: 'PROFILE', href: '/profile', icon: <AccountCircleIcon /> });
    }
}

export default function Navbar() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const theme = darkTheme;
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    return (
        <Box>
            <AppBar position="static" >
                <Toolbar>
                    <IconButton
                        edge="start"
                        onClick={toggleDrawer}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
                        Pwdl - Local WEBUI
                    </Typography>
                    {!isMobile && (
                        <ButtonGroup variant="outlined">
                            {links.map((link) => (
                                <Button href={link.href} key={link.href} startIcon={link.icon} >
                                    {link.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer} sx={{
                '& .MuiDrawer-paper': {
                    width: 'auto',
                    minWidth: '30vw',
                    maxWidth: '90%',
                },
            }}>
                <Stack spacing={2} p={1} >
                    {
                        links.map((link) => (<Button href={link.href} p={2} key={link.href} startIcon={link.icon} fullWidth variant={"text"}>{link.label} </Button>))
                    }
                </Stack>
            </Drawer>
        </Box>
    );
}
