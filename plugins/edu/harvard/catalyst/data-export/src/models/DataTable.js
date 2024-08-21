import PropTypes from "prop-types";

export const DataTable = ({
     table = {},
     isFetching= false,
 } = {}) => ({
    table,
    isFetching
});

DataTable.propTypes = {
    table: PropTypes.object,
    isFetching: PropTypes.bool,
};
