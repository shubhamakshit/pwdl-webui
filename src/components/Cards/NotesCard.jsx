"use client";
import {Box, CardContent, Typography, Chip, Button, Grid, Paper, IconButton} from "@mui/material"; // Added IconButton
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import BaseCard from "./BaseCard";
import Stack from "@mui/material/Stack";

const NotesCard = ({
                       data,
                       onClick,
                       image,
                       selectable = false,
                       onSelect = () => {},
                       selected = false,
                       fields = [],
                       gridSize
                   }) => {
    const handleDownloadClick = (e, downloadLink) => {
        e.stopPropagation(); // Prevent card click when clicking download
        if (downloadLink) {
            window.open(downloadLink, '_blank');
        } else {
            console.warn("No download link available for this item.");
        }
    };

    const renderLectureContent = (data) => {
        const downloadLink = data?.homeworks?.[0]?.attachments?.[0]?.link || data?.content?.[0]?.file?.link;
        const fileName = data?.homeworks?.[0]?.attachments?.[0]?.name || data?.content?.[0]?.file?.name || "Downloadable File";

        return (
            <CardContent
                sx={{
                    flexGrow: 1,
                    p: 3,
                    '&:last-child': { pb: 3 }
                }}
            >
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        color: 'primary.main',
                        mb: 2
                    }}
                >
                    {data?.content?.[0]?.text || data?.homeworks?.[0]?.attachments?.[0]?.name || "Untitled"}
                </Typography>

                {downloadLink && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            mb: 2,
                        }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                                sx={{ overflow: 'hidden' }}
                            >
                                <PictureAsPdfIcon
                                    sx={{
                                        color: 'error.main',
                                        fontSize: '2rem',
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: 'text.primary',
                                    }}
                                    title={fileName}
                                >
                                    {fileName}
                                </Typography>
                            </Stack>
                            <IconButton
                                aria-label={`Download ${fileName}`} // More specific aria-label
                                title={`Download ${fileName}`}      // Tooltip for users
                                onClick={(e) => handleDownloadClick(e, downloadLink)}
                                size="small" // Consistent with previous button size
                                sx={{
                                    flexShrink: 0,
                                    // If you want it to have a contained look, you can add:
                                    // bgcolor: 'primary.main',
                                    // color: 'primary.contrastText',
                                    // '&:hover': { bgcolor: 'primary.dark' }
                                }}
                            >
                                <DownloadIcon fontSize="inherit" /> {/* Icon will inherit size from IconButton */}
                            </IconButton>
                        </Stack>
                    </Paper>
                )}

                {data?.tags && data.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {data.tags.slice(0, 2).map((tag, idx) => (
                            <Chip
                                key={idx}
                                label={tag?.name || tag || "Unknown Tag"}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    height: '24px',
                                    '& .MuiChip-label': {
                                        px: 1
                                    }
                                }}
                            />
                        ))}
                    </Box>
                )}

                {fields?.length > 0 && (
                    <Grid container spacing={1}>
                        {fields?.map((field, index) => (
                            <Grid item xs={12} key={index}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'flex-start', // Align items to the start for potentially multi-line values
                                        gap: 0.5,
                                    }}
                                >
                                    <Box component="span" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{field}:</Box>
                                    <Box
                                        component="span"
                                        sx={{
                                            fontFamily: "monospace",
                                            color: 'text.primary',
                                            wordBreak: 'break-all'
                                        }}
                                    >
                                        {data?.[field] !== undefined && data?.[field] !== null ? String(data?.[field]) : "N/A"}
                                    </Box>
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </CardContent>
        );
    };

    return (
        <BaseCard
            data={data}
            onClick={onClick}
            image={image}
            selectable={selectable}
            onSelect={onSelect}
            selected={selected}
            fields={fields}
            renderContent={renderLectureContent}
            gridSize={gridSize}
        />
    );
};

export default NotesCard;