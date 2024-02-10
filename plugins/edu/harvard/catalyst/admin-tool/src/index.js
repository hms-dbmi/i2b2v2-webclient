import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import i2b2Loader from './js/i2b2-loader.js';

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./App.scss";

const el = document.getElementById("app");

ReactDOM.render(<App />, el);
