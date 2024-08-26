import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableDefinition} from "./TableDefinition";

export const MakeRequestDetails = ({
    patientSet = {},
    table = TableDefinition(),
    email = "",
    comments= "",
    isSubmitting= false,
    statusInfo = StatusInfo(),
} = {}) => ({
    patientSet,
    table,
    email,
    comments,
    isSubmitting,
    statusInfo
});

MakeRequestDetails.propTypes = {
    patientSet: PropTypes.object.isRequired,
    table: PropTypes.shape(TableDefinition).isRequired,
    email: PropTypes.string,
    comments: PropTypes.string,
    isSubmitting: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
