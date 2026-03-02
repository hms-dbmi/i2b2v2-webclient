import PropTypes from "prop-types";
import {DATA_ROLES} from "./ProjectUser";

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