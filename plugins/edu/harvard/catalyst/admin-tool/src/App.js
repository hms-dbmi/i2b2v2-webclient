import React from "react";
import { Provider } from "react-redux";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import {ThemeProvider} from "@mui/material/styles";

import { getStore } from "getStore";
import { Header } from "components";

const store = getStore();

export default () => {
    return (
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <CssBaseline />
                <Header />
            </Provider>
        </ThemeProvider>
    );
};
