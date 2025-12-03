import React from "react";
import { Provider } from "react-redux";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import {ThemeProvider} from "@mui/material/styles";
import { getStore } from "./store/getStore";
import { MonitorDashboard } from "components";

const store = getStore();

export default () => {
    return (
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <CssBaseline />
                <MonitorDashboard />
            </Provider>
        </ThemeProvider>
    );
};
