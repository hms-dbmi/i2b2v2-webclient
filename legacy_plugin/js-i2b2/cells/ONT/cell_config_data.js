// this file contains a list of all files that need to be loaded dynamically for this i2b2 Cell
// every file in this list will be loaded after the cell's Init function is called
{
	files: [
		"ONT_sdx_CONCPT.js",
		"i2b2_msgs.js"
	],
	// ONLY USE 1 STYLE SHEET: http://support.microsoft.com/kb/262161
	config: {
		// additional configuration variables that are set by the system
		name: "Ontology",
		description: "The Ontology cell manages all concepts used to describe the data processed by all the Cells within i2b2 Hive.",
		category: ["core","cell"],
		paramTranslation: [
			{xmlName:'OntMax', thinClientName:'max', defaultValue:500},
			{xmlName:'OntHiddens', thinClientName:'hiddens', defaultValue:false},
			{xmlName:'OntSynonyms', thinClientName:'synonyms', defaultValue:true},
			{xmlName:'OntReduceResults', thinClientName:'reduce', defaultValue:true},
			{xmlName:'OntHierarchy', thinClientName:'hierarchy', defaultValue:true}
		]
	}
}
