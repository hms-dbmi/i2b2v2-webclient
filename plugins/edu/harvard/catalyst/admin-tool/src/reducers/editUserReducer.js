import {
    GET_ALL_USER_PARAMS_ACTION,
    SAVE_USER_ACTION,
    SAVE_USER_PARAM_ACTION,
    DELETE_USER_PARAM_ACTION
} from "actions";
import { defaultState } from "defaultState";
import { SelectedUser, Param } from "models";

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

            //Extract each user data into User model and return an array of Users
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
            //TODO: add error handling somewhere
            return SelectedUser({
                ...state,
                isFetching: false,
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

        case  SAVE_USER_ACTION.SAVE_USER_FAILED:
        case SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM_FAILED: {

            return SelectedUser({
                ...state,
                saveStatus: "FAIL"
            });
        }
        case SAVE_USER_ACTION.SAVE_USER_STATUS_CONFIRMED:
        case SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM_STATUS_CONFIRMED: {

            return SelectedUser({
                ...state,
                saveStatus: null
            });
        }
        case  SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM_SUCCEEDED: {
            const  { user, param }  = action.payload;

            let newParams = [
                ...state.params
            ];
            newParams.push(param);

            return SelectedUser({
                ...state,
                params: newParams,
                saveStatus: "SUCCESS"
            });
        }

        case
            DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM_STATUS_CONFIRMED: {

            return SelectedUser({
                ...state,
                deleteStatus: null
            });
        }
        case  DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM_SUCCEEDED: {
            const  { user, param }  = action.payload;

            let newParams = [
                ...state.params
            ];
            newParams = newParams.filter((pm) => pm.id  === param.id);
            return SelectedUser({
                ...state,
                params: newParams,
                deleteStatus: "SUCCESS"
            });
        }
        case  DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM_FAILED: {

            return SelectedUser({
                ...state,
                deleteStatus: "FAIL"
            });
        }
        default: {
            return state;
        }
    }
};
