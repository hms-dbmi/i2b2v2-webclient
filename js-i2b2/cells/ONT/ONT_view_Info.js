
i2b2.ONT.view.info = {
    model: {},
    showLabWindow: function() {
        // display's the lab value entry modal
        let d = i2b2.ONT.view.info.model.sdxData.origData.basecode;
        if (d && d.startsWith("LOINC") || d.startsWith("LCS-I2B2")) i2b2.CRC.view.QT.labValue.showLabValues(i2b2.ONT.view.info.model.sdxData);
    },
    loadParent: function() {
        // generate the parent's key
        let parentKey = i2b2.ONT.view.info.model.sdxData.sdxInfo.sdxKeyValue.split('\\');
        parentKey.pop();
        parentKey.pop();
        parentKey.push('');
        parentKey = parentKey.join('\\');
        // fire the AJAX call to get the parent's info
        let scopeCB = new i2b2_scopedCallback(function(i2b2CellMsg) {
            if (!i2b2CellMsg.error) {
                let c = i2b2CellMsg.refXML.getElementsByTagName('concept');
                if (c.length > 0) {
                    // load the parent
                    let {sdx, tv} = i2b2.ONT.ctrlr.gen.generateNodeData(c[0]);
                    i2b2.ONT.view.info.load(sdx);
                }
            } else {
                alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
            }
        }, i2b2.ONT.view.info.model.displayData);
        let searchOptions = {};
        searchOptions.ont_max_records = "max='200'";
        searchOptions.ont_synonym_records = true;
        searchOptions.ont_hidden_records = true;
        searchOptions.concept_key_value = parentKey;
        i2b2.ONT.ajax.GetTermInfo("ONT:Info", searchOptions, scopeCB);
    },
    load: function(data, display) {
        i2b2.ONT.view.info.model.sdxData = data;

        // create written description
        let children1 = data.origData.hasChildren.substring(1,0);
        let termDescript = "This term is a ";
        if (children1 === "C"){
            termDescript += 'non-draggable ';
        } else {
            termDescript += 'draggable ';
        }
        if (children1 === "C" || children1 === "F" || children1 === "O" || children1 === "D"){
            termDescript += 'folder ';
        } else {
            termDescript += 'leaf node ';
        }
        termDescript += 'which ';
        if (children1 === "C"){
            termDescript += 'cannot ';
        } else {
            termDescript += 'can ';
        }
        termDescript += 'be used in a query. The term ';
        if (typeof data.origData.basecode !== "undefined"){
            termDescript += 'represents the code of <span class="basecode">' + data.origData.basecode + '</span> and ';
        }
        if (children1 === "C" || children1 === "F" || children1 === "O" || children1 === "D"){
            termDescript += 'may ';
        } else {
            termDescript += 'does not ';
        }
        termDescript += 'have children below it.';

        // deal with lab values
        let hasValues = false;
        if (data.origData.basecode && (data.origData.basecode.startsWith("LOINC") || data.origData.basecode.startsWith("LCS-I2B2"))) hasValues = true;

        // create display data for handlebars template
        let displayData = {
            icon: data.renderData.iconImg,
            title: data.renderData.title,
            descript: termDescript,
            heirarchy: data.origData.tooltip,
            canGoUp: (parseInt(data.origData.level) > 1),
            key: data.sdxInfo.sdxKeyValue,
            escKey: JSON.stringify(data.sdxInfo.sdxKeyValue).replace(/((^")|("$))/g, "").trim(),
            path: data.origData.dim_code,
            escPath: JSON.stringify(data.origData.dim_code).replace(/((^")|("$))/g, "").trim(),
            hasSQL: data.origData.operator.toUpperCase() === "LIKE",
            table: data.origData.table_name,
            column: data.origData.column_name,
            operator: data.origData.operator,
            patientCnt: data.origData.total_num,
            children: [],
            hasValues: hasValues
        };
        i2b2.ONT.view.info.model.displayData = displayData;

        // get the children of the node
        let scopeCB = new i2b2_scopedCallback(function(i2b2CellMsg) {
            if (!i2b2CellMsg.error) {
                let c = i2b2CellMsg.refXML.getElementsByTagName('concept');
                for (let i=0; i<1*c.length; i++) {
                    let {sdx, tv} = i2b2.ONT.ctrlr.gen.generateNodeData(c[i]);
                    // save the node to the ONT data model
                    i2b2.ONT.view.info.model.displayData.children.push(sdx);
                }
            } else {
                alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
            }
            // rerender the screen to show the child nodes
            i2b2.ONT.view.info.render();
            // create click handlers for the child links
            $('.i2b2OntInfo .child-link a').on('click', (evt) => {
                let key = $(evt.target).data('sdxKey');
                let data = i2b2.ONT.view.info.model.displayData.children.filter((child) => { return child.sdxInfo.sdxKeyValue == key });
                if (data.length > 0) {
                    // scroll to the top of the window
                    i2b2.ONT.view.info.model.viewport[0].scrollTop = 0;
                    // load the new term
                    i2b2.ONT.view.info.load(data[0]);
                }
            });

        }, i2b2.ONT.view.info.model.displayData);
        // fire the AJAX call
        let options = {};
        options.version = "1.2";
        options.ont_max_records = "";
        options.ont_hidden_records = false;
        options.ont_synonym_records = false;
        options.concept_key_value = data.sdxInfo.sdxKeyValue;
        i2b2.ONT.ajax.GetChildConcepts("ONT:Info", options, scopeCB);

        // render what we have and make the tab active if asked to do so
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
