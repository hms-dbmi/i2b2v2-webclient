import PropTypes from "prop-types";
import {ConstrainByValue} from "./ConstrainByValue";
import {ConstrainByModifier} from "./ConstrainByModifier";
import {ConstrainByDate} from "./ConstrainByDate";

export const Concept = ({
    hlevel = null,
    name =null,
    key=null,
    icon = null,
    tooltip = null,
    isSynonym = false,
    valueConstraint = ConstrainByValue(),
    dateConstraint=ConstrainByDate(),
    modifierConstraint = ConstrainByModifier(),
} = {}) => ({
    hlevel,
    name,
    key,
    icon,
    tooltip,
    isSynonym,
    valueConstraint,
    dateConstraint,
    modifierConstraint,
});

Concept.propTypes = {
    hlevel: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired,
    isSynonym: PropTypes.bool.isRequired,
    valueConstraint: PropTypes.shape(ConstrainByValue),
    dateConstraint: PropTypes.shape(ConstrainByDate),
    modifierConstraint: PropTypes.shape(ConstrainByModifier),
};