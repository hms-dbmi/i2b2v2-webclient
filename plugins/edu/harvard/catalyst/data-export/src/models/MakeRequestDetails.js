import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableDefinition} from "./TableDefinition";

export const MakeRequestDetails = ({
    patientSet = {},
    table = TableDefinition(),
    email = null,
    comment= null,
    isSubmitting= false,
    statusInfo = StatusInfo(),
} = {}) => ({
    patientSet,
    table,
    email,
    comment,
    isSubmitting,
    statusInfo
});

MakeRequestDetails.propTypes = {
    patientSet: PropTypes.object.isRequired,
    table: PropTypes.shape(TableDefinition).isRequired,
    email: PropTypes.string,
    comment: PropTypes.string,
    isSubmitting: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
