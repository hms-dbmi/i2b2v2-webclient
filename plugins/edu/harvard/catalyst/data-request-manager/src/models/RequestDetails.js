import PropTypes from "prop-types";
import {ResearcherRequestDetails} from "./ResearcherRequestDetails";
import {StatusInfo} from "./StatusInfo";

export const RequestDetails = ({
    details = ResearcherRequestDetails(),
    reloadQueryStatus = StatusInfo(),
} = {}) => ({
    details,
    reloadQueryStatus
})

RequestDetails.propTypes = {
    details: PropTypes.instanceOf(ResearcherRequestDetails).isRequired,
    reloadQueryStatus: PropTypes.shape(StatusInfo),
};