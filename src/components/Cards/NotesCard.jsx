import { Box, CardContent, Typography, Chip } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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
 * @returns {JSX.Element} - The rendered component
 */
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
    // Custom content renderer for lectures
    const renderLectureContent = (data) => (
        <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
                {data?.homeworks[0].attachments[0].name || null}
            </Typography>

            {/*<Typography variant="body2" color="textSecondary" gutterBottom noWrap>*/}
            {/*    {data?.homeworks[0].attachments[0].name || null}*/}
            {/*</Typography>*/}

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                <PictureAsPdfIcon fontSize="small" sx={{ mr: 0.5 }} color="action" />
                <Typography variant="body2" color="textSecondary">
                    {data?.homeworks[0].attachments[0].link || data.length || data?.videoDetails?.duration|| "Unknown"}
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
                <Typography key={index} variant="body2" color="textSecondary">
                    {field}:{" "}
                    <Box component="span" sx={{ fontFamily: "monospace" }}>
                        {data[field] !== undefined ? data[field] : "N/A"}
                    </Box>
                </Typography>
            ))}
        </CardContent>
    );

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