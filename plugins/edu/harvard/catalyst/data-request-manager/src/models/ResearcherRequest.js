import PropTypes from "prop-types";
import {ResearcherRequestDetails} from "./ResearcherRequestDetails";

export const ResearcherRequest = ({
     details = ResearcherRequestDetails(),
     log = [],
     isFetching= false,
 } = {}) => ({
    details,
    log,
    isFetching
})

ResearcherRequest.propTypes = {
    details:  PropTypes.instanceOf(ResearcherRequestDetails).isRequired,
    log: PropTypes.arrayOf(PropTypes.string).isRequired,
    status: PropTypes.string.isRequired,
    isFetching: PropTypes.bool
};