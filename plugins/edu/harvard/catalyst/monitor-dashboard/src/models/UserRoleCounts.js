import PropTypes from "prop-types";
import {UserRoleCount} from "./UserRoleCount";

export const UserRoleCounts = ({
    userRoleCountsList = [],
    adminUserCount= null,
    isFetching= false,
} = {}) => ({
    userRoleCountsList,
    adminUserCount,
    isFetching
});

UserRoleCounts.propTypes = {
    userRoleCountsList: PropTypes.arrayOf(UserRoleCount).isRequired,
    adminUserCount: PropTypes.number.isRequired,
    isFetching: PropTypes.bool,
};