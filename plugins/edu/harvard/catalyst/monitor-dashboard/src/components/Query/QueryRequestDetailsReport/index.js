import React  from "react";
import {useSelector} from "react-redux";

import {Box, Card, Divider, Typography} from "@mui/material";
import "./QueryRequestDetailsReport.scss";
import {
    EVENT_CONSTRAINT_AGGREGATE_OPERATOR,
    EVENT_CONSTRAINT_OPERATOR,
    EVENT_JOIN_COLUMN,
    QUERY_STATUSES,
    TIMESPAN_UNIT,
    TIMESPAN_OPERATOR
} from "models";

export const QueryRequestDetailsReport = ({patientCountStr, queryRow}) => {
    const queryRequestDetails = useSelector((state) => state.queryRequestDetails);

    const getQueryDefinitionTimingDescription = () => {
        let description = '';
        switch(queryRequestDetails.queryDefinition.queryTiming) {
            case "ANY":
                description = "Treat All Groups Independently";
                break;
            case "SAMEVISIT":
                description = "Selected groups occur in the same financial encounter";
                break;
            case "SAMEINSTANCENUM":
                description = "Items Instance will be the same";
                break;
        }

        return description;
    }

    const getConceptTimingDescription = (timing) => {
        let description = '';
        switch(timing) {
            case "ANY":
                description = "Independent of Visit";
                break;
            case "SAMEVISIT":
                description = "Occurs in Same Encounter";
                break;
            case "SAMEINSTANCENUM":
                description = "Item's Instance will be the same";
                break;
        }

        return description;
    }

    const displayConceptGroup = () => {
        return queryRequestDetails.queryDefinition.conceptGroups.map((conceptGroup , cgindex) => {
            return (
                <Box>
                    {cgindex !== 0 && <span className="joiner and">AND </span>}
                    {conceptGroup.invert && <span className="joiner and">NOT</span>}
                    <Card variant="outlined" className={conceptGroup.invert ? "concept-definition not" : "concept-definition"}>
                        {
                            conceptGroup.concepts.map((concept, index) => {
                                return displayConcept(concept, conceptGroup.occurrences,
                                    conceptGroup.conceptTiming, index === conceptGroup.concepts.length - 1);
                            })
                        }
                    </Card>
                </Box>
            )
        });
    }


    const extractValueConstraintContent = (valueConstraint) => {
        let valueConstraintContent = "";
        if (valueConstraint.valueType === "NODATATYPE"
            || valueConstraint.valueType === "NUMBER"
            || valueConstraint.valueType === "TEXT"
            || valueConstraint.valueType === "LARGETEXT"
            || valueConstraint.valueType === "FLAG") {


            if (valueConstraint.valueType === "FLAG") {
                let flagValueMapping = {
                    "A": "Abnormal",
                    "H": "High",
                    "@": "Normal",
                    "L": "Low",
                    "CH": "Critical High",
                    "CL": "Critical Low"
                }

                valueConstraintContent = "= " + valueConstraint.valueConstraint;

                if (flagValueMapping[valueConstraint.valueConstraint]) {
                    valueConstraintContent += " (" + flagValueMapping[valueConstraint.valueConstraint] + ")";
                }
            }
            if (valueConstraint.valueType === "NUMBER") {
                let numericOperatorMapping = {
                    "LT": "<",
                    "LE": "<=",
                    "EQ": "=",
                    "GT": ">",
                    "GE": ">="
                }

                if(valueConstraint.valueOperator === "BETWEEN"){
                    let valueLowAndHigh = valueConstraint.valueConstraint.trim().split(" and ");
                    if(valueLowAndHigh.length === 2){
                        valueConstraintContent = valueLowAndHigh[0] + " - " + valueLowAndHigh[1] + " ";
                    }
                }
                else{
                    valueConstraintContent = numericOperatorMapping[valueConstraint.valueOperator] + " " + valueConstraint.valueConstraint;
                }
            }

            if (valueConstraint.valueType === "TEXT") {
                try {
                    const enumValues = eval("(Array" + valueConstraint.valueConstraint + ")");
                    valueConstraintContent = "= (" +  enumValues.join(", ") + ")";
                } catch (e) {
                    //This is a string
                    let textOperatorMapping = {
                        "LIKE[exact]": "exact",
                        "LIKE[begin]": "starts with",
                        "LIKE[end]": "ends with",
                        "LIKE[contains]": "contains",
                    }

                    valueConstraintContent = textOperatorMapping[valueConstraint.valueOperator] + " ";
                    valueConstraintContent += '"' +  valueConstraint.valueConstraint + '"';
                }
            }

            if (valueConstraint.valueType === "LARGETEXT") {
                valueConstraintContent = "contains " + '"' + valueConstraint.valueConstraint + '"';
            }

        }else{
            if (valueConstraint.valueOperator) {
                valueConstraintContent += " " + valueConstraint.valueOperator + " ";
            }

            if (valueConstraint.valueConstraint) {
                valueConstraintContent += valueConstraint.valueConstraint;
            }
        }

        if (valueConstraint.valueUnits) {
            valueConstraintContent += " " + valueConstraint.valueUnits;
        }

        console.log("value constraint is: ", JSON.stringify(valueConstraint));
        return valueConstraintContent;
    };

    const displayConcept = (concept, occurrences, timing, isLast) => {
        let timingFrom = "earliest date available";
        if (concept.dateConstraint.dateFrom) {
          timingFrom = concept.dateConstraint.dateFrom.toLocaleDateString();
        }

        let timingTo = "latest date available";
        if (concept.dateConstraint.dateTo) {
            timingTo = concept.dateConstraint.dateTo.toLocaleDateString();
        }

        let modifierContent = "";
        if(concept.modifierConstraint.name){
            modifierContent = " {" + concept.modifierConstraint.name + " " + extractValueConstraintContent(concept.modifierConstraint.valueConstraint) + "}";
        }

        if(concept.valueConstraint.valueConstraint){
            modifierContent = " " + extractValueConstraintContent(concept.valueConstraint);
        }

        return (
            <Box>
                <Card className="concept-container">
                    <div className="concept-title">
                        {concept.name + modifierContent}
                    </div>
                    <div className="concept-descript">{concept.tooltip}</div>
                    <div className="concept-timing"> {getConceptTimingDescription(timing)} </div>
                    <div className="item-dates">From {timingFrom} to {timingTo}</div>
                    <div className="concept-occurs"># of times an item is recorded is >= {occurrences}</div>
                </Card>
                {!isLast && <div className="joiner or">OR</div> }
            </Box>
        )
    };

    const displayEvents = (events) => {
        return(
            <div className="events-container">
                <h3>All Events</h3>
                {
                    events.map(event => {
                        return(
                            event.conceptGroups.map(eventConceptGroup => {
                                return(
                                    <Card variant="outlined" className={eventConceptGroup.invert ? "concept-definition not" : "concept-definition"}>
                                        <div className="event-title">{event.queryName}</div>
                                        <div className="event-panel">
                                            {
                                                eventConceptGroup.concepts.map((concept, index) => {
                                                        return displayConcept(concept, eventConceptGroup.occurrences,
                                                            eventConceptGroup.conceptTiming, index === eventConceptGroup.concepts.length - 1);
                                                })
                                            }
                                        </div>
                                    </Card>
                                )
                            })
                        );
                    })
                }
            </div>
        )
    }

    const displayEventConstraints = (eventConstraints) => {
        return(
            <div className="events-container">
                <h3 className="eventlinks-title">Order of Events</h3>
                {
                    <Card variant="outlined" className="eventlinks-container">
                        {
                            eventConstraints.map((eventConstraint, index) => {
                                return(
                                    <div className={index === (eventConstraints.length - 1) ? "line last" : index === 0 ? "line first" : "line"}>
                                        {eventConstraint.firstConstraint.joinColumn === EVENT_JOIN_COLUMN.STARTDATE && "Start of "}
                                        {eventConstraint.firstConstraint.joinColumn === EVENT_JOIN_COLUMN.ENDDATE && "End of "}

                                        {eventConstraint.firstConstraint.aggOperator === EVENT_CONSTRAINT_AGGREGATE_OPERATOR.FIRST && "the first ever "}
                                        {eventConstraint.firstConstraint.aggOperator === EVENT_CONSTRAINT_AGGREGATE_OPERATOR.LAST && "the last ever "}
                                        {eventConstraint.firstConstraint.aggOperator === EVENT_CONSTRAINT_AGGREGATE_OPERATOR.ANY && "any "}

                                        { "occurrence for Event " + (index + 1) + " occurs "}

                                        {eventConstraint.operator === EVENT_CONSTRAINT_OPERATOR.EQUAL && "simultaneously with the "}
                                        {eventConstraint.operator === EVENT_CONSTRAINT_OPERATOR.LESSEQUAL && "on or before the "}
                                        {eventConstraint.operator === EVENT_CONSTRAINT_OPERATOR.LESS && "before the "}
                                        {eventConstraint.operator === EVENT_CONSTRAINT_OPERATOR.GREATER && "after the "}
                                        {eventConstraint.operator === EVENT_CONSTRAINT_OPERATOR.GREATEREQUAL && "on or after the "}

                                        <br/>
                                        {eventConstraint.secondConstraint.joinColumn === EVENT_JOIN_COLUMN.STARTDATE && "the start of "}
                                        {eventConstraint.secondConstraint.joinColumn === EVENT_JOIN_COLUMN.ENDDATE && "the end of "}

                                        {eventConstraint.secondConstraint.aggOperator === EVENT_CONSTRAINT_AGGREGATE_OPERATOR.FIRST && "the first ever "}
                                        {eventConstraint.secondConstraint.aggOperator === EVENT_CONSTRAINT_AGGREGATE_OPERATOR.LAST && "the last ever "}
                                        {eventConstraint.secondConstraint.aggOperator === EVENT_CONSTRAINT_AGGREGATE_OPERATOR.ANY && "any "}

                                        { "occurrence for Event " + (index + 2)}
                                        {eventConstraint.timeSpans.length > 0 && " by "}

                                        {(eventConstraint.timeSpans.length > 0 && eventConstraint.timeSpans[0].spanOperator === TIMESPAN_OPERATOR.LESS)
                                            && "< "}
                                        {(eventConstraint.timeSpans.length > 0 && eventConstraint.timeSpans[0].spanOperator === TIMESPAN_OPERATOR.LESSEQUAL)
                                            && "<= "}
                                        {(eventConstraint.timeSpans.length > 0 && eventConstraint.timeSpans[0].spanOperator === TIMESPAN_OPERATOR.EQUAL)
                                            && "= "}
                                        {(eventConstraint.timeSpans.length > 0 && eventConstraint.timeSpans[0].spanOperator === TIMESPAN_OPERATOR.GREATER)
                                            && "> "}
                                        {(eventConstraint.timeSpans.length > 0 && eventConstraint.timeSpans[0].spanOperator === TIMESPAN_OPERATOR.GREATEREQUAL)
                                            && ">= "}

                                        {eventConstraint.timeSpans.length > 0 && eventConstraint.timeSpans[0].spanValue}

                                        {(eventConstraint.timeSpans.length > 0 && eventConstraint.timeSpans[0].spanUnits === TIMESPAN_UNIT.DAY)
                                            && " day(s) "}
                                        {(eventConstraint.timeSpans.length > 0 && eventConstraint.timeSpans[0].spanUnits === TIMESPAN_UNIT.MONTH)
                                            && " month(s) "}
                                        {(eventConstraint.timeSpans.length > 0 && eventConstraint.timeSpans[0].spanUnits === TIMESPAN_UNIT.YEAR)
                                            && " year(s) "}

                                        {(eventConstraint.timeSpans.length > 1 && " and ")}

                                        {(eventConstraint.timeSpans.length > 1 && eventConstraint.timeSpans[1].spanOperator === TIMESPAN_OPERATOR.LESS)
                                            && "< "}
                                        {(eventConstraint.timeSpans.length > 1 && eventConstraint.timeSpans[1].spanOperator === TIMESPAN_OPERATOR.LESSEQUAL)
                                            && "<= "}
                                        {(eventConstraint.timeSpans.length > 1 && eventConstraint.timeSpans[1].spanOperator === TIMESPAN_OPERATOR.EQUAL)
                                            && "= "}
                                        {(eventConstraint.timeSpans.length > 1 && eventConstraint.timeSpans[1].spanOperator === TIMESPAN_OPERATOR.GREATER)
                                            && "> "}
                                        {(eventConstraint.timeSpans.length > 1 && eventConstraint.timeSpans[1].spanOperator === TIMESPAN_OPERATOR.GREATEREQUAL)
                                            && ">= "}

                                        {eventConstraint.timeSpans.length > 1 && eventConstraint.timeSpans[1].spanValue}
                                        {(eventConstraint.timeSpans.length > 1 && eventConstraint.timeSpans[1].spanUnits === TIMESPAN_UNIT.DAY)
                                            && " day(s) "}
                                        {(eventConstraint.timeSpans.length > 1 && eventConstraint.timeSpans[1].spanUnits === TIMESPAN_UNIT.MONTH)
                                            && " month(s) "}
                                        {(eventConstraint.timeSpans.length > 1 && eventConstraint.timeSpans[1].spanUnits === TIMESPAN_UNIT.YEAR)
                                            && " year(s) "}

                                        {index !== (eventConstraints.length - 1) && <Divider className={"eventlinks-container-divider"} sx={{ borderBottomWidth: '0.1em' }}/>}
                                    </div>
                                )
                            })
                        }
                    </Card>
                }
            </div>
        )
    }

    return (
        <Box className={"QueryRequestDetailsReport"}>
            This query was performed by username {queryRequestDetails.username}  on {queryRow.startDate.toLocaleDateString()} at {queryRow.startDate.toLocaleTimeString()}.
            {queryRow.queryStatus.status === QUERY_STATUSES.statuses.FINISHED && <span> The search was completed in  {queryRow.runTime} seconds.</span>}
            <h2 className="sub-title">Query Definition</h2>
            <Typography>
                Temporal Constraint: {getQueryDefinitionTimingDescription()}
            </Typography>

            {queryRequestDetails.queryDefinition.conceptGroups.length > 0 &&
                <Typography className={"groups-container"}>
                    <h3>All Groups</h3>
                    {displayConceptGroup()}
                </Typography>
            }

            {queryRequestDetails.queryDefinition.eventGroup.events.length > 0
                && displayEvents(queryRequestDetails.queryDefinition.eventGroup.events)}

            {queryRequestDetails.queryDefinition.eventGroup.eventConstraints.length > 0
                && displayEventConstraints(queryRequestDetails.queryDefinition.eventGroup.eventConstraints)}

            <h2 className="sub-title">Query Results</h2>

            {(queryRow.queryStatus.status === QUERY_STATUSES.statuses.FINISHED && patientCountStr.length > 0) && <Card className={"count-container"}>
                <Typography className={"count-title"}>Number of patients</Typography>
                <Typography className={"count-value"}>
                    {patientCountStr}
                </Typography>
            </Card>
            }

            {(queryRow.queryStatus.status !== QUERY_STATUSES.statuses.FINISHED ||  patientCountStr.length === 0) && <Box> Status: {queryRow.queryStatus.status !== QUERY_STATUSES.statuses.UNKNOWN ? queryRow.queryStatus.status.name: queryRow.queryStatus.i2b2Status} </Box>}
        </Box>
    );
}


