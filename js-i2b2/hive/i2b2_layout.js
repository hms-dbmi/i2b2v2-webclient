/**
 * @projectDescription	Main logic to implement Golden-Layout framework
 * @inherits 	i2b2
 * @namespace	i2b2.layout
 * @version 	2.0
 **/

// ================================================================================================== //
i2b2.layout = {
    __regCallbacks: {},
    registerWindowHandler: function (windowKey, callback) {
        i2b2.layout.__regCallbacks[windowKey] = callback;
    }
};


// ================================================================================================== //
i2b2.layout.resize = function() {
    // resize handler
    i2b2.layout.gl_instances.main.updateSize();
    let y = i2b2.layout.gl_instances.main.root.getItemsById("goldenLayoutLeftColFrame")[0].container.height;
    let w1 = i2b2.layout.gl_instances.main.root.getItemsById("goldenLayoutLeftColFrame")[0].container.width;
    let w2 = i2b2.layout.gl_instances.main.root.getItemsById("goldenLayoutRightColFrame")[0].container.width;
    i2b2.layout.gl_instances.leftCol.updateSize(w1 - 5, y - 22);
    i2b2.layout.gl_instances.rightCol.updateSize(w2 - 8, y - 22);
    if (i2b2.layout.gl_instances.Zoom.root) {
        i2b2.layout.gl_instances.Zoom.updateSize();
    }
};


// ================================================================================================== //
i2b2.layout.init = function () {
    i2b2.layout.gl_configs = {};
    i2b2.layout.gl_instances = {};

    //////////////////////////////////////////
    // The wrapper layout config
    //////////////////////////////////////////
    i2b2.layout.gl_configs.main = {
        settings: { hasHeaders:false },
        dimensions: { borderWidth: 6 },
        content: [{
                type: 'row',
                content:[
                    {
                        type: 'component',
                        id:'goldenLayoutLeftColFrame',
                        componentName: 'goldenLayoutLeftColFrame',
                        width:35
                    },{
                        type: 'component',
                        id:'goldenLayoutRightColFrame',
                        componentName: 'goldenLayoutRightColFrame'
                    }
                ]
        }]
    };

    //////////////////////////////////////////
    // The left column layout config
    //////////////////////////////////////////
    i2b2.layout.gl_configs.leftCol = {
        settings: {
            showPopoutIcon:false,
            reorderEnabled:true,
            constrainDragToContainer: true
        },
        dimensions: {
            borderWidth:10,
            headerHeight:30,
            minItemHeight:36
        }
    };



    //////////////////////////////////////////
    // The right column layout config shell
    //////////////////////////////////////////
    i2b2.layout.gl_configs.rightCol = {
        settings: {
            showPopoutIcon:false,
            reorderEnabled:false
        },
        dimensions: {
            borderWidth:10,
            headerHeight:30,
            minItemHeight:36
        }
    };


    //////////////////////////////////////////
    // The full zoom layout config shell
    //////////////////////////////////////////
    i2b2.layout.gl_configs.fullZoom = {
        settings: {
            showPopoutIcon:false,
            reorderEnabled:false
        },
        dimensions: { borderWidth:10 },
        content:[{
                type:'component',
                componentName: 'emptyComponent'
        }]
    };


    //////////////////////////////////////////
    // Construct the main layout
    //////////////////////////////////////////

    // Wrapper layout
    i2b2.layout.gl_instances.main = new GoldenLayout(i2b2.layout.gl_configs.main, '#goldenLayoutId1' );
    i2b2.layout.gl_instances.main.registerComponent('goldenLayoutLeftColFrame', function(container,state) {
        container.getElement().html('<div id="goldenLayoutColId1" class="goldenLayoutCol"></div>');
        container.on('resize',function() {
            $(window).trigger('resize');
        });
    });
    i2b2.layout.gl_instances.main.registerComponent('goldenLayoutRightColFrame', function(container,state) {
        container.getElement().html('<div id="goldenLayoutColId2" class="goldenLayoutCol" style="left:3px"></div>');
    });
    i2b2.layout.gl_instances.main.init();
    i2b2.layout.gl_instances.main.on("stateChanged", (obj) => {
        // HACK so that layout renders in Safari on initial load
        i2b2.layout.gl_instances.main.updateSize();
        i2b2.layout.gl_instances.main.off("stateChanged")
    });

    // Zoom layout
    i2b2.layout.gl_instances.Zoom = new GoldenLayout( i2b2.layout.gl_configs.fullZoom, '#goldenLayoutId2' );
    i2b2.layout.gl_instances.Zoom.registerComponent('emptyComponent', function() {});
    i2b2.layout.gl_instances.Zoom.on('initialised', () => {
        // remove the placeholder component
        i2b2.layout.gl_instances.Zoom.root.contentItems[0].remove();
    });
    i2b2.layout.gl_instances.Zoom.init();

    // setup resize handler
    $(window).resize(i2b2.layout.resize);


    //////////////////////////////////////////
    // load the layout configuration file
    //////////////////////////////////////////
    $.getJSON("js-i2b2/i2b2_tabs.json", (layoutConfig) => {
        let func_expandContent = function(inContent) {
            let localContent = inContent.content;
            for (let entry of localContent) {
                if (entry.type === undefined || entry.componentName !== undefined) {
                    // this is a component, add in missing defaults
                    entry.type = 'component';
                    if (entry.isClosable === undefined) entry.isClosable = false;
                } else if (Array.isArray(entry.content)) {
                    func_expandContent(entry);
                } else {
                    console.error("Unrecognized entry in i2b2_tabs.json");
                }
            }
        };

        let func_processCol = function(colBase, colIn) {
            if (colIn.settings) colBase.settings = {...colBase.settings, ...colIn.settings};
            if (colIn.dimensions) colBase.dimensions = {...colBase.dimensions, ...colIn.dimensions};
            let tempExpand = {type:"column", ...colIn};
            func_expandContent(tempExpand);
            colBase.content = [tempExpand];
        }

        // handle importing the column configurations
        func_processCol(i2b2.layout.gl_configs.leftCol, layoutConfig['left-column']);
        func_processCol(i2b2.layout.gl_configs.rightCol, layoutConfig['right-column']);

        // Create the column layouts
        i2b2.layout.gl_instances.leftCol = new GoldenLayout( i2b2.layout.gl_configs.leftCol, '#goldenLayoutColId1' );
        i2b2.layout.gl_instances.rightCol = new GoldenLayout( i2b2.layout.gl_configs.rightCol, '#goldenLayoutColId2' );

        // ========== MAGIC TRICK ==========
        // delayed calling of all the registration callbacks registered by cells during their initialization
        for (var k in i2b2.layout.__regCallbacks) {
            i2b2.layout.gl_instances.leftCol.registerComponent(k, i2b2.layout.__regCallbacks[k]);
            i2b2.layout.gl_instances.rightCol.registerComponent(k, i2b2.layout.__regCallbacks[k]);
        }

        // initialize the main display
        i2b2.layout.gl_instances.leftCol.init();
        i2b2.layout.gl_instances.rightCol.init();

        // this is the master load signal for all cells to begin operations
        i2b2.events.afterHiveInit.fire();
    });


};

// ================================================================================================== //
i2b2.events.afterLogin.add(
    (function() {
        // load the basic gui and attach the layout manager
        $("body").load("assets/main_display.html", () => {
            // remove debugging functionality from GUI
            i2b2.h.debugElements(document.documentElement);

            // Handle footer bar if configured
            if (i2b2.UI.cfg.footer && i2b2.UI.cfg.footer?.active !== false) {
                // deal with adding the bar height style
                if (i2b2.UI.cfg.footer.height) document.documentElement.style.setProperty("--FooterBarHeight", i2b2.UI.cfg.footer.height);
                if (i2b2.UI.cfg.footer.file) $("#footer-bar").load(i2b2.UI.cfg.footer.file);
            }

            // start the application loading process
            i2b2.layout.init();
        });
    })
);
