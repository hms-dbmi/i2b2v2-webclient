import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {ExportRequest} from "./ExportRequest";
import {TableDefinitionRow} from "./TableDefinitionRow";

export const TableDefinition = ({
    id = null,
    title= "",
    concepts = [],
    isFetching= false,
    statusInfo = StatusInfo(),
} = {}) => ({
    id,
    title,
    concepts,
    isFetching,
    statusInfo,
});

TableDefinition.propTypes = {
    id: PropTypes.number,
    title: PropTypes.string,
    concepts: PropTypes.arrayOf(TableDefinitionRow).isRequired,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};