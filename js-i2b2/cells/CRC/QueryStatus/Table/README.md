# [TABLE] -  Visualization Module
Written by Nick Benik in 2025
## Description

---
The Table visualization module is used to display a breakdown's data in a table format.

It has no configuration options.

### Definition within `breakdowns.json`
```json
{
  "PATIENT_GENDER_COUNT_XML": {
    "TABLE": true
  },
  "PATIENT_SEX_COUNT_SHRINE_XML": {
    "TABLE": true
  },
  "PATIENT_VITALSTATUS_COUNT_XML": {
    "TABLE": {
      "forceInitialDisplay": true
    }
  }, ...
}
```
