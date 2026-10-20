# [CONCEPTOVERALYTIMELINE] - Concept Overlay Timeline Visualization Module

Written by Thomas Naughton, 2026

Concept Overlay Timeline takes a breakdown of specific concepts and draws a line chart with an optional overlay of other data served from an endpoint or local file.

The module is designed to display the `PATIENT_PATHOGEN_TIMELINE_XML` breakdown type and relies on [d3.js](https://d3js.org/) for line chart rendering.


## Module Files

| File | Purpose |
|------|---------|
| `ConceptOverlayTimeline.js` | Main visualization module class |
| `ConceptOverlayTimeline.html` | Template for the filter bar controls |
| `ConceptOverlayTimeline.css` | Styles scoped to `.viztype-CONCEPTOVERLAYTIMELINE` |
| `demo_wastewater.json` | Demo file of wastewater data for overlay experimentation |


### Definition within `breakdowns.json`
```json
{
    "PATIENT_PATHOGEN_TIMELINE_XML": {
    "TABLE": true,
    "DOWNLOAD": true,
    "CONCEPTOVERLAYTIMELINE": {configs -- see below}
  }, ...
}
```

## conceptRegistry

The concept registry is generated automatically from your breakdown data on load. Every distinct concept value found in the breakdown becomes an entry, with a label matching its raw name, an automatically assigned color (drawn from `canonicalHexes`), and an order based on alphabetical sorting. `customizeConceptRegistry` (see below) lets you override specific entries after this default registry has been built — it never replaces the registry wholesale, only the fields you explicitly provide for concepts that already exist in your breakdown.


## Configs

### `canonicalHexes`

An array of hexes is required for the visualization to render in the case that colors have not been provided for the concept registry or overlay registry (see the respective registry sections below).

```json
"canonicalHexes": 
      [
          "#FF0000",
          "#00FF00",
          "#0000FF",
          "#FFFF00",
          "#00FFFF",
          "#FF00FF",
          ...
      ],
```
The canonical hex array is accessible by both concepts and overlays, which means that if every hex in the list is already assigned, additional concepts or overlay sources will receive a duplicate hex. This can be avoided by supplying your own hex colors in the `customizeConceptRegistry`or in the `overlayConfigs` config objects.

**Note:** Omitting this array will cause the visualization to render incompletely.

### `conceptsLabel`
By default, the concepts UI control row label will be "Diagnosis:", but this can be customized with the `conceptsLabel` config with any string.


### `customizeConceptRegistry`

Lets you override how specific concepts from the breakdown appear — their display label, color, and sort order.

**Shape:**

```json
"customizeConceptRegistry": {
    "<concept name as it appears in your breakdown>": {
        "label": "<custom display label>",
        "color": "<7-character hex code, e.g. #1f77b4>",
        "order": <integer>
    }
}
```

**How overriding values works:**

- The key (e.g. `"COVID-19"`) must exactly match a concept name as it comes out of the breakdown data. If it doesn't match any real concept, that entry is silently ignored — no customization is applied, and the concept falls back to its default generated appearance.
- Only `label`, `color`, and `order` can be customized. A `key` property, if included, is ignored — the concept's internal registry key always comes from the breakdown data itself, never from config.
- Any property left empty (`""`) or omitted is skipped — that specific value falls back to the default (generated label, auto-assigned color, alphabetical order), rather than the whole concept's customization being rejected.

**Important: `order` is all-or-nothing across every concept, not per-concept.** If you want a specific concept to appear in a specific position, you must supply a valid `order` for **every** concept in the registry. If even one concept is missing a valid integer `order`, the entire set's order values are discarded and all concepts are re-alphabetized instead — partial ordering is not supported.

**Failure behavior:** a typo in a concept name, or customizing a concept that doesn't exist in your current breakdown, doesn't cause an error — it's silently skipped, and a message is logged to the browser console explaining why.

### `overlayConfigs`
The top-level container for everything overlay-related.

### `overlayConfigs.overlays`
An object where each key is an overlay's internal nickname (used throughout the visualization and in compound selection keys), and each value is that overlay's full configuration.

**Shape:**

```json
"overlayConfigs": {
    "overlays": {
        "<overlayNickname>": {
            ...
        }
    }
}
```

### `overlayConfigs.overlays.<overlayNickname>.envUrls`

A map of environment names to the real, resolvable URL for that environment. Used to pick the correct endpoint automatically based on where the app is currently running, without hardcoding a single URL in config.

**Shape:**

```json
"envUrls": {
    "dev": "<url for dev environment>",
    "prod": "<url for prod environment>",
    "demo": "<url for demo environment>",
    "local": "<path to a local JSON file, used when sourceType is \"local\">"
}
```

**How it's used:**

- At runtime, the app detects which environment it's currently running in (based on the page's hostname, or — for `sourceType: "local"` — simply by checking that `envUrls.local` is set) and looks up the matching key here.
- The keys aren't fixed to exactly these four — any key name is valid as long as it matches what the app's environment detection resolves to. `dev`, `prod`, `demo`, and `local` are the ones currently recognized.
- `local` is the one entry that isn't a real environment — it's used specifically when `sourceType` is `"local"`, and should point to a path to a JSON file rather than a service URL.

**Required:** At least one entry must be present, and the specific entry matching whatever environment the app detects must have a real, non-empty value — otherwise the overlay is skipped entirely, with a message logged to the console.

### `overlayConfigs.overlays.<overlayNickname>.endpointUrl`

A lookup key, not a literal URL — despite the name. At runtime, the app resolves this to the matching entry in `envUrls` based on the detected environment, and overwrites this field in memory with the real, resolved URL.

**Shape:**

```json
"endpointUrl": ""
```

**How it's used:**

- Leave this as an empty string in config. It gets filled in automatically once the app detects which environment it's running in and resolves the matching key from `envUrls`.
- The name is a known inconsistency — it's kept as `endpointUrl` for historical reasons, even though it holds a lookup key rather than a URL, until config is injected directly by a deployment pipeline (at which point this field is expected to go away or change meaning).

**Failure behavior:** if the app can't resolve a matching entry in `envUrls` for the detected environment, this stays unresolved and a message is logged to the console — the overlay's data will fail to load.

### `overlayConfigs.overlays.<overlayNickname>.sourceType`

Tells the app whether this overlay's data comes from a network request or a static local file.

**Shape:**

```json
"sourceType": "url"
```

**Valid values:**

- `"url"` — fetch data from a live service (currently implemented via the i2b2 proxy; see `urlType`).
- `"local"` — fetch data from a static JSON file, using the path configured in `envUrls.local`.

**Required:** A missing, empty, or any other value causes the overlay to be skipped entirely, with a message logged to the console.

### `overlayConfigs.overlays.<overlayNickname>.urlType`

Tells the app how to actually make the request when `sourceType` is `"url"`. Only meaningful for URL-sourced overlays — this field is not used, and does not need to be set, when `sourceType` is `"local"`.

**Shape:**

```json
"urlType": "i2b2-proxy"
```

**Valid values:**

- `"i2b2-proxy"` — the data comes from an i2b2 service, reached through i2b2's internal proxy mechanism. This is the only fully implemented, working option today.
- `"external"` — reserved for a future direct external API integration. Currently a placeholder only; selecting this will cause the overlay's data fetch to be skipped with a console warning, since the actual fetch logic hasn't been built yet.

**Required:** When `sourceType` is `"url"`. A missing or invalid value causes the overlay to be skipped entirely, with a message logged to the console. Not required, and ignored, when `sourceType` is `"local"`.

### `overlayConfigs.overlays.<overlayNickname>.dateRange`

An optional, explicit start and end date to request data for, instead of letting the app infer a range automatically.

**Shape:**

```json
"dateRange": ["MM/DD/YYYY", "MM/DD/YYYY"]
```

**How it's used:**

- If left empty (`""`), or omitted, the app automatically uses the same date range as the patient breakdown data — this is the typical, recommended setup.
- If provided, both dates must fall within the breakdown's own date range, and the start date must come before the end date. If either check fails, the configured range is ignored and the app falls back to the breakdown's range instead, with a message logged to the console explaining why.
- Applies to both `url`- and `local`-sourced overlays — a local JSON file's rows are filtered down to this range (or the breakdown's range, if this is left empty) using whatever column is configured in `dateColumn`.

### `overlayConfigs.overlays.<overlayNickname>.dateColumn`

The exact name of the column in this overlay's data that holds each row's date.

**Shape:**

```json
"dateColumn": "Sample Date"
```

**How it's used:**

- Must match the column name exactly as it appears in the actual fetched data (for a local file, this is the real JSON key after whitespace/slash cleanup is applied; for a URL source, it's the key as returned by the service).
- Used everywhere the visualization needs to read a row's date — aggregating data by month/year, and (for local files) filtering rows down to the configured or breakdown-derived date range.

**Required:** A missing or empty value causes the overlay to be skipped entirely, with a message logged to the console.

### `overlayConfigs.overlays.<overlayNickname>.auth`

Reserved for future authentication support. Not currently used by any implemented data source.

**Shape:**

```json
"auth": {
    "type": "none"
}
```

**Current behavior:** regardless of what's set here, no authentication is actually applied to any request today — this field is read nowhere in the fetch logic. It exists as a placeholder for when API-key or other authentication support is added (likely alongside a future `urlType: "external"` implementation).

**Note:** This is not currently required.Leave as `{ "type": "none" }` until authentication support is implemented.

### `overlayConfigs.overlays.<overlayNickname>.visualizationData`

Defines the individual data series available within this overlay — one entry per selectable source (e.g. separate north/south readings), each pulling from its own column in the fetched data.

**Shape:**

```json
"visualizationData": {
    "<sourceNickname>": {
        "column": "<exact column name in the data>",
        "label": "<display label>",
        "color": "<7-character hex code>",
        "order": <integer>
    }
}
```

**Field details:**

- `<sourceNickname>` — an internal key for this source, used in the overlay's selection value (e.g. `myOverlay::<sourceNickname>`). Not shown to the user directly.
- `column` — the exact column name this source reads its value from in the fetched data. **Required.** A source with a missing or empty `column` is skipped entirely and won't appear as an option.
- `label` — the display name shown to the user. Optional; if omitted or empty, the raw `column` name is used instead.
- `color` — a 7-character hex code (e.g. `#1f77b4`). Optional; if omitted or invalid, a color is automatically assigned from the shared `canonicalHexes` pool.
- `order` — controls display order relative to this overlay's other sources. Optional, but **all-or-nothing**: if even one source in this overlay is missing a valid integer `order`, every source in the overlay is re-alphabetized instead, ignoring any order values that were provided.

**Important — silent failure risk:** if `column` points to a name that doesn't exist in the real fetched data (a typo, or a mismatch with what the data source actually returns), this is **not caught or flagged**. The source will still appear as a selectable option, but every value will silently come back as `0` — rendering as a flat line indistinguishable from genuinely all-zero data. Double-check column names carefully against the real data; there is no error or warning for this specific mistake.

**Required:** At least one valid source (with a non-empty `column`) must be present, or the overlay is dropped entirely.

### `overlayConfigs.overlays.<overlayNickname>.addCombinedOption`

Adds an extra selectable option that combines two or more of this overlay's individual sources into one summed value, shown alongside the individual sources.

**Shape:**

```json
"addCombinedOption": true
```

**Valid values:** `true` or `false`.

**How it's used:**

- When `true`, the combined option (defined in `combinedOptionData`) appears as an additional choice alongside the individual entries from `visualizationData`.
- When `false`, only the individual sources are selectable, and `combinedOptionData` is ignored entirely.
- If this field is missing, empty, or not a real boolean, it's treated as `false`, and `combinedOptionOnly` is also forced to `false` — the overlay falls back to showing only its individual sources.

**Note:** no. Defaults to `false` if omitted.

### `overlayConfigs.overlays.<overlayNickname>.combinedOptionOnly`

Hides this overlay's individual sources entirely, leaving only the combined option (defined in `combinedOptionData`) selectable.

**Shape:**

```json
"combinedOptionOnly": true
```

**Valid values:** `true` or `false`.

**How it's used:**

- When `true`, the individual entries from `visualizationData` are never shown as separate selectable options — only the combined option appears. The individual sources are still used internally to compute the combined value; they're just not independently selectable.
- When `false`, individual sources remain selectable as normal. Whether the combined option *also* appears alongside them depends on `addCombinedOption`.
- If this field is missing, empty, or not a real boolean, it's treated as `false` (same fallback as `addCombinedOption`, applied together).

**Note:** Defaults to `false` if omitted. Typically used together with `addCombinedOption: true` — setting `combinedOptionOnly: true` without `addCombinedOption: true` would leave nothing selectable at all for this overlay.

### `overlayConfigs.overlays.<overlayNickname>.combinedOptionData`

Defines the combined option itself — its label, which columns get summed together, and its appearance. Only used when `addCombinedOption` (or `combinedOptionOnly`) is `true`.

**Shape:**

```json
"combinedOptionData": {
    "label": "<display label>",
    "combinedColumns": ["<column1>", "<column2>"],
    "color": "<7-character hex code>",
    "order": 999
}
```

**Field details:**

- `label` — the display name shown to the user for this combined option. **Required.** If missing or empty, the entire combined option is dropped, with a message logged to the console.
- `combinedColumns` — an array of column names to sum together to produce this option's value. **Required**, and every column listed must already exist as a `column` value somewhere in this overlay's `visualizationData` — you can only combine columns that are already declared as real individual sources. If this check fails (empty array, or any column not found among the declared sources), the entire combined option is dropped, with a message logged to the console.
- `color` — a 7-character hex code. Optional; if omitted or invalid, a color is automatically assigned from the shared `canonicalHexes` pool.
- `order` — always set internally to `999` and not currently configurable. **Note:** this value isn't actually used to control display order relative to other overlays — it's a fixed placeholder. Display order between different overlays' options is currently just config/iteration order.

**Required:** Only if `addCombinedOption` or `combinedOptionOnly` is `true`. If either is `true` but this field is missing or incomplete, the combined option is silently dropped and the overlay falls back to whatever individual sources are still valid (unless `combinedOptionOnly` was `true`, in which case nothing is selectable at all).

### `overlayConfigs.overlays.<overlayNickname>.yRightLabel`

The label shown on the chart's right-hand y-axis when this overlay is selected.

**Shape:**

```json
"yRightLabel": "Wastewater Level"
```

**How it's used:**

- Displayed as-is on the right axis whenever this overlay is the one currently selected.
- Make sure this label accurately describes what the values actually represent — for example, if the underlying data is aggregated (averaged per month/year rather than a raw count), say so explicitly (e.g. "Average Overdoses" rather than "Reported Overdoses") to avoid misleading anyone reading the chart.

**Required:** A missing or empty value causes the overlay to be dropped entirely, with a message logged to the console.`