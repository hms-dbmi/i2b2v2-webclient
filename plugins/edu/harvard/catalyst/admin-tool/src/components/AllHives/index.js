import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import {  getAllHives } from "actions";
import { Loader } from "components";


import "./AllHives.scss";

export const AllHives = () => {
    const allHives = useSelector((state) => state.allHives );
    const isI2b2LibLoaded = useSelector((state) => state.isI2b2LibLoaded );
    const dispatch = useDispatch();

    const displayHivesDetail = () => {
        return (
            <Container>
                {
                    allHives.hives.map((hive) => (
                        <Grid container spacing={2}>
                            <Grid item xs={2}>
                                <Box className={"hiveLabel"}>{"Domain Id:"}</Box>
                            </Grid>
                            <Grid item xs={10}>
                                <Box>{hive.domainId}</Box>
                            </Grid>
                            <Grid item xs={2}>
                                <Box className={"hiveLabel"}>{"Help URL:"}</Box>
                            </Grid>
                            <Grid item xs={10}>
                                <Box><Link href={hive.helpUrl}>{hive.helpUrl}</Link></Box>
                            </Grid>
                            <Grid item xs={2}>
                                <Box className={"hiveLabel"}>{"Domain Name:"}</Box>
                            </Grid>
                            <Grid item xs={10}>
                                <Box>{hive.domainName}</Box>
                            </Grid>
                            <Grid item xs={2}>
                                <Box className={"hiveLabel"}>{"Environment:"} </Box>
                            </Grid>
                            <Grid item xs={10}>
                                <Box> {hive.environment} </Box>
                            </Grid>
                        </Grid>
                    ))
                }
            </Container>
        );
    };

    useEffect(() => {
        if(isI2b2LibLoaded) {
            dispatch(getAllHives({}));
        }
    }, []);

    return (
        <div className="AllHives">
            { allHives.isFetching && <Loader/>}
            { allHives.hives.length > 0 && displayHivesDetail()}
        </div>
    );
};

AllHives.propTypes = {};

