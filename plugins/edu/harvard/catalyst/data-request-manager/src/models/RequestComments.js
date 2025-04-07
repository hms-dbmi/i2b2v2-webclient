import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const RequestComments = ({
    id= null,
    comments= "",
    isFetching = false,
    isSaving= false,
    statusInfo = StatusInfo(),
    saveStatusInfo = StatusInfo(),
} = {}) => ({
    id,
    comments,
    isFetching,
    isSaving,
    statusInfo,
    saveStatusInfo
});

RequestComments.propTypes = {
    id: PropTypes.number.isRequired,
    comments: PropTypes.string.isRequired,
    isFetching: PropTypes.bool,
    isSaving: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
    saveStatusInfo: PropTypes.shape(StatusInfo),
};