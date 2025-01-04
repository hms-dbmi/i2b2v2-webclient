import PropTypes from "prop-types";
import {AdminNote} from "./AdminNote";
import {StatusInfo} from "./StatusInfo";

export const AdminNotes = ({
    notes = [],
    isFetching= false,
    statusInfo = StatusInfo(),
    addStatusInfo = StatusInfo()
} = {}) => ({
    notes,
    isFetching,
    statusInfo,
    addStatusInfo
});

AdminNotes.propTypes = {
    notes: PropTypes.arrayOf(AdminNote).isRequired,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
    addStatusInfo: PropTypes.shape(StatusInfo),
};