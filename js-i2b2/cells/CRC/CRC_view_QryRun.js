/**
 * @projectDescription	View controller for CRC Query Runner window.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.QR
 * @author		Nick Benik
 * @version 	2.0
 * ----------------------------------------------------------------------------------------
 * updated 2-3-2022: Relaunch [Nick Benik]
 */
console.group('Load & Execute component file: CRC > view > Query Runner');
console.time('execute time');

// create and save the view objects
i2b2.CRC.view['QR'] = new i2b2Base_cellViewController(i2b2.CRC, 'QR');

i2b2.CRC.view.QR.render = function() {
    $(i2b2.CRC.view.QR.containerDiv).empty();

    $((Handlebars.compile("{{> QueryRunner}}"))(i2b2.CRC.model.runner)).appendTo(i2b2.CRC.view.QR.containerDiv);

    // TODO: attach event handlers

};

i2b2.CRC.view.QR.timerTick = function() {
    i2b2.CRC.model.runner.elapsedTime = Math.round((new Date() - i2b2.CRC.model.runner.startTime) / 100) / 10;
    i2b2.CRC.view.QR.render();
};


// ================================================================================================== //
// This is done once the entire cell has been loaded
console.info("SUBSCRIBED TO i2b2.events.afterCellInit");
i2b2.events.afterCellInit.add(
    function (cell) {
        if (cell.cellCode == 'CRC') {
// ================================================================================================== //
            console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');

            // ___ Register this view with the layout manager ____________________
            i2b2.layout.registerWindowHandler("i2b2.CRC.view.QR",
                (function (container, scope) {
                    // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                    cell.view.QR.lm_view = container;

                    // add the cellWhite flare
                    cell.view.QR.containerDiv = $('<div class="CRC_QR_view"></div>').appendTo(cell.view.QR.lm_view._contentElement);


                    // TODO: add rest of initialization code here
                    container.on('open', () => {
                    });

                    // Show initial screen
                    i2b2.CRC.view.QR.render();
                }).bind(this)
            );

// !!! Do this properly via the "cell_config_data.json" file
//            // Attach the stylesheets
//            $('<link type="text/css" rel="stylesheet" href="js-i2b2/cells/CRC/assets/QueryRunner.css">').appendTo($("head")[0]);


            // load the templates (TODO: Refactor this to loop using a varname/filename list)
            // TODO: Refactor templates to use Handlebars partals system
            // ---------------------------------------------------------
            // cell.view.QR.template = {};
            // $.ajax("js-i2b2/cells/CRC/templates/QueryRunner.html", {
            //     success: (template) => {
            //         cell.view.QR.template.main = Handlebars.compile(template);
            //     },
            //     error: (error) => {
            //         console.error("Could not retrieve template: QueryRunner.html");
            //     }
            // });
            // ---------------------------------------------------------
            $.ajax("js-i2b2/cells/CRC/templates/QueryRunner.html", {
                success: (template, status, req) => {
                    Handlebars.registerPartial("QueryRunner", req.responseText);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: QueryRunner.html"); }
            });

        }
    }
);

console.timeEnd('execute time');
console.groupEnd();
