
export const RequestStatus = {
    statuses: {
        MEDIUM_OR_LONG_QUEUE: {
            order: 0,
            name: "Pending",
        },
        SUBMITTED: {
            order: 10,
            name: "Submitted",
        },
        CANCELLED: {
            order: 11,
            name: "Withdrawn",
        },
        INCOMPLETE: {
            order: 12,
            name: "Denied",
        },
        QUEUED: {
            order: 13,
            name: "File In Progress (Queued)",
        },
        PROCESSING: {
            order: 14,
            name: "File In Progress (Processing)"
        },
        FINISHED: {
            order: 16,
            name: "File Available"
        },
        ERROR: {
            order: 15,
            name: "Error"
        },
        UNKNOWN: {
            order: 1000,
            name: "Unknown"
        },
    },
    _getStatusKeysAsList: () => Object.keys(RequestStatus.statuses),
    _lookupStatusKey: (status) => Object.keys(RequestStatus.statuses).find(key => RequestStatus.statuses[key].name === status),
    _convertI2b2Status: (i2b2Status) => {
        let status = RequestStatus.statuses[i2b2Status];
        if(i2b2Status === "MEDIUM_QUEUE" || i2b2Status === "LONG_QUEUE") {
            status = RequestStatus.statuses.MEDIUM_OR_LONG_QUEUE;
        }
        else if(status === undefined) {
            status = RequestStatus.statuses.UNKNOWN;
            console.warn("Unknown request status: " + i2b2Status);
        }

        return status;
    }
}
