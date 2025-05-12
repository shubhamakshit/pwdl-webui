"use client";
import {Box, CardContent, Typography, Chip, Button, Grid, Paper} from "@mui/material";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import BaseCard from "./BaseCard";
import Stack from "@mui/material/Stack"; // Ensure Stack is imported

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
        e.stopPropagation();
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
                    p: 3, // Increased padding
                    '&:last-child': { pb: 3 } // Override MUI's default last-child padding
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
                            borderRadius: 2, // Or use theme.shape.borderRadius for consistency
                            mb: 2,
                        }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2} // Spacing between file info and download button
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5} // Spacing between icon and file name
                                sx={{ overflow: 'hidden' }} // Ensures text ellipsis works
                            >
                                <PictureAsPdfIcon
                                    sx={{
                                        color: 'error.main', // Consistent with original
                                        fontSize: '2rem',    // Consistent with original, consider '1.75rem' for slightly smaller
                                        flexShrink: 0,       // Prevents icon from shrinking
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
                                    title={fileName} // Show full file name on hover
                                >
                                    {fileName}
                                </Typography>
                            </Stack>
                            <Button
                                onClick={(e) => handleDownloadClick(e, downloadLink)}
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                size="small"
                                sx={{ flexShrink: 0 }} // Prevents button from shrinking
                            >
                                Download
                            </Button>
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
                    // Consider using Stack here as well if items are simple key-value pairs
                    // For now, keeping Grid as per original structure for this part
                    <Grid container spacing={1}> {/* Changed from <Grid spacing={1}> to <Grid container spacing={1}> for proper grid behavior */}
                        {fields?.map((field, index) => (
                            <Grid item xs={12} key={index}> {/* Wrap Typography in Grid item for proper spacing and layout within container */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5, // Adjusted gap for better visual
                                    }}
                                >
                                    <Box component="span" sx={{ fontWeight: 500 }}>{field}:</Box> {/* Use Box for styling consistency */}
                                    <Box
                                        component="span"
                                        sx={{
                                            fontFamily: "monospace",
                                            color: 'text.primary',
                                            wordBreak: 'break-all' // If value can be long
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