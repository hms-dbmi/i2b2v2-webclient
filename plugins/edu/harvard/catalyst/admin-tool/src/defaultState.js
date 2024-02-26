import {AllUsers, AllProjects, AllHives, SelectedUser, DeletedUser} from "models";
import PropTypes from "prop-types";

export const defaultState = {
    allUsers: AllUsers(),
    allProjects: AllProjects(),
    allHives: AllHives(),
    selectedUser: SelectedUser(),
    deletedUser: DeletedUser(),
    isI2b2LibLoaded: false
};

defaultState.propTypes = {
    allUsers: PropTypes.shape(AllUsers.propTypes),
    allProjects: PropTypes.shape(AllProjects.propTypes),
    allHives: PropTypes.shape(AllHives.propTypes),
    selectedUser: PropTypes.shape(SelectedUser.propTypes),
    deletedUser: PropTypes.shape(DeletedUser.propTypes),
    isI2b2LibLoaded: PropTypes.bool
};