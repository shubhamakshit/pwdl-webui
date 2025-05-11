import { useState } from "react";
import {
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Typography,
    Button,
    Box
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankOutlined from "@mui/icons-material/CheckBoxOutlineBlankOutlined";

/**
 * A reusable card component for displaying data information
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - The data object to display
 * @param {Function} props.onClick - Function to call when the card is clicked
 * @param {string} props.image - Optional image URL to display
 * @param {boolean} props.selectable - Whether the data can be selected
 * @param {Function} props.onSelect - Function to call when the data is selected/deselected
 * @param {boolean} props.selected - Whether the data is initially selected
 * @param {Array<string>} props.fields - Array of field names to display dynamically
 * @returns {JSX.Element} - The rendered component
 */
const DataCard = ({
                      data,
                      onClick,
                      image,
                      selectable = false,
                      onSelect = () => {},
                      selected = false,
                      fields = [] // New prop to specify custom fields
                  }) => {
    const [isSelected, setIsSelected] = useState(selected);

    const handleSelect = () => {
        setIsSelected(!isSelected);
        onSelect(data, !isSelected);
    };

    return (
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card
                variant="outlined"
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    minHeight: 200
                }}
                onClick={selectable ? (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleSelect();
                } : onClick}
            >
                {image && <CardMedia sx={{ height: 140 }} image={image} alt={data.name} />}

                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        {data.name} {data.description?data.description.split(";")[0]:null}
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

                {selectable && (
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
                )}
            </Card>
        </Grid>
    );
};

export default DataCard;