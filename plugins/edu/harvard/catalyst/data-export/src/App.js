/* global i2b2 */

import * as React from 'react';
import './App.css';
import theme from "./theme";
import {DataExport} from "./components";
import { Provider } from 'react-redux';
import {ThemeProvider} from "@mui/material/styles";
import { getStore } from "./store/getStore";
import sdxDropHandler from "./dropHandler"

const store = getStore();

export default () => {
    return (
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <DataExport />
            </Provider>
        </ThemeProvider>
    );
};


// ---------------------------------------------------------------------------------------
window.addEventListener("I2B2_READY", ()=> {
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)
    if (i2b2.model.tableDef === undefined) {
        i2b2.model.tableDef = {};
    } else {
        console.log("load previous table state");
    }
    // attach the drop handler after initialization
    i2b2.sdx.AttachType("dropTrgt", "CONCPT");
    i2b2.sdx.setHandlerCustom("dropTrgt", "CONCPT", "DropHandler", sdxDropHandler);

    // get the authentication info and save it to our model
    i2b2.authorizedTunnel.variable["i2b2.PM.model.login_username"].then((username) => {
        i2b2.model.user = username;
        i2b2.state.save();
    });
    i2b2.authorizedTunnel.variable["i2b2.PM.model.login_project"].then((project) => {
        i2b2.model.project = project;
        i2b2.state.save();
    });
    i2b2.authorizedTunnel.variable["i2b2.PM.model.login_password"].then((password) => {
        i2b2.model.session = password;
        i2b2.state.save();
    });
});
