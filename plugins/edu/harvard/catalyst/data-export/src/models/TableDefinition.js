import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableDefinitionRow} from "./TableDefinitionRow";

export const TableDefinition = ({
    id = null,
    title= "",
    shared= false,
    rows = [],
    isFetching= false,
    statusInfo = StatusInfo(),
    labValueToDisplay= null,
    isLoadingDataType =false,
} = {}) => ({
    id,
    title,
    shared,
    rows,
    isFetching,
    statusInfo,
    labValueToDisplay,
    isLoadingDataType,
});

TableDefinition.propTypes = {
    id: PropTypes.number,
    rows: PropTypes.arrayOf(TableDefinitionRow).isRequired,
    title: PropTypes.string,
    shared: PropTypes.bool,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
    labValueToDisplay: PropTypes.object,
    isLoadingDataType: PropTypes.bool,
};