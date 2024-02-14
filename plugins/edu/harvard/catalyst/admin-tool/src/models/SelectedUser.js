import PropTypes from "prop-types";
import {Param} from "./Param";
import {User} from "./User";

export const SelectedUser = ({
     user = User(),
     params= [],
     isFetching= false,
 } = {}) => ({
    user,
    params,
    isFetching
});

SelectedUser.propTypes = {
    user: PropTypes.shape(User).isRequired,
    parameters: PropTypes.arrayOf(Param).isRequired,
    isFetching: PropTypes.bool,
};
