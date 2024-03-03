import {
    GET_ALL_HIVES_ACTION, SAVE_HIVE_DOMAIN_ACTION,
} from "actions";
import { defaultState } from "defaultState";
import {AllHives, HiveDomain} from "models";

export const allHivesReducer = (state = defaultState.allHives, action) => {
    switch (action.type) {
        case  GET_ALL_HIVES_ACTION.GET_ALL_HIVES: {
            return AllHives({
                ...state,
                isFetching: true,
            });
        }
        case  GET_ALL_HIVES_ACTION.GET_ALL_HIVES_SUCCEEDED: {
            const  { allHives }  = action.payload;

            //Extract each project data into Project model and return an array of Projects
            let hiveDomains = [];
            allHives.map((hive) => {
                hiveDomains.push(HiveDomain({
                    environment: hive.environment,
                    helpURL: hive.helpURL,
                    domainId: hive.domainId,
                    domainName: hive.domainName,
                    isActive: hive.isActive
                }));
            })

            return AllHives({
                ...state,
                hiveDomains,
                isFetching: false,
            });
        }
        case  GET_ALL_HIVES_ACTION.GET_ALL_HIVES_FAILED: {
            return AllHives({
                ...state,
                isFetching: false,
            });
        }
        case  SAVE_HIVE_DOMAIN_ACTION.SAVE_HIVE_DOMAIN_SUCCEEDED: {
            const { hiveDomains }  = action.payload;

            return AllHives({
                ...state,
                hiveDomains,
                saveStatus: "SUCCESS"
            });
        }
        case  SAVE_HIVE_DOMAIN_ACTION.SAVE_HIVE_DOMAIN_FAILED: {
            return AllHives({
                ...state,
                saveStatus: "FAIL"
            });
        }
        case  SAVE_HIVE_DOMAIN_ACTION.SAVE_HIVE_DOMAIN_STATUS_CONFIRMED: {
            return AllHives({
                ...state,
                saveStatus: null
            });
        }
        default: {
            return state;
        }
    }
};
