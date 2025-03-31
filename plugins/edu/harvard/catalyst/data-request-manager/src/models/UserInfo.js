import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const UserInfo = ({
    username= null,
    isManager= false,
    isObfuscated = false,
    statusInfo= StatusInfo()
} = {}) => ({
    username,
    isManager,
    isObfuscated,
    statusInfo
});

UserInfo.propTypes = {
    username: PropTypes.string.isRequired,
    isManager: PropTypes.bool.isRequired,
    isObfuscated: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),

};