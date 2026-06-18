import PropTypes from "prop-types";
import {AuthenticationConfigLDAPOptions} from "./AuthenticationConfigLDAPOptions";
import {AuthenticationConfigDomainOptions} from "./AuthenticationConfigDomainOptions";

export const AuthenticationConfig = ({
    name=null,
    method=null,
    authConfigOptions = {}
} = {}) => ({
    name,
    method,
    authConfigOptions
});

AuthenticationConfig.propTypes = {
    name: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    authConfigOptions: PropTypes.arrayOf(
        PropTypes.oneOfType([AuthenticationConfigLDAPOptions, AuthenticationConfigDomainOptions])).isRequired,
};

export const AUTH_CONFIG_PARAM_NAME = "ADMIN_UI_DEFAULT_AUTH_TYPE";
