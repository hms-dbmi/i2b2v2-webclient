export const EventLog = ({
    id= null,
    eventLogType= EVENT_LOG_TYPE.ERROR,
    msg = null,
    createDateTime = null,
} = {}) => ({
    id,
    eventLogType,
    msg,
    createDateTime,
});


export const EVENT_LOG_TYPE = {
    ERROR: "ERROR",
}