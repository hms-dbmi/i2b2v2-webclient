import PropTypes from "prop-types";
import {Param} from "./Param";
import {Project} from "./Project";
import {ProjectDataSource} from "./ProjectDataSource";
import {ProjectUser} from "./ProjectUser";
import {ParamStatusInfo} from "./ParamStatusInfo";
import {UserStatusInfo} from "./UserStatusInfo";

export const SelectedProject = ({
    project = Project(),
    params= [],
    dataSources= {
        CRC: ProjectDataSource(),
        ONT: ProjectDataSource(),
        WORK: ProjectDataSource(),
    },
    users = [],
    isFetchingParams= false,
    isFetchingDataSources= false,
    isFetchingUsers= false,
    saveStatus= null,
    deleteStatus= null,
    allParamStatus=null,
    saveDSStatus = null,
    saveUserStatus=null,
    saveUserParamStatus = ParamStatusInfo(),
    deleteUserParamStatus= ParamStatusInfo(),
    userStatus = UserStatusInfo()
} = {}) => ({
    project,
    params,
    dataSources,
    users,
    isFetchingParams,
    isFetchingDataSources,
    isFetchingUsers,
    saveStatus,
    deleteStatus,
    allParamStatus,
    saveDSStatus,
    saveUserStatus,
    saveUserParamStatus,
    deleteUserParamStatus,
    userStatus
});

SelectedProject.propTypes = {
    project: PropTypes.shape(Project).isRequired,
    parameters: PropTypes.arrayOf(Param).isRequired,
    dataSources: PropTypes.objectOf(ProjectDataSource).isRequired,
    user: PropTypes.arrayOf(ProjectUser).isRequired,
    isFetchingParams: PropTypes.bool.isRequired,
    isFetchingDataSources: PropTypes.bool.isRequired,
    saveStatus: PropTypes.string,
    deleteStatus: PropTypes.string,
    allParamStatus: PropTypes.string,
    saveDSStatus: PropTypes.string,
    saveUserStatus: PropTypes.string,
    saveUserParamStatus: PropTypes.shape(ParamStatusInfo),
    deleteUserParamStatus: PropTypes.shape(ParamStatusInfo),
    userStatus: PropTypes.shape(UserStatusInfo)
};
