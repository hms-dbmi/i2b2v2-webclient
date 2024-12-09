import PropTypes from "prop-types";
import {ResearcherTableRow} from "./ResearcherTableRow";

export const ResearcherTable = ({
     rows = [],
     isFetching= false,
 } = {}) => ({
    rows,
    isFetching,
});

ResearcherTable.propTypes = {
    rows: PropTypes.arrayOf(ResearcherTableRow).isRequired,
    isFetching: PropTypes.bool,
};