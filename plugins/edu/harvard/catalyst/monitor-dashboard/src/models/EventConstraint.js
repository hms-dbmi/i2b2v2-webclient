import PropTypes from "prop-types";
import {Concept} from "./Concept";
import {EventConstraintQuery} from "./EventConstraintQuery";
import {TimeSpan} from "./TimeSpan";

export const EventConstraint = ({
    firstConstraint = EventConstraintQuery(),
    secondConstraint = EventConstraintQuery,
    operator = null,
    timeSpans = []
} = {}) => ({
    firstConstraint,
    secondConstraint,
    operator,
    timeSpans
});

export const EVENT_CONSTRAINT_OPERATOR = {
    LESS: "LESS",
    LESSEQUAL: "LESSEQUAL",
    EQUAL: "EQUAL",
    GREATER: "GREATER",
    GREATEREQUAL: "GREATEREQUAL"
};

EventConstraint.propTypes = {
    firstConstraint: PropTypes.shape(EventConstraintQuery).isRequired,
    secondConstraint: PropTypes.shape(EventConstraintQuery).isRequired,
    operator: PropTypes.oneOf([
        EVENT_CONSTRAINT_OPERATOR.LESS,
        EVENT_CONSTRAINT_OPERATOR.LESSEQUAL,
        EVENT_CONSTRAINT_OPERATOR.EQUAL
    ]).isRequired,
    timeSpans: PropTypes.arrayOf(TimeSpan).isRequired,
};



