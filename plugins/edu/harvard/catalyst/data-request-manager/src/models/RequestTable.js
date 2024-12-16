import PropTypes from "prop-types";
import {AdminTableRow} from "./AdminTableRow";
import {StatusInfo} from "./StatusInfo";
import {ResearcherTableRow} from "./ResearcherTableRow";

export const RequestTable = ({
   rows = [],
   isFetching= false,
   statusInfo = StatusInfo(),
} = {}) => ({
    rows,
    isFetching,
    statusInfo
});

RequestTable.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.oneOfType([AdminTableRow, ResearcherTableRow])).isRequired,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};