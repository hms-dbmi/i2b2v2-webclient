import PropTypes from "prop-types";
import {RequestStatus} from "./RequestStatus";
import {ExportRequest} from "./ExportRequest";


export const ResearcherTableRow = ({
    id = null,
    queryInstanceId = null,
    description= "",
    requests = [],
    dateSubmitted = null,
    patientCount = null,
    status= RequestStatus.statuses.SUBMITTED,
    userId,
} = {}) => ({
    id,
    queryInstanceId,
    description,
    requests,
    dateSubmitted,
    patientCount,
    userId,
    status
});

ResearcherTableRow.propTypes = {
    id: PropTypes.number.isRequired,
    queryInstanceId: PropTypes.number.isRequired,
    description:  PropTypes.string.isRequired,
    requests: PropTypes.arrayOf(ExportRequest).isRequired,
    dateSubmitted: PropTypes.instanceOf(Date).isRequired,
    patientCount: PropTypes.number.isRequired,
    userId:  PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
}

