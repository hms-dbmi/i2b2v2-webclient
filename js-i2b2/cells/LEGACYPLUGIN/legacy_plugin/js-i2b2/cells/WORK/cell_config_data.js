// this file contains a list of all files that need to be loaded dynamically for this i2b2 Cell
// every file in this list will be loaded after the cell's Init function is called
{
	files: [
		"WORK_sdx_WRK.js",
		"WORK_sdx_XML.js",
		"i2b2_msgs.js"
	],
	config: {
		// additional configuration variables that are set by the system
		name: "Workplace Cell",
		category: ["core","cell"]
	}
}