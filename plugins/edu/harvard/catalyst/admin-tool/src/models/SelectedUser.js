import PropTypes from "prop-types";
import {Param} from "./Param";
import {User} from "./User";
import {ParamStatusInfo} from "./ParamStatusInfo";

export const SelectedUser = ({
    user = User(),
    params= [],
    isFetching= false,
    allUserParamStatus=null,
    saveStatus= null,
    deleteStatus= null,
    paramStatus=ParamStatusInfo()
 } = {}) => ({
    user,
    params,
    isFetching,
    allUserParamStatus,
    saveStatus,
    deleteStatus,
    paramStatus
});

SelectedUser.propTypes = {
    user: PropTypes.shape(User).isRequired,
    params: PropTypes.arrayOf(Param).isRequired,
    isFetching: PropTypes.bool.isRequired,
    allUserParamStatus: PropTypes.string,
    paramStatus: PropTypes.shape(ParamStatusInfo),
};
