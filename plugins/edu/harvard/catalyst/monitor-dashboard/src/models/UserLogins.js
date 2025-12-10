import PropTypes from "prop-types";
import {UserLogin} from "./UserLogin";

export const UserLogins = ({
    loginList = [],
    loginTotalCount= 0,
    loginSuccessCount = 0,
    loginFailCount = 0,
    isFetching= false,
} = {}) => ({
    loginList,
    loginTotalCount,
    loginSuccessCount,
    loginFailCount,
    isFetching
});

UserLogins.propTypes = {
    loginList: PropTypes.arrayOf(UserLogin).isRequired,
    loginTotalCount: PropTypes.number.isRequired,
    loginSuccessCount: PropTypes.number.isRequired,
    loginFailCount: PropTypes.number.isRequired,
    isFetching: PropTypes.bool,
};