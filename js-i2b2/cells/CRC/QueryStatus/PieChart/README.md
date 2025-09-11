# [PIECHART] - Pie Chart Visualization Module
Written by Nick Benik in 2025


## Description

---
The Pie Chart visualization module is designed to display a breakdown as a pie chart.  It has the option to hide various
returned entries using two options.  

The first option is called `"hideZeros"` and is configured with a boolean value.  When the value is **true** then any 
breakdown result row that contains a zero count is not displayed in the pie chart.

The second option is called `"hideEntries"` and is an array of strings.  When generating the pie chart it checks each 
breakdown row's label and sees if it exists within the `"hideEntries"` array.  If it is found in the array then the row
is not displayed in the pie chart.  This is useful for hiding entries which represent a combination of other rows, such
as a row representing a count of "all children" or "all adults" whereas you want to display only the results for each 
individual row representing a specific age bucket (for example 1-5yrs, 6-13yrs, 14-20yrs, 21-35yrs, 36-55yrs, 56-72yrs, 73+yrs). 


### Definition within `breakdowns.json`
```json
{
  "PATIENT_AGE_COUNT_XML": {
    "PIECHART": {
      "hideEntries": [
        "(children) < 18 years old",
        "(adults) >= 18 years old",
        ">= 90 years old",
        ">= 85 years old",
        ">= 65 years old"
      ],
      "hideZeros": true
    }
  }, ...
}
```