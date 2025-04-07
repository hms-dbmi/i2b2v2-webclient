
export const RequestStatus = {
    statuses: {
        SUBMITTED: {
            order: 1,
            name: "Submitted"
        },
        WITHDRAWN: {
            order: 1,
            name: "Withdrawn"
        },
        DENIED: {
            order: 2,
            name: "Denied"
        },
        FILE_IN_PROGRESS_QUEUED: {
            order: 6,
            name: "File In Progress (Queued)"
        },
        FILE_IN_PROGRESS_PROCESSING: {
            order: 5,
            name: "File In Progress (Processing)"
        },
        FILE_AVAILABLE: {
            order: 4,
            name: "File Available"
        },
        ERROR: {
            order: 3,
            name: "Error"
        },
        UNKNOWN: {
            order: 1000,
            name: "Unknown"
        },
    },
    /*_getLatestStatus: (statuses) => {

    },*/
    _getStatusesAsList: () => Object.keys(RequestStatus.statuses),
    _lookupStatus: (status) => Object.keys(RequestStatus.statuses).find(key => RequestStatus.statuses[key].name === status),
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
