
export const RequestStatus = {
    statuses: {
        SUBMITTED: "Submitted",
        CANCELLED: "Cancelled",
        APPROVED: "Approved",
        DENIED: "Denied",
        FILE_AVAILABLE: "File Available",
        UNKNOWN: "Unknown"
    },
    _getStatusesAsList: () => Object.keys(RequestStatus.statuses),
    _lookupStatus: (status) => Object.entries(RequestStatus.statuses).find(([key, value]) => value === status)
}