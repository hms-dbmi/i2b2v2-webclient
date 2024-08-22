import PropTypes from "prop-types";
import {TableRow} from "./TableRow";

export const Table = ({
    rows = [],
} = {}) => ({
    rows,
});

Table.propTypes = {
    rows: PropTypes.arrayOf(TableRow),
};
