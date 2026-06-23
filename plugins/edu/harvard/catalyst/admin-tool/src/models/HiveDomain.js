import PropTypes from "prop-types";

export const HiveDomain = ({
    domainId= "",
    domainName = "",
    environment = "",
    helpURL = "",

 } = {}) => ({
    environment,
    helpURL,
    domainId,
    domainName,
});

HiveDomain.propTypes = {
    domainId: PropTypes.string.isRequired,
    domainName: PropTypes.string.isRequired,
    environment: PropTypes.string.isRequired,
    helpURL: PropTypes.string,
};