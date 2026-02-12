import PropTypes from "prop-types";
import {QueryStatus} from "./QueryStatus";
import {ExportRequest} from "./ExportRequest";

export const Query = ({
    id = null,
    queryInstanceId = null,
    name= "",
    project= "",
    dataRequests = [],
    startDate = null,
    deleteDate = null,
    patientCount = null,
    obfuscatedPatientCountStr= "",
    status= QueryStatus.statuses.SUBMITTED,
    runTime=null,
    username,
} = {}) => ({
    id,
    queryInstanceId,
    name,
    project,
    dataRequests,
    startDate,
    deleteDate,
    patientCount,
    obfuscatedPatientCountStr,
    username,
    status,
    runTime
});

Query.propTypes = {
    id: PropTypes.number.isRequired,
    queryInstanceId: PropTypes.number.isRequired,
    name:  PropTypes.string.isRequired,
    dataRequests: PropTypes.arrayOf(ExportRequest).isRequired,
    startDate: PropTypes.instanceOf(Date).isRequired,
    deleteDate: PropTypes.instanceOf(Date).isRequired,
    patientCount: PropTypes.number.isRequired,
    obfuscatedPatientCountStr: PropTypes.string,
    userId:  PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    runTime: PropTypes.number.isRequired
}

