import PropTypes from "prop-types";

export const TableDefinitionRow = ({
    id = null,
    name = "",
    sdxData = null,
    dataOption,
} = {}) => ({
    id,
    name,
    sdxData,
    dataOption,
});

TableDefinitionRow.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    sdxData: PropTypes.object,
    dataOption: PropTypes.string,
};

export const DATA_OPTION_LOOKUP = {
    "VALUE" : "Value",
    "Exists" : "Existence (Yes/No)",
    "NumDates" : "Count: Number of Dates",
    "NumEncounters" : "Count: Number of Encounters",
    "NumFacts" : "Count: Number of Facts",
    "NumProviders" : "Count: Number of Providers",
    "MinDate" : "Date: First Date",
    "MaxDate" : "Date: Last Date",
    "MinValue" : "Calc: Minimum Value",
    "MaxValue" : "Calc: Maximum Value",
    "AvgValue" : "Calc: Average Value",
    "MedianValue" : "Calc: Median Value",
    "FirstValue" : "Calc: First Value",
    "LastValue" : "Calc: Last Value",
    "NumValues" : "Count: Number of Values",
    "FirstValueEnum" : "Calc: First Value",
    "LastValueEnum" : "Calc: Last Value",
};