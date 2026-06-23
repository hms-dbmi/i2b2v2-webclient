import PropTypes from "prop-types";
import {Query, StatusInfo} from "models";

export const Queries = ({
    queryList= [],
    isFetching=false,
    statusInfo= StatusInfo()
} = {}) => ({
    queryList,
    isFetching,
    statusInfo
});

Queries.propTypes = {
    queryList: PropTypes.arrayOf(Query).isRequired,
    isFetching: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),
};