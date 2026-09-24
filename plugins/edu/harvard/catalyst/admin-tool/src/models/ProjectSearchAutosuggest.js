
export const ProjectSearchAutosuggest = ({
    startDateTime= null,
    status = SEARCH_AUTOSUGGEST_STATUS.UNAVAILABLE,
    progress = "",
    autosuggestIndexLocation = null,
    oldAutosuggestIndexLocation = null,
    errorLog = ErrorLog(),
} = {}) => ({
    startDateTime,
    status,
    progress,
    autosuggestIndexLocation,
    oldAutosuggestIndexLocation,
    errorLog,
});

const ErrorLog= ({
    msg = null,
    dateTime = null,

} = {}) => ({
    msg,
    dateTime,
});

export const SEARCH_AUTOSUGGEST_STATUS = {
    UNAVAILABLE: "UNAVAILABLE",
    RUNNING: "RUNNING",
    FINISHED: "FINISHED",
    ERROR: "ERROR"
}

