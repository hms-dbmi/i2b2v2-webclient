import {SaveTable, TableDefinition, TableListing, MakeRequestDetails} from "./models";

export const defaultState = {
    isI2b2LibLoaded: false,
    tableDef: TableDefinition(),
    saveTable: SaveTable(),
    tableListing: TableListing(),
    makeRequestDetails: MakeRequestDetails()
};