import PropTypes from "prop-types";

export const Project = ({
     id = null,
    internalId=null,
     name = null,
     description = null,
     key = null,
     wiki = null,
     path = null,
 } = {}) => ({
    id,
    internalId,
    name,
    description,
    key,
    wiki,
    path
});

Project.propTypes = {
    id: PropTypes.number.isRequired,
    internalId: PropTypes.number,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    key: PropTypes.string,
    wiki: PropTypes.string,
    path: PropTypes.string.isRequired,
};