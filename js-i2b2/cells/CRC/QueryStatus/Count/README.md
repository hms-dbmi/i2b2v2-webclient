# [COUNT] - Total Counts Visualization Module
Written by Nick Benik in 2025

## Description

---
The Total Counts visualization module is used to show end-users a total patient count for the query. It is designed to 
run against only the `"PATIENT_COUNT_XML"` and `"PATIENT_COUNT_SHRINE_XML"` breakdown types.  For SHRINE queries is also
displays the number of sites currently reporting results and the total number of sites that the query was sent to.

It has no configuration options.

### Definition within `breakdowns.json`
```json
{
  "PATIENT_COUNT_XML": {
    "COUNT": true
  },
  "PATIENT_COUNT_SHRINE_XML": {
    "COUNT": true
  }
}
```