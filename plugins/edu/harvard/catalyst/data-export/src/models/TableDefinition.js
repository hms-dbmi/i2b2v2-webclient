import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";
import {TableDefinitionRow} from "./TableDefinitionRow";

export const TableDefinition = ({
    rows = defaultRows,
    isFetching= false,
    statusInfo = StatusInfo()
} = {}) => ({
    rows,
    isFetching,
    statusInfo
});

TableDefinition.propTypes = {
    rows: PropTypes.arrayOf(TableDefinitionRow).isRequired,
    isFetching: PropTypes.bool,
    statusInfo: PropTypes.shape(StatusInfo),
};


const defaultRows = [
    TableDefinitionRow({
        "id": "subject_id",
        "order": 1,
        "name": "Participant ID",
        "display": true,
        "locked": true,
        "sdxData": {
            "sdxInfo": {
                "sdxType": "CONCPT",
                "sdxKeyName": "key",
                "sdxControlCell": "ONT",
                "sdxKeyValue": "\\\\REQUIRED\\subject_id\\",
                "sdxDisplayName": "Subject ID"
            }
        },
        "dataOptions": "Value",
        "required": true
    }),
    TableDefinitionRow({
        "id": "gender",
        "order": 2,
        "name": "Gender",
        "display": true,
        "locked": false,
        "sdxData": {
            "sdxInfo": {
                "sdxType": "CONCPT",
                "sdxKeyName": "key",
                "sdxControlCell": "ONT",
                "sdxKeyValue": "\\\\REQUIRED\\gender\\",
                "sdxDisplayName": "Gender"
            }
        },
        "dataOptions": "Value",
        "required": true
    }),
    TableDefinitionRow({
        "id": "age",
        "order": 3,
        "name": "Age",
        "display": true,
        "locked": false,
        "sdxData": {
            "sdxInfo": {
                "sdxType": "CONCPT",
                "sdxKeyName": "key",
                "sdxControlCell": "ONT",
                "sdxKeyValue": "\\\\REQUIRED\\age\\",
                "sdxDisplayName": "Age"
            }
        },
        "dataOptions": "Value",
        "required": true
    }),
    TableDefinitionRow({
        "id": "race",
        "order": 4,
        "name": "Race",
        "display": true,
        "locked": false,
        "sdxData": {
            "sdxInfo": {
                "sdxType": "CONCPT",
                "sdxKeyName": "key",
                "sdxControlCell": "ONT",
                "sdxKeyValue": "\\\\REQUIRED\\race\\",
                "sdxDisplayName": "Race"
            }
        },
        "dataOptions": "Value",
        "required": true
    }),
    TableDefinitionRow({
        "id": "ethnicity",
        "order": 5,
        "name": "Ethnicity",
        "display": true,
        "locked": false,
        "sdxData": {
            "sdxInfo": {
                "sdxType": "CONCPT",
                "sdxKeyName": "key",
                "sdxControlCell": "ONT",
                "sdxKeyValue": "\\\\REQUIRED\\ethnicity\\",
                "sdxDisplayName": "Ethnicity"
            }
        },
        "dataOptions": "Value",
        "required": true
    }),
    TableDefinitionRow({
        "id": "vital_status",
        "order": 6,
        "name": "Deceased",
        "display": true,
        "locked": false,
        "sdxData": {
            "sdxInfo": {
                "sdxType": "CONCPT",
                "sdxKeyName": "key",
                "sdxControlCell": "ONT",
                "sdxKeyValue": "\\\\REQUIRED\\vital_status\\",
                "sdxDisplayName": "Vital Status"
            }
        },
        "dataOptions": "Value",
        "required": true
    })
];

