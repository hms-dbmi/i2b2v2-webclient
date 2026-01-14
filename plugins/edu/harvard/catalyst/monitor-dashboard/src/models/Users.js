import PropTypes from "prop-types";
import {User} from "./User";

export const Users = ({
    userList = [],
    isFetching= false,
} = {}) => ({
    userList,
    isFetching
});

Users.propTypes = {
    userList: PropTypes.arrayOf(User).isRequired,
    isFetching: PropTypes.bool,
};