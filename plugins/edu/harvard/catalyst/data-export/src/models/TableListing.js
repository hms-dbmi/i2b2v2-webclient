import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableListingRow} from "./TableListingRow";

export const TableListing = ({
    rows = [],
    isFetching= false,
    statusInfo = StatusInfo(),
} = {}) => ({
    rows,
    isFetching,
    statusInfo
});

TableListing.propTypes = {
    rows: PropTypes.arrayOf(TableListingRow),
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
