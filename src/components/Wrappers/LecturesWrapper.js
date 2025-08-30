"use client";
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button, Grid, Tabs, Tab, Box, Paper } from '@mui/material';
import DataListComponent from '@/components/DataListComponent';

const Item = React.memo(({ children }) => (
    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', borderRadius: 2 }}>
        {children}
    </Box>
));
Item.displayName = "Item";

const TabPanel = React.forwardRef(({ children, value, index, ...other }, ref) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            ref={ref}
            tabIndex={-1} // Make it focusable
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

    const tabPanelRefs = useRef([]);

    useEffect(() => {
        tabPanelRefs.current = tabPanelRefs.current.slice(0, validTabConfigurations.length);
    }, [validTabConfigurations]);

    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);

        setSelectedItemsStates((prev) => {
            const newSelectedItemsStates = [...prev];
            newSelectedItemsStates[newValue] = [];
            return newSelectedItemsStates;
        });

        setTimeout(() => {
            tabPanelRefs.current[newValue]?.focus();
        }, 0);

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
            <Grid item xs={12}>
                <Item>
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
                </Item>
            </Grid>

            {validTabConfigurations.map((tab, index) => {
                const currentSelectedItems = selectedItemsStates[index] || [];

                return (
                    <Grid item xs={12} key={index}>
                        <TabPanel
                            value={tabValue}
                            index={index}
                            ref={(el) => (tabPanelRefs.current[index] = el)}
                        >
                            {currentSelectedItems.length > 0 && tab.handleDownload && (
                                <Grid item xs={12} sx={{ mb: 2 }}>
                                    <Item>
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

                            <DataListComponent
                                fetchData={tab.fetchData || (() => Promise.resolve([]))}
                                onCardClick={tab.onCardClick || (() => {})}
                                onWatchClick={tab.onWatchClick || undefined}
                                fields={tab.fields || ["slug"]}
                                selectable={true}
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

LecturesWrapper.displayName = 'LecturesWrapper';

export default LecturesWrapper;
