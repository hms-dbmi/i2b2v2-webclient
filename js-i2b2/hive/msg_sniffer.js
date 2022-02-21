/**
 * @projectDescription	Message Sniffer object - sniffs communication for objects which expose a _DebugMessaging event.  Example: i2b2.CRC.ajax._DebugMessaging is a custom YUI event object.
 * @inherits 	i2b2.hive
 * @namespace	i2b2.hive.MsgSniffer
 * @version 	2.0
 **/

i2b2.hive.MsgSniffer = {
    sniffSources: [],
    signalOrigins: [],
    signalMessageDB: [],
    initialize: function(doActivate) {},
    _showSingleMsgModal: function() {},
    showSingleMsgRequest: function(strXML) {},
    showSingleMsgResponse: function(strXML) {},
    show: function() {},
    _spawnWin: function() {},
    showStack: function(viewtitle, origins, cells, actions) {},
    // Register event for message sources
    RegisterMessageSource: function(regMsg) {
        // expected data format: {
        //    channelName: "CELLNAME",
        //    channelActions: ["the names", "of the", "Cell's server calls"],
        //    channelSniffEvent: {yui custom event}
        // }
        if (!regMsg.channelName || !regMsg.channelActions || !regMsg.channelSniffEvent || !regMsg.channelSniffEvent.add) {
            console.error('MsgSniffer: bad registration info / ');
            console.dir(regMsg);
            return false;
        }
        let t = regMsg.channelName;
        regMsg.channelCode = t;
        if (i2b2[t]) {
            if (i2b2[t].cfg.config.name) regMsg.channelName = i2b2[t].cfg.config.name;
        }
        let was_found = false;
        for (let i = 0; i < this.sniffSources.length; i++) {
            if (this.sniffSources[i].channelSniffEvent === regMsg.channelSniffEvent) {
                was_found = true;
                t = this.sniffSources[i].channelActions.concat(regMsg.channelActions);
                this.sniffSources[i].channelActions = $.unique(t);
            }
        }
        if (was_found === false) {
            this.sniffSources.push(regMsg);
            regMsg.channelSniffEvent.add(i2b2.hive.MsgSniffer.MsgHandler.bind(this));
        }
        return true;
    },
    MsgHandler: function(msgType, sniffMsg) {
        // Function where the messages enter the sniffer subsystem
        // (SCOPE IS NOT IN NAMESPACE WHEN FUNCTION IS CALLED)
        if (typeof sniffMsg ==='undefined') return false;
        var thisobj = i2b2.hive.MsgSniffer;
        if (!i2b2.PM.model.login_debugging) { return true; }
        // save the data if the framework is in debug mode
        sniffMsg = sniffMsg[0];
        sniffMsg.SignalType = msgType;
        var d = new Date();
        sniffMsg.SignalTimestamp = d;
        this.signalMessageDB.push(sniffMsg);

        if (this.signalOrigins.indexOf(sniffMsg.SignalOrigin) == -1) {
            this.signalOrigins.push(sniffMsg.SignalOrigin);
        }
        // TODO: refresh the message viewer window if it is open
        return true;
    }
};
