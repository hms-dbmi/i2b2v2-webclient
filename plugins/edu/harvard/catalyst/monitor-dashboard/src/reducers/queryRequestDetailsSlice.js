import { QueryRequestDetails, StatusInfo } from "models";
import {QUERY_REQUEST_DETAILS} from "../actions";
import {createSlice} from "@reduxjs/toolkit";
import {defaultState} from "../defaultState";
import {
    Concept, CONCEPT_TIMING,
    ConceptGroup,
    ConstrainByDate,
    ConstrainByModifier,
    ConstrainByValue, EVENT_CONSTRAINT_AGGREGATE_OPERATOR, EVENT_JOIN_COLUMN,
    EventConstraint,
    EventConstraintQuery,
    EventGroup,
    EventQuery,
    QUERY_TIMING,
    QueryDefinition, TimeSpan
} from "../models";
import {TIMESPAN_OPERATOR, TIMESPAN_UNIT} from "../models/TimeSpan";

export const queryRequestDetailsSlice = createSlice({
    name: QUERY_REQUEST_DETAILS,
    initialState: defaultState.queryRequestDetails,
    reducers: {
        getQueryRequestDetails: state => {
            return QueryRequestDetails({
                isFetching: true
            });
        },
        getQueryRequestDetailsSucceeded: (state, { payload:  queryRequest  }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
            state.queryMasterId = queryRequest.queryMasterId;
            state.queryName = queryRequest.queryName;
            state.username = queryRequest.username;
            state.queryRequestXml = queryRequest.queryRequestXml;
            state.queryRequestSQL = queryRequest.queryRequestSQL;

            let queryDefinition = QueryDefinition({
                queryName: queryRequest.queryDefinition.queryName,
                queryTiming : QUERY_TIMING[queryRequest.queryDefinition.queryTiming],
            });

            const extractConceptGroups = (panels) => {
                const conceptGroups = [];
                panels.map(panel => {
                    let conceptGroup = ConceptGroup({
                        conceptNumber: panel.panelNumber,
                        conceptTiming: CONCEPT_TIMING[panel.panelTiming],
                        invert: panel.invert,
                        occurrences: panel.occurrences,
                    });

                    panel.panelItems.map(panelItem => {
                        let modifierConstraint = ConstrainByModifier();
                        if (panelItem.constrainByModifier) {
                            modifierConstraint.name = panelItem.constrainByModifier.name;
                            modifierConstraint.key = panelItem.constrainByModifier.key;
                            modifierConstraint.appliedPath = panelItem.constrainByModifier.appliedPath;
                            if( panelItem.constrainByModifier.constrainByValue) {
                                modifierConstraint.valueConstraint = ConstrainByValue({
                                    valueOperator: panelItem.constrainByModifier.constrainByValue.valueOperator,
                                    valueConstraint: panelItem.constrainByModifier.constrainByValue.valueConstraint,
                                    valueType: panelItem.constrainByModifier.constrainByValue.valueType,
                                    valueUnits: panelItem.constrainByModifier.constrainByValue.valueUnits
                                });
                            }
                        }

                        let valueConstraint = ConstrainByValue();
                        if (panelItem.constrainByValue) {
                            valueConstraint.valueOperator = panelItem.constrainByValue.valueOperator;
                            valueConstraint.valueConstraint = panelItem.constrainByValue.valueConstraint;
                            valueConstraint.valueType = panelItem.constrainByValue.valueType;
                            valueConstraint.valueUnits = panelItem.constrainByValue.valueUnits;
                        }

                        let dateConstraint = ConstrainByDate();
                        if (panelItem.constrainByDate) {
                            dateConstraint.dateFrom = panelItem.constrainByDate.dateFrom;
                            dateConstraint.dateTo = panelItem.constrainByDate.dateTo;
                        }

                        conceptGroup.concepts.push( Concept({
                            hlevel: panelItem.hlevel,
                            name: panelItem.itemName,
                            key: panelItem.itemKey,
                            icon: panelItem.itemIcon,
                            tooltip: panelItem.tooltip,
                            isSynonym: panelItem.isSynonym,
                            valueConstraint,
                            dateConstraint,
                            modifierConstraint
                        }));
                    });

                    conceptGroups.push(conceptGroup);
                });

                return conceptGroups;
            }

            queryDefinition.conceptGroups = extractConceptGroups(queryRequest.queryDefinition.panels);

            if(queryRequest.queryDefinition.subqueryGroup.subquery.length > 0
                && queryRequest.queryDefinition.subqueryGroup.subqueryConstraints.length ){
                const events = queryRequest.queryDefinition.subqueryGroup.subquery.map(subquery => {
                    return (EventQuery({
                        queryId: subquery.queryId,
                        queryName: subquery.queryName,
                        queryType: subquery.queryType,
                        conceptGroups: extractConceptGroups(subquery.panels),
                    }));
                })

                const eventConstraints = queryRequest.queryDefinition.subqueryGroup.subqueryConstraints.map(subqueryConstraint => {
                   return( EventConstraint({
                        firstConstraint: EventConstraintQuery({
                            queryId: subqueryConstraint.firstConstraint.queryId,
                            joinColumn: EVENT_JOIN_COLUMN[subqueryConstraint.firstConstraint.joinColumn],
                            aggOperator: EVENT_CONSTRAINT_AGGREGATE_OPERATOR[subqueryConstraint.firstConstraint.aggOperator]
                        }),
                        secondConstraint: EventConstraintQuery({
                            queryId: subqueryConstraint.secondConstraint.queryId,
                            joinColumn: EVENT_JOIN_COLUMN[subqueryConstraint.secondConstraint.joinColumn],
                            aggOperator: EVENT_CONSTRAINT_AGGREGATE_OPERATOR[subqueryConstraint.secondConstraint.aggOperator]
                        }),
                        operator: subqueryConstraint.operator,
                        timeSpans: subqueryConstraint.timeSpans.map(timeSpan => {
                           return TimeSpan({
                               spanOperator: TIMESPAN_OPERATOR[timeSpan.operator],
                               spanValue: timeSpan.value,
                               spanUnits: TIMESPAN_UNIT[timeSpan.units]
                           })
                       })
                    }));
                })

                queryDefinition.eventGroup = EventGroup({
                    events,
                    eventConstraints
                });
            }


            state.queryDefinition = queryDefinition;
        },

        getQueryRequestDetailsFailed: (state, { payload: { errorMessage } }) => {
            return QueryRequestDetails({
                isFetching: false,
                statusInfo: StatusInfo({
                    status: "FAIL",
                    errorMessage: errorMessage
                })
            });
        }
    }
})

export const {
    getQueryRequestDetails,
    getQueryRequestDetailsSucceeded,
    getQueryRequestDetailsFailed,
} = queryRequestDetailsSlice.actions

export default queryRequestDetailsSlice.reducer