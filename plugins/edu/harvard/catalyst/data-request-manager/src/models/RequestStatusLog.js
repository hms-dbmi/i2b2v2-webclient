import PropTypes from "prop-types";

export const RequestStatusLog = ({
  id= null,
  date = null,
  status= "",
} = {}) => ({
    id,
    date,
    status
})

RequestStatusLog.propTypes = {
    id: PropTypes.number.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    status: PropTypes.string.isRequired,
};