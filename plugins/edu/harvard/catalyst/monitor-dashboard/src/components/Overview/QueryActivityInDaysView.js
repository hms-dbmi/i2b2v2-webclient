import React, {useEffect} from "react";
import {Box, CircularProgress, MenuItem, TextField, Typography} from "@mui/material";

export const QueryActivityInDaysView = ({queryMetrics}) => {
    const [totalQueriesInDays, setTotalQueriesInDays] = React.useState(queryMetrics.queryActivityInDays.totalQuery1Days);
    const [days, setDays] = React.useState("1");
    const dayToTotalQuery = {
        1: queryMetrics.queryActivityInDays.totalQuery1Days,
        7: queryMetrics.queryActivityInDays.totalQuery7Days,
        30: queryMetrics.queryActivityInDays.totalQuery30Days
    }
    const handleUpdateTotalQueries = (value) => {
        setTotalQueriesInDays(dayToTotalQuery[value]);
        setDays(value);
    }

    useEffect(() => {
        if(days === "1") {
            setTotalQueriesInDays(queryMetrics.queryActivityInDays.totalQuery1Days);
        }
    }, [queryMetrics.queryActivityInDays.totalQuery1Days]);

    return (
        <Typography variant="body2" className={"ProjectOverviewInfoContentCentered"}>
            {queryMetrics.isFetching && (
                <Box
                    className={"LoadingContent"}
                >
                    <CircularProgress className={"ContentProgress"}/>
                </Box>
            )}
            <Box className={"ProjectOverviewInfoContentCount"}>
                {totalQueriesInDays}
            </Box>
            <Box>
                queries performed in the last
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
                </TextField>
            </Box>
        </Typography>
    );
}