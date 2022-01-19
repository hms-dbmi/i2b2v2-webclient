console.group('Load & Execute component file: hive > layout');
console.time('execute time');

// ================================================================================================== //

i2b2.layout = {
    __regCallbacks: {},
    registerWindowHandler: function (windowKey, callback) {
        i2b2.layout.__regCallbacks[windowKey] = callback;
    }
};

i2b2.layout.resize = function() {
    // resize handler
    i2b2.layout.gl_instances.main.updateSize();
    var y = i2b2.layout.gl_instances.main.root.getItemsById("goldenLayoutLeftColFrame")[0].container.height;
    var w1 = i2b2.layout.gl_instances.main.root.getItemsById("goldenLayoutLeftColFrame")[0].container.width;
    var w2 = i2b2.layout.gl_instances.main.root.getItemsById("goldenLayoutRightColFrame")[0].container.width;
    i2b2.layout.gl_instances.leftCol.updateSize(w1 - 5, y - 22);
    i2b2.layout.gl_instances.rightCol.updateSize(w2 - 8, y - 22);
    if (i2b2.layout.gl_instances.Zoom.root) {
        i2b2.layout.gl_instances.Zoom.updateSize();
    }
};




i2b2.layout.setMode = function(mode) {

};


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
//            reorderEnabled:false,
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
                                title:'Navigate Terms'
                            },{
                                type:'component',
                                isClosable:false,
//                                componentName: 'i2b2.ONT.view.find',
                                componentName: 'blueComponent',
                                title:'Find'
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
                                title:'Previous Queries'
                            },{
                                type:'component',
                                isClosable:false,
                                componentName: 'blueComponent',
                                title:'Find'
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
                type:'component',
                height:80,
                id:'crcQueryTool',
                isClosable:false,
                componentName: 'i2b2.CRC.view.QT',
                title:'Query Tool'
            },{
                type:'component',
                id:'QS',
                isClosable:false,
                componentName: 'whiteComponent',
                title:'Show Query Status'
            }
        ]
    }

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
    }

    //////////////////////////////////////////
    // The full zoom layout config shell
    //////////////////////////////////////////
//    i2b2.layout.gl_configs.cfg4 = {
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
    }

    var blueComponent = function(container,state){
        container.getElement().html('<div class="cellBlue">This cell has a blue background and no padding.</div>');
    }


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


    // selectively add config options and refresh buttons to the tab bars
    var func_extendStackButtons = function(stack) {
        var btnConfig = false;
        var btnRefresh = false;

        if (typeof stack.config.content[0] === 'undefined') return false;
        switch (stack.config.content[0].componentName) {
            case "i2b2.ONT.view.nav":
            case "i2b2.CRC.view.history":
                btnConfig = true;
                btnRefresh = true;
                break;
            case "i2b2.CRC.view.QT":
                btnConfig = true;
                break;
            case "i2b2.WORK.view.main":
                btnRefresh = true;
                break;
        }

        // add configure options button
        if (btnConfig === true) {
            var tmpEl = stack.header.controlsContainer.prepend('<li class="stack-cfg-button" title="Configure Options"></li>');
            $('.stack-cfg-button' ,tmpEl).on('click', (function(a) {
                var cellCode = this.config.content[0].componentName.split('.');
                if (cellCode[0] === 'i2b2' && cellCode.length > 1) {
                    if (typeof i2b2[cellCode[1]].ctrlr.showOptions !== 'undefined' ) {
                        i2b2[cellCode[1]].ctrlr.showOptions(this.config.content[0].componentName);
                    }
                }
            }).bind(stack));
        }
        // add refresh all button
        if (btnRefresh === true) {
            var id = "stackRefreshIcon_" + stack.config.content[0].componentName.replace(/\./g,"-");
            // default the visual item as being loading
            var tmpEl = stack.header.controlsContainer.prepend('<li class="stack-refresh-button refreshing" title="Refresh All" id="'+id+'"></li>');
            $('.stack-refresh-button' ,tmpEl).on('click', (function (a) {
                var cellCode = this.config.content[0].componentName.split('.');
                if (cellCode[0] === 'i2b2' && cellCode.length > 1) {
                    if (typeof i2b2[cellCode[1]].ctrlr.refreshAll !== 'undefined') {
                        i2b2[cellCode[1]].ctrlr.refreshAll(this.config.content[0].componentName);
                    }
                }
            }).bind(stack));
        }
    };


    // Left column layout
    i2b2.layout.gl_instances.leftCol = new GoldenLayout( i2b2.layout.gl_configs.leftCol, '#goldenLayoutColId1' );
    i2b2.layout.gl_instances.leftCol.on('stackCreated', func_extendStackButtons);
    i2b2.layout.gl_instances.leftCol.registerComponent('whiteComponent', whiteComponent);
    i2b2.layout.gl_instances.leftCol.registerComponent('blueComponent', blueComponent);
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
    i2b2.layout.gl_instances.rightCol.on('stackCreated', func_extendStackButtons);
    // ========== MAGIC TRICK ==========
    // delayed calling of all the registration callbacks registered by cells during their initialization
    for (var k in i2b2.layout.__regCallbacks) {
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
    for (var k in i2b2.layout.__regCallbacks) {
        i2b2.layout.gl_instances.Zoom.registerComponent(k,i2b2.layout.__regCallbacks[k]);
    }
    i2b2.layout.gl_instances.Zoom.init();


    // setup resize handler
    $(window).resize(i2b2.layout.resize);


    // this is the master load signal for all cells to begin operations
    i2b2.events.afterHiveInit.fire();
};

// ================================================================================================== //
i2b2.events.afterLogin.add(function() {
    // load the basic gui and attach the layout manager
    $("body").load("assets/main_display.html", i2b2.layout.init);
});

// ================================================================================================== //


console.timeEnd('execute time');
console.groupEnd();
