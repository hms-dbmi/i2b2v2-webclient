import PropTypes from "prop-types";

export const TableListingRow = ({
    id= null,
    title = null,
    create_date= null,
    edit_date =  null,
    column_count = 0,
    user_id= null
 } = {}) => ({
    id,
    title,
    create_date,
    edit_date,
    column_count,
    user_id
});

TableListingRow.propTypes = {
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    create_date: PropTypes.instanceOf(Date).isRequired,
    edit_date: PropTypes.instanceOf(Date).isRequired,
    column_count: PropTypes.number.isRequired,
    user_id: PropTypes.string.isRequired
};
