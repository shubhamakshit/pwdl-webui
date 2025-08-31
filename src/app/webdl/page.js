"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Container,
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Breadcrumbs,
    Link,
    Paper,
    Divider,
    ListItemButton, IconButton
} from "@mui/material";
import {
    Folder,
    InsertDriveFile,
    Home,
    NavigateNext,
    Movie,
    AudioFile,
    Image,
    Description
} from "@mui/icons-material";
import API from "@/Server/api";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

function WebdlPage() {
    const router = useRouter();
    const params = useParams();

    const folderDataType = {
        files: [],
        folders: []
    };

    const [folderData, setFolderData] = useState(folderDataType);
    const [currentPath, setCurrentPath] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchFolderData = async (folderPath) => {
        setLoading(true);
        try {
            const response = await fetch(API.GET_WEBDL_FILE(folderPath));
            const data = await response.json();
            setFolderData(data);
            setCurrentPath(folderPath);
        } catch (error) {
            console.error("Error fetching folder data:", error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToFolder = (folderPath) => {
        const newUrl = folderPath ? `/webdl/${folderPath}` : '/webdl';
        router.push(newUrl);
    };

    useEffect(() => {
        // Get path from URL params
        const pathArray = params.path || [];
        const pathFromUrl = Array.isArray(pathArray) ? pathArray.join('/') : '';
        fetchFolderData(pathFromUrl);
    }, [params]);

    const handleFolderClick = (folderName) => {
        const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        navigateToFolder(newPath);
    };

    const handleBreadcrumbClick = (pathIndex) => {
        if (pathIndex === -1) {
            // Home clicked
            navigateToFolder("");
        } else {
            const pathParts = currentPath.split('/').filter(part => part);
            const newPath = pathParts.slice(0, pathIndex + 1).join('/');
            navigateToFolder(newPath);
        }
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'mp4':
            case 'avi':
            case 'mkv':
            case 'mov':
            case 'wmv':
                return <Movie color="action" />;
            case 'mp3':
            case 'wav':
            case 'flac':
            case 'aac':
                return <AudioFile color="action" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return <Image color="action" />;
            default:
                return <Description color="action" />;
        }
    };

    const pathParts = currentPath.split('/').filter(part => part);

    return (
        <Container maxWidth="md" sx={{ py: 2 }}>
            {/* Header */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    File Explorer
                </Typography>
            </Box>

            {/* Breadcrumbs */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => handleBreadcrumbClick(-1)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        <Home sx={{ mr: 0.5 }} fontSize="small" />
                        Home
                    </Link>
                    {pathParts.map((part, index) => (
                        <Link
                            key={index}
                            component="button"
                            variant="body2"
                            onClick={() => handleBreadcrumbClick(index)}
                            sx={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            {part}
                        </Link>
                    ))}
                </Breadcrumbs>
            </Paper>

            {/* Loading State */}
            {loading && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">Loading...</Typography>
                </Box>
            )}

            {/* Content */}
            {!loading && (
                <Paper variant="outlined">
                    <List dense>
                        {/* Folders */}
                        {folderData.folders.map((folder, index) => (
                            <div key={`folder-${folder}`}>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => handleFolderClick(folder)}>
                                        <ListItemIcon>
                                            <Folder color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={folder}
                                            secondary="Folder"
                                        />
                                    </ListItemButton>
                                </ListItem>
                                {index < folderData.folders.length - 1 && <Divider />}
                            </div>
                        ))}

                        {/* Divider between folders and files */}
                        {folderData.folders.length > 0 && folderData.files.length > 0 && (
                            <Divider sx={{ my: 1 }} />
                        )}

                        {/* Files */}
                        {folderData.files.map((file, index) => (
                            <div key={`file-${file}`}>
                                <ListItem>
                                    <ListItemIcon>
                                        {getFileIcon(file)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={file}
                                        secondary="File"
                                    />
                                    <IconButton aria-label="download" href={API.DOWNLOAD_WEBDL_FILE(currentPath + '/' + file)}>
                                        <DownloadIcon />
                                    </IconButton>
                                </ListItem>
                                {index < folderData.files.length - 1 && <Divider />}
                            </div>
                        ))}

                        {/* Empty State */}
                        {folderData.folders.length === 0 && folderData.files.length === 0 && (
                            <ListItem>
                                <ListItemText
                                    primary="This folder is empty"
                                    secondary="No files or folders to display"
                                    sx={{ textAlign: 'center', py: 4 }}
                                />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            )}
        </Container>
    );
}

export default WebdlPage;