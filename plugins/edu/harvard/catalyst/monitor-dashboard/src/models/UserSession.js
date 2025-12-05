import PropTypes from "prop-types";

export const UserSession = ({
    userName = null,
    entryDate= null,
    expireDate = null
} = {}) => ({
    userName,
    entryDate,
    expireDate
});

UserSession.propTypes = {
    userName: PropTypes.string.isRequired,
    entryDate: PropTypes.instanceOf(Date).isRequired,
    expireDate: PropTypes.instanceOf(Date).isRequired,
}