import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {Table} from "./Table";

export const TableDefinition = ({
  table = Table(),
  isFetching= false,
  statusInfo = StatusInfo()
} = {}) => ({
    table,
    isFetching,
    statusInfo
});

TableDefinition.propTypes = {
    table: PropTypes.shape(Table),
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
