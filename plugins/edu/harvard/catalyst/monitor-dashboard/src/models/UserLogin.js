import PropTypes from "prop-types";

export const UserLogin = ({
    userName = null,
    attempt = null,
    entryDate= null,
} = {}) => ({
    userName,
    attempt,
    entryDate,
});

UserLogin.propTypes = {
    userName: PropTypes.string.isRequired,
    attempt: PropTypes.string.isRequired,
    entryDate: PropTypes.instanceOf(Date).isRequired,
}


export const LOGIN_ATTEMPT = {
    BADPASSWORD: "BADPASSWORD",
    LOCKED_OUT: "LOCKED_OUT",
    NONEXIST: "NONEXIST",
    OTHER: "OTHER",
    PASSWORD_EXPIRED: "PASSWORD_EXPIRED",
    SUCCESS: "SUCCESS",
    UNKNOWN: "UNKNOWN",
    lookup: (attemptStr)=> {
        let loginAttempt = attemptStr && attemptStr.length > 0 ? LOGIN_ATTEMPT[attemptStr.toUpperCase()] : LOGIN_ATTEMPT.UNKNOWN;
        return loginAttempt ? loginAttempt : LOGIN_ATTEMPT.OTHER;
    }
}