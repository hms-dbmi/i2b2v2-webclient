import {Users} from "models";
import PropTypes from "prop-types";

export const defaultState = {
    users: Users(),
    projects: [],
    isI2b2LibLoaded: false
};

defaultState.propTypes = {
    users: PropTypes.shape(Users.propTypes),
    isI2b2LibLoaded: PropTypes.bool
};