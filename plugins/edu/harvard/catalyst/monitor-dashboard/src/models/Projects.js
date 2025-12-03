import PropTypes from "prop-types";
import {Project} from "./Project";

export const Projects = ({
    projectList = [],
    isFetching= false,
} = {}) => ({
    projectList,
    isFetching
});

Projects.propTypes = {
    projectList: PropTypes.arrayOf(Project).isRequired,
    isFetching: PropTypes.bool,
};