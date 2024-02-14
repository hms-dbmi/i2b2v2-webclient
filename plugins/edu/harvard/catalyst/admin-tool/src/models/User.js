import PropTypes from "prop-types";

export const User = ({
 username = "",
 fullname = "",
 email = "",
 isAdmin = false,
 password= null
} = {}) => ({
    username,
    fullname,
    email,
    isAdmin,
    password
});

User.propTypes = {
    username: PropTypes.string,
    fullname: PropTypes.string,
    email: PropTypes.string,
    isAdmin: PropTypes.bool,
};