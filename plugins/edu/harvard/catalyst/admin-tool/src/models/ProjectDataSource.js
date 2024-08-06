import PropTypes from "prop-types";

export const ProjectDataSource = ({
                                      name = "",
                                      dbSchema = "",
                                      jndiDataSource = "",
                                      dbServerType = "",
                                      ownerId = "",
                                      projectPath="",
                                      cellURL="",
                                      tooltip = "",
                                      comment="",
                                  } = {}) => ({
    name,
    dbSchema,
    jndiDataSource,
    dbServerType,
    ownerId,
    projectPath,
    cellURL,
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
    cellURL: PropTypes.string.isRequired,
};

export const CELL_ID = {
    CRC: "CRC",
    ONT: "ONT",
    WORK: "WORK"
}