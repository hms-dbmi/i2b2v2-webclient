import PropTypes from "prop-types";
import {StatusInfo} from "models";
import {QueryActivityInDays} from "./QueryActivityInDays";
import {TopUsersByQuery} from "./TopUsersByQuery";

export const QueryMetrics = ({
     queryActivityInDays= QueryActivityInDays(),
     topUsersByQuery=TopUsersByQuery(),
     isFetching=false,
     statusInfo= StatusInfo()
 } = {}) => ({
    queryActivityInDays,
    topUsersByQuery,
    isFetching,
    statusInfo
});

QueryMetrics.propTypes = {
    queryActivityInDays: PropTypes.shape(QueryActivityInDays).isRequired,
    topUsersByQuery: PropTypes.shape(TopUsersByQuery).isRequired,
    isFetching: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),
};