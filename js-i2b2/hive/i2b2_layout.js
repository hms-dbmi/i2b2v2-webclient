/**
 * @projectDescription	Main logic to implement Golden-Layout framework
 * @inherits 	i2b2
 * @namespace	i2b2.layout
 * @version 	2.0
 **/


console.group('Load & Execute component file: hive > layout');
console.time('execute time');

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
        settings: {
            hasHeaders:false
        },
        dimensions: {
            borderWidth: 6
        },
        content: [
            {
                type: 'row',
                content:[
                    {
                        type: 'component',
                        id:'goldenLayoutLeftColFrame',
                        width:35,
                        componentName: 'goldenLayoutLeftColFrame',
                        title:'goldenLayoutLeftColFrame'
                    },{
                        type: 'component',
                        id:'goldenLayoutRightColFrame',
                        componentName: 'goldenLayoutRightColFrame',
                        title:'goldenLayoutRightColFrame'
                    }
                ]
            }
        ]
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
            headerHeight:26,
            minItemHeight:36
        },
        content: [
            {
                type: 'column',
                content:[
                    {
                        type:'stack',
                        height:40,
                        content:[
                            {
                                type:'component',
                                isClosable:false,
                                componentName: "i2b2.ONT.view.nav",
                                title:'Terms'
                            }, {
                                type:'component',
                                isClosable:false,
                                componentName: "i2b2.ONT.view.info",
                                title:'Info'
                            }
                        ]
                    },{
                        type:'component',
                        isClosable:false,
                        componentName: 'i2b2.WORK.view.main',
                        title:'Workplace'
                    },{
                        type:'stack',
                        content:[
                            {
                                type:'component',
                                isClosable:false,
                                componentName: 'i2b2.CRC.view.history',
                                title:'Queries'
                            }
                        ]
                    }
                ]
            }
        ]
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
            headerHeight:26,
            minItemHeight:36
        },
        content:[
            {
                type:'component',
                componentName: 'whiteComponent'
            }
        ]
    };

    //////////////////////////////////////////
    // The query tool layout config
    //////////////////////////////////////////
    i2b2.layout.gl_configs.FindPatients = {
        type: 'column',
        id:'c2',
        content:[
            {
                type:'stack',
                height:40,
                content:[
                    {
                        type:'component',
                        height:80,
                        id:'crcQueryTool',
                        isClosable:false,
                        componentName: 'i2b2.CRC.view.QT',
                            title:'Find Patients'
                    },{
                        type:'component',
                        isClosable:false,
                        componentName: 'i2b2.PLUGIN.view.list',
                        title:'Analysis Tools'
                    }]
            },
            {
                type:'stack',
                height:25,
                content:[
                    {
                        type:'component',
                        id:'QR',
                        isClosable:false,
                        componentName: 'i2b2.CRC.view.QS',
                        title:'Query Status'
                    },{
                        type:'component',
                        isClosable:false,
                        componentName: 'i2b2.CRC.view.QR',
                        title:'Query Results'
                }]
            },
        ]
    };

    //////////////////////////////////////////
    // The analysis tool layout config
    //////////////////////////////////////////
    i2b2.layout.gl_configs.AnalysisTools = {
        type: 'column',
        id:'c2',
        content:[
            {
                type:'component',
                id:'AT',
                isClosable:false,
                componentName: 'whiteComponent',
                title:'Plugin Viewer'
            }
        ]
    };

    //////////////////////////////////////////
    // The full zoom layout config shell
    //////////////////////////////////////////
    i2b2.layout.gl_configs.fullZoom = {
        settings: {
            showPopoutIcon:false,
            reorderEnabled:false
        },
        dimensions: {
            borderWidth:10
        },
        content:[
            {
                type:'component',
                componentName: 'whiteComponent'
            }
        ]
    };

    //////////////////////////////////////////
    // Define components
    //////////////////////////////////////////
    var whiteComponent = function(container,state){
        container.getElement().html('<div class="cellWhite"><textarea>test content</textarea></div>');
    };

    //////////////////////////////////////////
    // Construct the layouts
    //////////////////////////////////////////

    // Wrapper layout
    i2b2.layout.gl_instances.main = new GoldenLayout(i2b2.layout.gl_configs.main, '#goldenLayoutId1' );
    i2b2.layout.gl_instances.main.registerComponent('goldenLayoutLeftColFrame', function(container,state){
        container.getElement().html('<div id="goldenLayoutColId1" class="goldenLayoutCol"></div>');
        container.on('resize',function() {
            $(window).trigger('resize');
        });
    });
    i2b2.layout.gl_instances.main.registerComponent('goldenLayoutRightColFrame', function(container,state){
        container.getElement().html('<div id="goldenLayoutColId2" class="goldenLayoutCol" style="left:3px"></div>');
    });
    i2b2.layout.gl_instances.main.init();
    i2b2.layout.gl_instances.main.on("stateChanged", function(obj){
        //HACK so that layout renders in Safari on initial load
        i2b2.layout.gl_instances.main.updateSize();
        i2b2.layout.gl_instances.main.off("stateChanged")
    });


    // Left column layout
    i2b2.layout.gl_instances.leftCol = new GoldenLayout( i2b2.layout.gl_configs.leftCol, '#goldenLayoutColId1' );
    i2b2.layout.gl_instances.leftCol.registerComponent('whiteComponent', whiteComponent);
    // ========== MAGIC TRICK ==========
    // delayed calling of all the registration callbacks registered by cells during their initialization
    for (var k in i2b2.layout.__regCallbacks) {
        i2b2.layout.gl_instances.leftCol.registerComponent(k,i2b2.layout.__regCallbacks[k]);
    }
    i2b2.layout.gl_instances.leftCol.init();


    // Right column layout
    i2b2.layout.gl_instances.rightCol = new GoldenLayout( i2b2.layout.gl_configs.rightCol, '#goldenLayoutColId2' );
    i2b2.layout.gl_instances.rightCol.registerComponent('whiteComponent', whiteComponent);
    i2b2.layout.gl_instances.rightCol.on('initialised',function(){
        i2b2.layout.gl_instances.rightCol.root.contentItems[0].remove();
        i2b2.layout.gl_instances.rightCol.root.addChild(i2b2.layout.gl_configs.FindPatients);
        glFindPatientsColumn = i2b2.layout.gl_instances.rightCol.root.contentItems[0];
    });
    // ========== MAGIC TRICK ==========
    // delayed calling of all the registration callbacks registered by cells during their initialization
    for (let k in i2b2.layout.__regCallbacks) {
        i2b2.layout.gl_instances.rightCol.registerComponent(k,i2b2.layout.__regCallbacks[k]);
    }
    i2b2.layout.gl_instances.rightCol.init();

    i2b2.layout.gl_instances.Zoom = new GoldenLayout( i2b2.layout.gl_configs.fullZoom, '#goldenLayoutId2' );
    i2b2.layout.gl_instances.Zoom.registerComponent('whiteComponent', function(){});
    i2b2.layout.gl_instances.Zoom.on('initialised',function(){
        i2b2.layout.gl_instances.Zoom.root.contentItems[0].remove();
    });
    // ========== MAGIC TRICK ==========
    // delayed calling of all the registration callbacks registered by cells during their initialization
    for (let k in i2b2.layout.__regCallbacks) {
        i2b2.layout.gl_instances.Zoom.registerComponent(k,i2b2.layout.__regCallbacks[k]);
    }
    i2b2.layout.gl_instances.Zoom.init();


    // setup resize handler
    $(window).resize(i2b2.layout.resize);

    // this is the master load signal for all cells to begin operations
    i2b2.events.afterHiveInit.fire();
};


// ================================================================================================== //
i2b2.events.afterLogin.add(
    (function() {
        // load the basic gui and attach the layout manager
        $("body").load("assets/main_display.html", i2b2.layout.init);
        // remove debugging functionality from GUI
        i2b2.h.debugElements(document.documentElement);
        // remove the analysis link if configuration tells us to
        // TODO: Manage this setting
    })
);


// ================================================================================================== //
console.timeEnd('execute time');
console.groupEnd();
