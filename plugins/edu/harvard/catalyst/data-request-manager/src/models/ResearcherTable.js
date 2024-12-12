import PropTypes from "prop-types";
import {ResearcherTableRow} from "./ResearcherTableRow";
import {StatusInfo} from "./StatusInfo";

export const ResearcherTable = ({
    rows = [],
    isFetching= false,
    statusInfo = StatusInfo(),
 } = {}) => ({
    rows,
    isFetching,
    statusInfo
});

ResearcherTable.propTypes = {
    rows: PropTypes.arrayOf(ResearcherTableRow).isRequired,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};