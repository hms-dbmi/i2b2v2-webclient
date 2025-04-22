import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableListingRow} from "./TableListingRow";

export const TableListing = ({
    globalRows = [],
    projectRows=[],
    userRows = [],
    isFetching= false,
    isDeleting = false,
    isRenaming = false,
    statusInfo = StatusInfo(),
    deleteStatusInfo = false,
    renameStatusInfo = false
} = {}) => ({
    globalRows,
    projectRows,
    userRows,
    isFetching,
    isDeleting,
    isRenaming,
    statusInfo,
    deleteStatusInfo,
    renameStatusInfo
});

TableListing.propTypes = {
    globalRows: PropTypes.arrayOf(TableListingRow),
    projectRows: PropTypes.arrayOf(TableListingRow),
    userRows: PropTypes.arrayOf(TableListingRow),
    isFetching: PropTypes.bool,
    isDeleting: PropTypes.bool,
    isRenaming: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
    deleteStatusInfo: PropTypes.shape(StatusInfo),
    renameStatusInfo: PropTypes.shape(StatusInfo),
};
