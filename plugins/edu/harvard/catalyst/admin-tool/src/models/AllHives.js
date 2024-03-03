import PropTypes from "prop-types";
import { HiveDomain } from "./HiveDomain";
import {Param} from "./Param";

export const AllHives = ({
    hiveDomains = [],
    params= [],
    isFetching= false,
    isFetchingParams = false,
    saveStatus = null,
    saveParamStatus= null,
    deleteParamStatus = null,
    allGlobalParamStatus = null
 } = {}) => ({
    hiveDomains,
    params,
    isFetching,
    isFetchingParams,
    saveStatus,
    saveParamStatus,
    deleteParamStatus,
    allGlobalParamStatus
});

AllHives.propTypes = {
    hiveDomains: PropTypes.arrayOf(HiveDomain).isRequired,
    params: PropTypes.arrayOf(Param).isRequired,
    isFetching: PropTypes.bool,
    isFetchingParams: PropTypes.bool,
    saveStatus: PropTypes.string,
    saveParamStatus: PropTypes.string,
    deleteParamStatus: PropTypes.string,
    allGlobalParamStatus: PropTypes.string
};