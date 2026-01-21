import PropTypes from "prop-types";

export const QueryActivityInDays = ({
    totalQuery=null,
    totalQuery1Days= null,
    totalQuery7Days=null,
    totalQuery30Days=null
} = {}) => ({
    totalQuery,
    totalQuery1Days,
    totalQuery7Days,
    totalQuery30Days
});

QueryActivityInDays.propTypes = {
    totalQuery: PropTypes.number.isRequired,
    totalQuery1Days: PropTypes.number.isRequired,
    totalQuery7Days: PropTypes.number.isRequired,
    totalQuery30Days: PropTypes.number.isRequired,
};