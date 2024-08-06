import PropTypes from "prop-types";
import { HiveDomain } from "./HiveDomain";
import {Param} from "./Param";
import {ParamStatusInfo} from "./ParamStatusInfo";

export const AllHives = ({
    hiveDomains = [],
    params= [],
    isFetching= false,
    isFetchingParams = false,
    saveStatus = null,
    paramStatus = ParamStatusInfo(),
    allGlobalParamStatus = null
 } = {}) => ({
    hiveDomains,
    params,
    isFetching,
    isFetchingParams,
    saveStatus,
    paramStatus,
    allGlobalParamStatus
});

AllHives.propTypes = {
    hiveDomains: PropTypes.arrayOf(HiveDomain).isRequired,
    params: PropTypes.arrayOf(Param).isRequired,
    isFetching: PropTypes.bool,
    isFetchingParams: PropTypes.bool,
    saveStatus: PropTypes.string,
    paramStatus: PropTypes.shape(ParamStatusInfo),
    allGlobalParamStatus: PropTypes.string
};