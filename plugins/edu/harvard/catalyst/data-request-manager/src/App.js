import './App.css';
import theme from "./theme";
import { Provider } from 'react-redux';
import {ThemeProvider} from "@mui/material/styles";
import { getStore } from "./store/getStore";
import {DataRequestManager} from "./components";
import {CssBaseline} from "@mui/material";

const store = getStore();

const App = () => {
  return (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
            <CssBaseline />
            <DataRequestManager/>
        </Provider>
      </ThemeProvider>
  );
};

export default App;


