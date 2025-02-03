import PropTypes from "prop-types";

export const TableListingRow = ({
    id= null,
    title = null,
    creator_id= null,
    create_date= null,
    column_count = 0,
    visible = false,
 } = {}) => ({
    id,
    title,
    creator_id,
    create_date,
    column_count,
    visible
});

TableListingRow.propTypes = {
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    creator_id: PropTypes.string.isRequired,
    create_date: PropTypes.instanceOf(Date).isRequired,
    column_count: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
};
