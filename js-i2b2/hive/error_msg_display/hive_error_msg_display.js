$('.toast').toast();

i2b2.hive.errorMsgDisplay = {
    show: (msg) => {
        if(msg.msgRecv.msg?.length > 0 && i2b2.PM.model.projects){
            try {
                const GLOBAL_ERROR_MESSAGE_PARAM_NAME = "Global Error Message";
                const DISABLE_GLOBAL_ERROR_MESSAGE_PARAM_NAME = "Disable Global Error Message";

                const projectParamsArr = Object.entries(i2b2.PM.model.projects[i2b2.PM.model.login_project].details);
                const projectLevelEnabled = projectParamsArr.filter(param => param.length > 1
                    &&  param[1].name === DISABLE_GLOBAL_ERROR_MESSAGE_PARAM_NAME
                    && param[1].value !== "true").length !== 0;
                const projectLevelDisabled = projectParamsArr.filter(param => param.length > 1
                    &&  param[1].name === DISABLE_GLOBAL_ERROR_MESSAGE_PARAM_NAME
                    && param[1].value === "true").length !== 0;

                const projectLevelGlobalMessage = projectParamsArr.filter(param => param.length > 1 && param[1].name === GLOBAL_ERROR_MESSAGE_PARAM_NAME);

                const globalLevelEnabled = (i2b2.hive.model.globalParams !== undefined
                    && (i2b2.hive.model.globalParams[DISABLE_GLOBAL_ERROR_MESSAGE_PARAM_NAME] !== undefined
                    &&  (i2b2.hive.model.globalParams[DISABLE_GLOBAL_ERROR_MESSAGE_PARAM_NAME].innerHTML !== "true")
                    || !i2b2.hive.model.globalParams[DISABLE_GLOBAL_ERROR_MESSAGE_PARAM_NAME]));
                const globalLevelGlobalMessage = i2b2.hive.model.globalParams[GLOBAL_ERROR_MESSAGE_PARAM_NAME] ?
                    i2b2.hive.model.globalParams[GLOBAL_ERROR_MESSAGE_PARAM_NAME].innerHTML : '';

                if(i2b2.h.checkXmlResponseForErrors(msg.msgRecv.msg) &&
                    (!projectLevelDisabled && (globalLevelEnabled || projectLevelEnabled))
                ){
                    if(projectLevelEnabled && projectLevelGlobalMessage.length > 0){
                        $(".toast-body")[0].innerHTML = projectLevelGlobalMessage[0][1].value;
                    }
                    else if(!projectLevelDisabled && globalLevelEnabled && globalLevelGlobalMessage.length > 0){
                        $(".toast-body")[0].innerHTML = i2b2.h.Unescape(globalLevelGlobalMessage);
                    }

                    let i2b2Url = window.location;
                    i2b2Url = i2b2Url.length > 31 ? i2b2Url.slice(0, 30) + "..." : i2b2Url;

                    $(".toast-header .header-title").text("[" + i2b2Url + "] says: ");
                    $(".toast-time").text(msg.msgRecv.when);
                    $('.toast').toast('show');
                }
            }catch(e){
                console.error("Error parsing i2b2 response for errors. ", e);
            }
        }
    }
}