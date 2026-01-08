import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const UserInfo = ({
    username= null,
    isAdmin = false,
    isManager= false,
    isObfuscated = false,
    statusInfo= StatusInfo()
} = {}) => ({
    username,
    isAdmin,
    isManager,
    isObfuscated,
    statusInfo
});

UserInfo.propTypes = {
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    isManager: PropTypes.bool.isRequired,
    isObfuscated: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),

};