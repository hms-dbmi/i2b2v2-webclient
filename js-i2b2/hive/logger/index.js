let events = {
    dump: new CustomEvent("dump-request"),
    clear: new CustomEvent("clear-request")
}

let msgLog = [];
let source = [];

// handle the response to get a full dump of the log
window.addEventListener("dump-response", (e) => {
    console.warn("Dump of message log arrived:");
    console.dir(e.detail.msgLog);
    console.dir(e.detail.source);

    msgLog = e.detail.msgLog;
    source = e.detail.source;

    msgLog.forEach((item, index) => {
        item.pk = index;
        updateFilterOptions(item);
    });

    handleClearButtonState();
    updateLogItems();
});

// handle event for when a new message is added to the log
window.addEventListener("add-response", (e) => {
    console.warn("New message arrived:");
    console.dir(e.detail);

    let msg = e.detail;
    msg.pk = msgLog.length;
    msgLog.push(msg);

    let origin = $("#filterOrigin").val().trim();
    let cell = $("#filterCell").val().trim();
    let action = $("#filterAction").val().trim();

    //add new filter options
    updateFilterOptions(msg);

    if((origin === "ALL" || msg.requester === origin.trim())
        && (cell === "ALL" || msg.cell === cell.trim())
        && (action === "ALL" || msg.function === action)) {
        appendLogItem(msg, msg.pk);
    }
});

// handle event for when the messageLog is cleared
window.addEventListener("clear-response", (e) => {
    console.warn("The message log has been cleared");
    msgLog = [];
    $(".logItems").empty();
    $(".messageDetail").empty();
});

function updateFilterOptions(item){
    let itemRequestor = item.requester.trim();
    let originOption = $("<option>" + itemRequestor  + "</option>").val(itemRequestor);
    let filterOrigin = $('#filterOrigin');

    if(filterOrigin.find('option[value="' + itemRequestor + '"]').length === 0){
        filterOrigin.append(originOption);
    }

    let itemCell = item.cell.trim();
    let filterCell= $("#filterCell");
    let cellOption = $("<option>" + itemCell + "</option>").val(itemCell);
    if(filterCell.find('option[value="' + itemCell  + '"]').length === 0){
        filterCell.append(cellOption);
    }
}

function updateLogItems(){
    $(".logItems").empty();
    $(".messageDetail").empty();
    let origin = $("#filterOrigin").val().trim();
    let cell = $("#filterCell").val().trim();
    let action = $("#filterAction").val().trim();

    let filteredMsgLog = msgLog.filter((msgItem) =>
        (origin === "ALL" || msgItem.requester === origin.trim())
        && (cell === "ALL" || msgItem.cell === cell.trim())
        && (action === "ALL" || msgItem.function === action)
    );

    handleClearButtonState();

    filteredMsgLog.forEach((item, index) => appendLogItem(item, item.pk));
}

function displayLogItem(logItem, sent, rcvd){
    $(".selected").removeClass("selected");
    logItem.addClass("selected");
    let msgIndex= logItem.data("index");

    let messageDetail = $(".messageDetail").empty();
    let msgLogItem = msgLog[msgIndex];
    if(sent) {
        let msgSentPanel = $("<pre>" + i2b2.h.Escape(msgLogItem.msgSent.msg) +"</pre>").addClass("msgSentXml");
        messageDetail.append(msgSentPanel);
    }
    if(rcvd) {
        let msgRcvdPanel = $("<pre>" + i2b2.h.Escape(msgLogItem.msgRecv.msg) +"</pre>").addClass("msgRcvdXml");
        messageDetail.append(msgRcvdPanel);
    }
}

function appendLogItem(msg, index){
    let logItem = $("<div class='logItem'></button>");
    let msgTypes = $("<div></div>").addClass("msgTypes");
    let sendMsgType = $("<div>sent</div>").addClass("sentStatus").appendTo(msgTypes);
    sendMsgType.on("click", function(event){
        event.stopPropagation();
        displayLogItem($(this).parents(".logItem"), true, false);
    });

    let rcvdMsgType = $("<div>rcvd</div>").appendTo(msgTypes);
    rcvdMsgType.on("click", function(event){
        event.stopPropagation();
        displayLogItem($(this).parents(".logItem"), false, true);
    });
    msg.error ? rcvdMsgType.addClass("errorStatus") : rcvdMsgType.addClass("rcvdStatus") ;
    logItem.append(msgTypes);

    let msgData = $("<div></div>").addClass("msgData");
    msgData.append("<div style='display:inline-block;float:left'>" + msg.function + "</div>"
        + "<div style='display:inline-block;float:right'>" + msg.cell + "</div>"
        + "<div style='clear:both'> called by " + msg.requester + "</div><div>" + msg.msgSent.when.toLocaleString() + "</div>");
    logItem.append(msgData)
    logItem.data("index", msg.pk);
    $(".logItems").append(logItem);
    
    handleClearButtonState();
    
    logItem.on("click", function(event){
        displayLogItem($(this), true, true);
    });
}

function init(){
    console.log("initializing...");
    window.dispatchEvent(events.dump);
    

    $("#filterOrigin").on("change", function() {
        updateLogItems();       
    });

    $("#filterCell").on("change", function() {
        let cell = $(this).val();

        $("#filterAction").empty().append('<option value="ALL">All Actions</option>');

        let sourceItem = source.filter((s) => s.channelCode === cell);
        if(sourceItem.length > 0 && sourceItem[0].channelActions !== undefined) {
            sourceItem[0].channelActions.forEach(item => {
                let actionOption = $("<option>" + item + "</option>").val(item);
                $("#filterAction").append(actionOption);
                handleClearButtonState();
            })
        }        
        updateLogItems();       
    });

     

    $("#filterAction").on("change", function() {        
        updateLogItems();
    });

    $(".MessageLog .refreshLog").on("click", function(){
        $(".logItems").empty();
        $(".messageDetail").empty();
        window.dispatchEvent(events.dump);
    });

    $(".MessageLog .clearLog").on("click", function(){ 
        if (confirm('Are you sure you want to delete ALL messages in the log?')) {
            window.dispatchEvent(events.clear);
            handleClearButtonState();
        }   
    });
}

function handleClearButtonState(){
    if (msgLog.length===0){
        $('.clearLog').prop("disabled", true);
    } else{
        $('.clearLog').prop("disabled", false);
    }
}