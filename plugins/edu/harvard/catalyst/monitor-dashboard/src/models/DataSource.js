import PropTypes from "prop-types";

export const DataSource = ({
    id="",
    dbSchema = "",
    jndiDataSource = "",
    dbServerType = "",
    ownerId = "",
    projectPaths= [],
    cellURL="",
} = {}) => ({
    id,
    dbSchema,
    jndiDataSource,
    dbServerType,
    ownerId,
    projectPaths,
    cellURL,
});

DataSource.propTypes = {
    id: PropTypes.number.isRequired,
    dbSchema: PropTypes.string.isRequired,
    jndiDataSource: PropTypes.string.isRequired,
    dbServerType: PropTypes.string.isRequired,
    ownerId: PropTypes.string.isRequired,
    projectPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
    cellURL: PropTypes.string.isRequired,
};


export const CELL_ID = {
    CRC: "CRC"
}