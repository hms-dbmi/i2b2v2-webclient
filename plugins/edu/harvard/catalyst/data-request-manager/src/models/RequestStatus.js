
export const RequestStatus = {
    statuses: {
        SUBMITTED: "Request Submitted",
        WITHDRAWN: "Withdrawn",
        DENIED: "Denied",
        FILE_IN_PROGRESS_QUEUED: "File In Progress (Queued)",
        FILE_IN_PROGRESS_PROCESSING: "File In Progress (Processing)",
        FILE_AVAILABLE: "File Available",
        ERROR: "Error",
        UNKNOWN: "Unknown",
    },
    _getStatusesAsList: () => Object.keys(RequestStatus.statuses),
    _lookupStatus: (status) => Object.entries(RequestStatus.statuses).find(([key, value]) => value === status),
    _convertI2b2Status: (i2b2Status) => {
        let status = '';
        switch (i2b2Status.toUpperCase()) {
            case "SUBMITTED":
                status = RequestStatus.statuses.SUBMITTED;
                break;
            case "CANCELLED":
                status = RequestStatus.statuses.WITHDRAWN;
                break;
            case "INCOMPLETE":
                status = RequestStatus.statuses.DENIED;
                break;
            case "QUEUED":
                status = RequestStatus.statuses.FILE_IN_PROGRESS_QUEUED;
                break;
            case "PROCESSING":
                status = RequestStatus.statuses.FILE_IN_PROGRESS_PROCESSING;
                break;
            case "FINISHED":
                status = RequestStatus.statuses.FILE_AVAILABLE;
                break;
            case "ERROR":
                status = RequestStatus.statuses.ERROR;
                break;
            default:
                status = RequestStatus.statuses.UNKNOWN;
        }

        return status
    }
}
