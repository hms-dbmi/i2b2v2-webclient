import PropTypes from "prop-types";
import {ResearcherRequestDetails} from "./ResearcherRequestDetails";
import {DataFileGeneration} from "./DataFileGeneration";
import {StatusInfo} from "./StatusInfo";

export const RequestDetails = ({
    details = ResearcherRequestDetails(),
    dataFileGeneration = DataFileGeneration(),
    reloadQueryStatus = StatusInfo(),
} = {}) => ({
    details,
    dataFileGeneration,
    reloadQueryStatus
})

RequestDetails.propTypes = {
    details: PropTypes.instanceOf(ResearcherRequestDetails).isRequired,
    dataFileGeneration: PropTypes.instanceOf(DataFileGeneration),
    reloadQueryStatus: PropTypes.shape(StatusInfo),
};