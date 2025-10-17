import PropTypes from "prop-types";

export const AuthenticationConfigDomainOptions = ({
 domain= null,
 domain_controller = null
} = {}) => ({
    domain,
    domain_controller
});

AuthenticationConfigDomainOptions.propTypes = {
    domain: PropTypes.string,
    domain_controller: PropTypes.string
};
