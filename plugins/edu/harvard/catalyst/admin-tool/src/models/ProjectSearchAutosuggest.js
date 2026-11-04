
export const ProjectSearchAutosuggest = ({
    startDateTime= null,
    endDateTime=null,
    status = SEARCH_AUTOSUGGEST_STATUS.UNAVAILABLE,
    progressMsg = "",
    calculateTotalNum= SEARCH_AUTOSUGGEST_TOTALNUM_OPTION.NONE,
    ontologyType=SEARCH_AUTOSUGGEST_ONT_TYPE_OPTION.OTHER,
    autosuggestIndexLocation = null,
    oldAutosuggestIndexLocation = null,
    eventLogs = [],
} = {}) => ({
    startDateTime,
    endDateTime,
    status,
    progressMsg,
    calculateTotalNum,
    ontologyType,
    autosuggestIndexLocation,
    oldAutosuggestIndexLocation,
    eventLogs,
});

export const SEARCH_AUTOSUGGEST_STATUS = {
    UNAVAILABLE: "",
    RUNNING_TOTALNUM: "RUNNING_TOTALNUM",
    RUNNING_AUTOSUGGEST: "RUNNING_AUTOSUGGEST",
    FINISHED: "FINISHED",
    SCHEDULED: "SCHEDULED",
    ERROR: "ERROR",
}

export const SEARCH_AUTOSUGGEST_TOTALNUM_OPTION = {
    OMOP: "OMOP",
    I2B2: "I2B2",
    NONE: "NONE",
}

export const SEARCH_AUTOSUGGEST_ONT_TYPE_OPTION = {
    ACT: "act",
    OTHER: "other",
}