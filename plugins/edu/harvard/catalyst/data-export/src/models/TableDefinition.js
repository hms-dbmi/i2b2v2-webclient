import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableDefinitionRow} from "./TableDefinitionRow";

export const TableDefinition = ({
    rows = [],
    title= "",
    shared= false,
    isFetching= false,
    statusInfo = StatusInfo(),
    labValueToDisplay= null,
    isLoadingDataType =false,
} = {}) => ({
    rows,
    title,
    shared,
    isFetching,
    statusInfo,
    labValueToDisplay,
    isLoadingDataType,
});

TableDefinition.propTypes = {
    rows: PropTypes.arrayOf(TableDefinitionRow).isRequired,
    title: PropTypes.string,
    shared: PropTypes.bool,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
    labValueToDisplay: PropTypes.object,
    isLoadingDataType: PropTypes.bool,
};