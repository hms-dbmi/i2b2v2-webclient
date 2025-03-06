import PropTypes from "prop-types";
import {RequestStatus} from "./RequestStatus";
import {ExportRequest} from "./ExportRequest";


export const ResearcherTableRow = ({
    id = null,
    description= "",
    requests = [],
    dateSubmitted = null,
    lastUpdated = null,
    status= RequestStatus.statuses.SUBMITTED
} = {}) => ({
    id,
    description,
    requests,
    dateSubmitted,
    lastUpdated,
    status
});

ResearcherTableRow.propTypes = {
    id: PropTypes.number.isRequired,
    description:  PropTypes.string.isRequired,
    requests: PropTypes.arrayOf(ExportRequest).isRequired,
    dateSubmitted: PropTypes.instanceOf(Date).isRequired,
    lastUpdated: PropTypes.instanceOf(Date).isRequired,
    status: PropTypes.string.isRequired
}

