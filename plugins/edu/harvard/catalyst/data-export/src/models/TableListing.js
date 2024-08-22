import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

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
    rows: PropTypes.array,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
