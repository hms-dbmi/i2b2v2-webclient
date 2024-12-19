import PropTypes from "prop-types";
import {ResearcherRequestDetails} from "./ResearcherRequestDetails";
import {DataFileGeneration} from "./DataFileGeneration";

export const RequestDetails = ({
     details = ResearcherRequestDetails(),
     dataFileGeneration = DataFileGeneration(),
     log = [],
 } = {}) => ({
    details,
    dataFileGeneration,
    log
})

RequestDetails.propTypes = {
    details: PropTypes.instanceOf(ResearcherRequestDetails).isRequired,
    dataFileGeneration: PropTypes.instanceOf(DataFileGeneration),
    log: PropTypes.arrayOf(PropTypes.string).isRequired,
    status: PropTypes.string.isRequired,
    isFetching: PropTypes.bool
};