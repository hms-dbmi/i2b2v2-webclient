import PropTypes from "prop-types";

export const StatusInfo = ({
   status= null,
   errorMessage= null,
} = {}) => ({
    status,
    errorMessage,
});

StatusInfo.propTypes = {
    status: PropTypes.string.isRequired,
    errorMessage: PropTypes.string,
};