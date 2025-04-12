import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const ConfigInfo = ({
                               obfuscatedDisplayNumber= null,
                               useFloorThreshold= false,
                               floorThresholdNumber= null,
                               floorThresholdText= null,
                               isFetching= false,
                               statusInfo= StatusInfo()
                           } = {}) => ({
    obfuscatedDisplayNumber,
    useFloorThreshold,
    floorThresholdNumber,
    floorThresholdText,
    isFetching,
    statusInfo
});

ConfigInfo.propTypes = {
    obfuscatedDisplayNumber: PropTypes.number.isRequired,
    useFloorThreshold: PropTypes.bool,
    floorThresholdNumber: PropTypes.number.isRequired,
    floorThresholdText: PropTypes.string.isRequired,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};