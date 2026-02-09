import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const QueryRequestDetails = ({
    queryMasterId="",
    queryName="",
    queryRequestXml="",
    queryRequestSQL="",
    isFetching= false,
    statusInfo = StatusInfo()
} = {}) => ({
    queryMasterId,
    queryName,
    queryRequestXml,
    queryRequestSQL,
    isFetching,
    statusInfo
});

QueryRequestDetails.propTypes = {
    queryMasterId: PropTypes.string.isRequired,
    queryName: PropTypes.string.isRequired,
    queryRequestXml: PropTypes.string.isRequired,
    queryRequestSQL: PropTypes.string.isRequired,
    isFetching: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo)
};