import { Projects, UserSessions } from "models";

export const defaultState = {
    isI2b2LibLoaded: false,
    projects: Projects(),
    userSessions: UserSessions()
};