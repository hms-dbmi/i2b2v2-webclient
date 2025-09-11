# Query Status Subsystem
This is the subsystem that populates the "Query Status" window/tab.
Rewritten in August 2025 by Nick Benik.

### Visualization Modules
This subsystem operates by displaying a query's resultant breakdowns using a variety of "Visualization Modules" which 
are contained within subdirectories of the subsystem's main directory (`/js-i2b2/cells/CRC/QueryStatus`).  Once the 
modules directories are created and the relevant code/css/HTML is present the visualization module is registered with
the subsystem's main engine using the `config.json` file within the `"displayComponents"` dictonary.  The (case-sensitive) 
key for your visualization module with be used throughout the rest of the configuration to reference your plugin.  Within
the dictionary defining your visualization module you must create a configuration object and declare its `"source"` and `"CSS"` 
files to be loaded. If your module is not going to be displayed exclusively (allow a dropdown for the user to select 
other visualization modules to also display the data) then you should define an icon to be displayed in that dropdown using
the `"iconClass""` attribute (within its configuration object) that contains the CSS classnames to be used by the icon 
element in the dropdown. Likewise, you will need to set a name for your visualization
module to be identified by in the dropdown using the `"name"` attribute. If your module is going to be displayed by itself,
then you will probably want to set `"noFrameTemplate": true` in its configuration object.  This setting will also 
remove the title and dropdown menu from the display of the breakdown it displays. If you want your module to be 
displayed on breakdowns that have **not** been explicitly configured via an entry in the `breakdowns.json` file, then you
would add the attribute `"displayForUnregistered": true` to your module's definition object.  If you **do not** want your
module to be shown when a user chooses to print a report of all the breakdowns then you would add `"notInReport": true` to
the definition object. There is also an option to add a class to each of the display DIVs used to host your visualization's
content - add `"class"` to the configuration object.


### Polling
It has its own polling system that operates separately from the "QueryRunner subsystem" which manages simple aspects of
running a new query and loading a previous query.  The polling system operates a separate thread for each "breakdown report"
that was selected to be generated for the query.  Polling will end when the breakdown ("Query Result Instance") enters a
status that is listed in the `"haltPollingOnStatus"` list defined in the `config.json` file.


### Breakdown Display Ordering
You can configure the display ordering of the various visualization modules in a few ways.  The primary way is to add 
the breakdown's code (found in the query result instance's XML) into the `"displayOrder"` array in the main `config.json` file.
The breakdowns not explicitly defined in the `"displayOrder"` array will be displayed according to their order in the
`breakdowns.json` configuration file also in the subsystem's root directory.


### Defining which Visualization Modules are used for each Breakdown
To explicitly map specific visualization modules with specific breakdown results coming back from the server you will
edit the information found in the `breakdowns.json` file in the root directory of the Query Status subsystem.  The file is
organized as a dictionary whose first level key matches the `query_result_type/name` value within the XML results.  
The exception to this is the `"INTERNAL_SUMMARY"` entry which is actually detailed metrics on the current query's run progress.
The order in which the breakdowns are defined within the `breakdowns.json` file is generally the order in which the 
breakdowns will be displayed in the Query Status window (see "Breakdown Display Ordering" above for caveats).

The next level deeper into the configuration level (at a "per breakdown" level) is a configuration object where each 
attribute's name is the unique visualization module code defined within `config.json`'s  `"displayComponents"` configuration object.
At this point a simple non-false value is sufficient for the Query Status subsystem to use the declared module to render the
breakdown's data.  

```json
{
  "PATIENT_SEX_COUNT_XML": {
    "BARS": true,
    "TABLE": true,
    "DOWNLOAD": true
  }
}
```


### Visualization Module Display Ordering
You can configure the order in which the display modules are displayed in the dropdown selection menu.  The visualizations
are ordered according to the integer value assigned to their `"displayOrder"` attributes within their definition object within the 
`"displayComponents"` dictionary in the `config.json` file.  The `"displayOrder"` attribute is ordered incrementally whereas
a module with a value of `10` will be displayed after a module with a value of `5` but will be displayed before a module with 
a value of `100`.  To have a visualization module be selected (and thus initially displayed on run/reload) you will need
to add `"default": true` to your visualization module's definition object and be sure that the setting does not exist in
any other module's definition.


### CSS Classes and Styling
The HTML layout used by the subsystem within the main display window is as follows for each breakdown returned:
1. A "master" DIV with the classes `QueryStatusComponent` and `main` or `frameless` is created.  When there is a 
   dropdown menu to select between modules the class `main` is used, otherwise it is `frameless`.  When a module 
   is `frameless` that also targets this DIV to be used as the display DIV, thus adding "display DIV" classes (described in #3).
2. If the DIV of step #1 is not `frameless` then a header DIV is created as the first child within the master DIV.  It contains the title DIV and the dropdown list of all visualization modules for the breakdown.
3. If the DIV of step #1 is not `frameless` now an organizational DIV having the class `viz-window` is created which contain the "display DIVs" for each visualization module to render its output to.
4. Finally, each "display DIV" has the class `component-instance-viz` followed by 2 dynamically generated classes.
   The first one being `resulttype-` followed by the XML code of the breakdown (ex. `"resulttype-PATIENT_AGE_COUNT_XML"`).
   The second one being `viztype-` followed by the visualization module code (ex. `"viztype-TABLE"`).

Given the previous description, it is preferred that all your CSS rules start with a "viztype" declaration making them
specific to only your visualization module's render DIV (ie. `.viztype-MYPLUGIN .description { ...something }`)


### Special Configuration of Visualization Modules for each Breakdown Result
It is possible to configure visualization modules so that they act differently depending upon which breakdown they
are tasked to display.  This configuration is done within the `breakdowns.json` file.  See "Defining which Visualization Modules are used for each Breakdown" for additional information. 

Basically, the `breakdowns.json` file allow you to define which visualizations are displayed for each breakdown result 
(by setting a non-false value).  In situations where the defined value is non-false and not equal to `true` (ie, an object),
its entire value is passed onwards into the constructor code of the module during its instantiation for this particular breakdown result.
Since each visualization module can have its own specific configuration options, it is suggested that you visit the `README.md` file
that may exist within the visualization module's directory for the module you are interested in configuring. All visualizations
have the option `"forceInitialDisplay"` which, if set to *true* will automatically select that visualization to be displayed
from the dropdown visualization selection menu upon first display of all the breakdowns.  The `"forceInitialDisplay"` 
configuration option is processed by the Query Status subsystem and not each individual visualization module. 

**breakdowns.json**
```json
{
  "PATIENT_AGE_COUNT_XML": {
    "BARS": true,
    "PIECHART": {
      "hideEntries": [
        "(children) < 18 years old",
        "(adults) >= 18 years old",
        ">= 90 years old",
        ">= 85 years old",
        ">= 65 years old"
      ],
      "hideZeros": true
    },
    "TABLE": {
       "forceInitialDisplay": true
    },
    "DOWNLOAD": true
  }, ...
}
```
