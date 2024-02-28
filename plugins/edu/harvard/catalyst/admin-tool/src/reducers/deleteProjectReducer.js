import {
    DELETE_PROJECT_ACTION,
} from "actions";
import { defaultState } from "defaultState";
import { DeletedProject } from "models";

export const deleteProjectReducer = (state = defaultState.deletedProject, action) => {
    switch (action.type) {
        case  DELETE_PROJECT_ACTION.DELETE_PROJECT: {
            const  { project }  = action.payload;

            return DeletedProject({
                ...state,
                project,
                isDeleting: true,
            });
        }
        case  DELETE_PROJECT_ACTION.DELETE_PROJECT_SUCCEEDED: {
            return DeletedProject({
                ...state,
                isDeleting: false,
                status: "SUCCESS"
            });
        }
        case  DELETE_PROJECT_ACTION.DELETE_PROJECT_FAILED: {

            return  DeletedProject({
                   ...state,
                   isDeleting: false,
                   status: "FAIL"
               });
        }

        case  DELETE_PROJECT_ACTION.DELETE_PROJECT_STATUS_CONFIRMED: {

            return DeletedProject({
                ...state,
                project: null,
                status: null
            });
        }

        default: {
            return state;
        }
    }
};
