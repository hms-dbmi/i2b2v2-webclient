import PropTypes from "prop-types";
import {DataSource, StatusInfo} from "models";

export const DataSources = ({
    dataSourceList= [],
    isFetching=false,
    statusInfo= StatusInfo()
} = {}) => ({
    dataSourceList,
    isFetching,
    statusInfo
});

DataSources.propTypes = {
    dataSourceList: PropTypes.arrayOf(DataSource).isRequired,
    isFetching: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape(StatusInfo),
};