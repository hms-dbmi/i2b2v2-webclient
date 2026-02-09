import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const QueryRequestDetails = ({
    queryMasterId="",
    queryName="",
    queryRequestXml="",
    isFetching= false,
    statusInfo = StatusInfo()
} = {}) => ({
    queryMasterId,
    queryName,
    queryRequestXml,
    isFetching,
    statusInfo
});

QueryRequestDetails.propTypes = {
    queryMasterId: PropTypes.string.isRequired,
    queryName: PropTypes.string.isRequired,
    queryRequestXml: PropTypes.string.isRequired,
    isFetching: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo)
};