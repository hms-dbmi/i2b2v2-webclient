import PropTypes from "prop-types";

export const ConstrainByValue = ({
    valueOperator = null,
    valueConstraint =null,
    valueUnits=null,
    valueType=null,
} = {}) => ({
    valueOperator,
    valueConstraint,
    valueUnits,
    valueType,
});

ConstrainByValue.propTypes = {
    valueOperator: PropTypes.number.isRequired,
    valueConstraint: PropTypes.string.isRequired,
    valueUnits: PropTypes.string,
    valueType: PropTypes.string.isRequired,
};