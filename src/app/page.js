"use client";

import Image from "next/image";
import styles from "./page.module.css";
import {Grid, Paper, styled, Box, TextField, Switch, Button} from "@mui/material";
import {useState} from "react";
import Details from "@/components/Details";
import FullDetails from "@/components/FullDetails";



const Home = () => {


    return (
        <div>


            <Box sx={{flexGrow: 1}}>
                <FullDetails onChange={(data) => console.log(data)}/>
            </Box>


        </div>
    );
}

export default Home;