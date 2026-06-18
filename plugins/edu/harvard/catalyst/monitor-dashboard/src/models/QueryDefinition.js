import PropTypes from "prop-types";
import {ConceptGroup} from "./ConceptGroup";
import {EventGroup} from "./EventGroup";

export const QueryDefinition = ({
    queryName = null,
    queryTiming =null,
    conceptGroups = [],
    eventGroup = EventGroup()
} = {}) => ({
    queryName,
    queryTiming,
    conceptGroups,
    eventGroup
});

QueryDefinition.propTypes = {
    queryName: PropTypes.string.isRequired,
    queryTiming: PropTypes.string.isRequired,
    conceptGroups: PropTypes.arrayOf(ConceptGroup),
    eventGroup: PropTypes.shape(EventGroup)
};

export const QUERY_TIMING = {
    ANY: "ANY",
    SAMEVISIT: "SAMEVISIT",
    SAMEINSTANCENUM: "SAMEINSTANCENUM"
}