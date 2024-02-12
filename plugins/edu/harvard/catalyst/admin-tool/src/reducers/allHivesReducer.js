import {
    GET_ALL_HIVES_ACTION,
} from "actions";
import { defaultState } from "defaultState";
import {AllHives, Hive} from "models";

export const allHivesReducer = (state = defaultState.allHives, action) => {
    switch (action.type) {
        case  GET_ALL_HIVES_ACTION.GET_ALL_HIVES: {
            return AllHives({
                ...state,
                isFetching: true,
            });
        }
        case  GET_ALL_HIVES_ACTION.GET_ALL_HIVES_SUCCEEDED: {
            const  allHives  = action.payload;

            //Extract each project data into Project model and return an array of Projects
            let hives = [];
            allHives.map((hive) => {
                hives.push(Hive({
                    environment: hive.environment,
                    helpUrl: hive.helpUrl,
                    domainId: hive.domainId,
                    domainName: hive.domainName,
                    isActive: hive.isActive
                }));
            })

            return AllHives({
                ...state,
                hives,
                isFetching: false,
            });
        }
        case  GET_ALL_HIVES_ACTION.GET_ALL_HIVES_FAILED: {
            //TODO: add error handling somewhere
            return AllHives({
                ...state,
                isFetching: false,
            });
        }
        default: {
            return state;
        }
    }
};
