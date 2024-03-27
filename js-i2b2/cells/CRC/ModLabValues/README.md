#How to Create a New Custom Data Type

1. Create **html**, **js**, and optionally css files and define in the CRC `cell_config_data.json`
2. In the js file create an object named i2b2.CRC.view[*<ENTER_CUSTOM_DATATYPE_NAME>*]
3. Implement the following 3 required functions:
   1. `parseMetadataXml(valueMetadataXml)`
      1. Returns a parsed version of the value metadata xml that will be provided as input to the showDialog and updateDisplayValue functions 
   2. `showDialog(sdxData, valueMetadata, queryPanelController, queryGroupId, eventId)` - Should display a dialog for the given concept and value metadata
      1. queryPanelController provides actions that can be performed on the concept 
         1. `redrawConcept(sdxData, groupIdx, eventIdx)` - This will re-render the concept in the query panel 
            1. sdxData.renderData(iconImg, title) can be modified to change the icon and text displayed in the UI 
            2. sdxData.dateRange can be modified to apply date ranges
      2. On close of showDialog sdxData.LabValues object should be updated with values for the following available properties set
         1. ValueFlag
         2. Value 
         3. ValueLow 
         4. ValueHigh 
         5. ValueString 
         6. ValueOperator
         7. isEnum 
         8. isString
   3. `updateDisplayValue(sdxData, valueMetadata)`
      1. This function should update the sdxData.renderData.title based on the LabValues
4. The following optional function can also be implemented:
   1. `getGeneralDataType()` - Returns the general data type to use to handle a given data type. This is useful if a data type has several subtypes. 
      1. The subtype would only need to define this function. The other functions for the general type will be called.
   2. `reportHtml(sdxData)` - This function should return either text or a html snippet that will be rendered in the query report pdf