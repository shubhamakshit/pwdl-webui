"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Grid, Typography, Fade, Box, Button } from "@mui/material";
import DataCard from "@/components/Cards/DataCard";
import LectureCard from "@/components/Cards/LectureCard";
import FullScreenLoader from "@/components/FullScreenLoader";
import useSelection from "@/hooks/useSelection";
import NotesCard from "@/components/Cards/NotesCard";

/**
 * A reusable component to fetch and display lists of data or lectures
 *
 * @param {Object} props - Component props
 * @param {Function} props.fetchData - Function to fetch data
 * @param {Function} props.onCardClick - Function to call when a card is clicked
 * @param {Function} props.renderCard - Optional custom card renderer
 * @param {Array<string>} props.fields - Array of field names to display dynamically
 * @param {string} props.noDataMessage - Message to display when no data is available
 * @param {string} props.loadingMessage - Message to display while loading
 * @param {string} props.errorMessage - Message to display when an error occurs
 * @param {string} props.type - Type of data ('data' or 'lecture' or 'notes')
 * @param {boolean} props.selectable - Whether items can be selected (primarily for lectures)
 * @param {Function} props.onSelectionChange - Callback when selection changes
 * @param {Object} props.gridSize - Grid item size configuration
 */
const DataListComponent = ({
                               fetchData,
                               onCardClick,
                               renderCard,
                               fields = [],
                               noDataMessage = "No data available.",
                               loadingMessage = "Loading...",
                               errorMessage = "An error occurred.",
                               type = "data", // 'data' or 'lecture'
                               selectable = false,
                               onSelectionChange = () => {},
                               gridSize = {size:  { xs: 12, sm: 6, md: 4, lg: 3 }}
                           }) => {
    const params = useParams();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    // Use the selection hook when in selectable mode
    const selection = useSelection(data, 'id');

    // Determine if we're in lecture mode
    const isLectureMode = useMemo(() => type === 'lecture', [type]);
    const isNotesMode = useMemo(() => type === 'notes', [type]);

    // Process image URLs for different data structures
    const getImageUrl = (item) => {
        if (item.image) {
            // Handle standard image object format
            return item.image.baseUrl + "/" + item.image.key;
        } else if (item.content && item.content[0]?.videoDetails?.image) {
            // Handle video content with image
            return item.content[0].videoDetails.image;
        }
        else if(item.videoDetails && item.videoDetails.image) {
            // Handle video details with image
            return item.videoDetails.image;
        }
        else if (item.thumbnail) {
            // Handle simple thumbnail URL
            return item.thumbnail;
        }
        return null;
    };

    useEffect(() => {
        setIsMounted(true); // Set to true when component mounts

        async function loadData() {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedData = await fetchData(params);
                console.dir(fetchedData);
                setData(fetchedData);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError(err.message || "Unknown error");
            } finally {
                setIsLoading(false);
            }
        }

        loadData();

        return () => {
            setIsMounted(false); // Set to false when component unmounts
        };
    }, [fetchData, params]);

    // Notify a parent component when selection changes
    useEffect(() => {
        if (selectable) {
            onSelectionChange(selection.selectedItemsData);
        }
    }, [selection.selectedItemsData, onSelectionChange, selectable]);

    if (isLoading) {
        return <FullScreenLoader />;
    }

    if (error) {
        return <Typography color="error">{errorMessage}: {error}</Typography>;
    }

    if (data.length === 0) {
        return <Typography variant="body1">{noDataMessage}</Typography>;
    }

    return (
        <Fade in={isMounted} timeout={500}>
            <Box>
                {selectable && data.length > 0 && (
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={selection.selectAll}
                        >
                            Select All
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={selection.clearSelection}
                        >
                            Clear Selection
                        </Button>
                    </Box>
                )}

                <Grid container spacing={3} sx={{ padding: 2 }}>
                    {data.map((item, index) => {
                        if (renderCard) {
                            return renderCard(item, index);
                        }

                        const imageUrl = getImageUrl(item);

                        if (isLectureMode) {
                            return (
                                <LectureCard
                                    key={item.id || item.slug || index}
                                    data={item}
                                    image={imageUrl}
                                    onClick={() => onCardClick(item)}
                                    fields={fields}
                                    selectable={selectable}
                                    onSelect={selection.handleSelect}
                                    selected={selection.isSelected(item)}
                                    gridSize={gridSize}
                                />
                            );
                        }

                        if(isNotesMode){
                            return (
                                <NotesCard
                                    key={item.id || item.slug || index}
                                    data={item}
                                    image={imageUrl}
                                    onClick={() => onCardClick(item)}
                                    fields={fields}
                                    selectable={selectable}
                                    onSelect={selection.handleSelect}
                                    selected={selection.isSelected(item)}
                                    gridSize={gridSize}
                                />
                            )
                        }

                        return (
                            <DataCard
                                key={item.id || item.slug || index}
                                data={item}
                                image={imageUrl}
                                onClick={() => onCardClick(item)}
                                fields={fields}
                                selectable={selectable}
                                onSelect={selection.handleSelect}
                                selected={selection.isSelected(item)}
                                gridSize={gridSize}
                            />
                        );
                    })}
                </Grid>
            </Box>
        </Fade>
    );
};

export default DataListComponent;