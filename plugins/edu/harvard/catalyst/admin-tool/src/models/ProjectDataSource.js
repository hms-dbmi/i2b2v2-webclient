import PropTypes from "prop-types";

export const ProjectDataSource = ({
    name = null,
    dbSchema = null,
    jndiDataSource = null,
    dbServerType = null,
    ownerId = null,
    projectPath=null,
    tooltip = null,
    comment=null
} = {}) => ({
    name,
    dbSchema,
    jndiDataSource,
    dbServerType,
    ownerId,
    projectPath,
    tooltip,
    comment
});

ProjectDataSource.propTypes = {
    name: PropTypes.string.isRequired,
    dbSchema: PropTypes.string.isRequired,
    jndiDataSource: PropTypes.string.isRequired,
    dbServerType: PropTypes.string.isRequired,
    ownerId: PropTypes.string.isRequired,
    projectPath: PropTypes.string.isRequired,
};

export const CELL_ID = {
    CRC: "CRC",
    ONT: "ONT",
    WORK: "WORK"
}