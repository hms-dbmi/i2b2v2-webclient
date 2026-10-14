import PropTypes from "prop-types";
import {Param} from "./Param";
import {Project} from "./Project";
import {ProjectDataSource} from "./ProjectDataSource";
import {ProjectUser} from "./ProjectUser";
import {ParamStatusInfo} from "./ParamStatusInfo";
import {UserStatusInfo} from "./UserStatusInfo";
import { ProjectSearchAutosuggest } from "./ProjectSearchAutosuggest";
import {StatusInfo} from "./StatusInfo";

export const SelectedProject = ({
    project = Project(),
    params= [],
    dataSources= {
        CRC: ProjectDataSource(),
        ONT: ProjectDataSource(),
        WORK: ProjectDataSource(),
    },
    users = [],
    customRoles = [],
    searchAutosuggestDetails = ProjectSearchAutosuggest(),
    isFetchingParams= false,
    isFetchingDataSources= false,
    isFetchingUsers= false,
    isFetchingAutosuggestDetails= false,
    saveStatus= null,
    deleteStatus= null,
    allParamStatus=null,
    saveDSStatus = null,
    saveUserStatus=null,
    paramStatus = ParamStatusInfo(),
    userStatus = UserStatusInfo(),
    searchAutosuggestStatus = StatusInfo()
} = {}) => ({
    project,
    params,
    dataSources,
    users,
    customRoles,
    searchAutosuggestDetails,
    isFetchingParams,
    isFetchingDataSources,
    isFetchingUsers,
    isFetchingAutosuggestDetails,
    saveStatus,
    deleteStatus,
    allParamStatus,
    saveDSStatus,
    saveUserStatus,
    paramStatus,
    userStatus,
    searchAutosuggestStatus
});

SelectedProject.propTypes = {
    project: PropTypes.shape(Project).isRequired,
    parameters: PropTypes.arrayOf(Param).isRequired,
    dataSources: PropTypes.objectOf(ProjectDataSource).isRequired,
    users: PropTypes.arrayOf(ProjectUser).isRequired,
    customRoles: PropTypes.arrayOf(PropTypes.string),
    searchAutoSuggestDetails: PropTypes.shape(ProjectSearchAutosuggest).isRequired,
    isFetchingParams: PropTypes.bool.isRequired,
    isFetchingDataSources: PropTypes.bool.isRequired,
    saveStatus: PropTypes.string,
    deleteStatus: PropTypes.string,
    allParamStatus: PropTypes.string,
    saveDSStatus: PropTypes.string,
    saveUserStatus: PropTypes.string,
    paramStatus: PropTypes.shape(ParamStatusInfo),
    userStatus: PropTypes.shape(UserStatusInfo),
    searchAutosuggestStatus: PropTypes.shape(StatusInfo)
};
