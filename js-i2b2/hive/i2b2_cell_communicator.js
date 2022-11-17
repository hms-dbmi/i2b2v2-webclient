/**
 * @projectDescription	Standard Data Exchange (SDX) subsystem's core message router.
 * @inherits 	i2b2
 * @namespace	i2b2
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 **/
i2b2.hive.communicatorFactory = function(cellCode){

    try {
        var cellURL = i2b2[cellCode].cfg.cellURL;
    }
    catch (e) {}
    if (!cellURL) {
        console.warn("communicatorFactory: '"+cellCode+"' does not have a cellURL specified");
    }

    function i2b2Base_communicator(){}
    var retCommObj = new i2b2Base_communicator;
    retCommObj.ParentCell = cellCode;
    retCommObj.globalParams = {}; //TODO: remove this => new Hash;
    retCommObj.cellParams = {}; //TODO: remove this => new Hash;
    retCommObj._commData = {};
    // setup for sniffer message
    retCommObj._SniffMsg =  $.Callbacks(); //TODO: remove this => new YAHOO.util.CustomEvent('CellCommMessage');

    retCommObj._addFunctionCall = function(name, url_string, xmlmsg, escapeless_params, parseFunc){
        var protectedNames = ["ParentCell", "globalParams", "cellParams", "_commMsgs", "_addFunctionCall", "_doSendMsg", "_defaultCallbackOK", "_defaultCallbackFAIL"];
        if (protectedNames.indexOf(name) !== -1) {
            console.error("Attempt to build communicator call [" + name + "] failed because it is a protected name");
            return false;
        }
        if (!$.isArray(escapeless_params)) { escapeless_params = []; }
        escapeless_params.push("proxy_info");
        escapeless_params.push("sec_pass_node");
        this._commData[name] = {
            msg: xmlmsg,
            url: url_string,
            dont_escape_params: escapeless_params
        };
        // create a named redirector function on the main communicator object
        this[name] = new Function("return this._doSendMsg.call(this, '"+name+"', arguments[0], arguments[1], arguments[2], arguments[3]);");
        // save the passed parse() function

        if (parseFunc) {
            // - the parse() function will be passed the communicator packet and is expected to return the reference to the communicator packet.
            // - the parse() function is responsible for creating and populating the "model" namespace withing the communicator packet.
            this._commData[name].parser = parseFunc;
        }
        // register with the sniffer subsystem
        //    channelName: "CELLNAME",
        //    channelActions: ["the names", "of the", "Cell's server calls"],
        //    channelSniffEvent: {yui custom event}
        var msg = {
            channelName: this.ParentCell,
            channelActions: Object.keys(this._commData),
            channelSniffEvent: this._SniffMsg
        };
        i2b2.hive.MsgSniffer.RegisterMessageSource(msg);
    };


    retCommObj._doSendMsg = function(funcName, originName, parameters, callback, transportOptions){
        if (!this._commData[funcName]) {
            console.error("Requested function does not exist [" +this.ParentCell+"->"+funcName+"] called by "+originName);
            return false;
        }
        var commOptions = {
            contentType: 'text/xml',
            method: 'post',
            asynchronous: true,
            evalJS: false,
            evalJSON: false
        };

        var execBubble = {
            self: this,
            reqOrigin: originName,
            cellName: this.ParentCell,
            funcName: funcName,
            callback: callback,
            params: parameters
        };
        // mix in our transport options from the originator call
        $.extend(commOptions, transportOptions);
        // if no callback is set then we want to make this interaction synchronous
        if (!callback) { commOptions.asynchronous = false; }
        // collect message values
        var sMsgValues = {};
        $.extend(sMsgValues, parameters);
        // proxy server data
        sMsgValues.proxy_info = '';
        if (commOptions.url !== undefined) {
            var sUrl = commOptions.url;
        } else {
            var sUrl = i2b2[this.ParentCell].cfg.cellURL;
        }
        sUrl = i2b2.h.Escape(sUrl);
        sUrl = this._commData[funcName].url.replace("{{{URL}}}",sUrl);
        execBubble.funcURL = sUrl;
        var sProxy_Url = i2b2.h.getProxy();
        if (sProxy_Url) {
            sMsgValues.proxy_info = '<proxy>\n            <redirect_url>' + sUrl + '</redirect_url>\n        </proxy>\n';
        } else {
            sProxy_Url = sUrl;
        }
        execBubble.proxyURL = sProxy_Url;

        // PM + security info
        if (commOptions.user !== undefined) {
            sMsgValues.sec_user = commOptions.user;
        } else {
            sMsgValues.sec_user = i2b2.h.getUser();
        }
        if (commOptions.password !== undefined) {
            sMsgValues.sec_pass_node = commOptions.password;
        } else {
            sMsgValues.sec_pass_node = i2b2.h.getPass();
        }
        if (commOptions.password !== undefined) {
            sMsgValues.sec_domain = commOptions.domain;
        } else {
            sMsgValues.sec_domain = i2b2.h.getDomain();
        }
        if (commOptions.project !== undefined) {
            sMsgValues.sec_project = commOptions.project;
        } else {
            sMsgValues.sec_project = i2b2.h.getProject();
        }
        if (commOptions.msg_id !== undefined) {
            sMsgValues.header_msg_id = commOptions.msg_id;
        } else {
            sMsgValues.header_msg_id = i2b2.h.GenerateAlphaNumId(20);
        }
        if (commOptions.msg_datetime !== undefined) {
            sMsgValues.header_msg_datetime = commOptions.msg_datetime;
        } else {
            sMsgValues.header_msg_datetime = moment().toISOString(true);
        }

        if (parameters == undefined) { parameters = {}; }
        if (commOptions.result_wait_time !== undefined || parameters.result_wait_time !== undefined) {
            if (commOptions.result_wait_time !== undefined) { sMsgValues.result_wait_time = commOptions.result_wait_time; }
            if (parameters.result_wait_time !== undefined) { sMsgValues.result_wait_time = parameters.result_wait_time; }
        } else {
            sMsgValues.result_wait_time = 180;  // default to 180 second timeout within the cell if a specific timeout period was not passed
        }

        // apply message values to message template
        i2b2.h.EscapeTemplateVars(sMsgValues, this._commData[funcName].dont_escape_params);
        execBubble.params = sMsgValues;
        var sMessage = this._commData[funcName].msg;
        for (var tag in sMsgValues) {
            sMessage = sMessage.replace(new RegExp("{{{"+tag+"}}}", 'g'), sMsgValues[tag]);
        }
        var sMessageNoPWD = new String(sMessage);
        if (execBubble.funcName == 'getUserAuth') {
            sMessageNoPWD = sMessageNoPWD.replace(/<password>.*<\/password>/gi,"<password></password>");
        }
        execBubble.msgSent = sMessageNoPWD;
        var verify = i2b2.h.parseXml(sMessage);
        var verify_status = verify.getElementsByTagName('proxy')[0];

        if (!verify_status) {
            sMessage = sMessage.replace(/\&amp;/g,'&');
            sMessage = sMessage.replace(/\&/g, '\&amp;');
        }

        commOptions.postBody = sMessage;
        //if (commOptions.asynchronous) {
            commOptions.onSuccess = this._defaultCallbackOK;
            commOptions.onFailure = this._defaultCallbackFAIL;
        //}
        var removeKeys = [
            "asynchronous",
            "contentType",
            "encoding",
            "method",
            "parameters",
            "postBody",
            "requestHeaders",
            "evalJS",
            "evalJSON",
            "sanitizeJSON",
            "onCreate",
            "onComplete",
            "onException",
            "onFailure",
            "onInteractive",
            "onLoaded",
            "onLoading",
            "onSuccess",
            "onUninitialized"
        ];
        var tmp = Object.keys(commOptions);
        tmp = tmp.filter(function(v) { return (removeKeys.indexOf(v) === -1) });
        console.groupEnd();
        execBubble.timeSent = new Date();
        commOptions.i2b2_execBubble = execBubble;


        var myCallback = {
                  success: function(o) {
                      /* success handler code */
                      if (typeof o !== "object") {
                          alert("There is a problem contacting the server!");
                          return false;
                      }
                      o.request = {};
                      o.request.options = {};
                      o.request.options.i2b2_execBubble = commOptions.i2b2_execBubble;
                      retCommObj._defaultCallbackOK(o);
                  },
                  failure: function(o) {
                      /* failure handler code */
                      o.request = {};
                      o.request.options = {};
                      o.request.options.i2b2_execBubble = commOptions.i2b2_execBubble;
                      retCommObj._defaultCallbackFAIL(o);
                  }
        };

        if (commOptions.asynchronous) {
            // perform an ASYNC query
            $.ajax({
                type: "POST",
                url: sProxy_Url,
                data: commOptions.postBody})
                .done(myCallback.success)
                .fail(myCallback.failure);
        } else {
            // perform a SYNC query
            $.ajax({
                type: "POST",
                url: sProxy_Url,
                async: false,
                data: commOptions.postBody})
                .done(myCallback.success)
                .fail(myCallback.failure);
        }
        console.groupEnd();
        return true;
    };



    retCommObj._defaultCallbackOK = function(transport){
        var execBubble = transport.request.options.i2b2_execBubble;
        execBubble.timeRecv = new Date();
        var origCallback = execBubble.callback;

       // update timeout
        i2b2.PM.model.IdleTimer.resetTimeout();

        // debug messages
        if (i2b2.PM.login_debugging === undefined || (i2b2.PM.login_debugging && !i2b2.PM.login_debugging_suspend)) {
            console.group("[AJAX RESULT i2b2." + execBubble.cellName + ".ajax." + execBubble.funcName + "]");
            console.info("AJAX Transport SUCCESS");
            console.dir(transport);
        }

        // create our data message to send to the callback function
        var cbMsg = {
            msgParams: execBubble.params,
            msgRequest: execBubble.msgSent,
            msgResponse: transport.documentElement.outerHTML,
            timeStart: execBubble.timeSent,
            timeEnd: execBubble.timeRecv,
            msgUrl: execBubble.funcURL,
            proxyUrl: execBubble.proxyURL,
            error: false
        };
        // check the status from the message
        var xmlRecv = transport; // jQuery returns a full XMLDocument
        if (!xmlRecv) {
            cbMsg.error = true;
            cbMsg.errorStatus = transport.status;
            cbMsg.errorMsg = "The cell's message could not be interpreted as valid XML.";
            console.error(transport.responseText);
        }
        else {
            cbMsg.refXML = xmlRecv;
            var result_status = xmlRecv.getElementsByTagName('result_status');
            if (!result_status[0]) {
                var has_error = true;
            } else {
                var s = xmlRecv.getElementsByTagName('status')[0];
            }
            if (has_error || s.getAttribute('type') != 'DONE') {
                cbMsg.error = true;
                cbMsg.errorStatus = transport.status;
                cbMsg.errorMsg = "The cell's status message could not be understood.";
                console.error(transport.responseText);
            }
        }
        // attach the parse() function
        if (cbMsg.error || !execBubble.self._commData[execBubble.funcName]) {
            cbMsg.parse = function(){
                this.model = false;
                return this;
            }
        }
        else {
            cbMsg.parse = execBubble.self._commData[execBubble.funcName].parser;
        }
        console.groupEnd();

        // send the result message to the callback function
        if (i2b2.PM.login_debugging === undefined || (i2b2.PM.login_debugging && !i2b2.PM.login_debugging_suspend)){
            // broadcast a debug message to any sniffers/tools
            var sniffPackage = i2b2.h.BuildSniffPack(execBubble.cellName, execBubble.funcName, cbMsg, execBubble.reqOrigin);
            execBubble.self._SniffMsg.fire(sniffPackage);
        }
        // return results to caller
        if (origCallback !== undefined )
        if (i2b2.h.getObjectClass(origCallback)=='i2b2_scopedCallback') {
            origCallback.callback.call(origCallback.scope, cbMsg);
        } else {
            origCallback(cbMsg);
        }
    };



    retCommObj._defaultCallbackFAIL = function(transport) {
        var execBubble = transport.request.options.i2b2_execBubble;
        execBubble.timeRecv = new Date();
        var origCallback = execBubble.callback;

        console.group("[AJAX RESULT i2b2." + execBubble.cellName + ".ajax." + execBubble.funcName + "]");
        console.error("AJAX Transport FAILURE");
        console.dir(transport);

        // create our data message to send to the callback fuction
        var cbMsg = {
            msgParams: execBubble.params,
            msgRequest: execBubble.msgSent,
            msgResponse: transport.responseText,
            timeStart: execBubble.timeSent,
            timeEnd: execBubble.timeRecv,
            msgUrl: execBubble.funcURL,
            proxyUrl: execBubble.proxyURL,
            error: true
        };
        // broadcast a debug message to any sniffers/tools
        // send the result message to the callback function
        if (i2b2.PM.login_debugging === undefined || (i2b2.PM.login_debugging && !i2b2.PM.login_debugging_suspend)){
            // broadcast a debug message to any sniffers/tools
            var sniffPackage = i2b2.h.BuildSniffPack(execBubble.cellName, execBubble.funcName, cbMsg, execBubble.reqOrigin);
            execBubble.self._SniffMsg.fire(sniffPackage);
        }
        // return results to caller
        if (origCallback !== undefined)
        if (i2b2.h.getObjectClass(origCallback)=='i2b2_scopedCallback') {
            origCallback.callback.call(origCallback.scope, cbMsg);
        } else {
            origCallback(cbMsg);
        }
    };

    return retCommObj;
};


