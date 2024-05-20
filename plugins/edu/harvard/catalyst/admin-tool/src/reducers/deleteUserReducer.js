import {
    DELETE_USER_ACTION,
} from "actions";
import { defaultState } from "defaultState";
import { DeletedUser, User } from "models";

export const deleteUserReducer = (state = defaultState.deletedUser, action) => {
    switch (action.type) {
        case  DELETE_USER_ACTION.DELETE_USER: {
            const  { user }  = action.payload;

            return DeletedUser({
                ...state,
                user,
                isDeleting: true,
            });
        }
        case  DELETE_USER_ACTION.DELETE_USER_SUCCEEDED: {
            return DeletedUser({
                ...state,
                isDeleting: false,
                status: "SUCCESS"
            });
        }
        case  DELETE_USER_ACTION.DELETE_USER_FAILED: {

            return DeletedUser({
                ...state,

                isDeleting: false,
                status: "FAIL"
            });
        }

        case  DELETE_USER_ACTION.DELETE_USER_STATUS_CONFIRMED: {

            return DeletedUser({
                ...state,
                user: null,
                status: null
            });
        }

        default: {
            return state;
        }
    }
};
