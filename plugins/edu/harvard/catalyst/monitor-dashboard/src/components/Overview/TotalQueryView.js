import React from "react";
import {Box, CircularProgress, Typography} from "@mui/material";
import PropTypes from "prop-types";
import {QueryActivityInDays} from "../../models";


export const TotalQueryView = ({queryMetrics}) => {

    return (
        <Typography variant="body2" className={"ProjectOverviewInfoContentCentered"}>
            {queryMetrics.isFetching && (
                <Box className={"LoadingContent"}>
                    <CircularProgress className={"ContentProgress"}/>
                </Box>
            )}
            <Box className={"ProjectOverviewInfoContentCount"}>
                {queryMetrics.queryActivityInDays.totalQuery}
            </Box>
            <Box>
                Total Number of Queries Performed
            </Box>
        </Typography>
    );
};

TotalQueryView.propTypes = {
    queryMetrics: PropTypes.shape(QueryActivityInDays).isRequired
};