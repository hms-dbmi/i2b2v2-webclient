import PropTypes from "prop-types";
import {AdminNote} from "./AdminNote";
import {StatusInfo} from "./StatusInfo";

export const AdminNotes = ({
    notes = [],
    isFetching= false,
    statusInfo = StatusInfo(),
} = {}) => ({
    notes,
    isFetching,
    statusInfo
});

AdminNotes.propTypes = {
    notes: PropTypes.arrayOf(AdminNote).isRequired,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};