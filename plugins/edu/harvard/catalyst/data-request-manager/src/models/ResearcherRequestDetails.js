import PropTypes from "prop-types";
import {RequestStatus} from "./RequestStatus";
import {RequestStatusLog} from "./RequestStatusLog";
import {ExportRequest} from "./ExportRequest";
import {StatusInfo} from "./StatusInfo";

export const ResearcherRequestDetails = ({
    id = null,
    name = "",
    requests = [],
    dateSubmitted = null,
    patientCount = null,
    status= RequestStatus.statuses.SUBMITTED,
    userId = "",
    email= "",
    statusLogs= [],
    isFetching= false,
    isUpdatingStatus = false,
    statusInfo = StatusInfo(),
    statusUpdateStatusInfo = StatusInfo()
 } = {}) => ({
    id,
    name,
    requests,
    dateSubmitted,
    patientCount,
    status,
    userId,
    email,
    statusLogs,
    isFetching,
    isUpdatingStatus,
    statusInfo,
    statusUpdateStatusInfo
});

ResearcherRequestDetails.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    requests: PropTypes.arrayOf(ExportRequest).isRequired,
    dateSubmitted: PropTypes.instanceOf(Date).isRequired,
    patientCount: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    statusLogs: PropTypes.arrayOf(PropTypes.shape(RequestStatusLog)).isRequired,
    isFetching: PropTypes.bool.isRequired,
    isUpdatingStatus: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),
    statusUpdateStatusInfo: PropTypes.shape(StatusInfo),
};