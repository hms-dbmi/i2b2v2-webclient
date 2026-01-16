import PropTypes from "prop-types";
import {UserRoleCount} from "./UserRoleCount";

export const UserRoleCounts = ({
    userRoleCountsList = [],
    adminUserCount= -1,
    managerUserCount= -1,
    isFetching= false,
} = {}) => ({
    userRoleCountsList,
    adminUserCount,
    managerUserCount,
    isFetching
});

UserRoleCounts.propTypes = {
    userRoleCountsList: PropTypes.arrayOf(UserRoleCount).isRequired,
    adminUserCount: PropTypes.number.isRequired,
    managerUserCount: PropTypes.number.isRequired,
    isFetching: PropTypes.bool,
};