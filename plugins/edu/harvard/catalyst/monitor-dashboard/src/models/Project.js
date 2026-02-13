import PropTypes from "prop-types";

export const Project = ({
    id = null,
    name = "",
    description = "",
    key = "",
    path = "",
    createDate = null
} = {}) => ({
    id,
    name,
    description,
    key,
    path,
    createDate
});

Project.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    key: PropTypes.string,
    path: PropTypes.string.isRequired,
    createDate: PropTypes.instanceOf(Date).isRequired,
};