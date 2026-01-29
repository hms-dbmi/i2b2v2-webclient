import PropTypes from "prop-types";
import {StatusInfo} from "models";
import {QueryActivityInDays} from "./QueryActivityInDays";
import {TopUsersByQuery} from "./TopUsersByQuery";
import {QueryActivityByMonth} from "./QueryActivityByMonth";

export const QueryMetrics = ({
    queryActivityInDays= QueryActivityInDays(),
    topUsersByQuery= TopUsersByQuery(),
    queryActivityByMonth= QueryActivityByMonth(),
    isFetching= false,
    statusInfo = StatusInfo()
 } = {}) => ({
    queryActivityInDays,
    topUsersByQuery,
    queryActivityByMonth,
    isFetching,
    statusInfo
});

QueryMetrics.propTypes = {
    queryActivityInDays: PropTypes.shape(QueryActivityInDays).isRequired,
    topUsersByQuery: PropTypes.shape(TopUsersByQuery).isRequired,
    queryActivityByMonth: PropTypes.shape(QueryActivityByMonth).isRequired,
    isFetching: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),
};