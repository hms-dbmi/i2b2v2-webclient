import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const UserInfo = ({
    username= null,
    isAdmin= false,
    statusInfo= StatusInfo()
} = {}) => ({
    username,
    isAdmin,
    statusInfo
});

UserInfo.propTypes = {
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),

};
