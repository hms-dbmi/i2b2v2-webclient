import PropTypes from "prop-types";
import {RequestStatus} from "./RequestStatus";


export const ResearcherTableRow = ({
   id = null,
   description= "",
   requests = [],
   dateSubmitted = null,
   irbNumber= "",
   status= RequestStatus.statuses.SUBMITTED
} = {}) => ({
    id,
    description,
    requests,
    dateSubmitted,
    irbNumber,
    status
});

ResearcherTableRow.propTypes = {
    id: PropTypes.number.isRequired,
    description:  PropTypes.string.isRequired,
    requests: PropTypes.arrayOf(PropTypes.string).isRequired,
    dateSubmitted: PropTypes.instanceOf(Date).isRequired,
    irbNumber: PropTypes.string.isRequired
}

