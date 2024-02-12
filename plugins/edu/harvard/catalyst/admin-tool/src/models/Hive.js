import PropTypes from "prop-types";

export const Hive = ({
     environment = null,
     helpUrl = null,
     domainId= null,
     domainName = null,
     isActive = false,
 } = {}) => ({
    environment,
    helpUrl,
    domainId,
    domainName,
    isActive,
});

Hive.propTypes = {
    environment: PropTypes.string,
    helpUrl: PropTypes.string,
    domainId: PropTypes.string,
    domainName: PropTypes.string,
    isActive: PropTypes.bool,
};