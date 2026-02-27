import PropTypes from "prop-types";

export const UserSession = ({
   isActive= false,
   isLockedOut= false,
} = {}) => ({
    isActive,
    isLockedOut,
});

UserSession.propTypes = {
    isActive: PropTypes.bool.isRequired,
    isLockedOut: PropTypes.bool.isRequired,
};