import PropTypes from "prop-types";
import {AUTHENTICATION_METHODS} from "./AUTHENTICATION_METHODS";
import {UserStatus} from "./UserStatus";

export const User = ({
    username = "",
    fullname = "",
    email = "",
    isAdmin = false,
    status= UserStatus(),
    authMethod= AUTHENTICATION_METHODS.I2B2.value,
    password= "",
    passwordVerify= "",
} = {}) => ({
    username,
    fullname,
    email,
    isAdmin,
    status,
    authMethod,
    password,
    passwordVerify
});

User.propTypes = {
    username: PropTypes.string.isRequired,
    fullname: PropTypes.string.isRequired,
    email: PropTypes.string,
    isAdmin: PropTypes.bool.isRequired,
    status: PropTypes.shape(UserStatus).isRequired,
    authMethod: PropTypes.string.isRequired,
    password: PropTypes.string,
    passwordVerify: PropTypes.string
};