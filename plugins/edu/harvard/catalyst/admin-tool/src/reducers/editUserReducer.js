import {
    GET_ALL_USER_PARAMS_ACTION,
    SAVE_USER_DETAILS_ACTION
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
        case  SAVE_USER_DETAILS_ACTION.SAVE_USER_DETAILS_SUCCEEDED: {

            return SelectedUser({
                ...state,
                saveStatus: "SUCCESS"
            });
        }
        case  SAVE_USER_DETAILS_ACTION.SAVE_USER_DETAILS_FAILED: {

            return SelectedUser({
                ...state,
                saveStatus: "FAIL"
            });
        }
        case  SAVE_USER_DETAILS_ACTION.SAVE_USER_DETAILS_STATUS_CONFIRMED: {

            return SelectedUser({
                ...state,
                saveStatus: null
            });
        }
        default: {
            return state;
        }
    }
};
