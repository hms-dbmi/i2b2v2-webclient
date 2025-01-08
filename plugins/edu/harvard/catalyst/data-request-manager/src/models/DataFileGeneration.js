import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const DataFileGeneration = ({
     requestId = null,
     isGenerating= false,
     statusInfo = StatusInfo()
 } = {}) => ({
    requestId,
    isGenerating,
    statusInfo
})

DataFileGeneration.propTypes = {
    requestId: PropTypes.number.isRequired,
    isGenerating: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};