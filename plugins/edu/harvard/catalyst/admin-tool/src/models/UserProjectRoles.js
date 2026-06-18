import PropTypes from "prop-types";
import {UserProjectRole} from "./UserProjectRole";
import {User} from "./User";
import {StatusInfo} from "./StatusInfo";

export const UserProjectRoles = ({
    user = User(),
    projectRoles = [],
    isFetching= false,
    statusInfo = null,
} = {}) => ({
    user,
    projectRoles,
    isFetching,
    statusInfo,
});

UserProjectRoles.propTypes = {
    user: PropTypes.shape(User).isRequired,
    projectRoles: PropTypes.arrayOf(UserProjectRole.propTypes).isRequired,
    statusInfo: PropTypes.shape(StatusInfo.propTypes),
    isFetching: PropTypes.bool
};