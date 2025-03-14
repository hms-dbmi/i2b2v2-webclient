import PropTypes from "prop-types";

export const RequestStatusLogItem = ({
    id= null,
    date = null,
    status= "",
} = {}) => ({
    id,
    date,
    status
})

RequestStatusLogItem.propTypes = {
    id: PropTypes.number.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    status: PropTypes.string.isRequired,
};