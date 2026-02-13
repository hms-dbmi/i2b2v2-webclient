import { createSlice } from '@reduxjs/toolkit'
import {
    PROJECTS,
} from "../actions";
import { defaultState } from '../defaultState';
import { Project, StatusInfo } from "models";
import {DateTime} from "luxon";

export const projectsSlice = createSlice({
    name: PROJECTS,
    initialState: defaultState.projects,
    reducers: {
        getAllProjects: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        getAllProjectsSucceeded: (state, { payload: projectList }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });

            let projects = [];
            projectList.map((project) => {
                let createDate;
                if(project.createDate) {
                    createDate = DateTime.fromISO(project.createDate).toJSDate();
                }

                projects.push(Project({
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    path: project.path,
                    createDate: createDate
                }));
            })
            projects.sort((a, b) => a.name.localeCompare(b.name));

            state.projectList = projects;
        },
        getAllProjectsFailed: (state, { payload: { errorMessage } }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getAllProjects,
    getAllProjectsSucceeded,
    getAllProjectsFailed
} = projectsSlice.actions

export default projectsSlice.reducer