import PropTypes from "prop-types";
import {StatusInfo} from "models";
import {QueryActivityInDays} from "./QueryActivityInDays";

export const QueryMetrics = ({
     queryActivityInDays= QueryActivityInDays(),
     isFetching=false,
     statusInfo= StatusInfo()
 } = {}) => ({
    queryActivityInDays,
    isFetching,
    statusInfo
});

QueryMetrics.propTypes = {
    queryActivityInDays: PropTypes.shape(QueryActivityInDays).isRequired,
    isFetching: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),
};