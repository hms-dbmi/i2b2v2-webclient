import PropTypes from "prop-types";
import {EventConstraint} from "./EventConstraint";
import {EventQuery} from "./EventQuery";

export const EventGroup = ({
     eventConstraints = [],
     events =[],
 } = {}) => ({
    eventConstraints,
    events,
});

EventGroup.propTypes = {
    eventConstraints: PropTypes.arrayOf(EventConstraint).isRequired,
    events: PropTypes.arrayOf(EventQuery).isRequired,
};