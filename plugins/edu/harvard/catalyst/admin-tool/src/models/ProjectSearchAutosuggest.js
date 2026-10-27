
export const ProjectSearchAutosuggest = ({
    startDateTime= null,
    endDateTime=null,
    status = SEARCH_AUTOSUGGEST_STATUS.UNAVAILABLE,
    progressMsg = "",
    calculateTotalNum= SEARCH_AUTOSUGGEST_TOTALNUM_OPTION.NONE,
    autosuggestIndexLocation = null,
    oldAutosuggestIndexLocation = null,
    eventLogs = [],
} = {}) => ({
    startDateTime,
    endDateTime,
    status,
    progressMsg,
    calculateTotalNum,
    autosuggestIndexLocation,
    oldAutosuggestIndexLocation,
    eventLogs,
});

export const SEARCH_AUTOSUGGEST_STATUS = {
    UNAVAILABLE: "",
    RUNNING_TOTALNUM: "RUNNING_TOTALNUM",
    RUNNING_AUTOSUGGEST: "RUNNING_AUTOSUGGEST",
    FINISHED: "FINISHED",
    ERROR: "ERROR"
}

export const SEARCH_AUTOSUGGEST_TOTALNUM_OPTION = {
    OMOP: "OMOP",
    I2B2: "I2B2",
    NONE: "NONE",
}