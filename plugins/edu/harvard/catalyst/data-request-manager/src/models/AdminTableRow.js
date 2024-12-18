import PropTypes from "prop-types";
import {RequestStatus} from "./RequestStatus";


export const AdminTableRow = ({
   id = null,
   description= "",
   requests = [],
   lastUpdated = null,
   patientCount = null,
   userId = null,
   status= RequestStatus.statuses.SUBMITTED
} = {}) => ({
    id,
    description,
    requests,
    lastUpdated,
    patientCount,
    userId,
    status
});

AdminTableRow.propTypes = {
    id: PropTypes.number.isRequired,
    description:  PropTypes.string.isRequired,
    requests: PropTypes.arrayOf(PropTypes.string).isRequired,
    lastUpdated: PropTypes.instanceOf(Date).isRequired,
    patientCount: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
}
