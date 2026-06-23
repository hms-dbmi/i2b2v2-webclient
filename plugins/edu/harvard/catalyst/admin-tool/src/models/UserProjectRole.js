import PropTypes from "prop-types";

export const UserProjectRole = ({
    projectLabel="",
    roles = [],
    createDate=null,
 } = {}) => ({
    projectLabel,
    roles,
    createDate
});

UserProjectRole.propTypes = {
    projectLabel: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    createDate: PropTypes.instanceOf(Date)
};