import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const SaveTable = ({
    table = {},
    isSaving= false,
    statusInfo = StatusInfo(),
} = {}) => ({
    table,
    isSaving,
    statusInfo
});

SaveTable.propTypes = {
    table: PropTypes.object,
    isSaving: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
