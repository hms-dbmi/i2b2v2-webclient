import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const UserInfo = ({
    username= null,
    isManager= false,
    statusInfo= StatusInfo()
} = {}) => ({
    username,
    isManager,
    statusInfo
});

UserInfo.propTypes = {
    username: PropTypes.string.isRequired,
    isManager: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),

};