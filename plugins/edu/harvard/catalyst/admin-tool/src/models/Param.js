import PropTypes from "prop-types";

export const Param = ({
    id= null,
  name = null,
  value= null,
  dataType= DataType.T
} = {}) => ({
    id,
    name,
    value,
    dataType
});

Param.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    dataType: PropTypes.string.isRequired,
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

