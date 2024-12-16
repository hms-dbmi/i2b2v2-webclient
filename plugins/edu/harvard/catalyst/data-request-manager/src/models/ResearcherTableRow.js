import PropTypes from "prop-types";
import {RequestStatus} from "./RequestStatus";


export const ResearcherTableRow = ({
   id = null,
   description= "",
   requests = [],
   dateSubmitted = null,
   status= RequestStatus.statuses.SUBMITTED
} = {}) => ({
    id,
    description,
    requests,
    dateSubmitted,
    status
});

ResearcherTableRow.propTypes = {
    id: PropTypes.number.isRequired,
    description:  PropTypes.string.isRequired,
    requests: PropTypes.arrayOf(PropTypes.string).isRequired,
    dateSubmitted: PropTypes.instanceOf(Date).isRequired,
    status: PropTypes.string.isRequired
}

