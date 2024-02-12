import PropTypes from "prop-types";
import {Project} from "./Project";

export const AllProjects = ({
  projects = [],
  isFetching= false,
} = {}) => ({
    projects,
    isFetching
});

AllProjects.propTypes = {
    projects: PropTypes.arrayOf(Project).isRequired,
    isFetching: PropTypes.bool,
};
