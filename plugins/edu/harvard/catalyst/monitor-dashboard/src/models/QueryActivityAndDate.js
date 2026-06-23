import PropTypes from "prop-types";
import {DateTime} from "luxon";

export const QueryActivityAndDate = ({
    date= null,
    queryActivity= null,
} = {}) => ({
    date,
    queryActivity,
});

QueryActivityAndDate.propTypes = {
    date: PropTypes.instanceOf(DateTime).isRequired,
    queryActivity: PropTypes.number.isRequired,
};