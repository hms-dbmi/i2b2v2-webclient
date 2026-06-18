import React, {useEffect} from "react";
import {Box, CircularProgress} from "@mui/material";
import PropTypes from "prop-types";
import {QueryMetrics} from "models";
import {BarGraph} from "../../Graphs/BarGraph.js";
import * as d3 from "d3";
import "./QueryActivityByMonthView.scss";

export const QueryActivityByMonthView = ({queryMetrics}) => {
    const [chartData, setChartData] = React.useState([]);

    useEffect(() => {
        const newChartData = queryMetrics.queryActivityByMonth.activityByMonthList.map(b => {
            const options = { year: 'numeric', month: 'short' };
            const localizedDate =  b.date.toLocaleDateString(undefined, options);
                return {
                    name: localizedDate,
                    value: b.queryActivity
                }
            }
        );

        setChartData(newChartData);
    },[queryMetrics.queryActivityByMonth]);

    return (
        <Box className={"QueryActivityByMonthView ProjectOverviewInfoContentCount"}>
            <Box className={"QueryActivityByMonthViewHeader"}>
                <Box className={"QueryActivityByMonthViewItems"}>
                    <Box>
                        Query Activity By Month
                    </Box>
                </Box>
            </Box>
            <Box>
                {queryMetrics.isFetching && (
                    <Box className={"LoadingContent"}>
                        <CircularProgress className={"ContentProgress"}/>
                    </Box>
                )}
                <BarGraph data={chartData} xAxisTitle={"Month"} yAxisTitle={"# of Queries"} />
            </Box>
        </Box>

    );
};

QueryActivityByMonthView.propTypes = {
    queryMetrics: PropTypes.shape(QueryMetrics).isRequired
};