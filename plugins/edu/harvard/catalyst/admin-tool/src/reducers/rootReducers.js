import {editProjectReducer} from "./editProjectReducer";
import {allProjectsReducer} from "./allProjectsReducer";
import {deleteProjectReducer} from "./deleteProjectReducer";
import {i2b2LibLoadedReducer} from "./i2b2LibLoadedReducer";
import {deleteUserReducer} from "./deleteUserReducer";
import {editUserReducer} from "./editUserReducer";
import allAuthenticationConfigsReducer from "./allAuthenticationConfigsSlice";
import allHivesReducer from "./allHivesSlice";
import allUsersReducer from "./allUsersSlice";
import userProjectRolesReducer from "./userProjectRolesSlice";

const rootReducers = {
    allHives: allHivesReducer,
    selectedProject: editProjectReducer,
    selectedUser: editUserReducer,
    allProjects : allProjectsReducer,
    allUsers: allUsersReducer,
    deletedProject: deleteProjectReducer,
    deletedUser: deleteUserReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    allAuthenticationConfigs: allAuthenticationConfigsReducer,
    userProjectRoles: userProjectRolesReducer
};

export default rootReducers;