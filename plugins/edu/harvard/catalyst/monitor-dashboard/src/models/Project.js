import PropTypes from "prop-types";

export const Project = ({
    id = null,
    name = "",
    description = "",
    key = "",
    path = "",
} = {}) => ({
    id,
    name,
    description,
    key,
    path
});

Project.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    key: PropTypes.string,
    path: PropTypes.string.isRequired,
};