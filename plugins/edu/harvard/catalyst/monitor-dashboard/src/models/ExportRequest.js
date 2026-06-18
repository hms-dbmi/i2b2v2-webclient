import PropTypes from "prop-types";

export const ExportRequest = ({
    tableId= null,
    resultInstanceId = null,
    description= null,
    isRPDO= false,
} = {}) => ({
    tableId,
    resultInstanceId,
    description,
    isRPDO
});

ExportRequest.propTypes = {
    tableId: PropTypes.number,
    resultInstanceId: PropTypes.number,
    description: PropTypes.string.isRequired,
    isRPDO: PropTypes.bool.isRequired,
};