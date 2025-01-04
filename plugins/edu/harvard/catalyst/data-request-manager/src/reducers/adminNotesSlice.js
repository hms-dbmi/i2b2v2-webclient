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
                    id: note.id,
                    date: DateTime.fromISO(note.date).toJSDate(),
                    note: note.note
                })
            });
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
        addAdminNote: state => {
            state.isAdding = true;
            state.addStatusInfo = StatusInfo();
        },
        addAdminNoteSuccess: (state, { payload: {note} }) => {
            state.notes.push(
                AdminNote({
                    id: note.id,
                    date: DateTime.fromISO(note.date).toJSDate(),
                    note: note.note
                })
            );
            state.isAdding = false;
            state.addStatusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        addAdminNoteError: (state, { payload: { errorMessage} }) => {
            state.isAdding = false;
            state.addStatusInfo = StatusInfo({
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
    addAdminNote,
    addAdminNoteSuccess,
    addAdminNoteError,
} = adminNotesSlice.actions

export default adminNotesSlice.reducer