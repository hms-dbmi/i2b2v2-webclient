import PropTypes from "prop-types";

export const Param = ({
    id= null,
  name = null,
  value= null,
  dataType= DataType.TEXT
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
    TEXT: {
        name: "Text",
        value: "T"
    },
    NUMERIC: {
        name: "Numeric",
        value: "N"
    },
    INTEGER: {
        name: "Integer",
        value: "I"
    },
    DATE: {
        name: "Date",
        value: "D"
    },
   BOOLEAN: {
        name: "Boolean",
        value: "B"
    },
    REFERENCE_BINARY: {
        name: "Reference Binary",
        value: "C"
    },
    RTF: {
        name: "Rtf",
        value: "RTF"
    },
    XLS: {
        name: "Excel",
        value: "XLS"
    },
    XML: {
        name: "Xml",
        value: "XML"
    },
    DOC: {
        name: "Word",
        value: "DOC"
    },
};

