import PropTypes from "prop-types";

export const Param = ({
    id= null,
    internalId = null,
    name = null,
    value= null,
    dataType= DataType.T,
    status = null
} = {}) => ({
    id,
    internalId,
    name,
    value,
    dataType,
    status
});

Param.propTypes = {
    id: PropTypes.number.isRequired,
    internalId: PropTypes.number,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    dataType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
};

export const DataType = {
    T : "T", //Text
    N: "N", //Numeric
    I: "I", //Integer
    D: "D", //Date
    B: "B", //Boolean
    C: "C", //Reference Binary
    RTF: "RTF", //Rtf
    XLS: "XLS", //Excel
    XML: "XML",  //Xml
    DOC: "DOC", //Word
};

export const ParamStatus = {
    A : "ACTIVE",
    P: "PRIVATE"
};

