import PropTypes from "prop-types";
import {AuthenticationConfig} from "./AuthenticationConfig";
import {ParamStatusInfo} from "./ParamStatusInfo";

export const AuthenticationConfigs = ({
    authConfigs= [],
    isFetching= false,
    authConfigsStatus = ParamStatusInfo(),
} = {}) => ({
    authConfigs,
    isFetching,
    authConfigsStatus
});

AuthenticationConfigs.propTypes = {
    authConfigs: PropTypes.arrayOf(AuthenticationConfig),
    isFetching: PropTypes.bool,
    authConfigsStatus: PropTypes.shape(ParamStatusInfo),
};