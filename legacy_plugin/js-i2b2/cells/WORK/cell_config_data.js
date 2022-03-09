// this file contains a list of all files that need to be loaded dynamically for this i2b2 Cell
// every file in this list will be loaded after the cell's Init function is called
{
	files: [
		"WORK_sdx_WRK.js",
		"WORK_sdx_XML.js",
		"i2b2_msgs.js"
	],
	css: ["main_list.css"],  // ONLY USE 1 STYLE SHEET: http://support.microsoft.com/kb/262161
	config: {
		// additional configuration variables that are set by the system
		name: "Workplace Cell",
		category: ["core","cell"]
	}
}