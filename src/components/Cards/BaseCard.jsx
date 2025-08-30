import { useState } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Typography,
    Button,
    Box,
    Grid
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankOutlined from "@mui/icons-material/CheckBoxOutlineBlankOutlined";

/**
 * A base card component that serves as the foundation for specialized card types
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - The data object to display
 * @param {Function} props.onClick - Function to call when the card is clicked
 * @param {string} props.image - Optional image URL to display
 * @param {boolean} props.selectable - Whether the item can be selected
 * @param {Function} props.onSelect - Function to call when the item is selected/deselected
 * @param {boolean} props.selected - Whether the item is initially selected
 * @param {Array<string>} props.fields - Array of field names to display dynamically
 * @param {Function} props.renderContent - Custom function to render the card content
 * @param {Function} props.renderActions - Custom function to render the card actions
 * @returns {JSX.Element} - The rendered component
 */
const BaseCard = ({
                      data,
                      onClick,
                      image,
                      selectable = false,
                      onSelect = () => {},
                      selected = false,
                      fields = [],
                      renderContent,
                      renderActions,
                      gridSize = { xs: 12, sm: 6, md: 4, lg: 3 }
                  }) => {
    // const [isSelected, setIsSelected] = useState(selected);
    const isSelected = selected;


    const handleSelect = () => {
        // setIsSelected(!isSelected);
        onSelect(data, !isSelected);
    };

    // Default content renderer
    const defaultContentRenderer = () => (
        <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
                {data.name} {data.description ? data.description.split(";")[0] : null}
            </Typography>
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

    // Default actions renderer
    const defaultActionsRenderer = () => (
        selectable && (
            <CardActions>
                <Box sx={{ width: "100%", display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant={isSelected ? "contained" : "outlined"}
                            endIcon={isSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleSelect();
                            }}
                        >
                            {isSelected ? "Selected" : "Select"}
                        </Button>
                    </Grid>
                </Box>
            </CardActions>
        )
    );

    return (
        <Grid {...gridSize}>
            <Card
                variant="outlined"
                tabIndex={0}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    minHeight: 200,
                    '&:focus-visible': {
                        outline: '2px solid #90caf9', // Example focus style
                        outlineOffset: '2px',
                    },
                }}
                onClick={selectable ? (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleSelect();
                } : onClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (selectable) {
                            handleSelect();
                        } else {
                            onClick(e);
                        }
                    }
                }}
            >
                {image && <CardMedia sx={{ height: 140 }} image={image} alt={data.name || "Card image"} />}

                {renderContent ? renderContent(data, isSelected, handleSelect) : defaultContentRenderer()}

                {renderActions ? renderActions(data, isSelected, handleSelect) : defaultActionsRenderer()}
            </Card>
        </Grid>
    );
};

export default BaseCard;