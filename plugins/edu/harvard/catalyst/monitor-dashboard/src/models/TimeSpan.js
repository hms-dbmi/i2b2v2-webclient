import PropTypes from "prop-types";

export const TimeSpan = ({
   spanOperator = null,
   spanValue = null,
   spanUnits=null,
} = {}) => ({
    spanOperator,
    spanValue,
    spanUnits
});

export const TIMESPAN_OPERATOR = {
    LESS: "LESS",
    LESSEQUAL: "LESSEQUAL",
    EQUAL: "EQUAL",
    GREATER: "GREATER",
    GREATEREQUAL: "GREATEREQUAL"
}

export const TIMESPAN_UNIT = {
    DAY: "DAY",
    MONTH: "MONTH",
    YEAR: "YEAR",
}

TimeSpan.propTypes = {
    spanOperator: PropTypes.string.isRequired,
    spanValue: PropTypes.string.isRequired,
    spanUnits: PropTypes.string.isRequired,
};