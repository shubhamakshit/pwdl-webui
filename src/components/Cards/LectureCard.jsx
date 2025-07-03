"use client";
import { Box, CardContent, Typography, Chip, Button } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import BaseCard from "./BaseCard";

/**
 * A specialized card component for displaying lecture information
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - The lecture data object to display
 * @param {Function} props.onClick - Function to call when the card is clicked
 * @param {string} props.image - Optional image URL to display
 * @param {boolean} props.selectable - Whether the lecture can be selected
 * @param {Function} props.onSelect - Function to call when the lecture is selected/deselected
 * @param {boolean} props.selected - Whether the lecture is initially selected
 * @param {Array<string>} props.fields - Array of field names to display dynamically
 * @param {Function} [props.onWatchClick] - Optional function to call when the watch button is clicked
 * @returns {JSX.Element} - The rendered component
 */
const LectureCard = ({
                         data,
                         onClick,
                         image,
                         selectable = false,
                         onSelect = () => {},
                         selected = false,
                         fields = [],
                         gridSize,
                         onWatchClick
                     }) => {
    // Custom content renderer for lectures
    const renderLectureContent = (data) => {
        // Determine the date to display, prioritizing endTime
        let displayDate = null;
        if (data.endTime) {
            displayDate = new Date(data.endTime);
        } else if (data.date) {
            displayDate = new Date(data.date);
        }

        const handleWatchClick = (event) => {
            event.stopPropagation(); // Prevent card's onClick from firing
            if (onWatchClick) {
                onWatchClick(data);
            } else {
                console.error("onWatchClick function is not provided for LectureCard.");
            }
        };

        return (
            <CardContent sx={{
                flexGrow: 1,
                display: 'flex', // Use flexbox
                flexDirection: 'column', // Arrange items vertically
                justifyContent: 'space-between', // Push button to the bottom
            }}>
                <Box> {/* Wrapper for all content except the button */}
                    {/* Date/Time Chip - Using displayDate logic */}
                    {displayDate && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                mb: 1.5,
                                width: '100%'
                            }}
                        >
                            <Chip
                                icon={<EventIcon sx={{ fontSize: '0.9rem !important' }} />}
                                label={displayDate.toLocaleDateString(undefined, {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                                size="small"
                                variant="filled"
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    color: 'text.secondary',
                                    '.MuiChip-icon': {
                                        color: 'text.secondary',
                                        ml: 0.5
                                    },
                                }}
                            />
                        </Box>
                    )}

                    <Typography variant="h6" gutterBottom>
                        {data.title || data.name}
                    </Typography>

                    <Typography variant="body2" color="textSecondary" gutterBottom noWrap>
                        {data.description ? data.description.split(";")[0] : null}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} color="action" />
                        <Typography variant="body2" color="textSecondary">
                            {data.duration || data.length || data?.videoDetails?.duration|| data?.content[0]?.videoDetails?.duration|| "Unknown"}
                        </Typography>
                    </Box>

                    {data.tags && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {data?.tags.slice(0, 2).map((tag, idx) => (
                                <Chip
                                    key={idx}
                                    label={tag?.name || tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                />
                            ))}
                        </Box>
                    )}

                    {fields.map((field, index) => (
                        // Exclude 'date' and 'endTime' from dynamic fields if they are explicitly handled
                        (field !== 'date' && field !== 'endTime') && (
                            <Typography key={index} variant="body2" color="textSecondary">
                                {field}:{" "}
                                <Box component="span" sx={{ fontFamily: "monospace" }}>
                                {data[field] !== undefined
                                    ? (typeof data[field] === "object"
                                        ? (data[field]?.toString !== Object.prototype.toString
                                            ? data[field].toString()
                                            : JSON.stringify(data[field]))
                                        : data[field])
                                    : "N/A"}
                                </Box>
                            </Typography>
                        )
                    ))}
                </Box>

                {/* Watch Button - Always at the very bottom of the CardContent */}
                <Box sx={{ mt: 2, width: '100%' }}>
                    <Button
                        variant="contained"
                        startIcon={<PlayCircleIcon />}
                        onClick={handleWatchClick}
                        fullWidth
                    >
                        Watch
                    </Button>
                </Box>
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

export default LectureCard;