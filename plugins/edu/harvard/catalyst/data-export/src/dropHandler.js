

export default function sdxDropHandler(sdx,ev) {
    let rowNum = null;
    // see if drop is on a row
    let row = ev.target.closest(".MuiDataGrid-row");
    if (row === null) {
        // see if the drop was on the header
        row = ev.target.closest(".MuiDataGrid-columnHeaders");
        if (row !== null) {
            // insert the drop at the very top
            rowNum = Number.NEGATIVE_INFINITY;
        } else {
            // insert to drop at the very bottom
            rowNum = Number.POSITIVE_INFINITY;
        }
    } else {
        // insert the drop below the currently set row
        rowNum = row.dataset.rowindex;
    }
    console.log("dropped on row: " + rowNum);
}