import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const TableListing = ({
  tables = [],
  isFetching= false,
  statusInfo = StatusInfo(),
} = {}) => ({
    tables,
    isFetching,
    statusInfo
});

TableListing.propTypes = {
    tables: PropTypes.array,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
