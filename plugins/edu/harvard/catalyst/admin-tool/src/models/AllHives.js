import PropTypes from "prop-types";
import { Hive } from "./Hive";

export const AllHives = ({
     hives = [],
     isFetching= false,
 } = {}) => ({
    hives,
    isFetching
});

AllHives.propTypes = {
    hives: PropTypes.arrayOf(Hive).isRequired,
    isFetching: PropTypes.bool,
};