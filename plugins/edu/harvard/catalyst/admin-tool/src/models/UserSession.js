import PropTypes from "prop-types";

export const UserSession = ({
    isActive= false,
    isLockedOut= false,
    isTerminatingSession = false,
    isUnlockingOutUser = false,
} = {}) => ({
    isActive,
    isLockedOut,
    isTerminatingSession,
    isUnlockingOutUser
});

UserSession.propTypes = {
    isActive: PropTypes.bool.isRequired,
    isLockedOut: PropTypes.bool.isRequired,
    isTerminatingSession: PropTypes.bool.isRequired,
    isUnlockingOutUser: PropTypes.bool.isRequired,
};