# [PATHOGENTIMELINE] - Pathogen Timeline Visualization Module

Written by Thomas Naughton, 2026

Pathogen Timeline takes a breakdown of specific diagnoses and draws a line chart with an optional overlay of wastewater data.

The module is designed to display the `PATIENT_PATHOGEN_TIMELINE_SHRINE_XML` breakdown type and relies on [d3.js](https://d3js.org/) for line chart rendering.


### Module Files

| File | Purpose |
|------|---------|
| `PathogenTimeline.js` | Main visualization module class |
| `PathogenTimeline.html` | Template for the filter bar controls |
| `PathogenTimeline.css` | Styles scoped to `.viztype-PATHOGENTIMELINE` |
| `demo_wastewater.json` | Demo file of wastewater data for experimentation |


### Definition within `breakdowns.json`
```json
{
    "PATIENT_PATHOGEN_TIMELINE_SHRINE_XML": {
    "TABLE": true,
    "DOWNLOAD": true,
    "PATHOGENTIMELINE": true
  }, ...
}
```

### Options

Breakdown diagnoses are mapped through a registry object. This allows you to control labeling, coloring, ordering, and normalization of diagnosis values returned from the query.

```
const DIAGNOSIS_REGISTRY = {
    diagnosis: {
        "COVID-19": { key: "COVID-19", label: "COVID-19", color: "#1f77b4", order: 1, aliases: ["COVID-19", "COVID19", "SARS-COV-2"] },
        "Influenza": { key: "Influenza", label: "Influenza", color: "#ff7f0e", order: 2, aliases: ["INFLUENZA"] },
        "RSV": { key: "RSV", label: "RSV", color: "#2ca02c", order: 3, aliases: ["RSV"] }
    },
    canonicalize(raw) {
        const key = raw.trim().toUpperCase();
        for (const diagnosis of Object.values(this.diagnosis)) {
            if (diagnosis.aliases.includes(key)) {
                return diagnosis.key;
            }
        }
        return raw.trim();
    }
};

```

Wastewater data sources are configured through a separate registry. This defines how raw wastewater rows are interpreted and displayed.

```
const WASTEWATER_REGISTRY = {
    wastewater_sources: {
        "local-combined": { label: "Wastewater Local COVID-19", color: "#333333", order: 3, accessor: (row) => (Number(row["Northern 7 day avg"]) || 0) + (Number(row["Southern 7 day avg"]) || 0) }
    }
};
```


### Demo Wastewater Data

As described above, this module comes with a sample file of wastewater data. The code also contains example functions used to fetch the wastewater data through an endpoint.