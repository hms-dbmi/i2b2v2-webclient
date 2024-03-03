import PropTypes from "prop-types";
import { HiveDomain } from "./HiveDomain";
import {Param} from "./Param";

export const AllHives = ({
    hiveDomains = [],
    params= [],
    isFetching= false,
    saveStatus = null
 } = {}) => ({
    hiveDomains,
    params,
    isFetching,
    saveStatus
});

AllHives.propTypes = {
    hiveDomains: PropTypes.arrayOf(HiveDomain).isRequired,
    params: PropTypes.arrayOf(Param).isRequired,
    isFetching: PropTypes.bool,
    saveStatus: PropTypes.string
};