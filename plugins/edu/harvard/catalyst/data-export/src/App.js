/* global i2b2 */

import * as React from 'react';
import './App.css';
import theme from "./theme";
import {DataExport} from "./components";
import { Provider } from 'react-redux';
import {ThemeProvider} from "@mui/material/styles";
import { getStore } from "./store/getStore";

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
        let s = password.indexOf('SessionKey:');
        let e = password.lastIndexOf('<');
        i2b2.model.session = password.substr(s+11,e-s-11);
        i2b2.state.save();
    });

    setTimeout(()=>{
        const testCredentials = new Request("test_credentials.json");
        fetch(testCredentials)
            .then((response) => response.json())
            .then((data) => {
                i2b2.model.user = data.username;
                i2b2.model.project = data.project;
                i2b2.model.session = data.password;
            })
            .catch();
    }, 200);
});
