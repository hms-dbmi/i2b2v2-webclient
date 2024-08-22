import PropTypes from "prop-types";

export const TableDefinitionRow = ({
    order=  null,
    id= null,
    name= null,
    aggregation= "Value",
    included= true,
    demographic= false,
    locked = false,
} = {}) => ({
    order,
    id,
    name,
    aggregation,
    included,
    demographic,
    locked
});

TableDefinitionRow.propTypes = {
    order: PropTypes.number,
    id: PropTypes.number,
    name: PropTypes.string,
    aggregation: PropTypes.string,
    included: PropTypes.bool,
    demographic: PropTypes.bool,
    locked: PropTypes.bool
};
