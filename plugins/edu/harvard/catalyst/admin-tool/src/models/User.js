import PropTypes from "prop-types";
import {AUTHENTICATION_METHODS} from "./AUTHENTICATION_METHODS";
import {UserSession} from "./UserSession";

export const User = ({
    username = "",
    fullname = "",
    email = "",
    isAdmin = false,
    session= UserSession(),
    authMethod= AUTHENTICATION_METHODS.I2B2.value,
    password= "",
    passwordVerify= "",
} = {}) => ({
    username,
    fullname,
    email,
    isAdmin,
    session,
    authMethod,
    password,
    passwordVerify
});

User.propTypes = {
    username: PropTypes.string.isRequired,
    fullname: PropTypes.string.isRequired,
    email: PropTypes.string,
    isAdmin: PropTypes.bool.isRequired,
    authMethod: PropTypes.string.isRequired
};