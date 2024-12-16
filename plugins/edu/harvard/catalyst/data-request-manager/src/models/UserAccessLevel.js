import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
export const ACCESS_LEVEL = {
    RESEARCHER: "RESEARCHER",
    ADMIN: "ADMIN"
}

export const UserAccessLevel = ({
    accessLevel = ACCESS_LEVEL.RESEARCHER,
    isFetching= false,
    statusInfo= StatusInfo(),
} = {}) => ({
    accessLevel,
    isFetching,
    statusInfo
});

UserAccessLevel.propTypes = {
    role: PropTypes.string.isRequired,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};