import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const TableDefinitionRow = ({
    id = 0,
    order = 0,
    name = "",
    display = true,
    locked = false,
    sdxData = {},
    dataOption = null,
    dataOptionHasError = false,
    required = false,
    dataType= null,
    dataOptionStatus = StatusInfo(),
    isLoadingTermInfo = false

} = {}) => ({
    id,
    order,
    name,
    display,
    locked,
    sdxData,
    dataOption,
    dataOptionHasError,
    required,
    dataType,
    dataOptionStatus,
    isLoadingTermInfo
});

TableDefinitionRow.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    order: PropTypes.number,
    display: PropTypes.bool,
    locked: PropTypes.bool,
    sdxData: PropTypes.object,
    dataOption: PropTypes.string,
    required: PropTypes.bool,
    dataType: PropTypes.string
};

export const DATATYPE = {
    POSINTEGER: "PosInteger",
    POSFLOAT : "PosFloat",
    INTEGER: "Integer",
    FLOAT: "Float",
    STRING: "String",
    LARGESTRING: "LargeString",
    ENUM: "Enum"
};

export const generateTableDefRowId = (key) => {
    return key + '[' + Math.floor(Math.random() * 1000 + 999) + ']';
};