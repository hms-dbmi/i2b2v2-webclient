import PropTypes from "prop-types";

export const UserStatus = ({
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

UserStatus.propTypes = {
    isActive: PropTypes.bool.isRequired,
    isLockedOut: PropTypes.bool.isRequired,
    isTerminatingSession: PropTypes.bool.isRequired,
    isUnlockingOutUser: PropTypes.bool.isRequired,
};