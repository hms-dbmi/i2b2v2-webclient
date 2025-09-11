# [ZIPCODEMAP] - ZipcodeMap Visualization Module
Written by Nick Benik in 2025

## Description

---

The ZipcodeMap visualization module is used to visualize a zip code breakdown upon map with GeoJSON features.  It uses a 
regular expression to extract a zip code (or other area identifier) from the breakdown table's row labels.  It then matches
this extracted value to a configurable data variable name that exists within one or more GeoJSON features' `properties` data object.



## Configuration Options

---
### GeoJSON Data Ingestion 
One or more GeoJSON files need to be loaded for any shapes to be display on the map. These files must be added to the 
`GeoJSON` subdirectory under the visualization module's root directory.  Within the `GeoJSON` exists a `load_list.json` file 
which contains a simple list of the filenames within the GeoJSON directory that should be loaded for the data visualization. 

**Example of `ZipcodeMap/GeoJSON/load_list.json`**
```json
[
  "me_maine_zip_codes_geo.min.json",
  "nh_new_hampshire_zip_codes_geo.min.json",
  "vt_vermont_zip_codes_geo.min.json",
  "ma_massachusetts_zip_codes_geo.min.json",
  "ct_connecticut_zip_codes_geo.min.json",
  "ny_new_york_zip_codes_geo.min.json"
]
```


### Quick Zoom Links (optional)
One or more entries that will become the quick zoom links at the top of the map area.  The `initial` boolean entry set to true
will cause that zoom window to be active when the visualization is first displayed.
```json
  "zooms": [
    {
      "lat": 42.33023458841124,
      "long": -71.13364100605521,
      "zoom": 11,
      "title": "Boston",
      "tooltip": "Boston and surrounding area",
      "initial": true
    }, ...
  ]
```

<br/>
<br/>

### Map Configuration (required)
| Attribute Name  | Description                                                                                                       |
|-----------------|-------------------------------------------------------------------------------------------------------------------|
| `tiles`       | The required URL template used by leaflet to retreve the main images for the map                                  |
| `labelTiles`    | The optional URL template used by leaflet to place a labels-only map on top of the map and data layers            |
| `attribution`   | Optional HTML to display for providing attribution for the map tile layer(s)                                      |
| `maxZoom`       | Required: the maximum amount of zoom that is allowed during user interaction                                      |
| `zipAttribName` | Required: the attribute name that is used to identify zip codes from the GeoJSON data files                       |
| `zipRegEx`      | Required: A regular expression that will extract the zip code from the row name of the breakdown XML table        |
| `colors`        | Optional: A list of objects defining the color gradient that will be used to display the counts for each zip code |
| `styles`        | Defining styles used by SVG paths that visualize each zip code on the map                                         |
| `styles.norm`   | List of attribute/values used on the SVG zip code paths that are not being highlighted by a mouse-over            |
| `styles.hover`  | List of attribute/values use on the SVG zip code paths that are highlighted by having the mouse over them         |

```json
  "map": {
    "tiles": "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
    "labelTiles": "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
    "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
    "maxZoom": 18,
    "zipAttribName": "ZCTA5CE10",
    "zipRegEx": "^(.*)[0-9]{5}",
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
        "color": "#F00",
        "fillOpacity": 0.5
      }
    }
  }
```

<br/>
<br/>

### Map Color Gradient Configuration (optional)
This configuration defines a color gradient that used to display colors for each zip code path that has data.  It exists
within the above described `map` configuration space in an attribute labeled `colors`.

| Attribute Name    | Description                                                                                                                                                             |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `color`           | The required HTML color code used for the color of the data range bucket.  It should be a HTML hex value.                                                               |
| `min`             | The optional minimum value that the color bucket will be matched on.                                                                                                    |
| `max`             | The optional maximum value that the color bucket will be matched on.                                                                                                    |
| *other variables* | It is possible to define other variables within each of the buckets. These additional variables will be accessible to the template engine when rendering the legendbox. | 

```json
      "map": {
        "colors": [
          {"color": "#d73027"},
          {"color": "#f46d43", "min": 0.25},
          {"color": "#fdae61", "min": 0.5, "max": 0.75},
          {"color": "#fee090", "max": 1}
          {"color": "#d73027", "percentile": "10th"},
        ]
      }
```
If `min` and/or `max` values are **NOT** used in color entries then the buckets will have `min` and `max` values automatically 
assigned to them once data is injected into the visualization module.  The `min` and `max` values are automatically calculated 
by taking the range of the data's counts (*Math.max(dataValues[]) - Math.min(dataValues[])*) and dividing it equally by 
the number of color buckets defined, and offset by the minimum value found in the counts data. 

<br/>
<br/>

### Click Box Configuration (optional)
This configuration makes it so that a Leaflet Marker is created when a zip code path is clicked.

| Attribute Name | Description                                                                                  |
|----------------|----------------------------------------------------------------------------------------------|
| `template`     | An HTML template that is displayed within the Leaflet Marker when a zip code path is clicked |
| `options`      | Container holding options for the Leaflet Marker (see https://leafletjs.com/reference.html#marker)                                      |   

For the `template` definition, it uses the general template processing engine within this module. See "Template Engine" for more details.

```json
  "clickBox": {
    "template": "<b>[{{ZCTA5CE10}}]</b><br/>{{~count}} patients",
    "options": {
      "closeButton": "true",
      "className": "onclick-box",
      "autoClose": false,
      "closeOnClick": false
    }
  }
```

<br/>
<br/>

### Hover Box Configuration (optional)
This configuration makes it so that a hoverbox displays information about the zip code map.

| Attribute Name | Description                                                                                                |
|----------------|------------------------------------------------------------------------------------------------------------|
| `position`     | Leaflet position of where to place the hoverbox (See https://leafletjs.com/reference.html#control-options) |
| `className`    | A classname to be added to the control to allow better CSS style targeting                                 |
| `default`      | An optional HTML template to be displayed when the mouse is not over any zip code path                     |
| `template`     | A required HTML template that is displayed within the Leaflet Marker when a zip code path is clicked       |

For the `template` definition, it uses the general template processing engine within this module. See "Template Engine" for more details.

```json
  "hoverBox": {
    "position": "topright",
    "className": "onhover-box",
    "default": "<h4>Patient Count</h4>Hover over an area", 
    "template": "<h4>Patient Count</h4><div>Zip Code: {{ZCTA5CE10}}</div><span>{{~count}} patients</span>"
  }
```

<br/>
<br/>

### Legend Box Configuration (optional)
This configuration makes it so that there is a legend that displays information color gradient used by the zip code map.

| Attribute Name      | Description                                                                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `position`          | Leaflet position of where to place the legend (See https://leafletjs.com/reference.html#control-options)                                                                       |
| `options`           | Options to be use... (TODO: describe this)                                                                                                                                     |
| `templates`         | Container to hold all the HTML template entries                                                                                                                                |
| `templates.root`    | A required HTML template that is the root of the legend.  Use the special {{entries}} tag to render the collection of all other templates for the map's defined color gradient |
| `templates.auto`    | A required HTML template that renders a single entry from the defined color gradient for a color gradient entry that does not have a defined `max` or `min` value              |
| `templates.min-max` | An optional HTML template that renders a single color gradient entry which has defined both `max` and `min` values                                                             |
| `templates.no-min`  | An optional HTML template that renders a single color gradient entry which has defined only a `max` value                                                                      |
| `templates.no-max`  | An optional HTML template that renders a single color gradient entry which has defined only a `min` value                                                                      |

For the `template` definition, it uses the general template processing engine within this module. See "Template Engine" for more details.

```json
  "legendBox": {
    "position": "bottomright",
    "options": {},
    "templates": {
      "root": "<div><h4>Patient Count</h4></div><div>{{entries}}</div>",
      "auto": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}&ndash;{{~max|2}}</span></div>",
      "min-max": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min}}&ndash;{{~max}}</span></div>",
      "no-min": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>&lt;{{~max}}</span></div>",
      "no-max": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min}}+</span></div>"
    }
  }
```

<br/>
<br/>

### Template Engine
This plugin uses a template engine for rendering the template strings for the "Legend Box", "Hover Box", and "Click Box"
components.  It recognizes template tags as being a template variable contained within handlebars (example `{{varname}}`).
It also has number display processing routines which can be accessed by adding prefix/suffix control variables to the
template variable's name within the handlebars delimiters.

| Common Template Variables  | Description                                                                                                                      |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `color`                    | Used in all templates (except `"root"`) to represent the color code of the bucket entry                                      |
| `min`                      | Used in Legendbox templates to represent the minimum value of the bucket entry                                                   |   
| `max`                      | Used in Legendbox templates to represent the maximum value of the bucket entry                                                   |
| `entries`                  | Used in the `"root"` Legendbox template. It contains the list of pre-rendered individual data buckets as a concatenated string   |
| `ZCTA5CE10` and other vars | Used in Clickbox and Hoverbox templates. All variables in the GeoJSON features' `"properties"` data object are accessible to use |
| `count`                    | Used in Clickbox and Hoverbox templates. It is the count value returned for the zip code's entry in the breakdown results        |
| `text`                     | Used in Clickbox and Hoverbox templates. It is the unprocessed text value labeling the data value in the breakdown results       |


| Template Variables Modifiers                | Description                                                                                                                                                       |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Prefixed `~` as in `{{~count}}`             | Used to enable "pritty print" of the number. By itself it makes it an integer with commas. This example turns "12345.123" into "12,345.123"                       |
| Appended `.` as in `{{~count.2}}`           | Truncates the fractional part of the number by a given number of digits. This example limits "2" digits after the decimal point ("12345.123" becomes "12,345.12") |
| Appended `&#124;` as in `{{~count&#124;3}}` | Limits the number to a set number of significant digits. This example show a limit of 3 digits ("12345.123" becomes "12,300")                                     |

<br/>
<br/>
<br/>
<br/>

### Example configuration in the `breakdowns.json` file

---
```json
{ ...,
  "PATIENT_ZIP_COUNT_SHRINE_XML": {
    "ZIPCODEMAP": {
      "zooms": [
        {
          "lat": 42.33023458841124,
          "long": -71.13364100605521,
          "zoom": 11,
          "title": "Boston",
          "tooltip": "Boston and surrounding area",
          "initial": true
        },
        {
          "lat": 42.01652429956454,
          "long": -71.7354813533802,
          "zoom": 8,
          "title": "Massachussetts",
          "tooltip": "State of Massachussetts"
        },
        {
          "lat": 42.33880604791197,
          "long": -71.1066726902258,
          "zoom": 7,
          "title": "New England",
          "tooltip": "New England Area"
        }
      ],
      "clickBox": {
        "options": {
          "closeButton": "true",
          "className": "onclick-box",
          "autoClose": false,
          "closeOnClick": false
        },
        "template": "<b>[{{ZCTA5CE10}}]</b><br/>{{~count}} patients"
      },
      "hoverBox": {
        "position": "topright",
        "className": "onhover-box",
        "default": "<h4>Patient Count</h4>Hover over an area",
        "template": "<h4>Patient Count</h4><div>Zip Code: {{ZCTA5CE10}}</div><span>{{~count}} patients</span>"
      },
      "legendBox": {
        "position": "bottomright",
        "options": {},
        "templates": {
          "root": "<div><h4>Patient Count</h4></div><div>{{entries}}</div>",
          "auto": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}&ndash;{{~max|2}}</span></div>",
          "min-max": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min}}&ndash;{{~max}}</span></div>",
          "no-min": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>&lt;{{~max}}</span></div>",
          "no-max": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min}}+</span></div>"
        }
      },
      "map": {
        "tiles": "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "labelTiles": "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
        "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
        "maxZoom": 18,
        "zipAttribName": "ZCTA5CE10",
        "zipRegEx": "^(.*)[0-9]{5}",
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
            "color": "#F00",
            "fillOpacity": 0.5
          }
        }
      }
    }
  }
}
```