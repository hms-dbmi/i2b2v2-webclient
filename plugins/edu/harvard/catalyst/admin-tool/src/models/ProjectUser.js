import PropTypes from "prop-types";

export const ProjectUser = ({
                                username = null,
                                adminPath = ADMIN_ROLE.USER,
                                dataPath = DATA_ROLE.DATA_OBFSC,

                            } = {}) => ({
    username,
    adminPath,
    dataPath,
});

export const ADMIN_ROLE = {
    MANAGER: {
        name: "MANAGER",
        order: 1
    },
    USER: {
        name: "USER",
        order: 2
    }
};

export const DATA_ROLE = {
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
    }
};

ProjectUser.propTypes = {
    username: PropTypes.string.isRequired,
    adminPath: PropTypes.shape(ADMIN_ROLE).isRequired,
    dataOath: PropTypes.shape(DATA_ROLE).isRequired,
};

