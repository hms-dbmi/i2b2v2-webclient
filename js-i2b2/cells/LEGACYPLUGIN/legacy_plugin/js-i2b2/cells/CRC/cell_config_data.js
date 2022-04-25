// this file contains a list of all files that need to be loaded dynamically for this i2b2 Cell
// every file in this list will be loaded after the cell's Init function is called
{
	files: [
//		"CRC_ajax.js",
		"CRC_sdx_QM.js",
		"CRC_sdx_QI.js",
		"CRC_sdx_PRC.js",
		"CRC_sdx_PRS.js",		
		"CRC_sdx_ENS.js",		
		"CRC_sdx_PR.js",
		"CRC_sdx_QDEF.js",
		"CRC_sdx_QGDEF.js",
		"CRC_sdx_WRKF.js",
		"i2b2_msgs.js",
	],
	files_updated: [
		{origName: "i2b2_msgs.js", newName: "i2b2_msgs-Ver1_3.js", versionLevel: 1.3},
		{origName: "CRC_sdx_QI.js", newName: "CRC_sdx_QI-Ver1_3.js", versionLevel: 1.3}
	],
	config: {
		// additional configuration variables that are set by the system
		name: "Data Repository",
		description: "The Data Repository cell stores all information that a user saves within the i2b2 Hive.",
		category: ["core","cell"],
		paramTranslation: [
			{thinClientName:'sortBy', defaultValue:'DATE'},
			{thinClientName:'sortOrder', defaultValue:'DESC'},
			{thinClientName:'maxQueriesDisp', defaultValue:50},
			{thinClientName:'maxChildren', defaultValue:200},
			{thinClientName:'queryTimeout', defaultValue:180}
		]
	}
}
