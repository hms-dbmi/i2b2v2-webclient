import PropTypes from "prop-types";
import {RequestStatus} from "./RequestStatus";
import {RequestStatusLog} from "./RequestStatusLog";
import {ExportRequest} from "./ExportRequest";
import {StatusInfo} from "./StatusInfo";

export const AdminRequestDetails = ({
    id = null,
    name = "",
    requests = [],
    dateSubmitted = null,
    status= RequestStatus.statuses.SUBMITTED,
    userId = "",
    email= "",
    patientCount = null,
    statusLogs= [],
    isFetching = false,
    isUpdatingStatus = false,
    statusInfo = StatusInfo(),
    statusUpdateStatusInfo = StatusInfo()
} = {}) => ({
    id,
    name,
    requests,
    dateSubmitted,
    status,
    userId,
    email,
    patientCount,
    statusLogs,
    isFetching,
    isUpdatingStatus,
    statusInfo,
    statusUpdateStatusInfo
});

AdminRequestDetails.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    requests: PropTypes.arrayOf(ExportRequest).isRequired,
    dateSubmitted: PropTypes.instanceOf(Date).isRequired,
    status: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    patientCount: PropTypes.number.isRequired,
    statusLogs: PropTypes.arrayOf(PropTypes.shape(RequestStatusLog)).isRequired,
    isFetching: PropTypes.bool.isRequired,
    isUpdatingStatus: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),
    statusUpdateStatusInfo: PropTypes.shape(StatusInfo),
};