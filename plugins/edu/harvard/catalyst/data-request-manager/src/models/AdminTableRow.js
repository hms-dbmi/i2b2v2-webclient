import PropTypes from "prop-types";
import {RequestStatus} from "./RequestStatus";
import {DataFileGeneration} from "./DataFileGeneration";

export const AdminTableRow = ({
    id = null,
    queryInstanceId = null,
    description= "",
    requests = [],
    dateSubmitted = null,
    patientCount = null,
    userId = null,
    status= RequestStatus.statuses.SUBMITTED,
    dataFileGeneration = DataFileGeneration(),
    isFetchingStatus = false
} = {}) => ({
    id,
    queryInstanceId,
    description,
    requests,
    dateSubmitted,
    patientCount,
    userId,
    status,
    dataFileGeneration,
    isFetchingStatus
});

AdminTableRow.propTypes = {
    id: PropTypes.number.isRequired,
    queryInstanceId: PropTypes.number.isRequired,
    description:  PropTypes.string.isRequired,
    requests: PropTypes.arrayOf(PropTypes.string).isRequired,
    dateSubmitted: PropTypes.instanceOf(Date).isRequired,
    patientCount: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    isFetchingStatus: PropTypes.bool.isRequired,
    dataFileGeneration: PropTypes.instanceOf(DataFileGeneration),
}
