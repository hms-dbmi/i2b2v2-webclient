import './App.css';
import * as React from 'react';
import BasicTabs from "./tabs";
import ExportDefList from "./definitionListing";
import DataTable from "./DefTable";




function App() {

    return (
    <div className="App">
      <BasicTabs/>
      {/*  <ExportDefList></ExportDefList>*/}
    </div>
  );
}

export default App;
