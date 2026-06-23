import PropTypes from "prop-types";

export const ConstrainByDate = ({
    dateFrom = null,
    dateTo =null,
} = {}) => ({
    dateFrom,
    dateTo
});

ConstrainByDate.propTypes = {
    dateFrom: PropTypes.instanceOf(Date).isRequired,
    dateTo: PropTypes.instanceOf(Date).isRequired,
};