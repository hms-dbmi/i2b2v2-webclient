import PropTypes from "prop-types";

export const ExportRequest = ({
    tableId= null,
    resultInstanceId = null,
    description= null,
} = {}) => ({
    tableId,
    resultInstanceId,
    description,
});

ExportRequest.propTypes = {
    tableId: PropTypes.number,
    resultInstanceId: PropTypes.number,
    description: PropTypes.string.isRequired,
};