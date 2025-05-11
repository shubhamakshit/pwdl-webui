"use client";


import {Grid, Paper, styled, Box, TextField, Switch, Button, Checkbox, FormControlLabel} from "@mui/material";
import {useEffect, useState} from "react";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteSharp from '@mui/icons-material/Delete';

const DataTextField = ({placeholder, onChange, value}) => {
    return (
        <TextField
            id={"data-text-field-" + placeholder}
            label={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            variant="outlined"
            fullWidth
        />
    )
};


const Details = ({onChange,onDelete,open,initState}) => {

    const [khazanaEnabledDataField, setKhazanaEnabledDataField] = useState(false);

    const [cmdDetailsState, setCmdDetailsState] = useState( initState||{
        name: '',
        id: '',
        batch_name: '',
        topic_name: '',
        lecture_url: ''
    });

    const toggleKhazanaEnabledDataField = (checked) => {
        setKhazanaEnabledDataField(checked);
    };

    const handleDelete = () => {
        if(onDelete !== undefined)
        onDelete();
    };

    useEffect(() => {
        if (onChange !== undefined)
            onChange(cmdDetailsState);
        if(cmdDetailsState.topic_name || cmdDetailsState.lecture_url ){setKhazanaEnabledDataField(true);}
    }, [cmdDetailsState]);

    return (
        <div>


            <Box sx={{flexGrow: 1}}>
                <Grid container spacing={2}>

                    <Grid size={{xs: 12, sm: 12, md: 3}} spacing={2}>
                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <DataTextField placeholder={"Name"} onChange={(value) => {
                                    setCmdDetailsState((prev) => ({...prev, name: value}));
                                }}
                                               value={cmdDetailsState.name}
                                />
                            </Grid>
                            <Grid size={6}>
                                <Button
                                    size={"large"}
                                    variant={khazanaEnabledDataField ? "outlined" : "outlined"}
                                    fullWidth
                                    disableRipple
                                    onClick={() => toggleKhazanaEnabledDataField(!khazanaEnabledDataField)}
                                    startIcon={
                                        khazanaEnabledDataField ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>
                                    }
                                >
                                    Khazana
                                </Button>
                            </Grid>
                            <Grid size={6}>
                                <Button
                                    size={"large"}
                                    variant="outlined"
                                    color={"error"}
                                    fullWidth
                                    disableRipple
                                    onClick={handleDelete}
                                    startIcon={
                                        <DeleteSharp/>
                                    }
                                >
                                    Delete
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>


                    {/* Second column with 3 rows */}
                    <Grid size={{xs: 12, sm: 12, md: 9}}>
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <DataTextField placeholder={"Id"} onChange={(value) => {
                                    setCmdDetailsState((prev) => ({...prev, id: value}));
                                }}
                                               value={cmdDetailsState.id}
                                />
                            </Grid>
                            <Grid size={6}>
                                <DataTextField placeholder={"Batch_name"} onChange={(value) => {
                                    setCmdDetailsState((prev) => ({...prev, batch_name: value}));
                                }}
                                               value={cmdDetailsState.batch_name}
                                />
                            </Grid>
                            {
                                khazanaEnabledDataField ?
                                    (<>
                                            <Grid size={6}>
                                                <DataTextField placeholder={"Topic Id"} onChange={(value) => {
                                                    setCmdDetailsState((prev) => ({...prev, topic_name: value}));
                                                }}
                                                               value={cmdDetailsState.topic_name}
                                                />
                                            </Grid>
                                            <Grid size={6}>
                                                <DataTextField placeholder={"Lecture Url"} onChange={(value) => {
                                                    setCmdDetailsState((prev) => ({...prev, lecture_url: value}));
                                                }}
                                                               value={cmdDetailsState.lecture_url}
                                                />
                                            </Grid>
                                        </>
                                    )
                                    : null
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Box>


        </div>
    );
}

export default Details;