"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { Button, Grid, Tabs, Tab, Box } from '@mui/material';
import DataListComponent from '@/components/DataListComponent';

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

        setSelectedItemsStates((prev) => {
            const newSelectedItemsStates = [...prev];
            newSelectedItemsStates[newValue] = [];
            return newSelectedItemsStates;
        });

        onTabChange?.(newValue);
    }, [onTabChange]);

    const handleSelection = useCallback(
        (tabIndex) => (data) => {
            setSelectedItemsStates((prev) => {
                const newSelectedItemsStates = [...prev];
                const tabConfig = validTabConfigurations[tabIndex];

                if (tabConfig?.handleSelection) {
                    newSelectedItemsStates[tabIndex] =
                        tabConfig.handleSelection(data) || [];
                } else {
                    newSelectedItemsStates[tabIndex] = data.map((item) => ({
                        ...item,
                        batch_name: params?.batch_name,
                    }));
                }

                return newSelectedItemsStates;
            });
        },
        [validTabConfigurations, params]
    );

    if (validTabConfigurations.length === 0) {
        return null;
    }

    return (
        <Grid container spacing={2}>
            <Grid item size={12}>
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
                                {...a11yProps(index)}
                            />
                        ))}
                    </Tabs>
                </Box>
            </Grid>

            {validTabConfigurations.map((tab, index) => {
                const currentSelectedItems = selectedItemsStates[index] || [];

                return (
                    <Grid item size={12} key={index}>
                        <TabPanel value={tabValue} index={index}>
                            {currentSelectedItems.length > 0 && tab.handleDownload && (
                                <Grid item size={12} sx={{ mb: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => tab.handleDownload(currentSelectedItems)}
                                    >
                                        Download Selected {tab.label || 'Items'}
                                    </Button>
                                </Grid>
                            )}

                            <DataListComponent
                                fetchData={tab.fetchData || (() => Promise.resolve([]))}
                                onCardClick={tab.onCardClick || (() => {})}
                                fields={tab.fields || ["slug"]}
                                selectable
                                onSelectionChange={handleSelection(index)}
                                type={tab.type || 'default'}
                                noDataMessage={tab.noDataMessage || 'No data available'}
                                urlParams={params}
                            />
                        </TabPanel>
                    </Grid>
                );
            })}
        </Grid>
    );
});
// Set display name for better debugging
LecturesWrapper.displayName = 'LecturesWrapper';
TabPanel.displayName = "TabPanel"
export default LecturesWrapper;