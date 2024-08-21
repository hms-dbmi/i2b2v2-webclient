/* global i2b2 */

import * as React from 'react';
import './App.css';
import theme from "./theme";
import {CreateTable} from "./components";
import { Provider } from 'react-redux';
import {ThemeProvider} from "@mui/material/styles";
import { getStore } from "./app/getStore";

const store = getStore();

export default () => {
    return (
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <CreateTable />
            </Provider>
        </ThemeProvider>
    );
};


// ---------------------------------------------------------------------------------------
window.addEventListener("I2B2_READY", ()=> {
    debugger;
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)
    if (i2b2.model.tableDef === undefined) {
        i2b2.model.tableDef = {};
    } else {
        console.log("load previous table state");
    }

    // Attach drop handler
    i2b2.sdx.AttachType("dropTrgt", "CONCPT");
    i2b2.sdx.setHandlerCustom("dropTrgt", "CONCPT", "DropHandler", ()=>{alert("dropped")});
});
