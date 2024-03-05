import PropTypes from "prop-types";
import {Param} from "./Param";
import {Project} from "./Project";
import {ProjectDataSource} from "./ProjectDataSource";
import {ProjectUser} from "./ProjectUser";

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
    allParamStatus
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
    allParamStatus: PropTypes.string
};
