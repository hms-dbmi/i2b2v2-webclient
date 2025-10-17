import PropTypes from "prop-types";

export const AuthenticationConfigLDAPOptions = ({
    connection_url=null,
    search_base= null,
    distinguished_name= null,
    security_authentication=null,
    ssl=false,
    security_layer=null,
    privacy_strength=null,
    max_buffer=null
} = {}) => ({
    connection_url,
    search_base,
    distinguished_name,
    security_authentication,
    ssl,
    security_layer,
    privacy_strength,
    max_buffer
});

AuthenticationConfigLDAPOptions.propTypes = {
    connection_url: PropTypes.string.isRequired,
    search_base: PropTypes.string.isRequired,
    security_authentication: PropTypes.string.isRequired,
    ssl: PropTypes.bool,
    security_layer: PropTypes.string,
    privacy_strength: PropTypes.string,
    max_buffer: PropTypes.string
};

