import PropTypes from "prop-types";
import {QueryActivityAndDate} from "./QueryActivityAndDate";

export const QueryActivityByMonth = ({
    activityByMonthList=[],
} = {}) => ({
    activityByMonthList,
});

QueryActivityByMonth.propTypes = {
    activityByMonthList: PropTypes.arrayOf(QueryActivityAndDate).isRequired
};