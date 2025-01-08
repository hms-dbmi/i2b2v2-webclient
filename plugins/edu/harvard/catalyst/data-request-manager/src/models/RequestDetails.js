import PropTypes from "prop-types";
import {ResearcherRequestDetails} from "./ResearcherRequestDetails";

export const RequestDetails = ({
     details = ResearcherRequestDetails(),
     log = [],
     isFetching= false,
 } = {}) => ({
    details,
    log,
    isFetching
})

RequestDetails.propTypes = {
    details:  PropTypes.instanceOf(ResearcherRequestDetails).isRequired,
    log: PropTypes.arrayOf(PropTypes.string).isRequired,
    status: PropTypes.string.isRequired,
    isFetching: PropTypes.bool
};