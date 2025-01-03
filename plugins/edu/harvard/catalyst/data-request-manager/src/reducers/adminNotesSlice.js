import {createSlice} from "@reduxjs/toolkit";
import {ADMIN_NOTES} from "../actions";
import {defaultState} from "../defaultState";
import {AdminNotes, AdminNote, StatusInfo} from "../models";
import {DateTime} from "luxon";

export const adminNotesSlice = createSlice({
    name: ADMIN_NOTES,
    initialState: defaultState.adminNotes,
    reducers: {
        getAdminNotes: state => {
            return AdminNotes({
                isFetching: true
            })
        },
        getAdminNotesSuccess: (state, { payload: {notes} }) => {
            state.notes = notes.map((note, index) => {
                return AdminNote({
                    date: DateTime.fromISO(note.date).toJSDate(),
                    note: note.note
                })
            })
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getAdminNotesError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getAdminNotes,
    getAdminNotesSuccess,
    getAdminNotesError,
} = adminNotesSlice.actions

export default adminNotesSlice.reducer