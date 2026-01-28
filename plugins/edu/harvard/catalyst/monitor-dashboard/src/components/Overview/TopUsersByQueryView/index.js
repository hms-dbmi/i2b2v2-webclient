import React, {useEffect} from "react";
import {Box, IconButton, MenuItem, TextField, Tooltip} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import PropTypes from "prop-types";
import {QueryMetrics} from "models";
import {BarGraph} from "../../Graphs/BarGraph.js";
import * as d3 from "d3";
import "./TopUsersByQueryView.scss";

export const TopUsersByQueryView = ({queryMetrics}) => {
    const [chartData, setChartData] = React.useState([]);
    const [days, setDays] = React.useState("1");
    const daysToUserTotalQuery = {
        "all": queryMetrics.topUsersByQuery.usersAndTotalQueries,
        "1": queryMetrics.topUsersByQuery.usersAndTotalQueries1Day,
        "7": queryMetrics.topUsersByQuery.usersAndTotalQueries7Days,
        "30": queryMetrics.topUsersByQuery.usersAndTotalQueries30Days
    }
    const handleUpdateTotalQueries = (value) => {
        setChartData(daysToUserTotalQuery[value]);
        setDays(value);
    }

    useEffect(() => {
        setChartData(daysToUserTotalQuery[days]);
    },[queryMetrics.topUsersByQuery]);

    return (
        <Box className={"TopUsersByQueryView ProjectOverviewInfoContentCount"}>
            <Box className={"TopUsersByQueryViewHeader"}>
                <Box className={"TopUsersByQueryViewHeaderItems"}>
                    <Box>
                        Top Users By Query Activity:
                    </Box>
                    <Box>
                        <TextField
                            select
                            value={days}
                            onChange={(event) => handleUpdateTotalQueries(event.target.value)}
                            variant="standard"
                        >
                            <MenuItem value={"1"}>1 day</MenuItem>
                            <MenuItem value={"7"}>7 days</MenuItem>
                            <MenuItem value={"30"}>30 days</MenuItem>
                            <MenuItem value={"all"}>All time</MenuItem>
                        </TextField>
                    </Box>
                    <Box>
                        <Tooltip title={"Displays up to 10 of the most active users. Users with no queries are omitted."}>
                            <InfoOutlineIcon color="primary" fontSize="small"/>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
            <Box>
                <BarGraph data={chartData}/>
            </Box>
        </Box>

    );
};

TopUsersByQueryView.propTypes = {
    queryMetrics: PropTypes.shape(QueryMetrics).isRequired
};