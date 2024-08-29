import PropTypes from "prop-types";

export const TableDefinitionRow = ({
    id = 0,
    order = 0,
    name = "",
    display = true,
    locked = false,
    sdxData = {},
    dataOptions = null,
    required = false,
    isLoadingDataType = false,
    demographic= false
} = {}) => ({
    id,
    order,
    name,
    display,
    locked,
    sdxData,
    dataOptions,
    required,
    isLoadingDataType,
    demographic
});

TableDefinitionRow.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    order: PropTypes.number,
    display: PropTypes.bool,
    locked: PropTypes.bool,
    sdxData: PropTypes.object,
    dataOptions: PropTypes.string,
    required: PropTypes.bool,
    demographic: PropTypes.bool,
    isLoadingDataType: PropTypes.bool
};
