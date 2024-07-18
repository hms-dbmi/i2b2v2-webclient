if (i2b2.PLUGIN.view === undefined) i2b2.PLUGIN.view = {};
i2b2.PLUGIN.view.options ={};
i2b2.PLUGIN.view.windows = [];
i2b2.PLUGIN.view.newInstance = function(pluginId, initializationData) {
    // get the plugin info from the model
    const pluginData = i2b2.PLUGIN.model.plugins[pluginId];
    if (pluginData === undefined) {
        console.error("Plugin does not exist: " + pluginId);
        return false;
    }
    pluginData.initializationData = initializationData;

    let componentName = 'i2b2.PLUGIN.view';
    let pluginTitle = pluginData.title;
    if(pluginData.isLegacy){
        componentName = 'i2b2.LEGACYPLUGIN.view.main';
        pluginTitle = pluginData.name;
    }
    
    // create the new tab configuration
    let newPluginWindow = {
        type:'component',
        isClosable:true,
        componentName: componentName,
        componentPlugin: pluginData,
        componentPluginCode: pluginId,
        title:pluginTitle
    };
    // this function creates or replaces the current plugin tab with this new plugin
    if (i2b2.layout.gl_instances.rightCol.root.contentItems[0].contentItems[0].contentItems.length > 2) {
        i2b2.layout.gl_instances.rightCol.root.contentItems[0].contentItems[0].contentItems[2].remove();
    }
    i2b2.layout.gl_instances.rightCol.root.contentItems[0].contentItems[0].addChild(newPluginWindow, 2);
};

//================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
    if (cell.cellCode === "PLUGIN") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.PLUGIN.view",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                let windowEntry = {
                    lm_view: container,
                    data: container._config.componentPlugin,
                    title: container._config.title,
                    state: {}
                };
                windowEntry.data.code = container._config.componentPluginCode;

                // i2b2.ONT.view.info.newInstance()
                i2b2.PLUGIN.view.windows.push(windowEntry);

                // change the tab's hover over to be the name of the plugin and add an id of activePlugin
                let funcRetitle = (function(title) {
                    // this can only be run after a bit when the tab has been created in the DOM
                    this.tab.element[0].title = title;
                    this.tab.element[0].classList.add('active-plugin');
                         
                    
                }).bind(container, windowEntry.title);

                           

                container.on("titleChanged", funcRetitle);
                container.on("tab", funcRetitle);

                container.on( 'tab', function( tab ){
                    if($(tab.element).hasClass('active-plugin')) {                                          

                        let optionsBtn = $('<div id="activePluginOptions" class="menuOptions"><i class="bi bi-chevron-down" title="Plugin Options"></i></div>');
                        $(optionsBtn).insertAfter($(tab.element).find(".lm_title"));   

                        i2b2.PLUGIN.view.options.ContextMenu = new BootstrapMenu("#activePluginOptions", {
                            menuEvent: "click",
                            actions: {
                                ClosePlugin: {
                                    name: 'Close Plugin',
                                    onClick: function (node) {
                                       i2b2.PLUGIN.view.exitInstance(container);
                                    }
                                }
                            }
                        });

                        
                    }
                });

                // create the iframe and load the plugin into it
                let iframeTarget = $('<iframe class="i2b2PluginIFrame" src="'+windowEntry.data.url+'" title="'+windowEntry.data.title+'"></iframe>').appendTo(container._contentElement)[0];
                console.log(windowEntry.title);
                let exitPluginModalHTML = `<div class="modal fade" id="exitPluginModal" tabindex="-1" aria-labelledby="exitPluginModalLabel" aria-hidden="true" data-bs-backdrop="false" style="background-color: rgba(0, 0, 0, 0.5);">
                                            <div class="modal-dialog">
                                                <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="exitPluginModalLabel">Close this Plugin? </h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    Closing this plugin will stop all processes in the plugin and return you to the Analysis Tools Tab. Do you want to proceed?
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary trigger-close">Yes</button>
                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>                                                   
                                                </div>
                                                </div>
                                            </div>
                                        </div>`;

              
                $(container._contentElement).append(exitPluginModalHTML);


            }).bind(this)
        );
    }
});

//================================================================================================== //
i2b2.PLUGIN.view.exitInstance = function(container){
    let exitPluginModal = new bootstrap.Modal(document.getElementById('exitPluginModal'), {
        keyboard: false
    });
   
    exitPluginModal.show();
       
    let modalDiv = document.getElementById('exitPluginModal');
    let triggerClose = modalDiv.getElementsByClassName('trigger-close');
    
    triggerClose[0].addEventListener('click', handleClick);
    
      
      function handleClick(event) {
        container.close();    
           
        for (let i in i2b2.PLUGIN.view.windows) {
            let windowRef = i2b2.PLUGIN.view.windows[i].lm_view;
            if (windowRef === container) {
                i2b2.PLUGIN.view.windows.splice(i, 1); 
                break; 
            } 
        }        
        exitPluginModal.hide();
      
      }     
};