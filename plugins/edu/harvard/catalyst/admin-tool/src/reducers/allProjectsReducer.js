import {
    DELETE_PROJECT_ACTION,
    GET_ALL_PROJECTS_ACTION,
} from "actions";
import { defaultState } from "defaultState";
import {AllProjects, DeletedProject, Project} from "models";

export const allProjectsReducer = (state = defaultState.allProjects, action) => {
    switch (action.type) {
        case  GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS: {
            return AllProjects({
                ...state,
                isFetching: true,
            });
        }
        case  GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS_SUCCEEDED: {
            const  allProjects  = action.payload;

            //Extract each project data into Project model and return an array of Projects
            let projects = [];
            allProjects.map((project) => {
                projects.push(Project({
                    id: project.id,
                    internalId: project.internalId,
                    name: project.name,
                    description: project.description,
                    wiki: project.wiki,
                    path: project.path
                }));
            })

            return AllProjects({
                ...state,
                projects,
                isFetching: false,
            });
        }
        case  GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS_FAILED: {
            //TODO: add error handling somewhere
            return AllProjects({
                ...state,
                isFetching: false,
            });
        }

        case  DELETE_PROJECT_ACTION.DELETE_PROJECT_SUCCEEDED: {
            const  { project }  = action.payload;

            const filteredProject = state.projects.filter((proj) => proj.id !== project.id);

            return AllProjects({
                ...state,
                projects: filteredProject
            });
        }
        default: {
            return state;
        }
    }
};
