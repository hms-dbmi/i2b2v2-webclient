import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableListingRow} from "./TableListingRow";

export const TableListing = ({
    sharedRows = [],
    userRows = [],
    isFetching= false,
    isDeleting = false,
    statusInfo = StatusInfo(),
    deleteStatusInfo = false
} = {}) => ({
    sharedRows,
    userRows,
    isFetching,
    isDeleting,
    statusInfo,
    deleteStatusInfo
});

TableListing.propTypes = {
    sharedRows: PropTypes.arrayOf(TableListingRow),
    userRows: PropTypes.arrayOf(TableListingRow),
    isFetching: PropTypes.bool,
    isDeleting: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
    deleteStatusInfo: PropTypes.shape(StatusInfo),
};
