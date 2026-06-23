import PropTypes from "prop-types";
import {Concept} from "./Concept";

export const ConceptGroup = ({
    conceptNumber = null,
    conceptTiming =null,
    invert = false,
    occurrences = 1,
    concepts =[],
} = {}) => ({
    conceptNumber,
    conceptTiming,
    invert,
    occurrences,
    concepts,
});

export const CONCEPT_TIMING = {
    ANY: "ANY",
    SAMEVISIT: "SAMEVISIT",
    SAMEINSTANCENUM: "SAMEINSTANCENUM"
};

ConceptGroup.propTypes = {
    conceptNumber: PropTypes.number.isRequired,
    conceptTiming: PropTypes.oneOf([CONCEPT_TIMING.ANY, CONCEPT_TIMING.SAMEVISIT, CONCEPT_TIMING.SAMEINSTANCENUM]).isRequired,
    invert: PropTypes.bool.isRequired,
    occurrences: PropTypes.number.isRequired,
    concepts: PropTypes.arrayOf(Concept).isRequired,
};



