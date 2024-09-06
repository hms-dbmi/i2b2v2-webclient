import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableDefinition} from "./TableDefinition";

export const MakeRequestDetails = ({
    patientSet = {
        title: "",
        icon: null,
        sdx: {}
    },
    email = "",
    comments= "",
    isSubmitting= false,
    statusInfo = StatusInfo(),
} = {}) => ({
    patientSet,
    email,
    comments,
    isSubmitting,
    statusInfo
});

MakeRequestDetails.propTypes = {
    patientSet: PropTypes.object.isRequired,
    email: PropTypes.string,
    comments: PropTypes.string,
    isSubmitting: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};
