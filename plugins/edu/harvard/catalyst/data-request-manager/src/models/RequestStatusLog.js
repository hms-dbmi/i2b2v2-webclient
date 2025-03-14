import PropTypes from "prop-types";
import {RequestStatusLogItem} from "./RequestStatusLogItem";
import {StatusInfo} from "./StatusInfo";

export const RequestStatusLog = ({
    statusLogs= [],
    isFetching= false,
    statusInfo = StatusInfo(),
} = {}) => ({
    statusLogs,
    isFetching,
    statusInfo
})

RequestStatusLog.propTypes = {
    statusLogs: PropTypes.arrayOf(
        PropTypes.shape({
            description: PropTypes.string,
            logItems: PropTypes.arrayOf(PropTypes.shape(RequestStatusLogItem))
        })
    ),
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};