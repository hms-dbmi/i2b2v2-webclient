import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableDefinitionRow} from "./TableDefinitionRow";

export const TableDefinition = ({
    rows = [],
    isFetching= false,
    statusInfo = StatusInfo()
} = {}) => ({
    rows,
    isFetching,
    statusInfo
});

TableDefinition.propTypes = {
    rows: PropTypes.arrayOf(TableDefinitionRow),
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
