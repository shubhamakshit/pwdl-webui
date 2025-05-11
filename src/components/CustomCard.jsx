import React from "react";
import { Card, CardActionArea, CardContent, Box } from "@mui/material";

/**
 * CustomCard Component
 * A reusable, flexible card component.
 *
 * Props:
 * - data: The data object for the card.
 * - onClick: Function to handle card clicks.
 * - renderHeader: Function to render the header section (optional).
 * - renderContent: Function to render the content section (optional).
 * - renderFooter: Function to render the footer section (optional).
 */
const CustomCard = ({ data, onClick, renderHeader, renderContent, renderFooter }) => {
    return (
        <Card
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                borderRadius: 4,
                boxShadow: 3,
                overflow: "hidden",
            }}
        >
            <CardActionArea onClick={onClick} sx={{ flex: 1 }}>
                {/* Header Section */}
                {renderHeader && (
                    <Box sx={{ width: "100%", flexShrink: 0 }}>{renderHeader(data)}</Box>
                )}

                {/* Content Section */}
                <CardContent sx={{ flex: 1 }}>
                    {renderContent ? renderContent(data) : <Box>No Content</Box>}
                </CardContent>
            </CardActionArea>

            {/* Footer Section */}
            {renderFooter && <Box sx={{ mt: "auto" }}>{renderFooter(data)}</Box>}
        </Card>
    );
};

export default CustomCard;