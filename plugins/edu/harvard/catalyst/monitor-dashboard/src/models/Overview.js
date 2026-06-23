import PropTypes from "prop-types";

export const Overview = ({
    allDataSources= null,
    allProjects= null,
} = {}) => ({
    username,
    isAdmin,
});

Overview.propTypes = {
    isFetchingDbInstances: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),
};
