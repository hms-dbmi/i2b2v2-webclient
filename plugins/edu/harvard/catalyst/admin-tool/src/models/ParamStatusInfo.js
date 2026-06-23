import PropTypes from "prop-types";

export const ParamStatusInfo = ({
     status=null,
     param= null,
 } = {}) => ({
    status,
    param,
});

ParamStatusInfo.propTypes = {
    status: PropTypes.string.isRequired,
    param: PropTypes.string.isRequired,
};
