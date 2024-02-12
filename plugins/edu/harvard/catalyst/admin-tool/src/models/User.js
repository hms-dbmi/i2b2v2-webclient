import PropTypes from "prop-types";

export const User = ({
 username = null,
 fullname = null,
 email = null,
 isAdmin = false,
} = {}) => ({
    username,
    fullname,
    email,
    isAdmin,
});

User.propTypes = {
    username: PropTypes.string,
    fullname: PropTypes.string,
    email: PropTypes.string,
    isAdmin: PropTypes.bool,
};