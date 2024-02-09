import {User} from "models";
import PropTypes from "prop-types";

export const defaultState = {
    users: []
};

defaultState.propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape(User.propTypes)),
};