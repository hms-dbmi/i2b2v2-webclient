import PropTypes from "prop-types";

export const Project = ({
     id = null,
     name = null,
     description = null,
     key = null,
     wiki = null,
     path = null,
 } = {}) => ({
    id,
    name,
    description,
    key,
    wiki,
    path
});

Project.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    key: PropTypes.string,
    wiki: PropTypes.string,
    path: PropTypes.string,
};