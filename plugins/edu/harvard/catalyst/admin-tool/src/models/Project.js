import PropTypes from "prop-types";

export const Project = ({
    id = null,
    internalId= "",
    name = "",
    description = "",
    key = "",
    wiki = "",
    path = "",
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
    internalId: PropTypes.string,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    key: PropTypes.string,
    wiki: PropTypes.string,
    path: PropTypes.string.isRequired,
};