import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {QueryDefinition} from "./QueryDefinition";

export const QueryRequestDetails = ({
    queryMasterId="",
    queryName="",
    username="",
    queryRequestXml="",
    queryRequestSQL="",
    queryDefinition = QueryDefinition(),
    isFetching= false,
    statusInfo = StatusInfo()
} = {}) => ({
    queryMasterId,
    queryName,
    username,
    queryRequestXml,
    queryRequestSQL,
    queryDefinition,
    isFetching,
    statusInfo
});

QueryRequestDetails.propTypes = {
    queryMasterId: PropTypes.string.isRequired,
    queryName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    queryRequestXml: PropTypes.string.isRequired,
    queryRequestSQL: PropTypes.string.isRequired,
    queryDefinition: PropTypes.shape(QueryDefinition).isRequired,
    isFetching: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo)
};