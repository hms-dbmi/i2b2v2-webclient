import React from "react";
import { Provider } from "react-redux";

import { getStore } from "getStore";
import { Header } from "components";

const store = getStore();

export default () => {
    return (
        <Provider store={store}>
            <Header />
            <div />
        </Provider>
    );
};