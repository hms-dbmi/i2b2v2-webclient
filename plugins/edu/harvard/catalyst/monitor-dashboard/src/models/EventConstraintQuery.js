import PropTypes from "prop-types";

export const EventConstraintQuery = ({
    queryId = null,
    joinColumn = null,
    aggOperator = null
} = {}) => ({
    queryId,
    joinColumn,
    aggOperator
});

export const EVENT_CONSTRAINT_AGGREGATE_OPERATOR = {
    FIRST: "FIRST",
    LAST: "LAST",
    ANY: "ANY"
}

export const EVENT_JOIN_COLUMN = {
    STARTDATE: "STARTDATE",
    ENDDATE: "ENDDATE"
}

EventConstraintQuery .propTypes = {
    queryId: PropTypes.string.isRequired,
    joinColumn: PropTypes.oneOf([
        EVENT_JOIN_COLUMN.STARTDATE,
        EVENT_JOIN_COLUMN.ENDDATE
    ]).isRequired,
    aggOperator: PropTypes.oneOf([
        EVENT_CONSTRAINT_AGGREGATE_OPERATOR.FIRST,
        EVENT_CONSTRAINT_AGGREGATE_OPERATOR.LAST,
        EVENT_CONSTRAINT_AGGREGATE_OPERATOR.ANY
    ]).isRequired,
};



