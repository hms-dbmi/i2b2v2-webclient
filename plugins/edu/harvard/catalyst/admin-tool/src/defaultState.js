import {AllUsers, AllProjects, AllHives, SelectedUser, DeletedUser, DeletedProject, SelectedProject, AuthenticationConfigs} from "models";
import PropTypes from "prop-types";

export const defaultState = {
    allUsers: AllUsers(),
    allProjects: AllProjects(),
    allHives: AllHives(),
    selectedUser: SelectedUser(),
    deletedUser: DeletedUser(),
    selectedProject: SelectedProject(),
    deletedProject: DeletedProject(),
    allAuthenticationConfigs: AuthenticationConfigs(),
    isI2b2LibLoaded: false
};

defaultState.propTypes = {
    allUsers: PropTypes.shape(AllUsers.propTypes),
    allProjects: PropTypes.shape(AllProjects.propTypes),
    allHives: PropTypes.shape(AllHives.propTypes),
    selectedUser: PropTypes.shape(SelectedUser.propTypes),
    selectedProject: PropTypes.shape(SelectedProject.propTypes),
    deletedUser: PropTypes.shape(DeletedUser.propTypes),
    deletedProject: PropTypes.shape(DeletedProject.propTypes),
    allAuthenticationConfigs: PropTypes.shape(AuthenticationConfigs.propTypes),
    isI2b2LibLoaded: PropTypes.bool
};