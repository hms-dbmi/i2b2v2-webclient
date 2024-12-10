import PropTypes from "prop-types";
import {RequestStatus} from "./RequestStatus";

export const ResearcherRequestDetails = ({
    id = null,
    name = "",
    requests = [],
    dateSubmitted = null,
    irbNumber= "",
    status= RequestStatus.statuses.SUBMITTED,
    userId = "",
    email= "",
    statusLogs= []
} = {}) => ({
    id,
    name,
    requests,
    dateSubmitted,
    irbNumber,
    status,
    userId,
    email,
    statusLogs
});

ResearcherRequestDetails.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    requests: PropTypes.arrayOf(PropTypes.string).isRequired,
    dateSubmitted: PropTypes.instanceOf(Date).isRequired,
    irbNumber: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    statusLogs: PropTypes.arrayOf(PropTypes.string).isRequired,
};