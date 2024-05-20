import PropTypes from "prop-types";
import {User} from "./User";

export const DeletedUser = ({
    user = User(),
    isDeleting= false,
    status= null,
} = {}) => ({
    user,
    isDeleting,
    status,
});

DeletedUser.propTypes = {
    user: PropTypes.shape(User).isRequired,
    status: PropTypes.string,
    isFetching: PropTypes.bool
};
