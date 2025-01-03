import PropTypes from "prop-types";

export const AdminNote = ({
   date = null,
   note= "",
} = {}) => ({
    date,
    note,
});

AdminNote.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    note: PropTypes.string.isRequired,
};