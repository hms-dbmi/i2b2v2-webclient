
export const RequestStatus = {
    statuses: {
        SUBMITTED: "Submitted",
        APPROVED: "Approved",
        DENIED: "Denied",
        FILE_AVAILABLE: "File Available",
        CANCELLED: "Cancelled",
        UNKNOWN: "Unknown"
    },
    _lookupStatus: (status) => Object.entries(RequestStatus.statuses).find(([key, value]) => value === status)
}