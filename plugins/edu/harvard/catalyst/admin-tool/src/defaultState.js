import {AllUsers, AllProjects} from "models";
import PropTypes from "prop-types";

export const defaultState = {
    allUsers: AllUsers(),
    allProjects: AllProjects(),
    isI2b2LibLoaded: false
};

defaultState.propTypes = {
    allUsers: PropTypes.shape(AllUsers.propTypes),
    allProjects: PropTypes.shape(AllProjects.propTypes),
    isI2b2LibLoaded: PropTypes.bool
};