import PropTypes from "prop-types";

export const AdminNote = ({
    id= null,
   date = null,
   note= "",
} = {}) => ({
    id,
    date,
    note,
});

AdminNote.propTypes = {
    id: PropTypes.number.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    note: PropTypes.string.isRequired,
};