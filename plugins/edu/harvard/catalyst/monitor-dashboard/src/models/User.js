import PropTypes from "prop-types";

export const User = ({
    username = "",
    fullname = "",
    email = "",
    isAdmin = false,
} = {}) => ({
    username,
    fullname,
    email,
    isAdmin,
});

User.propTypes = {
    username: PropTypes.string.isRequired,
    fullname: PropTypes.string.isRequired,
    email: PropTypes.string,
    isAdmin: PropTypes.bool.isRequired,
};