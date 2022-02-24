i2b2.ONT.view.info = {
    windows: [],
    newInstance: function(data) {

    }
};



//================================================================================================== //
i2b2.events.afterCellInit.add((function(cell){
    if (cell.cellCode == "ONT") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.ONT.view.info",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                let temp = {
                    lm_view: container,
                    data: container._config.sdx
                };

                // i2b2.ONT.view.info.newInstance()
                i2b2.ONT.view.info.windows.push(temp);

                // change the tab's hover over to be the name of the term
                let funcRetitle = (function(title) {
                    // this can only be run after a bit when the tab has been created in the DOM
                    this.tab.element[0].title = title;
                }).bind(container, temp.data.renderData.moreDescriptMinor);

                container.on("titleChanged", funcRetitle);
                container.on("tab", funcRetitle);


                // add the cellWhite flare
                let treeTarget = $('<div class="cellWhite" id="i2b2OntInfo">this is term info</div>').appendTo(container._contentElement);
            }).bind(this)
        );
    }
}));
