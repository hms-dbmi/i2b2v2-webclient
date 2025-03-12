import PropTypes from "prop-types";

export const ExportRequest = ({
   id= null,
   description= null,
} = {}) => ({
    id,
    description,
});

ExportRequest.propTypes = {
    id: PropTypes.number,
    description: PropTypes.string.isRequired,
};