// create and save the view object
i2b2.LEGACYPLUGIN.view.main = new i2b2Base_cellViewController(i2b2.LEGACYPLUGIN, 'main');


i2b2.LEGACYPLUGIN.view.options ={};

// ==================================================================================================

i2b2.LEGACYPLUGIN.view.main.onPluginFrameLoad = function(){
    if(!i2b2.PM.model.data.loginXMLStr) {
        i2b2.PM.model.data.loginXMLStr = i2b2.h.Xml2String(i2b2.PM.model.data.refXML);
        delete i2b2.PM.model.data.refXML;
    }

    let loginData = JSON.stringify(i2b2.PM.model.data);
    document.getElementById("pluginframe").contentWindow.postMessage(loginData, window.location.origin);
}

// ==================================================================================================

i2b2.events.afterCellInit.add((cell) => {
    if (cell.cellCode === "LEGACYPLUGIN") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.LEGACYPLUGIN.view.main",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE LEGACY PLUGIN CELL'S MAIN VIEW
                let pluginCode = container._config.componentPluginCode;
                let initializationDataRaw = container._config.componentPlugin.initializationData;

                let initializationData = JSON.stringify(initializationDataRaw);
                initializationData = btoa(initializationData);

                let iframe = $("<iframe id='pluginframe' onload='i2b2.LEGACYPLUGIN.view.main.onPluginFrameLoad()' src='' class='pluginCell' " +
                    "data-plugin-code='" + pluginCode +  "' data-initialization-data='" + initializationData + "'></iframe>");

                iframe.attr("src", "js-i2b2/cells/LEGACYPLUGIN/legacy_plugin/index.html");

                let frameDiv = $("<div class='cellWhite pluginCellMain'></div>");
                frameDiv.append(iframe);
                container.getElement().append(frameDiv);
                let exitLegacyPluginModalHTML = `<div class="modal fade" id="exitLegacyPluginModal" tabindex="-1" aria-labelledby="exitLegacyPluginModalLabel" aria-hidden="true" data-bs-backdrop="false" style="background-color: rgba(0, 0, 0, 0.5);">
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
                        <button type="button" class="btn btn-primary">Yes</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>                                                   
                    </div>
                    </div>
                </div>
            </div>`;

            // Append the modal immediately after the iframe
            frameDiv.after(exitLegacyPluginModalHTML);



                container.on('tab', (tab) => {

                    $(tab.header.parent.element).data("minimize", true);

                    let maximizePluginComponent = function(){
                        $(tab.header.parent.element).find(".lm_maximise").hide();
                        if(!tab.header.parent.isMaximised)
                        {
                            tab.header.parent.toggleMaximise();
                        }
                    }

                    let minimizeComponent = function(){
                        $(tab.header.activeContentItem.element).parent().parent().data("minimize", true);
                    }

                    let maximizeComponent = function(){
                        if(tab.header.activeContentItem.componentName !== "i2b2.LEGACYPLUGIN.view.main")
                        {
                            $(tab.header.activeContentItem.element).parent().parent().data("minimize", false);
                        }
                    }

                    let resetComponentState = function(){
                        $(tab.header.parent.element).find(".lm_maximise").show();
                        let minimized = $(tab.header.parent.element).data("minimize");
                        if(minimized && tab.header.parent.isMaximised){
                            tab.header.parent.toggleMaximise();
                        }
                    }

                    container.on('show', () => {
                        maximizePluginComponent();
                    });

                    container.on('hide', () => {
                        resetComponentState();
                    });

                    tab.header.parent.on("minimised", () => {
                        minimizeComponent();
                    });

                    tab.header.parent.on("maximised", () => {
                        maximizeComponent();
                    });

                   
                });
                 let funcRetitle = (function(title) {
                        // this can only be run after a bit when the tab has been created in the DOM
                        this.tab.element[0].classList.add('active-plugin'); 
                    }).bind(container);

                    container.on("tab", funcRetitle);

                    container.on( 'tab', function( tab ){
                        if($(tab.element).hasClass('active-plugin')) {
                            //add unique id to the term tab                       
    
                            let optionsBtn = $('<div id="activePluginOptions" class="menuOptions"><i class="bi bi-chevron-down" title="Plugin Options"></i></div>');
                            $(optionsBtn).insertAfter($(tab.element).find(".lm_title"));   
                            
                            i2b2.LEGACYPLUGIN.view.options.ContextMenu = new BootstrapMenu("#activePluginOptions", {
                                menuEvent: "click",
                                actions: {
                                    ClosePlugin: {
                                        name: 'Close Plugin',
                                        onClick: function (node) {
                                            i2b2.LEGACYPLUGIN.view.exitInstance(container);
                                        }
                                    }
                                }
                            });
    
                            
                        }
                    });
            }).bind(this)
        );
    }
});
i2b2.LEGACYPLUGIN.view.exitInstance = function(container){
    let exitLegacyPluginModal = new bootstrap.Modal(document.getElementById('exitLegacyPluginModal'), {
        keyboard: false
      });
      exitLegacyPluginModal.show();
      let modalDiv = document.getElementById('exitLegacyPluginModal');
      let modalBtns = modalDiv.getElementsByTagName('button');
      for (let i = 0; i < modalBtns.length; i++) {
          modalBtns[i].addEventListener('click', handleClick);
        }
        
        function handleClick(event) {
          let btn = event.currentTarget;
        
          let btnResult = btn.textContent;
        
          if(btnResult === 'Yes') {           
             container.close();          
          } 
          exitLegacyPluginModal.hide();
        
        }
      
};