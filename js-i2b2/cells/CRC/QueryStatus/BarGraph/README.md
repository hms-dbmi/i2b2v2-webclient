# [BARS] - Bar Graph Visualization Module
Written by Nick Benik in 2025

## Description

---
The Bar Graph visualization module is used to display a breakdown's data in a bar graph format.

It has three configuration options:

| Configuration Variable | Description                                                                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `maxLabelLength`       | Used to limit the maximum length of the label to be displayed in the lower bar graph labels. The default value for is 150 characters.            |
| `textColor`            | Used to define the color used for the text labels on the left and bottom sides of the bar graph. <br/>The default value is `var(--text-primary-dark)` |
| `barColor`             | Used to define the color used for the bars within the visualization.                                                                             |

### Definition within `breakdowns.json`
```json
{
  "PATIENT_GENDER_COUNT_XML": {
    "BARS": true
  },
  "PATIENT_SEX_COUNT_XML": {
    "BARS": true
  },
  "PATIENT_TOP20MEDS_XML": {
    "BARS": {
      "maxLabelLength": 15,
      "textColor": "#990000",
      "barColor": "#F0F"
    }
  }, ...
}
```