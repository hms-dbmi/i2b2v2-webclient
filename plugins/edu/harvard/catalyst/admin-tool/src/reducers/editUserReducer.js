import {
    GET_ALL_USER_PARAMS_ACTION,
    GET_ALL_PROJECT_USER_PARAMS_ACTION,
    SAVE_USER_ACTION,
    SAVE_USER_PARAM_ACTION,
    DELETE_USER_PARAM_ACTION,
    CLEAR_SELECTED_USER_ACTION
} from "actions";
import { defaultState } from "defaultState";
import {SelectedUser, Param, ParamStatusInfo, SelectedProject} from "models";

export const editUserReducer = (state = defaultState.selectedUser, action) => {
    switch (action.type) {
        case  GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS: {
            const  {user}  = action.payload;

            return SelectedUser({
                ...state,
                user,
                isFetching: true,
            });
        }
        case  GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS_SUCCEEDED: {
            const  {user, params}  = action.payload;

            //Extract each user param data into Param model and return an array of Params
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

            return SelectedUser({
                ...state,
                user,
                params: paramsList,
                isFetching: false,
            });
        }

        case  GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS_FAILED: {
            return SelectedUser({
                ...state,
                isFetching: false,
            });
        }

        case GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS_STATUS_CONFIRMED: {

            return SelectedUser({
                ...state,
                userParamStatus: null
            });
        }

        case  SAVE_USER_ACTION.SAVE_USER_SUCCEEDED: {
            const  { user }  = action.payload;

            return SelectedUser({
                ...state,
                user,
                saveStatus: "SUCCESS"
            });
        }
        case SAVE_USER_ACTION.SAVE_USER_FAILED:{

            return SelectedUser({
                ...state,
                saveStatus: "FAIL"
            });
        }

        case SAVE_USER_ACTION.SAVE_USER_STATUS_CONFIRMED: {
            return SelectedUser({
                ...state,
                saveStatus: null
            });
        }

        case  SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM_SUCCEEDED: {
            const  { param }  = action.payload;

            return SelectedUser({
                ...state,
                paramStatus: ParamStatusInfo({
                    status: "SAVE_SUCCESS",
                    param
                })
            });
        }

        case SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM_FAILED: {
            const  { param }  = action.payload;

            return SelectedUser({
                ...state,
                paramStatus: ParamStatusInfo({
                    status: "SAVE_FAIL",
                    param
                })
            });
        }
        case SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM_STATUS_CONFIRMED: {

            return SelectedUser({
                ...state,
                paramStatus: ParamStatusInfo()
            });
        }

        case  DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM_SUCCEEDED: {
            const  { user, param }  = action.payload;

            let newParams = [
                ...state.params
            ];
            newParams = newParams.filter((pm) => pm.id  !== param.id);
            //reset the row ids which are based on index
            newParams.forEach((pm, index) => {
                pm.id = index;
            });
            return SelectedUser({
                ...state,
                params: newParams,
                paramStatus: ParamStatusInfo({
                    status: "DELETE_SUCCESS",
                    param
                })
            });
        }
        case  DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM_FAILED: {

            return SelectedUser({
                ...state,
                paramStatus: ParamStatusInfo({
                    status: "DELETE_FAIL",
                    param
                })
            });
        }

        case DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM_STATUS_CONFIRMED: {

            return SelectedUser({
                ...state,
                paramStatus: ParamStatusInfo()
            });
        }

        case  GET_ALL_PROJECT_USER_PARAMS_ACTION.GET_ALL_PROJECT_USER_PARAMS: {
            const  {user}  = action.payload;

            return SelectedUser({
                ...state,
                user,
                isFetching: true,
                userParamStatus: null
            });
        }

        case  GET_ALL_PROJECT_USER_PARAMS_ACTION.GET_ALL_PROJECT_USER_PARAMS_SUCCEEDED: {
            const  {user, params}  = action.payload;

            //Extract each user param data into Param model and return an array of Params
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

            return SelectedUser({
                ...state,
                user,
                params: paramsList,
                isFetching: false,
                userParamStatus: "SUCCESS"
            });
        }


        case  GET_ALL_PROJECT_USER_PARAMS_ACTION.GET_ALL_PROJECT_USER_PARAMS_FAILED: {
            return SelectedUser({
                ...state,
                isFetching: false,
                userParamStatus: "FAIL"
            });
        }

        case GET_ALL_PROJECT_USER_PARAMS_ACTION.GET_ALL_PROJECT_USER_PARAMS_STATUS_CONFIRMED: {

            return SelectedUser({
                ...state,
                userParamStatus: null
            });
        }

        case  CLEAR_SELECTED_USER_ACTION.CLEAR_SELECTED_USER: {
            return SelectedUser();
        }

        default: {
            return state;
        }
    }
};
