import PropTypes from "prop-types";

export const UserStatusInfo = ({
    status=null,
    username= null,
} = {}) => ({
    status,
    username,
});

UserStatusInfo.propTypes = {
    status: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
};
