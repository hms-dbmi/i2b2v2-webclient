import PropTypes from "prop-types";
import {User} from "./User";

export const AllUsers = ({
    users = [],
    isFetching= false,
    isTerminatingSession = false,
 } = {}) => ({
    users,
    isFetching,
    isTerminatingSession
});

AllUsers.propTypes = {
    users: PropTypes.arrayOf(User).isRequired,
    isFetching: PropTypes.bool,
};
