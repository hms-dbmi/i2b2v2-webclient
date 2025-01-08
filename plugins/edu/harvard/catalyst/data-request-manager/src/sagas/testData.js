export const requestList = [
    {
        id: 1477,
        name: "Abnormal findings on neonatal screenings",
        description: "Abnormal findings on neonatal screenings",
        dateSubmitted: "2024-01-02",
        lastUpdated: "2024-02-14",
        status: "Submitted",
        requests: [
            "Request Demographics Data"
        ],
        email: "user12@i2b2.org",
        userId: "user12",
    },
    {
        id: 1478,
        name: "Female hypertensive disease",
        description: "Female hypertensive disease",
        dateSubmitted: "2024-03-18",
        lastUpdated: "2024-04-11",
        status: "Approved",
        requests: [
            "Request Demographics Data",
            "Request Diagnosis Data",
        ],
        email: "user12@i2b2.org",
        userId: "user12",
    },
    {
        id: 1479,
        name: "Diabetes Mellitus@10:32:58",
        description: "Diabetes Mellitus@10:32:58",
        dateSubmitted: "2024-07-11",
        lastUpdated: "2024-08-11",
        status: "Denied",
        requests: [
            "Request Demographics Data",
            "Request Diagnosis Data",
            "Request Patient Mapping"
        ],
        email: "user12@i2b2.org",
        userId: "user12",
    },
    {
        id: 1450,
        name: "Diabetes Mellitus@10:35:46",
        description: "Diabetes Mellitus@10:35:46",
        dateSubmitted: "2024-07-28",
        lastUpdated: "2024-09-29",
        status: "File Available",
        requests: [
            "Request Demographics Data",
            "Request Medication Data",
            "Request Diagnosis Data",
            "Request Lab Data",
            "Request Patient Mapping"
        ],
        email: "user12@i2b2.org",
        userId: "user12",
    },
    {
        id: 1451,
        name: "Circulatory system@21:30:14",
        description: "Circulatory system@21:30:14",
        dateSubmitted: "2024-09-03",
        lastUpdated: "2024-09-28",
        status: "Cancelled",
        requests: [
            "Request Diagnosis Data",
            "Request Lab Data"
        ],
        email: "user12@i2b2.org",
        userId: "user12"
    }
];


export const requestDetails = [
    {
        id: requestList[0].id,
        description: requestList[0].description,
        dateSubmitted: requestList[0].dateSubmitted,
        lastUpdated: requestList[0].lastUpdated,
        status: requestList[0].status,
        requests: requestList[0].requests,
        name: requestList[0].description,
        email: "user12@i2b2.org",
        userId: "user12",
        statusLogs: [
            {
                date: requestList[0].dateSubmitted,
                status: "Submitted"
            }
        ]
    },
    {
        id: requestList[1].id,
        description: requestList[1].description,
        dateSubmitted: requestList[1].dateSubmitted,
        lastUpdated: requestList[1].lastUpdated,
        status: requestList[1].status,
        requests: requestList[1].requests,
        name: requestList[1].description,
        email: "user12@i2b2.org",
        userId: "user12",
        statusLogs: [
            {
                date: requestList[1].dateSubmitted,
                status: "Submitted"
            },
            {
                date: requestList[1].lastUpdated,
                status: "Approved"
            }
        ]
    },
    {
        id: requestList[2].id,
        description: requestList[2].description,
        dateSubmitted: requestList[2].dateSubmitted,
        lastUpdated: requestList[2].lastUpdated,
        status: requestList[2].status,
        requests: requestList[2].requests,
        name: requestList[2].description,
        email: "user12@i2b2.org",
        userId: "user12",
        statusLogs: [
            {
                date: requestList[2].dateSubmitted,
                status: "Submitted"
            },
            {
                date: requestList[2].lastUpdated,
                status: "Denied"
            }
        ]
    },
    {
        id: requestList[3].id,
        description: requestList[3].description,
        dateSubmitted: requestList[3].dateSubmitted,
        lastUpdated: requestList[3].lastUpdated,
        status: requestList[3].status,
        requests: requestList[3].requests,
        name: requestList[3].description,
        email: "user12@i2b2.org",
        userId: "user12",
        statusLogs: [
            {
                date: requestList[3].dateSubmitted,
                status: "Submitted"
            },
            {
                date: "2024-09-14",
                status: "Approved"
            },
            {
                date: requestList[3].lastUpdated,
                status: "File Available"
            }
        ]
    },
    {
        id: requestList[4].id,
        description: requestList[4].description,
        dateSubmitted: requestList[4].dateSubmitted,
        lastUpdated: requestList[4].lastUpdated,
        status: requestList[4].status,
        requests: requestList[4].requests,
        name: requestList[4].description,
        email: "user12@i2b2.org",
        userId: "user12",
        statusLogs: [
            {
                date: requestList[4].dateSubmitted,
                status: "Submitted"
            },
            {
                date: requestList[4].lastUpdated,
                status: "Cancelled"
            }
        ]
    }
];

export const adminRequestList = [
    {
        id: requestList[0].id,
        description: requestList[0].description,
        dateSubmitted: requestList[0].dateSubmitted,
        lastUpdated: requestList[0].lastUpdated,
        status: requestList[0].status,
        requests: requestList[0].requests,
        patientCount: "",
        userId: "user12",
    },
    {
        id: requestList[1].id,
        description: requestList[1].description,
        dateSubmitted: requestList[1].dateSubmitted,
        lastUpdated: requestList[1].lastUpdated,
        status: requestList[1].status,
        requests: requestList[1].requests,
        patientCount: "27439",
        userId: "user15",
    },
    {
        id: requestList[2].id,
        description: requestList[2].description,
        dateSubmitted: requestList[2].dateSubmitted,
        lastUpdated: requestList[2].lastUpdated,
        status: requestList[2].status,
        requests: requestList[2].requests,
        userId: "user19",
        patientCount: "5643100",
    },
    {
        id: requestList[3].id,
        description: requestList[3].description,
        dateSubmitted: requestList[3].dateSubmitted,
        lastUpdated: requestList[3].lastUpdated,
        status: requestList[3].status,
        requests: requestList[3].requests,
        userId: "user35",
        patientCount: "634980",
    },
    {
        id: 1480,
        description: "Diabetes Mellitus@14:27:10",
        dateSubmitted: requestList[3].dateSubmitted,
        lastUpdated: requestList[3].lastUpdated,
        status: "Submitted",
        requests: requestList[3].requests,
        userId: "user35",
        patientCount: "",
    },
    {
        id: requestList[4].id,
        description: requestList[4].description,
        dateSubmitted: requestList[4].dateSubmitted,
        lastUpdated: requestList[4].lastUpdated,
        status: requestList[4].status,
        requests: requestList[4].requests,
        email: "user12@i2b2.org",
        userId: "user24",
        patientCount: "8923",
    }
];