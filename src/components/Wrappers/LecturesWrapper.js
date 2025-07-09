"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { Button, Grid, Tabs, Tab, Box, Paper } from '@mui/material'; // Added Paper for Item component
import DataListComponent from '@/components/DataListComponent'; // Assuming this path is correct
// Simple Item component for visual representation within the Grid
const Item = React.memo(({ children }) => (
    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', borderRadius: 2 }}>
        {children}
    </Box>
));
Item.displayName = "Item";

// Memoized TabPanel to prevent unnecessary re-renders
const TabPanel = React.memo(({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
});
TabPanel.displayName = "TabPanel";

// Performance-optimized wrapper component
const LecturesWrapper = React.memo(({
                                        tabConfigurations = [],
                                        params = {},
                                        a11yProps = () => ({}),
                                        onTabChange
                                    }) => {
    const validTabConfigurations = useMemo(() =>
            Array.isArray(tabConfigurations) ? tabConfigurations : [],
        [tabConfigurations]
    );

    const [tabValue, setTabValue] = useState(0);
    const [selectedItemsStates, setSelectedItemsStates] = useState(
        () => validTabConfigurations.map(() => [])
    );

    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);

        // Clear selection when changing tabs
        setSelectedItemsStates((prev) => {
            const newSelectedItemsStates = [...prev];
            newSelectedItemsStates[newValue] = []; // Clear selection for the newly active tab
            return newSelectedItemsStates;
        });

        onTabChange?.(newValue); // Callback to parent if provided
    }, [onTabChange]);

    const handleSelection = useCallback(
        (tabIndex) => (data) => {
            setSelectedItemsStates((prev) => {
                const newSelectedItemsStates = [...prev];
                const tabConfig = validTabConfigurations[tabIndex];

                if (tabConfig?.handleSelection) {
                    // Use a custom selection handler if provided in tab configuration
                    newSelectedItemsStates[tabIndex] =
                        tabConfig.handleSelection(data) || [];
                } else {
                    // Default selection handling: map selected items and add batch_name
                    newSelectedItemsStates[tabIndex] = data.map((item) => ({
                        ...item,
                        batch_name: params?.batch_name, // Inject batch_name from params
                    }));
                }

                return newSelectedItemsStates;
            });
        },
        [validTabConfigurations, params]
    );

    // If no valid tab configurations are provided, render nothing
    if (validTabConfigurations.length === 0) {
        return null;
    }

    return (
        // Grid container for the overall layout
        <Grid container spacing={2}>
            {/* Tabs for navigation */}
            {/* Replaced Grid item xs={12} with Grid size={{ xs: 12 }} */}
            <Grid size={{ xs: 12 }}>
                <Item> {/* Wrapping content in Item for consistent styling */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="batch content tabs"
                        >
                            {validTabConfigurations.map((tab, index) => (
                                <Tab
                                    key={index}
                                    label={tab.label || `Tab ${index + 1}`}
                                    {...a11yProps(index)} // Accessibility props for each tab
                                />
                            ))}
                        </Tabs>
                    </Box>
                </Item>
            </Grid>

            {/* Tab Panels for content */}
            {validTabConfigurations.map((tab, index) => {
                const currentSelectedItems = selectedItemsStates[index] || [];

                return (
                    // Replaced Grid item xs={12} with Grid size={{ xs: 12 }}
                    <Grid size={{ xs: 12 }} key={index}>
                        <TabPanel value={tabValue} index={index}>
                            {/* Download Button for selected items, if handleDownload is provided */}
                            {currentSelectedItems.length > 0 && tab.handleDownload && (
                                // Replaced Grid item xs={12} with Grid size={{ xs: 12 }}
                                <Grid size={{ xs: 12 }} sx={{ mb: 2 }}>
                                    <Item> {/* Wrapping content in Item for consistent styling */}
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => tab.handleDownload(currentSelectedItems)}
                                        >
                                            Download Selected {tab.label || 'Items'}
                                        </Button>
                                    </Item>
                                </Grid>
                            )}

                            {/* DataListComponent to display content for the current tab */}
                            <DataListComponent
                                fetchData={tab.fetchData || (() => Promise.resolve([]))}
                                onCardClick={tab.onCardClick || (() => {})}
                                onWatchClick={tab.onWatchClick || undefined}
                                fields={tab.fields || ["slug"]}
                                selectable={true} // Lectures are typically selectable
                                onSelectionChange={handleSelection(index)}
                                type={tab.type || 'default'} // Type of content (e.g., 'lecture', 'data')
                                noDataMessage={tab.noDataMessage || 'No data available'}
                                urlParams={params} // Pass URL parameters
                            />
                        </TabPanel>
                    </Grid>
                );
            })}
        </Grid>
    );
});

// Set display names for better debugging
LecturesWrapper.displayName = 'LecturesWrapper';

export default LecturesWrapper;
