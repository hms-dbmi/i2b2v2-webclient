export const QueryStatus = {
    statuses: {
        SUBMITTED: {
            order: 10,
            name: "Submitted",
        },
        PROCESSING: {
            order: 20,
            name: "Processing"
        },
        QUEUED: {
            order: 30,
            name: "Queued",
        },
        MEDIUM_QUEUE: {
            order: 40,
            name: "Medium Queue",
        },
        LONG_QUEUE: {
            order: 50,
            name: "Long Queue",
        },
        CANCELLED: {
            order: 60,
            name: "Cancelled",
        },
        INCOMPLETE: {
            order: 70,
            name: "Incomplete",
        },
        FINISHED: {
            order: 80,
            name: "Finished"
        },
        ERROR: {
            order: 90,
            name: "Error"
        },
        UNKNOWN: {
            order: 1000,
            name: "Unknown"
        }
    },
    getStatusKeysAsList: () => Object.keys(QueryStatus.statuses),
    lookupStatusKey: (status) => Object.keys(QueryStatus.statuses).find(key => QueryStatus.statuses[key] === status),
    convertI2b2Status: (i2b2Status) => {
        let status = QueryStatus.statuses[i2b2Status];
       if(status === undefined || status?.length === 0) {
            status = QueryStatus.statuses.UNKNOWN;
            console.warn("Unknown request status: " + i2b2Status);
        }

        return status;
    }
}
