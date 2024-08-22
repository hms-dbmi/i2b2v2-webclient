import PropTypes from "prop-types";
import {StatusInfo} from "./StatusInfo";

export const DataTable = ({
  table = {},
} = {}) => ({
  table,
});

TableDefinition.propTypes = {
    table: PropTypes.object,
};