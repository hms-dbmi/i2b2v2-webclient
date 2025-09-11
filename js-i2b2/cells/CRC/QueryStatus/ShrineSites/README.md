# [SHRINESITES] - SHRINE Sites Visualization Module
Written by Nick Benik in 2025

## Description

---

The SHRINE Sites visualization module is used to display the current status of the query as it is running on a SHRINE network.
It displays a sortable list with `"Site"`, `"Results"` representing the SHRINE site names and the results of the query at that site.
The results will usually display a patient count when the query is finished executing at the SHRINE site. It is also possible 
for the result to display the run status of the query at the site; being running, delayed, or error among others.  Sometimes it
is possible to get more information about the status by clicking the status message itself if it is a link (denoted by text underline).

It is possible to sort the chart by clicking on the 2 sort buttons within the "Site" and "Results" header.

The module is designed to poll the SHRINE plugin within the local i2b2 instance and retieve incremental updates over time.

### Definition within `breakdowns.json`
```json
{
  "PATIENT_SITE_COUNT_SHRINE_XML": {
    "SHRINESITES": true
  }, ...
}
```