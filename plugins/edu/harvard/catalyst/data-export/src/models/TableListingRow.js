import PropTypes from "prop-types";

export const TableListingRow = ({
    id= null,
    title = null,
    create_date= null,
    edit_date =  null,
    column_count = 0
 } = {}) => ({
    id,
    title,
    create_date,
    edit_date,
    column_count
});

TableListingRow.propTypes = {
    id: PropTypes.number,
    title: PropTypes.string,
    create_date: PropTypes.instanceOf(Date),
    edit_date: PropTypes.instanceOf(Date),
    column_count: PropTypes.number
};
