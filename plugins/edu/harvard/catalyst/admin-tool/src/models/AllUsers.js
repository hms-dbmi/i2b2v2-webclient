import PropTypes from "prop-types";
import {User} from "./User";

export const AllUsers = ({
     users = [],
    isFetching= false,
 } = {}) => ({
    users,
    isFetching
});

AllUsers.propTypes = {
    users: PropTypes.arrayOf(User).isRequired,
    isFetching: PropTypes.bool,
};
