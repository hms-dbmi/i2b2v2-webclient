import PropTypes from "prop-types";
import {Param} from "./Param";
import {User} from "./User";

export const SelectedUser = ({
     user = User(),
     params= [],
     isFetching= false,
     userParamStatus=null,
     saveStatus= null,
     deleteStatus= null
 } = {}) => ({
    user,
    params,
    isFetching,
    userParamStatus,
    saveStatus,
    deleteStatus
});

SelectedUser.propTypes = {
    user: PropTypes.shape(User).isRequired,
    parameters: PropTypes.arrayOf(Param).isRequired,
    isFetching: PropTypes.bool.isRequired,
};
