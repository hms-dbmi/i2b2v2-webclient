import PropTypes from "prop-types";
import {UserSession} from "./UserSession";

export const UserSessions = ({
    sessionList = [],
    sessionCount = 0,
    isFetching= false,
} = {}) => ({
    sessionList,
    sessionCount,
    isFetching
});

UserSessions.propTypes = {
    sessionList: PropTypes.arrayOf(UserSession).isRequired,
    sessionCount: PropTypes.number.isRequired,
    isFetching: PropTypes.bool,
};