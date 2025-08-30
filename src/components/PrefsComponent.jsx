'use client';

import React, { useState, useEffect } from 'react';
import {
    Button,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    Tooltip,
    IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import dynamic from 'next/dynamic';

const AceEditor = dynamic(
    async () => {
        const ace = await import('react-ace');
        await import('ace-builds/src-noconflict/mode-json');
        await import('ace-builds/src-noconflict/theme-tomorrow_night');
        return ace;
    },
    { ssr: false }
);

const PrefsComponent = ({
    expanded = false,
    getData,
    updateData,
    title,
    keyModifierFunction,
    tooltipObject
}) => {
    const [prefs, setPrefs] = useState([]);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = getData();
                const result = data instanceof Promise ? await data : data;
                const prefsArray = Object.keys(result).map((key, index) => ({
                    id: index,
                    key: key,
                    value: result[key],
                }));
                setPrefs(prefsArray);
            } catch (error) {
                console.error('Error fetching preferences:', error);
            }
        };
        fetchData();
    }, [getData]);

    const handleEditClick = () => setEditMode(true);

    const handleSaveClick = async () => {
        setEditMode(false);
        const updatedPrefsObject = prefs.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        try {
            const result = updateData(updatedPrefsObject);
            if (result instanceof Promise) {
                await result;
            }
            console.log('Preferences updated successfully');
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    };

    const handleInputChange = (id, field, value) => {
        setPrefs(prev =>
            prev.map(pref => pref.id === id ? {...pref, [field]: value} : pref)
        );
    };

    const addNewOption = (id) => {
        setPrefs(prev =>
            prev.map(pref =>
                pref.id === id ? {...pref, value: [...pref.value, '']} : pref
            )
        );
    };

    const removeOption = (id, index) => {
        setPrefs(prev =>
            prev.map(pref =>
                pref.id === id ? {
                    ...pref,
                    value: pref.value.filter((_, i) => i !== index)
                } : pref
            )
        );
    };

    const handlePrimarySelect = (id, newValue) => {
        setPrefs(prev =>
            prev.map(pref => {
                if (pref.id === id) {
                    const newArray = [...pref.value];
                    const currentIndex = newArray.indexOf(newValue);
                    if (currentIndex > -1) {
                        newArray.splice(currentIndex, 1);
                        newArray.unshift(newValue);
                    }
                    return {...pref, value: newArray};
                }
                return pref;
            })
        );
    };

    const renderCell = (pref) => {
        if (editMode) {
            if (typeof pref.value === 'boolean') {
                return (
                    <ToggleButtonGroup
                        value={pref.value ? 'true' : 'false'}
                        exclusive
                        onChange={(e, newValue) =>
                            handleInputChange(pref.id, 'value', newValue === 'true')
                        }
                    >
                        <ToggleButton value="true">True</ToggleButton>
                        <ToggleButton value="false">False</ToggleButton>
                    </ToggleButtonGroup>
                );
            }

            if (typeof pref.value === 'object') {
                return (
                    <AceEditor
                        mode="json"
                        theme="tomorrow_night"
                        value={JSON.stringify(pref.value, null, 2)}
                        onChange={(newValue) => {
                            try {
                                const parsedValue = JSON.parse(newValue);
                                handleInputChange(pref.id, 'value', parsedValue);
                            } catch (err) {
                                // Ignore JSON parsing errors
                            }
                        }}
                        name={`json-editor-${pref.id}`}
                        editorProps={{ $blockScrolling: true }}
                        width="100%"
                        setOptions={{ useWorker: false }}
                    />
                );
            }

            if (Array.isArray(pref.value)) {
                return (
                    <div>
                        <Select
                            value={pref.value[0] || ''}
                            onChange={(e) => handlePrimarySelect(pref.id, e.target.value)}
                            fullWidth
                        >
                            {pref.value.map((value, index) => (
                                <MenuItem 
                                    key={index} 
                                    value={value}
                                    sx={{ p: 2 }}
                                >
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                        <div>
                            {pref.value.map((value, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginTop: 10
                                    }}
                                >
                                    <TextField
                                        value={value}
                                        onChange={(e) => {
                                            const updatedArray = [...pref.value];
                                            updatedArray[index] = e.target.value;
                                            handleInputChange(pref.id, 'value', updatedArray);
                                        }}
                                        fullWidth
                                        autoFocus={value === ''}
                                    />
                                    <IconButton
                                        onClick={() => removeOption(pref.id, index)}
                                        disabled={index === 0}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                        <IconButton 
                            onClick={() => addNewOption(pref.id)} 
                            sx={{ mt: 1 }}
                        >
                            <AddIcon />
                        </IconButton>
                    </div>
                );
            }

            return (
                <TextField
                    value={pref.value}
                    onChange={(e) => handleInputChange(pref.id, 'value', e.target.value)}
                    fullWidth
                />
            );
        }

        return typeof pref.value === 'boolean' 
            ? (pref.value ? 'True' : 'False') 
            : typeof pref.value === 'object' 
                ? JSON.stringify(pref.value) 
                : <TextField 
                    value={pref.value} 
                    disabled 
                    fullWidth 
                  />;
    };

    return (
        <div className="p-2">
            <Accordion defaultExpanded={expanded}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {editMode ? (
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleSaveClick}
                            >
                                <SaveIcon /> Save All
                            </Button>
                        ) : (
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={handleEditClick}
                            >
                                <EditIcon /> Edit All
                            </Button>
                        )}
                    </div>
                    <Paper sx={{ mt: 2 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Key</TableCell>
                                        <TableCell align="center">Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prefs.map((pref) => (
                                        <TableRow key={pref.id}>
                                            <TableCell 
                                                align="center" 
                                                sx={{
                                                    wordWrap: 'break-word',
                                                    whiteSpace: 'normal'
                                                }}
                                            >
                                                <Tooltip title={tooltipObject ? tooltipObject[pref.key] : ''}>
                                                    <span>
                                                        {keyModifierFunction 
                                                            ? keyModifierFunction(pref.key) 
                                                            : pref.key}
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell 
                                                align="center" 
                                                sx={{ whiteSpace: 'normal' }}
                                            >
                                                {renderCell(pref)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default PrefsComponent;