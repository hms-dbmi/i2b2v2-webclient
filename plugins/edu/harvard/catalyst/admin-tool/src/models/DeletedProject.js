import PropTypes from "prop-types";
import {Project} from "./Project";

export const DeletedProject = ({
    project = Project(),
    isDeleting= false,
    status= null,
} = {}) => ({
    project,
    isDeleting,
    status,
});

DeletedProject.propTypes = {
    project: PropTypes.shape(Project).isRequired,
    status: PropTypes.string,
    isFetching: PropTypes.bool
};