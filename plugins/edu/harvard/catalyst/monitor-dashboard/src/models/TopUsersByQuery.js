import PropTypes from "prop-types";

export const TopUsersByQuery = ({
    usersAndTotalQueries= [],
    usersAndTotalQueries1Day= [],
    usersAndTotalQueries7Days= [],
    usersAndTotalQueries30Days= []
} = {}) => ({
    usersAndTotalQueries,
    usersAndTotalQueries1Day,
    usersAndTotalQueries7Days,
    usersAndTotalQueries30Days
});

TopUsersByQuery.propTypes = {
    usersAndTotalQueries: PropTypes.arrayOf(PropTypes.object).isRequired,
    usersAndTotalQueries1Day: PropTypes.arrayOf(PropTypes.object).isRequired,
    usersAndTotalQueries7Days: PropTypes.arrayOf(PropTypes.object).isRequired,
    usersAndTotalQueries30Days: PropTypes.arrayOf(PropTypes.object).isRequired,

};