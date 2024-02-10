import {User} from "models";
import PropTypes from "prop-types";

export const defaultState = {
    users: [],
    projects: [],
    i2b2LibLoaded: false
};

defaultState.propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape(User.propTypes)),
    i2b2LibLoaded: PropTypes.bool
};