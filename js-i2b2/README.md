3
 # js-i2b2 Web Client Framework

This directory contains the main browser-side i2b2 web client framework. It is the
layer that bootstraps the global `i2b2` namespace, loads cell modules, renders the
GoldenLayout-based user interface, sends XML messages to i2b2 server cells, and
implements shared infrastructure such as SDX drag-and-drop, plugin messaging, and
message logging.

This documentation was written from a review of the JavaScript source, JSON
configuration files, Handlebars/HTML templates, CSS assets, and inline comments in
`js-i2b2` and its subdirectories.

## Table of Contents

- [Relationship to the Larger Web Client](#relationship-to-the-larger-web-client)
- [High-Level Architecture](#high-level-architecture)
- [Runtime Lifecycle and Events](#runtime-lifecycle-and-events)
- [Root Files and Configuration](#root-files-and-configuration)
- [Cell Configuration Pattern](#cell-configuration-pattern)
- [CRC Cell: Data Repository and Query Workflow](#crc-cell-data-repository-and-query-workflow)
- [ONT Cell: Ontology Browser and Term Search](#ont-cell-ontology-browser-and-term-search)
- [PLUGIN Cell: Plugin Manager and Plugin Bridge](#plugin-cell-plugin-manager-and-plugin-bridge)
- [PM Cell: Authentication, Project Selection, and Session State](#pm-cell-authentication-project-selection-and-session-state)
- [WORK Cell: Workplace Tree and Saved Objects](#work-cell-workplace-tree-and-saved-objects)
- [Hive Infrastructure](#hive-infrastructure)
- [Template and Asset Conventions](#template-and-asset-conventions)
- [Configuration Reference](#configuration-reference)
- [Significant Inline Comments and Operational Notes](#significant-inline-comments-and-operational-notes)
- [Adding or Modifying Functionality](#adding-or-modifying-functionality)

## Relationship to the Larger Web Client

`js-i2b2` is loaded by the root `index.html` after third-party libraries from
`js-ext` are loaded. Those external libraries provide the UI and utility runtime
used by this framework, including jQuery, GoldenLayout, Bootstrap, Bootstrap
Treeview, Bootstrap context menu, Handlebars, Gijgo date picker, Luxon, Leaflet,
and D3.

The larger application provides several important integration points outside this
directory:

- `index.html` loads `js-i2b2/i2b2_loader.js` and `js-i2b2/i2b2_ui_config.js`,
  then calls `i2b2.Init()` on document ready.
- `i2b2_config_domains.json` defines deployment/domain information used during
  login and Project Management discovery.
- `i2b2_config_cells.json` defines the available i2b2 cells and service endpoints.
- `assets/main_display.html` provides the post-login page shell into which the
  GoldenLayout columns are inserted.
- `assets/css` provides global visual theme variables used by framework and logger
  styles.
- `plugins/` contains separately packaged plugin applications. The PLUGIN cell in
  `js-i2b2` discovers and hosts those plugin UIs, while plugin-side support
  libraries under `js-i2b2/cells/PLUGIN/libs` expose a limited API back into the
  main web client.

## High-Level Architecture

The framework uses a classic i2b2 “hive and cells” architecture:

1. **Bootstrap:** `i2b2_loader.js` creates the global `i2b2` namespace, loads root
   deployment configuration, loads hive infrastructure files, creates cell objects,
   and starts the Project Management cell.
2. **Hive services:** files under `hive/` provide shared runtime services: base
   cell loading, helper functions, GoldenLayout integration, SDX routing,
   AJAX/XML communication, message sniffing, and global error display.
3. **Cells:** each major functional area under `cells/` is a self-contained i2b2
   cell with its own `cell_config_data.json`, JavaScript files, CSS, templates,
   message definitions, and SDX type handlers.
4. **Layout registration:** cell views register GoldenLayout component handlers
   after their cell JavaScript has loaded. The layout manager wires those handlers
   to component names in `i2b2_tabs.json`.
5. **Server communication:** cells define XML request templates in their
   `i2b2_msgs.js` files and register named calls through the hive communicator
   factory. Callers invoke `i2b2.<CELL>.ajax.<function>()`.
6. **Data exchange:** cells expose drag-and-drop-compatible data through SDX
   packages. SDX type controllers define how a concept, query, patient set,
   workplace item, or XML object is rendered, dragged, dropped, and expanded.
7. **Plugin hosting:** the PLUGIN cell hosts plugins in iframes and communicates
   with them through `window.postMessage` and plugin-side support libraries.

At runtime, most cell namespaces have the same high-level shape:

- `i2b2.<CELL>.cfg` - loaded JSON configuration and cell parameters.
- `i2b2.<CELL>.model` - in-memory state and data returned from services.
- `i2b2.<CELL>.view` - view controllers, layout containers, templates, and DOM
  rendering logic.
- `i2b2.<CELL>.ctrlr` - cell-specific controller logic.
- `i2b2.<CELL>.ajax` - generated XML/AJAX communication functions.
- `i2b2.<CELL>.sdx` - SDX helper functions and type-specific behavior.

## Runtime Lifecycle and Events

The runtime is coordinated through jQuery callback lists created in
`i2b2_loader.js`:

- `i2b2.events.afterFrameworkInit` fires after root and hive files are loaded.
- `i2b2.events.afterHiveInit` is a once/memory signal used by hive and layout
  initialization code as the “framework is ready” event.
- `i2b2.events.afterCellInit` fires once for each cell after that cell's configured
  JavaScript files have loaded.
- `i2b2.events.afterAllCellsLoaded` fires when PM has initialized all active cells
  for the selected project.
- `i2b2.events.afterLogin` fires after all active cells are ready and the user can
  enter the main application UI.

Important lifecycle details:

- `i2b2_BaseCell` implements a small load-state finite state machine. The comments
  define load states from `-1` fatal failure through `6` fully loaded.
- Each cell first loads `cell_config_data.json`. Only after the JSON is available
  does `Init()` inject configured CSS, load JavaScript files, preload images, and
  fire `afterCellInit`.
- The PM cell controls authentication, project selection, cell endpoint discovery,
  and load monitoring. It fires `afterAllCellsLoaded` and then `afterLogin`.
- `i2b2_layout.js` listens to `afterLogin`, loads the main display shell, creates
  GoldenLayout instances, registers all cell view callbacks, and renders the tab
  arrangement from `i2b2_tabs.json`.

## Root Files and Configuration

### `i2b2_loader.js`

Primary framework bootstrap file.

Responsibilities:

- Defines `window.i2b2` and core namespaces such as `i2b2.sdx`, `i2b2.events`,
  `i2b2.hive`, `i2b2.h`, and `i2b2.hive.model`.
- Defines the framework version (`1.8.3` in the reviewed source).
- Loads deployment/domain/cell configuration and hive configuration.
- Loads hive JavaScript files listed in `hive/hive_config_data.json`.
- Creates `i2b2_BaseCell` instances for configured cells.
- Starts PM first because PM performs login and later initializes project-enabled
  cells.
- Creates the global lifecycle events listed above.

Notable comment: the `afterFrameworkInit` handler uses a polling loader to avoid a
race condition where the PM cell could start before `hive_globals.js` has defined
`i2b2_BaseCell` and `i2b2.h`.

### `i2b2_ui_config.js`

Defines configurable UI behavior under `i2b2.UI.cfg`.

Options:

- `loginDefaultUsername` - default username text for the login form.
- `loginDefaultPassword` - default password text for the login form.
- `loginDefaultMessage` - explanatory text shown on the login page.
- `obfuscatedDisplayNumber` - number displayed after plus/minus for obfuscated
  counts; the actual obfuscation rules are controlled server-side by CRC.
- `useFloorThreshold` - when true, low result counts are shown as a threshold
  phrase rather than the exact low number.
- `floorThresholdNumber` - numeric threshold for low-count display.
- `floorThresholdText` - prefix used when displaying thresholded low counts.
- `useExpandedLabFlags` - enables expanded lab flag behavior where supported.
- `footer.active` - enables or disables the footer bar.
- `footer.height` - CSS height for the footer area.
- `footer.file` - HTML fragment loaded into the footer bar when enabled.

### `i2b2_tabs.json`

Defines the default GoldenLayout tab arrangement. The layout manager expands
entries with missing defaults, treats entries with `componentName` as components,
and allows nested `stack`/`column`/`row` structures.

The default layout places:

- Left column:
  - `Terms` (`i2b2.ONT.view.nav`)
  - `Term Info` (`i2b2.ONT.view.info`)
  - `Workplace` (`i2b2.WORK.view.main`)
  - `Previous Queries` (`i2b2.CRC.view.history`)
- Right column:
  - `Find Patients` (`i2b2.CRC.view.QT`)
  - `Tools` (`i2b2.PLUGIN.view.list`)
  - `Query Status` (`i2b2.CRC.view.QueryMgr`)

Common entry options:

- `type` - GoldenLayout type such as `component` or `stack`. If omitted for a
  component, `i2b2_layout.js` supplies `component`.
- `title` - tab title.
- `componentName` - key registered by a cell with `i2b2.layout.registerWindowHandler()`.
- `content` - nested layout entries.
- `height` / `width` - GoldenLayout sizing hints.
- `settings` and `dimensions` - column-level GoldenLayout overrides.
- `isClosable` - defaults to false when omitted for component entries.

## Cell Configuration Pattern

Every cell has a `cell_config_data.json` file loaded by `i2b2_BaseCell` before the
cell is initialized.

Common keys:

- `files` - JavaScript files loaded in order after configuration is available.
- `css` - stylesheet paths injected into the document head. Paths are resolved
  relative to the cell asset/config base.
- `preload` - image assets preloaded by adding `<link rel="preload" as="image">`.
- `config.name` - human-readable cell name.
- `config.description` - cell purpose.
- `config.icons` - optional icon metadata.
- `config.category` - classification such as `core`, `cell`, or `plugins`.
- `config.paramTranslation` - PM/project parameter mapping from XML names to
  thin-client names and default values.

`paramTranslation` entries can include:

- `xmlName` - project parameter name supplied by PM.
- `thinClientName` - local property name written to `i2b2.<CELL>.cfg.params`.
- `defaultValue` - fallback value when PM does not provide the parameter.

When PM provides string values `true` or `false`, the base cell loader converts
them to booleans.

## CRC Cell: Data Repository and Query Workflow

Path: `cells/CRC`

The CRC cell is the largest cell in this tree. It handles query construction,
query submission, previous query history, query status polling, result retrieval,
result visualization, query reports, patient/result SDX types, and lab value
constraints.

### Configuration

`cells/CRC/cell_config_data.json` loads:

- SDX controllers: `CRC_sdx_QM.js`, `CRC_sdx_QI.js`, `CRC_sdx_PRC.js`,
  `CRC_sdx_PRS.js`, `CRC_sdx_ENS.js`, `CRC_sdx_PR.js`, `CRC_sdx_QDEF.js`, and
  `CRC_sdx_QGDEF.js`.
- Query history view/controller: `CRC_view_History.js`, `CRC_ctrlr_History.js`.
- Query tool view/controller: `CRC_ctrlr_QryTool.js`, `CRC_view_QryTool.js`.
- Query manager view/controller: `CRC_ctrlr_QryMgr.js`, `CRC_view_QryMgr.js`.
- AJAX message definitions: `i2b2_msgs.js`.
- Lab value and modifier views: `CRC_ctrlr_LabValues.js` and files under
  `ModLabValues/`.
- Search UI: `CRC_view_search.js`.
- Result visualization/report engines: `QueryStatus/QueryStatusEngine.js` and
  `QueryReport/QueryReport.js`.

Default parameters:

- `sortBy` - defaults to `DATE` for previous query sorting.
- `sortOrder` - defaults to `DESC`.
- `maxQueriesDisp` - defaults to `25` previous queries.
- `maxChildren` - defaults to `200` returned child records.
- `queryTimeout` - defaults to `180` seconds.

### Query Tool

The query tool (`CRC_view_QryTool.js` and `CRC_ctrlr_QryTool.js`) renders the
“Find Patients” tab. It accepts SDX drops from ONT, WORK, and CRC history objects,
organizes them into query panels, manages include/exclude semantics, timing
constraints, and lab/modifier constraints, and builds query definitions for CRC
server calls.

The query tool interacts heavily with:

- ONT concept SDX packages (`CONCPT`) dragged from the Terms tree.
- WORK workplace SDX packages (`WRK`) that may wrap query definitions or concepts.
- CRC query master/query instance SDX packages from previous queries.
- PM project parameters that determine timeouts and query options.

### Query History

`CRC_view_History.js` and `CRC_ctrlr_History.js` render and control the Previous
Queries panel. They call CRC AJAX functions to retrieve the user's query master
records, show query status metadata, and expose previous query objects as SDX
packages that can be dragged into the query tool or workplace.

### Query Manager and Query Status

`CRC_view_QryMgr.js` and `CRC_ctrlr_QryMgr.js` own the Query Status area. Query
status display is delegated to `QueryStatus/QueryStatusEngine.js`, which loads the
visualization configuration, determines which result instances are available, polls
query status until terminal states, and renders result display components.

`QueryStatus/config.json` defines available display components:

- `SUMMARY` - summary component; always shown, not included in reports.
- `COUNT` - patient count component; always shown.
- `BARS` - bar chart; default display for many breakdowns.
- `PIECHART` - pie chart.
- `TABLE` - table summary.
- `TABLEBARCHART` - combined table/bar display; not included in reports.
- `DATAREQUESTSUPER` - super-module that captures result names matching
  `/^RPDO_/` or `/_REQUEST$/`.
- `DOWNLOAD` - CSV download component; not included in reports.
- `MULTIZIPCODEMAP` - Leaflet-based ZIP code map view.
- `PATHOGENTIMELINE` - pathogen timeline visualization.
- `NIHENROLLTABLE` - enrollment form table.
- `NIHENROLLCSV` - enrollment form CSV download; not included in reports.

Display component options include:

- `name` - UI label for display selectors.
- `source` - JavaScript module path relative to `QueryStatus/`.
- `CSS` - optional stylesheet loaded for the module.
- `iconClass` - Bootstrap icon class used in display controls.
- `displayOrder` - sort order for display selection.
- `default` - marks the default visualization.
- `alwaysShow` - forces display even if not selected by a breakdown mapping.
- `displayForUnregistered` - allows display for result types not explicitly mapped.
- `noFrameTemplate` - renders without the standard result frame.
- `notInReport` - excludes the component from QueryReport output.
- `showQueryButton` - controls whether a query/action button appears.
- `class` - CSS class applied to the component container.
- `superModule.capture` - list of regex patterns used to capture related result
  types for a super-module.

Global query status options:

- `displayOrder` - prioritized result type ordering; includes literal names and
  regex entries such as `/^RPDO_/`.
- `haltPollingOnStatus` - statuses that stop polling: `COMPLETED`, `PROCESSING`,
  `FINISHED`, `ERROR`, `INCOMPLETE`, and `TIMEOUT`.
- `hideVisualizationsOn` - statuses, currently `ERROR`, that suppress result
  visualizations.
- `realtimePolling` - toggles real-time polling behavior.

`QueryStatus/breakdowns.json` maps CRC result instance names to display components.
Values can be `true`, `false`, or an options object. Examples:

- `PATIENT_COUNT_XML` maps to `COUNT`.
- demographic breakdowns such as `PATIENT_GENDER_COUNT_XML`,
  `PATIENT_RACE_COUNT_XML`, and `PATIENT_VITALSTATUS_COUNT_XML` map to bar, table,
  and CSV displays.
- `PATIENT_AGE_COUNT_XML` adds a pie chart and supplies `maxLabelLength` to the bar
  chart.
- ZIP count results map to `MULTIZIPCODEMAP` with map, hover, click, legend,
  tile, color, and style options.
- pathogen timeline and NIH enrollment result types map to their specialized
  components.
- regex keys such as `/^RPDO_/` and `/_REQUEST$/` feed the data request
  super-module.

### Query Status Visualization Subdirectories

The `QueryStatus/` subdirectories each implement a display component. Most contain
JavaScript, CSS, and sometimes HTML/Handlebars templates.

- `Summary/` renders query summary metadata.
- `Count/` renders obfuscated or thresholded patient count output using UI config.
- `BarGraph/`, `PieChart/`, `Table/`, and `TableBarChart/` render common result
  breakdown visualizations.
- `Download/` converts result data into CSV downloads.
- `DataRequestSuper/` groups and handles data request-oriented result types.
- `MultiZipcodeMap/` renders ZIP results using Leaflet and GeoJSON.
- `PathogenTimeline/` renders timeline-style output.
- `NihEnrollTable/` and `NihEnrollCsv/` render/download NIH enrollment outputs.

### MultiZipcodeMap Static Data

`QueryStatus/MultiZipcodeMap/GeoJSON` contains configuration and static geographic
data for map rendering. Per the documentation scope, large static GeoJSON storage
files are documented by purpose and structure only:

- `load_list.json` lists geographic data files loaded by the map component.
- `zoom_list.json` defines which data levels are used at different zoom levels.
- `Storage/` contains GeoJSON feature data used to draw ZIP/geographic regions.
  Individual storage files are large static assets and are not enumerated here.

### Query Report

`QueryReport/QueryReport.js` builds report-oriented displays for completed query
results. It uses `QueryReport/ReportConfig.json` to decide which result display
components are included in reports.

`ReportConfig.json` is similar to `breakdowns.json` but excludes interactive-only
views such as CSV download and many request controls. It includes report mappings
for patient counts, SHRINE site counts, demographics, length-of-stay, top
medications/diagnoses, NIH enrollment, pathogen timeline, and selected regex-based
data request result names.

### Lab Value and Modifier Views

`CRC_ctrlr_LabValues.js` coordinates lab value constraint UI. `ModLabValues/`
contains modular views for different constraint types:

- `CRC_view_BASIC.js` / `.css` - basic lab value constraint UI.
- `CRC_view_GENOTYPE_RSID.js` - genotype by RSID.
- `CRC_view_GENOTYPE_GENE.js` - genotype by gene.
- `CRC_view_NUMBER_EXAMPLE.js` / `.css` - numeric example module.

The `ModLabValues/README.md` in that directory documents the intent of the
modular lab value view pattern.

### CRC Templates and XML Messages

CRC uses templates for both UI fragments and XML messages. UI templates under
`templates/` and component-specific HTML files are loaded and compiled as needed.
`i2b2_msgs.js` registers CRC XML request templates with the hive communicator
factory. Those message templates are populated by the communicator before POSTing
to the CRC service or proxy.

## ONT Cell: Ontology Browser and Term Search

Path: `cells/ONT`

The ONT cell renders the Terms tree, term information panel, ontology search UI,
and SDX handling for ontology concepts and modifiers.

### Configuration

`cells/ONT/cell_config_data.json` loads:

- `ONT_ctrlr_general.js` - shared ontology controller behavior.
- `ONT_ctrlr_Search.js` - search controller behavior.
- `ONT_view_Nav.js` - Terms navigation tree.
- `ONT_view_Info.js` - selected term information display.
- `ONT_view_Search.js` - search UI.
- `ONT_sdx_CONCPT.js` - SDX type controller for ontology concepts.
- `i2b2_msgs.js` - ONT XML/AJAX message definitions.

Default parameters:

- `max` from `Terms Options: Max Display`, default `200`.
- `hiddens` from `Terms Options: Show Hidden Terms`, default `false`.
- `synonyms` from `Terms Options: Show Synonymous Terms`, default `false`.
- `patientCounts` from `Terms Options: Enable Patient Counts`, default `true`.
- `showShortTooltips` from `Terms Options: Use Short Tooltips`, default `false`.
- `showConceptCode` from `Terms Options: Show Concept Codes in Tooltips`, default
  `false`.
- `modifiers` from `Terms Options: Disable Modifiers`, default `false`.
- `fullSearch` from `Terms Options: Disable Optimized Search`, default `false`.

### Navigation and Search

The navigation view registers a GoldenLayout component named `i2b2.ONT.view.nav`.
It retrieves ontology roots and children using ONT AJAX calls, renders the results
as a Bootstrap Treeview tree, and exposes concept nodes as draggable SDX packages.

The search view/controller provides term search and uses ONT service calls to
retrieve matching concepts. Search results use the same SDX concept package shape
so they can be dragged into query panels or workplace folders.

### Term Info

The term information view registers `i2b2.ONT.view.info`. It listens for selected
terms from the navigation/search workflow and renders metadata about concepts,
modifiers, and ontology items.

### SDX Type: `CONCPT`

`ONT_sdx_CONCPT.js` defines how ontology concept packages are encapsulated,
rendered, dragged, and expanded. Rendered concept packages include display title,
icon, CSS classes, descriptive text, and Treeview state used by SDX consumers.

## PLUGIN Cell: Plugin Manager and Plugin Bridge

Path: `cells/PLUGIN`

The PLUGIN cell discovers, lists, launches, hosts, and communicates with external
plugins. It is the bridge between the main i2b2 web client and plugin applications
under the repository's `plugins/` tree.

### Configuration

`cells/PLUGIN/cell_config_data.json` loads:

- `PLUGIN_ctrlr_general.js` - plugin registry, message router, and bridge logic.
- `PLUGIN_instance_view.js` - individual plugin iframe/display instances.
- `PLUGIN_list_view.js` - Tools tab listing available plugins.
- `PLUGIN_styles.css` - plugin list/instance styling.

Configuration options:

- `config.name` - `Plugins Manager`.
- `config.description` - manager component description.
- `config.defaultListIcons.size16x16` and `.size32x32` - default icons for plugin
  list entries.
- `config.category` - `core`, `plugins`.
- `config.paramTranslation` - empty by default.

### Tools List and Plugin Instances

`PLUGIN_list_view.js` registers `i2b2.PLUGIN.view.list`, which corresponds to the
default `Tools` tab in `i2b2_tabs.json`. The list presents available plugins and
launches selected tools.

`PLUGIN_instance_view.js` creates the actual plugin display instances, usually as
iframes. The code accounts for GoldenLayout moving iframe DOM nodes by preserving
plugin state through the plugin bridge/state infrastructure.

### `window.postMessage` Bridge

`PLUGIN_ctrlr_general.js` implements the main message handler for plugin
communication. It validates message origins, routes requests from plugin frames,
and exposes controlled operations from the main i2b2 namespace.

The reviewed comments and code describe a controlled “Authorized Tunnel” pattern:

- Plugins send structured messages to the parent frame.
- The PLUGIN cell validates the origin and requested operation.
- Only registered/authorized functions and variables are exposed.
- Responses are posted back to the requesting plugin frame.

This prevents plugins from directly reaching arbitrary parent-window internals.

### Plugin Support Libraries

`cells/PLUGIN/libs` contains browser-side libraries loaded inside plugin frames.
They provide a plugin-local `i2b2` facade and communicate with the parent via
`postMessage`.

Important libraries include:

- `i2b2-ajax.js` - creates `i2b2.ajax.<CELL>.<FUNCTION>()` wrappers from the AJAX
  tree sent by the parent after all cells load.
- `i2b2-sdx.js` - plugin-side SDX helpers and data exchange support.
- `i2b2-state.js` - plugin state preservation support.
- Additional support files for initialization, messaging constants, or other
  plugin-facing APIs.

`PLUGIN_ctrlr_general.js` listens to `afterAllCellsLoaded`, crawls the loaded cell
namespaces, extracts public AJAX functions and SDX capabilities, and sends that
capability tree to plugin-side libraries.

## PM Cell: Authentication, Project Selection, and Session State

Path: `cells/PM`

The Project Management cell is responsible for authentication, project selection,
project/user metadata, project-specific cell URLs, authorization roles, session
timeout handling, and the transition from login screen to the main application.

### Configuration

`cells/PM/cell_config_data.json` loads:

- `PM_misc.js` - helper/miscellaneous PM logic.
- `PM_view.js` - login and project selection UI.
- `PM_ctrlr.js` - login, PM service calls, project loading, and cell loading.
- `i2b2_msgs.js` - PM XML/AJAX message definitions.
- `PM.css` - PM UI styling.

Authorization roles listed in configuration:

- `MANAGER` - Hive Manager.
- `EDITOR` - Hive Editor.
- `USER` - Hive User.
- `DATA_PROT`, `DATA_DEID`, `DATA_LDS`, `DATA_AGG`, `DATA_OBFSC` - data protection
  roles used to determine user data access level.

### Login Flow

The PM view listens for the PM cell `afterCellInit` event and displays the login
dialog. It also loads/compiles the project selection template from
`templates/ProjectSelection.html`.

The controller authenticates with the PM service, retrieves available projects,
loads project-specific cell information and global parameters, initializes active
cells, monitors loading completion, and fires `afterAllCellsLoaded` followed by
`afterLogin`.

### Session and Idle Timer

PM model state includes login credentials/session information, selected project,
project metadata, and an idle timer. The hive communicator resets the PM idle
timer on successful AJAX responses so normal server activity keeps the session
alive.

## WORK Cell: Workplace Tree and Saved Objects

Path: `cells/WORK`

The WORK cell implements the Workplace tab. It allows users to browse, create,
rename, delete, and organize saved workplace folders and objects such as saved
queries or XML-backed items.

### Configuration

`cells/WORK/cell_config_data.json` loads:

- `WORK_ctrlr_general.js` - controller logic for workplace operations.
- `WORK_view.js` - Workplace GoldenLayout view and tree UI.
- `WORK_sdx_WRK.js` - SDX type controller for workplace items.
- `WORK_sdx_XML.js` - SDX type controller for XML workplace payloads.
- `i2b2_msgs.js` - WORK XML/AJAX message definitions.

Preloaded assets include root, folder, and XML icons. CSS includes SDX type styles,
context menu dialog styles, and the main workplace view stylesheet.

### Workplace View

`WORK_view.js` registers `i2b2.WORK.view.main`, rendered by default under the
left-column `Workplace` tab. It uses a tree UI, context menus, and SDX drop targets
to support folder browsing and object management.

### SDX Types: `WRK` and `XML`

`WORK_sdx_WRK.js` encapsulates workplace records. A `WRK` package can also wrap an
underlying SDX package, allowing workplace items to behave like their contained
concept/query/XML object during drag-and-drop.

`WORK_sdx_XML.js` handles generic XML payloads stored in workplace folders.

The SDX master router intentionally fires WORK bindings first during drops so that
workplace wrapper packages can unwrap or translate to the underlying package before
other handlers execute.

## Hive Infrastructure

Path: `hive`

The hive directory contains framework infrastructure shared by all cells.

### `hive_config_data.json`

Lists hive files loaded during framework bootstrap:

- `hive_globals.js`
- `hive_helpers.js`
- `i2b2_layout.js`
- `hive_SDX.js`
- `hive_msg_sniffer.js`
- `error_msg_display/hive_error_msg_display.js`
- `i2b2_cell_communicator.js`

### `hive_globals.js`

Defines base classes and shared Handlebars helpers.

Key pieces:

- `i2b2Base_cellViewController` - base view-controller structure with default
  `showOptions`, `saveOptions`, and `cancelOptions` behavior.
- `i2b2_scopedCallback` - legacy callback wrapper that preserves function scope.
- `i2b2_BaseCell` - lazy-loading base class for all cells.
- Handlebars `select` helper - marks selected `<option>` entries.
- Handlebars `eachProperty` helper - iterates object properties with index values.

Important comments:

- The base cell loader documents load-state values from fatal failure to fully
  loaded.
- CSS is injected before configured JavaScript files are loaded.
- JavaScript file loading uses jQuery promises and fires `afterCellInit` only when
  all configured files have loaded.
- Image preloading only applies to recognized image file extensions.
- `paramTranslation` bridges PM XML parameters to thin-client defaults.

### `hive_helpers.js`

Defines utility functions under `i2b2.h` and several global helpers.

Major helper categories:

- XML parsing, XPath evaluation, node value extraction, and XML serialization.
- HTML/XML escaping and unescaping.
- Template variable escaping with allowlisted escapeless parameters.
- Debug element visibility toggling.
- Type checks, boolean parsing, GUID generation, numeric checks.
- Handlebars helpers: `ifCond`, `increment`, and `objLen`.
- Message sniffer package construction.
- XML response error detection.

Important comments and behaviors:

- `parseXml` has a TODO comment indicating the legacy functionality should be
  removed.
- XML namespace stripping is used as a Firefox compatibility fix.
- ActiveX/IE XPath paths remain for legacy browser support.
- `ifCond` is explicitly documented as the helper to use for template comparisons.
- `checkXmlResponseForErrors` intentionally ignores some known non-fatal cases,
  including max-exceeded behavior unless all errors are requested and a queued
  query timeout workaround.

### `i2b2_layout.js`

Creates and manages GoldenLayout UI instances.

Responsibilities:

- Provides `i2b2.layout.registerWindowHandler(componentName, callback)` for cells.
- Creates the main two-column wrapper layout.
- Creates left-column, right-column, and full-zoom GoldenLayout instances.
- Loads `js-i2b2/i2b2_tabs.json` and merges column-specific settings/dimensions.
- Registers all callbacks captured from cells before initializing column layouts.
- Resizes nested layouts when the browser window changes.
- Implements `i2b2.layout.selectTab(componentName)`.
- On `afterLogin`, loads `assets/main_display.html`, hides debug elements when not
  in debug mode, optionally loads the footer bar, and starts layout initialization.

Notable comments:

- A Safari rendering hack updates the main GoldenLayout size on initial state
  change.
- The “MAGIC TRICK” comment describes delayed registration of all cell-provided
  window callbacks after the JSON layout is available but before column layouts are
  initialized.

### `hive_SDX.js`

Implements the Standard Data Exchange subsystem.

Core concepts:

- `i2b2.sdx.Master` is the central router.
- `i2b2.sdx.TypeControllers` stores per-type controllers registered by cells.
- SDX packages contain `sdxInfo`, `origData`, and optional rendered or underlying
  package data.
- Drag-and-drop uses browser `dataTransfer` payloads:
  - `application/i2b2+json` carries the serialized SDX package.
  - `application/i2b2-sdxType+...` carries type labels usable during hover/dragover.

Major functions:

- `EncapsulateData(inType, inData)` - wraps a cell data object into a standard SDX
  package using type-controller metadata.
- `AttachType(container, typeCode, options)` - marks a DOM node as an SDX drop
  target and attaches default handlers.
- `setHandlerCustom(...)` - overrides handlers for a specific target/type.
- `getHandlerDefault(...)` / `setHandlerDefault(...)` - resolve defaults from type
  controllers.
- `RenderData(sdxDataPackage, options)` - routes rendering to the type controller
  and fills missing render defaults.
- `onDragStart(...)` - serializes SDX drag data and strips parent/DOM references.
- `getChildRecords(...)` - delegates child expansion to the relevant type controller.

Important comments:

- Several comments call out TODOs for cleaning up older array-processing hacks.
- The router pattern comments explain dynamic registration and per-target handler
  overrides.
- The global `dragstart` handler contains a Chrome/Edge bug fix and creates a
  custom drag image from the dragged tree node.

### `i2b2_cell_communicator.js`

Provides `i2b2.hive.communicatorFactory(cellCode)`, which builds each cell's
`ajax` object.

How it works:

1. A cell calls `_addFunctionCall(name, urlTemplate, xmlTemplate,
   escapelessParams, parser)`.
2. The communicator stores the XML template and URL template.
3. It creates a public method with the given `name`.
4. Calls merge parameters, security values, PM/project values, timestamps, message
   IDs, proxy information, and timeout values.
5. Template variables are escaped unless listed in `dont_escape_params`.
6. The XML is POSTed through the configured proxy if one is active.
7. Sent and received messages are recorded by the message sniffer.
8. Success/failure callbacks receive a standardized callback message with request,
   response, timing, URL, proxy URL, error status, XML reference, and parser.

Important defaults and behaviors:

- If no callback is supplied, the request is made synchronously.
- Default `result_wait_time` is `180` seconds unless passed in options or params.
- Password/session content is masked before messages are logged.
- The body gets a `pendingRequest` class when more than one async request is in
  flight.
- Successful responses reset the PM idle timer.
- Parser functions are responsible for populating a `model` namespace on returned
  callback packets.

### `hive_msg_sniffer.js` and `hive/logger`

The message sniffer records cell-to-server communications and exposes a separate
log window.

`hive_msg_sniffer.js` maintains:

- `i2b2.hive.model.msgSniffer.msgLog` - recorded sent/received messages.
- `i2b2.hive.model.msgSniffer.sources` - cells and known AJAX actions.
- `i2b2.hive.model.loggingWindow` - popup window reference.

It supports:

- `show()` - opens/focuses `hive/logger/index.html`.
- `close()` - closes the logger window.
- `add(msg)` - stores a message and notifies the logger window.
- `clear()` - clears stored messages and notifies the logger.
- `registerMessageSource(regMsg)` - registers cells and public AJAX function names
  for logger filters.

`hive/logger/index.html`, `.js`, and `.css` implement the popup UI. The logger
supports filtering by origin, cell, and action; viewing sent and received XML;
clearing logs; and highlighting responses with detected errors.

### `error_msg_display/hive_error_msg_display.js`

Displays global error messages in a Bootstrap toast when XML responses contain
errors and global/project-level settings allow display.

Recognized PM/global parameter names:

- `Global Error Message` - message body displayed in the toast.
- `Disable Global Error Message` - disables global error display when set to
  `true` at the project or global level.

Project-level settings can override global settings. The implementation unescapes
global message text before inserting it into the toast body.

## Template and Asset Conventions

Templates in this directory fall into three categories:

1. **HTML/Handlebars UI templates** - used by views to render dialogs, panels,
   lists, tables, and result component fragments.
2. **XML message templates** - generally embedded in each cell's `i2b2_msgs.js`,
   registered with the communicator factory, and populated at send time.
3. **Configuration-backed display templates** - string templates inside JSON, such
   as MultiZipcodeMap hover/click/legend templates.

Template-related conventions:

- Handlebars is used for UI rendering and helper-based conditional output.
- XML message templates use `{{{variable}}}` placeholders replaced by the hive
  communicator.
- The communicator escapes template variables by default; only parameters listed
  as escapeless are inserted raw.
- Template comparison logic should use the shared `ifCond` helper.
- Select option rendering can use the shared `select` helper.

Asset conventions:

- Cell icons and SDX icons are stored under each cell's `assets/` directory.
- SDX type styles are named like `sdx_<CELL>_types.css`.
- Cell-specific view CSS files are loaded through `cell_config_data.json`.
- Large static geographic files under MultiZipcodeMap are data assets, not runtime
  code.

## Configuration Reference

### Root UI Config: `i2b2_ui_config.js`

| Option | Purpose |
| --- | --- |
| `loginDefaultUsername` | Default username placeholder/value in login form. |
| `loginDefaultPassword` | Default password placeholder/value in login form. |
| `loginDefaultMessage` | Login page explanatory message. |
| `obfuscatedDisplayNumber` | Plus/minus display number for obfuscated counts. |
| `useFloorThreshold` | Enables low-count threshold display. |
| `floorThresholdNumber` | Low-count display threshold. |
| `floorThresholdText` | Prefix for thresholded low-count text. |
| `useExpandedLabFlags` | Enables expanded lab flag behavior where supported. |
| `footer.active` | Enables footer loading. |
| `footer.height` | CSS footer height. |
| `footer.file` | Footer HTML fragment path. |

### Layout Config: `i2b2_tabs.json`

| Option | Purpose |
| --- | --- |
| `left-column` | GoldenLayout content/settings for the left column. |
| `right-column` | GoldenLayout content/settings for the right column. |
| `content` | Nested layout entries. |
| `type` | GoldenLayout type (`stack`, `component`, etc.). |
| `title` | Displayed tab title. |
| `componentName` | Registered i2b2 layout component key. |
| `height`, `width` | Size hints. |
| `settings`, `dimensions` | Column-level GoldenLayout overrides. |

### Cell Config: `cell_config_data.json`

| Option | Purpose |
| --- | --- |
| `files` | Ordered JavaScript files loaded for the cell. |
| `css` | Stylesheets injected for the cell. |
| `preload` | Image assets preloaded by the base loader. |
| `config.name` | Human-readable cell name. |
| `config.description` | Cell description. |
| `config.icons` | Optional icon definitions. |
| `config.category` | Cell classification. |
| `config.paramTranslation` | PM/project parameter mapping and defaults. |
| `config.authRoles` | PM-only list of recognized authorization roles. |
| `config.defaultListIcons` | PLUGIN-only fallback list icons. |

### CRC Query Status Config: `QueryStatus/config.json`

| Option | Purpose |
| --- | --- |
| `displayComponents` | Registry of available visualization modules. |
| `displayComponents.*.source` | JavaScript file to load for a component. |
| `displayComponents.*.CSS` | Optional stylesheet for a component. |
| `displayComponents.*.name` | UI label. |
| `displayComponents.*.iconClass` | Bootstrap icon class. |
| `displayComponents.*.default` | Marks default display. |
| `displayComponents.*.alwaysShow` | Forces component display. |
| `displayComponents.*.displayOrder` | Sort/display order. |
| `displayComponents.*.displayForUnregistered` | Enables use for unmapped result types. |
| `displayComponents.*.noFrameTemplate` | Suppresses standard frame wrapper. |
| `displayComponents.*.notInReport` | Excludes from reports. |
| `displayComponents.*.superModule.capture` | Regex captures for grouped result modules. |
| `displayOrder` | Result type ordering rules. |
| `haltPollingOnStatus` | Status values that stop polling. |
| `hideVisualizationsOn` | Status values that suppress visualizations. |
| `realtimePolling` | Enables/disables real-time polling behavior. |

### CRC Breakdown/Report Configs

`QueryStatus/breakdowns.json` and `QueryReport/ReportConfig.json` map result
instance names to visualization component names.

Value forms:

- `true` - enable the component with default options.
- `false` - disable or suppress a captured/super-module component.
- object - enable the component and pass component-specific options.

Keys can be literal result names or regex-like strings such as `/^RPDO_/`.

## Significant Inline Comments and Operational Notes

- **Bootstrap race condition:** `i2b2_loader.js` polls until `i2b2_BaseCell` and
  `i2b2.h` exist before creating cells.
- **Base cell load states:** `hive_globals.js` documents the cell loading FSM and
  uses it to avoid initializing cells before their JSON configuration is ready.
- **Legacy browser XML handling:** `hive_helpers.js` retains ActiveX/IE paths and
  namespace-stripping workarounds for XPath/XML compatibility.
- **Template comparison:** comments explicitly direct templates to use the shared
  `ifCond` Handlebars helper.
- **GoldenLayout delayed registration:** `i2b2_layout.js` registers cell callbacks
  only after `i2b2_tabs.json` is loaded and before layout initialization.
- **Safari layout hack:** the main GoldenLayout instance updates size on initial
  state change to work around Safari rendering issues.
- **SDX router pattern:** `hive_SDX.js` documents the dynamic data-type router and
  per-target handler override pattern.
- **WORK drop precedence:** SDX drop handling fires WORK handlers first so wrapper
  workplace packages can expose underlying data.
- **Chrome/Edge drag image fix:** `hive_SDX.js` temporarily adjusts layout display
  and creates a custom drag image to avoid drag rendering bugs.
- **Communicator parser contract:** parser functions attached to AJAX calls must
  populate and return the callback packet, usually by adding `model` data.
- **Message safety:** the communicator masks password/session content before
  messages are written to the sniffer log.
- **Global error display:** error toast behavior is controlled by PM/global params
  and XML response error detection.
- **Plugin authorization:** PLUGIN bridge comments describe a controlled tunnel
  rather than unrestricted parent-window access.

## Adding or Modifying Functionality

### Adding a New Cell View

1. Add the view/controller file to the cell's `cell_config_data.json` `files` list.
2. In the file, listen for `i2b2.events.afterCellInit` and filter by `cellCode`.
3. Register a GoldenLayout component with `i2b2.layout.registerWindowHandler()`.
4. Add a matching `componentName` entry to `i2b2_tabs.json` if it should appear in
   the default layout.
5. Add any CSS to the cell `css` list.

### Adding a New AJAX Call

1. Define the XML request template in the cell's `i2b2_msgs.js`.
2. Register it through the cell's communicator with `_addFunctionCall()`.
3. Supply any escapeless parameters only when raw XML insertion is required.
4. Provide a parser that populates callback `model` data.
5. Use the generated `i2b2.<CELL>.ajax.<name>()` function from controllers/views.

### Adding a New SDX Type

1. Create a cell SDX controller file and load it from `cell_config_data.json`.
2. Register the type under `i2b2.sdx.TypeControllers`.
3. Implement encapsulation metadata, rendering, drag start behavior, child loading,
   and any drop handlers needed by consumers.
4. Add icons/styles under the cell's assets/CSS files.
5. Attach the type to drop targets with `i2b2.sdx.Master.AttachType()`.

### Adding a Query Status Visualization

1. Create a subdirectory under `cells/CRC/QueryStatus/` with the visualization's
   JavaScript, optional CSS, and optional HTML templates.
2. Add a component entry to `QueryStatus/config.json` with `source`, `CSS`, `name`,
   `iconClass`, and ordering/report options.
3. Map CRC result instance names to the component in `QueryStatus/breakdowns.json`.
4. If the visualization should appear in printable reports, add a corresponding
   entry to `QueryReport/ReportConfig.json`.

### Adding or Modifying a Plugin

1. Add or update the plugin under the repository's `plugins/` tree.
2. Ensure its manifest/listing metadata can be discovered by the PLUGIN cell.
3. Load plugin-side support libraries from `cells/PLUGIN/libs` when the plugin
   needs parent i2b2 AJAX, SDX, state, or messaging APIs.
4. Use the authorized postMessage APIs exposed by the PLUGIN cell rather than
   directly reaching into the parent `window.i2b2` object.
