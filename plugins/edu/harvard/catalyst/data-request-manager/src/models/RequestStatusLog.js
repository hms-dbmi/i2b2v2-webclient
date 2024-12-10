import PropTypes from "prop-types";

export const RequestStatusLog = ({
  date = null,
  status= "",
} = {}) => ({
    date,
    status
})

RequestStatusLog.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    status: PropTypes.string.isRequired,
};