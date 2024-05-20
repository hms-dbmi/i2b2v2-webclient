import PropTypes from "prop-types";

export const ProjectUser = ({
    username = null,
    adminPath = ADMIN_ROLES.USER,
    dataPath = DATA_ROLES.DATA_OBFSC,
    editorPath = false
} = {}) => ({
    username,
    adminPath,
    dataPath,
    editorPath,
});

export const ADMIN_ROLES = {
    MANAGER: {
        name: "MANAGER",
        order: 1
    },
    USER: {
        name: "USER",
        order: 2
    }
};

export const DATA_ROLES = {
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

export const EDITOR_ROLE = "EDITOR";

ProjectUser.propTypes = {
    username: PropTypes.string.isRequired,
    adminPath: PropTypes.shape(ADMIN_ROLES).isRequired,
    dataPath: PropTypes.shape(DATA_ROLES).isRequired,
    editorPath: PropTypes.bool.isRequired,
};

