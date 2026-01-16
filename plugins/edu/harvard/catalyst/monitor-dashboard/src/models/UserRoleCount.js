import PropTypes from "prop-types";

export const UserRoleCount = ({
    projectId = null,
    role = USER_DATA_ROLES.DATA_OBFSC,
    count = null,
} = {}) => ({
    projectId,
    role,
    count,
});

UserRoleCount.propTypes = {
    projectId: PropTypes.number.isRequired,
    role: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
};

export const USER_DATA_ROLES = {
    DATA_PROT: {
        name: "DATA_PROT",
        order: 1
    },
    DATA_DEID: {
        name: "DATA_DEID",
        order: 2,
    },
    DATA_LDS: {
        name: "DATA_LDS",
        order: 3,
    },
    DATA_AGG: {
        name: "DATA_AGG",
        order: 4
    },
    DATA_OBFSC: {
        name: "DATA_OBFSC",
        order: 5
    },
    UNKNOWN: {
        name: "UNKNOWN",
        order: 1000
    }
};
