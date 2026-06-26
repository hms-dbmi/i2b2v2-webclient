# [MULTIZIPCODEMAP] - Multi-ZIP Code Map Visualization Module
Written by Nick Benik in 2025

## Description

---
The Multi-ZIP Code Map visualization module renders patient counts as an interactive choropleth map.
Geographic areas are color-coded by patient count using a configurable color palette. The user can
switch between three levels of geographic aggregation — State, three-digit ZIP prefix (ZIP3), and
five-digit ZIP code (ZIP5) — using a navigation bar rendered above the map.

The module is designed to display the `PATIENT_ZIP_COUNT_XML` breakdown type and relies on
[Leaflet.js](https://leafletjs.com/) for map rendering. Geographic boundary shapes are loaded at
startup from a set of GeoJSON files. The map supports preset zoom/pan shortcuts, a hover-over info
panel, click-to-pin popups, a color legend, and normalization (displaying patient rates relative to
a reference dataset when one is available in the breakdown results).

### Module Files

| File | Purpose |
|------|---------|
| `MultiZipcodeMap.js` | Main visualization module class |
| `MultiZipcodeMap.html` | Handlebars template for the navigation bar controls |
| `MultiZipcodeMap.css` | Styles scoped to `.viztype-MULTIZIPCODEMAP` |
| `aggregations.mjs` | Defines aggregation levels and their data-extraction and display rules |
| `zoom_list.json` | Defines preset zoom/pan navigation buttons shown above the map |
| `GeoJSON/load_list.json` | Lists the GeoJSON boundary files loaded at startup |
| `GeoJSON/Storage/` | Repository of all available GeoJSON boundary files organized by state |

---

## Configuration

All configuration is supplied through the breakdown's entry in `breakdowns.json`. The value of the
`MULTIZIPCODEMAP` key must be an object with up to four top-level sections: `map`, `clickBox`,
`hoverBox`, and `legendBox`.

### `map` Options

| Option | Description | Default |
|--------|-------------|---------|
| `tiles` | Leaflet URL template for the base map tile layer | ArcGIS World Light Gray Base |
| `labelTiles` | *(optional)* URL template for a label overlay tile layer rendered above the shapes | *(none)* |
| `maxZoom` | Maximum zoom level allowed on the map | `16` |
| `aggKeyName` | GeoJSON feature property name used to match patient data rows to map shapes | `"aggKey"` |
| `colors` | Array of color bucket objects used to paint the choropleth. See **Color Buckets** below. | 9-color diverging palette |
| `styles.norm` | Leaflet path style applied to each area under normal display | `weight:1, color:"#000", fillOpacity:0.25` |
| `styles.hover` | Leaflet path style applied to an area when it is hovered | `weight:3, color:"#F00", fillOpacity:0.5` |

#### Color Buckets (`colors` array)

Each entry in `colors` requires a `color` (hex string) and supports optional `min` / `max` keys for
fixed bucket boundaries. When `min` and `max` are omitted the full data range is divided evenly
across all buckets (auto-scaled). When set, they become fixed thresholds and the legend switches to
the corresponding template (see `legendBox` templates in `aggregations.mjs`).

```json
"colors": [
  { "color": "#d73027" },
  { "color": "#fdae61", "min": 50, "max": 100 },
  { "color": "#4575b4", "min": 100 }
]
```

### `clickBox` Options

Configures a Leaflet popup that appears when a user clicks a map area. The popup content template is
defined in `aggregations.mjs` (per aggregation level). If no template is found there, the `template`
field here in `breakdowns.json` is used as a fallback.

| Option | Description |
|--------|-------------|
| `template` | Fallback HTML template string for the popup body (see **Template Syntax** below) |
| `options.closeButton` | Show a close button on the popup (`"true"` / `"false"`) |
| `options.className` | CSS class added to the popup element |
| `options.autoClose` | Auto-close the popup when another area is clicked |
| `options.closeOnClick` | Close the popup when the map background is clicked |

### `hoverBox` Options

Configures a Leaflet control panel that updates as the mouse moves over map areas.

> **Note:** The content templates (`template` and `default` text) for the hover panel are defined
> inside each aggregation level's `extract` entries in `aggregations.mjs`. The options below
> control only the panel's placement and CSS class. Setting `default` to any non-empty string
> enables the default-state display; the actual text shown is taken from `aggregations.mjs`.

| Option | Description |
|--------|-------------|
| `position` | Leaflet control position: `"topright"`, `"topleft"`, `"bottomright"`, or `"bottomleft"` |
| `className` | Additional CSS class added to the hover panel element |
| `default` | Set to any non-empty string to enable the idle default message (text comes from `aggregations.mjs`) |

### `legendBox` Options

Configures the Leaflet color-legend control. Content templates are defined in `aggregations.mjs`.

| Option | Description |
|--------|-------------|
| `position` | Leaflet control position |
| `options` | Additional Leaflet control options object |

---

## Template Syntax

Templates in `clickBox`, `hoverBox`, and `legendBox` use a `{{variable}}` substitution syntax.
Prefixing the variable name with `~` formats the value as a locale-aware number.

| Syntax | Description |
|--------|-------------|
| `{{varname}}` | Insert the raw string value of `varname` |
| `{{~varname}}` | Format `varname` as a locale-aware integer (thousands separators) |
| `{{~varname.N}}` | Format `varname` as a number with exactly `N` decimal places |
| `{{~varname\|N}}` | Format `varname` rounded to `N` significant digits |

Common variables available in templates:

| Variable | Description |
|----------|-------------|
| `{{text}}` | Area label text as returned from the server |
| `{{display}}` | Formatted patient count string |
| `{{count}}` | Raw integer patient count |
| `{{color}}` | Hex color assigned to this bucket (legend entries only) |
| `{{~min}}`, `{{~max}}` | Bucket boundary values (legend entries only) |
| `{{normalizedValue}}` | Patient rate value (normalized mode only) |
| `{{$normalizer}}` | Name of the active normalizer dataset (normalized mode only) |

Additional variables (e.g. `{{zip5code}}`, `{{zip3code}}`, `{{stateCode}}`) are declared in
`aggregations.mjs` via the `attribs` mappings described in the next section.

---

## Customizing Aggregation Levels (`aggregations.mjs`)

The `aggregations.mjs` file is an ES module whose default export is an object. Each key defines one
aggregation level. The module ships with three levels — `STATE`, `ZIP3`, and `ZIP5` — which
correspond to the buttons shown in the **Aggregation** navigation bar above the map.

### Top-Level Aggregation Properties

Each aggregation definition supports the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `order` | number | Display order in the Aggregation navigation bar (lower values appear first) |
| `title` | string | Label shown in the Aggregation navigation bar |
| `tooltip` | string | *(optional)* Hover tooltip for the aggregation button |
| `default` | boolean | If `true`, this aggregation is selected on first render. Only one should be default. |
| `extract` | array | Array of extractor definitions used to parse result rows for this aggregation |

### Extractor Definitions

The `extract` array tells the module how to recognize and parse result rows returned by the server.
Each extractor object supports these fields:

| Property | Description |
|----------|-------------|
| `regex` | Regular expression used to match the row label text coming from the XML breakdown result |
| `attribs` | Ordered list describing how each regex capture group should be stored |
| `clickBox` | *(optional)* Click-popup template for this extractor |
| `hoverBox` | *(optional)* Hover-panel templates for this extractor |
| `legendBox` | *(optional)* Legend templates for this extractor |

The module evaluates the extractor definitions and uses the first one whose `regex` matches the
incoming row label. In practice, each aggregation usually defines:

1. One extractor for **raw patient counts**, and
2. One extractor for **normalized / rate-based output**

The normalized extractor is identified by including `"$normalizer"` in its `attribs` list.

### The `attribs` Array

The `attribs` array maps regex capture groups to named values used later by the map, popups,
hover boxes, and legend templates.

Each element in `attribs` corresponds positionally to one regex capture group.

| `attribs` value | Meaning |
|-----------------|---------|
| `"$normalizer"` | Store this capture group as the current normalizer name |
| `"text"` | Store this capture group as the generic `text` field |
| `["myVar"]` | Store this capture group as `myVar` |
| `["myVar", "text"]` | Store this capture group as both `myVar` and `text` |
| `["myVar", "$aggKey"]` | Store this capture group as `myVar` and also use it as the GeoJSON aggregation key |
| `["myVar", "text", "$aggKey"]` | Store this capture group as `myVar`, `text`, and the GeoJSON aggregation key |

#### Special `attribs` keywords

| Keyword | Purpose |
|---------|---------|
| `text` | Human-readable label used by templates such as `{{text}}` |
| `$aggKey` | Value used to match the server row against a GeoJSON feature property |
| `$normalizer` | Marks the extractor as being for normalized output |

For the map to render correctly, each non-normalized extractor must ultimately produce a value that
can be matched to the feature property named by `map.aggKeyName` (default: `aggKey`).

### `clickBox`, `hoverBox`, and `legendBox` inside `aggregations.mjs`

These blocks define the templates used for each aggregation level. They override the more general
breakdown-level configuration whenever present.

- `clickBox.template` defines the HTML popup shown when the user clicks a region.
- `hoverBox.default` defines the idle message shown when no feature is hovered.
- `hoverBox.template` defines the HTML shown while hovering a feature.
- `legendBox.templates.root` defines the legend wrapper and should include `{{entries}}`.
- `legendBox.templates.auto` is used when legend ranges are automatically calculated.
- `legendBox.templates.min-max`, `no-min`, and `no-max` are used when color buckets define fixed
  range boundaries in `breakdowns.json`.

### How to Add a Custom Aggregation Level

To add your own aggregation level, create a new top-level entry in `aggregations.mjs` and then make
sure the GeoJSON data contains matching aggregation keys.

#### Step 1: Add a new entry to `aggregations.mjs`

Create a new object beside `STATE`, `ZIP3`, and `ZIP5`.

Example skeleton:

```javascript
MYLEVEL: {
    order: 4,
    title: "My Level",
    tooltip: "Rollup to My Level",
    extract: [
        {
            regex: "^(.*)$",
            attribs: [
                ["myLabel", "text", "$aggKey"]
            ],
            clickBox: {
                template: "<b>{{myLabel}}</b><br/>{{display}} patients"
            },
            hoverBox: {
                default: "<h4>Patient Count</h4>Hover over an area",
                template: "<h4>Patient Count</h4><div><b>{{myLabel}}</b></div><span>{{display}} patients</span>"
            },
            legendBox: {
                templates: {
                    root: "<div class='map-title'><h4>Patient Count</h4></div><div class='map-entries'><div>{{entries}}</div></div>",
                    auto: "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}&ndash;{{~max|2}}</span></div>"
                }
            }
        }
    ]
}
```

#### Step 2: Write a `regex` that matches the server output

Your `regex` must match the label text returned for the `PATIENT_ZIP_COUNT_XML` breakdown rows.
Each capture group should isolate one useful piece of data, such as a state code, ZIP prefix, ZIP
code, county name, or display label.

For example:

- `^([A-Z]{2})$` matches a two-letter state code like `MA`
- `^([0-9]{5}) - (.*)` matches a ZIP5 label like `02115 - Boston`
- `^\[(.*)\]([0-9]{3}) - (.*)` matches a normalized ZIP3 label like `[TOTAL]021 - Boston`

#### Step 3: Map the capture groups in `attribs`

Use `attribs` to assign the capture groups to template variables and to the aggregation key.

Example:

```javascript
attribs: [
    ["zip5code", "$aggKey"],
    "text"
]
```

This means:

- capture group 1 becomes `zip5code`
- capture group 1 is also the key used to match the GeoJSON feature
- capture group 2 becomes `text`

#### Step 4: Add a normalized extractor if needed

If the server can return normalized data for the same aggregation, add a second extractor whose
first capture group maps to `"$normalizer"`.

Example:

```javascript
{
    regex: "^\\[(.*)\\]([0-9]{5}) - (.*)",
    attribs: [
        "$normalizer",
        ["zip5code", "$aggKey"],
        "text"
    ]
}
```

This tells the visualization that the row contains a normalized value and that the leading bracketed
value is the normalizer name.

#### Step 5: Ensure the GeoJSON features have matching keys

Your new aggregation only works if the GeoJSON features contain a property whose value matches the
captured `$aggKey`. By default the module looks for a property named `aggKey`, although this can be
changed via `map.aggKeyName` in `breakdowns.json`.

For example, if your extractor sets `$aggKey` to `021`, then the matching GeoJSON feature must have:

```json
{
  "properties": {
    "aggKey": "021"
  }
}
```

#### Step 6: Verify ordering and default selection

After adding the new aggregation:

- assign it a unique `order`
- give it a user-friendly `title`
- optionally set `tooltip`
- only mark it as `default: true` if you want it to be the initial aggregation shown

---

## GeoJSON Coverage and `load_list.json`

By default, the visualization is configured to show only New England states.

The repository also contains a larger library of GeoJSON boundary data under `GeoJSON/Storage/`.
That storage area is organized into two directories:

| Directory | Contents |
|-----------|----------|
| `GeoJSON/Storage/zip3/` | GeoJSON files whose shapes represent multiple ZIP codes combined by their first 3 digits |
| `GeoJSON/Storage/zip5/` | GeoJSON files whose shapes represent individual 5-digit ZIP codes |

Both directories group files by state and use names such as:

- `Storage/zip3/NY_zip3.json`
- `Storage/zip5/NY_zip5.json`

### Adding more states to the visualization

The files actually loaded by the module are controlled by `GeoJSON/load_list.json`.

To add another state to the active visualization:

1. Copy the desired GeoJSON files from `GeoJSON/Storage/zip3/` and/or `GeoJSON/Storage/zip5/`
   into the main `GeoJSON/` directory used by the module.
2. Add the copied filenames to `GeoJSON/load_list.json`.
3. Reload the visualization.

Example addition:

```json
[
  "ALL_STATES.json",
  "CT_zip3.json",
  "CT_zip5.json",
  "MA_zip3.json",
  "MA_zip5.json",
  "NY_zip3.json",
  "NY_zip5.json"
]
```

`ALL_STATES.json` provides the shapes for the `STATE` aggregation level. The state-specific ZIP3 and
ZIP5 files provide the geometry for the `ZIP3` and `ZIP5` aggregation levels.

---

## Definition within `breakdowns.json`

```json
{
  "PATIENT_ZIP_COUNT_XML": {
    "TABLE": true,
    "MULTIZIPCODEMAP": {
      "clickBox": {
        "options": {
          "closeButton": "true",
          "className": "onclick-box",
          "autoClose": false,
          "closeOnClick": false
        },
        "template": "<b>[{{text}}] - {{name}}</b><br/>{{display}} patients"
      },
      "hoverBox": {
        "position": "topright",
        "className": "onhover-box",
        "default": "<h4>Patient Count</h4>Hover over an area",
        "template": "<h4>Patient Count</h4><div><b>{{name}}</b></div><div>Zip Code: {{zipcode}}</div><span>{{display}} patients</span>"
      },
      "legendBox": {
        "position": "bottomright",
        "options": {},
        "templates": {
          "root": "<div class='map-title'><h4>Patient Count</h4></div><div class='map-entries'><div>{{entries}}</div></div>",
          "auto": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}&ndash;{{~max|2}}</span></div>",
          "min-max": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min}}&ndash;{{~max}}</span></div>",
          "no-min": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>&lt;{{~max}}</span></div>",
          "no-max": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min}}+</span></div>"
        }
      },
      "map": {
        "tiles": "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "labelTiles": "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
        "maxZoom": 18,
        "aggKeyName": "aggKey",
        "colors": [
          {"color": "#d73027"},
          {"color": "#f46d43"},
          {"color": "#fdae61"},
          {"color": "#fee090"},
          {"color": "#ffffbf"},
          {"color": "#e0f3f8"},
          {"color": "#abd9e9"},
          {"color": "#74add1"},
          {"color": "#4575b4"}
        ],
        "styles": {
          "norm": {
            "weight": 1,
            "opacity": 1,
            "color": "#000",
            "fillOpacity": 0.25
          },
          "hover": {
            "weight": 3,
            "_dashArray": "4,6",
            "color": "#F00",
            "fillOpacity": 0.5
          }
        }
      }
    }
  }
}
```

