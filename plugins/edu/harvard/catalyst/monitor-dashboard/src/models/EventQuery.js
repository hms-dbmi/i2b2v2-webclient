import PropTypes from "prop-types";
import {ConceptGroup} from "./ConceptGroup";
import {TimeSpan} from "./TimeSpan";

export const EventQuery = ({
    queryId = null,
    queryName = null,
    queryTiming=null,
    conceptGroups = [],

} = {}) => ({
    queryId,
    queryName,
    queryTiming,
    conceptGroups,
});

EventQuery.propTypes = {
    queryId: PropTypes.string.isRequired,
    queryName: PropTypes.string.isRequired,
    queryTiming: PropTypes.string.isRequired,
    conceptGroups: PropTypes.arrayOf(ConceptGroup).isRequired,
};