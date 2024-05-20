import {
    GET_ALL_GLOBAL_PARAMS_ACTION,
    GET_ALL_HIVES_ACTION, SAVE_HIVE_DOMAIN_ACTION, SAVE_GLOBAL_PARAM_ACTION, DELETE_GLOBAL_PARAM_ACTION,
} from "actions";
import { defaultState } from "defaultState";
import {AllHives, HiveDomain, Param, ParamStatusInfo} from "models";

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

        case  GET_ALL_GLOBAL_PARAMS_ACTION.GET_ALL_GLOBAL_PARAMS: {
            return AllHives({
                ...state,
                isFetchingParams: true
            });
        }

        case  GET_ALL_GLOBAL_PARAMS_ACTION.GET_ALL_GLOBAL_PARAMS_SUCCEEDED: {
            const  { params }  = action.payload;

            let paramsList = [];
            params.map((param) => {
                paramsList.push(Param({
                    id: param.id,
                    internalId: param.internalId,
                    name: param.name,
                    value:param.value,
                    dataType: param.dataType,
                }));
            })

            return AllHives({
                ...state,
                params: paramsList,
                isFetchingParams: false
            });
        }

        case  GET_ALL_GLOBAL_PARAMS_ACTION.GET_ALL_GLOBAL_PARAMS_FAILED: {

            return AllHives({
                ...state,
                isFetchingParams: false
            });
        }


        case  SAVE_GLOBAL_PARAM_ACTION.SAVE_GLOBAL_PARAM_SUCCEEDED: {
            const  { param }  = action.payload;

            return AllHives({
                ...state,
                paramStatus: ParamStatusInfo({
                    status: "SAVE_SUCCESS",
                    param
                })
            });
        }

        case  SAVE_GLOBAL_PARAM_ACTION.SAVE_GLOBAL_PARAM_FAILED: {
            const  { param }  = action.payload;

            return AllHives({
                ...state,
                paramStatus: ParamStatusInfo({
                    status: "SAVE_FAIL",
                    param
                })
            });
        }

        case SAVE_GLOBAL_PARAM_ACTION.SAVE_GLOBAL_PARAM_STATUS_CONFIRMED: {

            return AllHives({
                ...state,
                paramStatus: ParamStatusInfo()
            });
        }

        case  DELETE_GLOBAL_PARAM_ACTION.DELETE_GLOBAL_PARAM_SUCCEEDED: {
            const  { param }  = action.payload;

            return AllHives({
                ...state,
                paramStatus: ParamStatusInfo({
                    status: "DELETE_SUCCESS",
                    param
                })
            });
        }
        case  DELETE_GLOBAL_PARAM_ACTION.DELETE_GLOBAL_PARAM_FAILED: {

            return AllHives({
                ...state,
                paramStatus: ParamStatusInfo({
                    status: "DELETE_FAIL",
                    param
                })
            });
        }

        case DELETE_GLOBAL_PARAM_ACTION.DELETE_GLOBAL_PARAM_STATUS_CONFIRMED: {

            return AllHives({
                ...state,
                paramStatus: ParamStatusInfo()
            });
        }

        default: {
            return state;
        }
    }
};
