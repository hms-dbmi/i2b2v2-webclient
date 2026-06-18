import PropTypes from "prop-types";
import {ConstrainByValue} from "./ConstrainByValue";

export const ConstrainByModifier = ({
    name =null,
    key=null,
    appliedPath = null,
    valueConstraint = ConstrainByValue(),
} = {}) => ({
    name,
    key,
    appliedPath,
    valueConstraint
});

ConstrainByModifier.propTypes = {
    name: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    applied_path: PropTypes.string.isRequired,
    valueConstraint: PropTypes.shape(ConstrainByValue).isRequired,
};