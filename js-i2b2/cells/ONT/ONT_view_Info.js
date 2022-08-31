
i2b2.ONT.view.info = {
    model: {},
    newInstance: function(data) {
        alert("TODO: Implement i2b2.ONT.view.info.newInstance()");
    },
    load: function(data, display) {
        i2b2.ONT.view.info.model.sdxData = data;
        let displayData = {
            icon: data.renderData.iconImg,
            title: data.renderData.title,
            heirarchy: data.origData.tooltip,
            canGoUp: (parseInt(data.origData.level) > 1),
            key: data.sdxInfo.sdxKeyValue,
            escKey: JSON.stringify(data.sdxInfo.sdxKeyValue).replace(/((^")|("$))/g, "").trim(),
            path: data.origData.dim_code,
            escPath: JSON.stringify(data.origData.dim_code).replace(/((^")|("$))/g, "").trim(),
            table: data.origData.table_name,
            column: data.origData.column_name,
            operator: data.origData.operator,
            patientCnt: data.origData.total_num,
            children: []
        };
        i2b2.ONT.view.info.model.displayData = displayData;
        i2b2.ONT.view.info.render();
        if (display) i2b2.ONT.view.info.model.lm_view.parent.parent.setActiveContentItem(i2b2.ONT.view.info.model.lm_view.parent);
    },
    render: function() {
        let view = i2b2.ONT.view.info.model.viewport;
        $(view).empty();
        $(i2b2.ONT.view.info.model.template(i2b2.ONT.view.info.model.displayData)).appendTo(view);
        // attach click handlers
        $(".i2b2OntInfo i.bi-clipboard").on('click', (evt)=>{
            // copy to clipboard
            navigator.clipboard.writeText($(evt.target).data("clipContents"));
            // toggle icons
            $(evt.target).removeClass("bi-clipboard").addClass("bi-check-lg");
            setTimeout(()=>{
                $(evt.target).removeClass("bi-check-lg").addClass("bi-clipboard");
            },3000);
        });
    }
};



//================================================================================================== //
i2b2.events.afterCellInit.add((function(cell){
    if (cell.cellCode === "ONT") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.ONT.view.info",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                i2b2.ONT.view.info.model.lm_view = container;

                // change the tab's hover over to be the name of the term
                let funcRetitle = (function(sdxData) {
                    // this can only be run after a bit when the tab has been created in the DOM
                    console.dir(sdxData);
                    this.tab.element[0].title = "title";
                }).bind(container, i2b2.ONT.view.info.model.sdxData);

                container.on("titleChanged", funcRetitle);
                container.on("tab", funcRetitle);


                $.ajax("js-i2b2/cells/ONT/templates/OntologyTermInfo.html", {
                    success: (template) => {
                        i2b2.ONT.view.info.model.template = Handlebars.compile(template);
                        $(container).empty();
                        $(i2b2.ONT.view.info.model.template({})).appendTo($('.i2b2OntInfo', container._contentElement)[0]);
                    },
                    error: (error) => { console.error("Could not retrieve template: OntologyTermInfo.html"); }
                });
                i2b2.ONT.view.info.model.viewport = $('<div class="i2b2OntInfo"></div>').appendTo(container._contentElement);
            }).bind(this)
        );
    }
}));
