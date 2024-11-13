import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableListingRow} from "./TableListingRow";

export const TableListing = ({
    sharedRows = [],
    userRows = [],
    isFetching= false,
    statusInfo = StatusInfo(),
} = {}) => ({
    sharedRows,
    userRows,
    isFetching,
    statusInfo
});

TableListing.propTypes = {
    sharedRows: PropTypes.arrayOf(TableListingRow),
    userRows: PropTypes.arrayOf(TableListingRow),
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
