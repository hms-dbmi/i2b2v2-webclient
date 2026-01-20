import PropTypes from "prop-types";
import {User} from "./User";

export const NewUsers = ({
    userList = [],
    userCount= 0,
    days = null,
    projectId=null,
    isFetching= false,
} = {}) => ({
    userList,
    userCount,
    days,
    projectId,
    isFetching
});

NewUsers.propTypes = {
    userList: PropTypes.arrayOf(User).isRequired,
    userCount: PropTypes.number.isRequired,
    days: PropTypes.number.isRequired,
    projectId: PropTypes.string.isRequired,
    isFetching: PropTypes.bool,
};