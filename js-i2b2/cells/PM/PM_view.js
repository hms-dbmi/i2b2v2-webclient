/**
 * @projectDescription	View controller for PM module's login form(s).
 * @inherits 	i2b2
 * @namespace	i2b2.PM
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */

i2b2.PM.view.template = {};
// ================================================================================================== //

i2b2.PM.setUserAccountInfo = function(){
    let userInfo = $("#userInfo");
    userInfo.find(".user").text(i2b2.PM.model.login_username);
    userInfo.find(".project").text(i2b2.PM.model.login_projectname);
    userInfo.find(".userRole").text(i2b2.PM.model.userRoles.join(", "));
    userInfo.find(".versionNum").text(i2b2.ClientVersion);

    if (!i2b2.PM.model.otherAuthMethod) {
        $('#changePasswordLink').removeClass("hidden").prev().removeClass("hidden");
    }
};

// login screen
// ================================================================================================== //
i2b2.PM.removeLoginDialog = function() {
    // delete the modal login form's HTML/CSS
    try {$("#PM-login-modal").remove(); } catch(e) {}
    try {$("#PM-login-html-css").remove(); } catch(e) {}
};
// ================================================================================================== //
i2b2.PM.doLoginDialog = function() {
    // this displays the login dialogue box (auto generated popup)

    // shows the modal login form and its supporting CSS file
    $('<link>')
        .appendTo('head')
        .attr({
            id: 'PM-login-html-css',
            type: 'text/css',
            rel: 'stylesheet',
            href: this.cfg.baseDir+"/assets/login-html.css"
        });

    $("body").load(this.cfg.baseDir+"assets/login.html #PM-login-modal", null, (function(){
        // execute this after the external HTML/CSS load
        $('loginusr').focus();
        // load info from the i2b2.UI.cfg data that may exist
        try {
            $("#PM-login-modal input[name='loginusr']").val(i2b2.UI.cfg.loginDefaultUsername);
        } catch(e) {}
        try {
            $("#PM-login-modal input[name='loginpass']").val(i2b2.UI.cfg.loginDefaultPassword);
        } catch(e) {}

        // clear any domains
        $('#logindomain option').remove();
        // load the domains into dropdown
        i2b2.PM.model.Domains.forEach((domain, i)=>{
            $('#logindomain').append($('<option>', {
                value: i,
                text: domain.name
            }));
        });
        // attach the onClick/onSubmit handlers
        $("#PM-login-modal .login-button").click(function(event) {
            let selectedDomain = i2b2.PM.model.Domains[$('#logindomain').val()];
            if (selectedDomain.ignorePasswordMgrs === true) {
                // prevent the browser's password save option from saving/checking the password
                event.preventDefault();
                i2b2.PM.doLogin();
            } else {
                // allow the form's submit handler to fire (this is the hook for Chrome's password manager)
                i2b2.PM.doLogin();
            }
        });
        $("#PM-login-modal form").submit(function(event) {
            // we don't actually want to use the browser's form submit action
            event.preventDefault();
        });

        // attach event handlers for the SSO buttons
        let func_lauchSaml = (evt) => { i2b2.PM.doSamlLogin($(evt.currentTarget).data('service')); };
        $('.sso-button').on('click', func_lauchSaml);
        $('.sso-button').on('keyup', (evt) => {
            if (evt.which === 13) func_lauchSaml(evt);
        });

        // attach event handler for domain changes
        $('#logindomain').on('change', i2b2.PM.doChangeDomain);

        // initial handling to display/hide SAML buttons based on the Domain
        i2b2.PM.doChangeDomain();
    }));
};
// ================================================================================================== //

i2b2.PM.view.updateProjectSelection = function(projectSelElem){

    let project = $(projectSelElem).val();
    $("#projectSelectionDetails").empty();
    let details = Object.fromEntries(Object.entries(i2b2.PM.model.projects[project].details).filter(([key, detail]) => detail.status !== 'H'));
    let projectDetails = {
        projectDetails: details
    }

    $((Handlebars.compile("{{> ProjectSelectionDetail }}"))(projectDetails)).appendTo("#projectSelectionDetails");
}
// ================================================================================================== //

i2b2.PM.view.showProjectSelectionModal = function(){

    let projectSelModal = $("#projectSelection");

    let projects = [];
    for (let code in i2b2.PM.model.projects) {
        let details = Object.fromEntries(Object.entries( i2b2.PM.model.projects[code].details).filter(([key, detail]) => detail.status !== 'P'));

        projects.push({
            name : i2b2.PM.model.projects[code].name,
            value: code,
            details:  details
        });
    }

    let projectData = {
        projects: projects,
    }
    if (projectSelModal.length === 0) {
        $("body").append("<div id='projectSelection'/>");
        projectSelModal = $("#projectSelection");
        projectSelModal.load('js-i2b2/cells/PM/assets/modalProjectSelection.html', function(){
            $(i2b2.PM.view.template.projectSelection.projects(projectData)).appendTo("#projectSelectionForm");
            $("body #projectSelection button.i2b2-save").click(function () {
                let selectedI2B2Project =  $("#selectedI2B2Project");
                let ProjId = selectedI2B2Project.val();
                let ProjName = selectedI2B2Project.find("option:selected").text();
                if (ProjId !== 'admin_HY!5Axu&') {
                    i2b2.PM.model.login_project = ProjId;
                    i2b2.PM.model.login_projectname = ProjName;
                    i2b2.PM._processLaunchFramework();
                }

                $("#projectSelection div").eq(0).modal("hide");
            });
            $("#projectSelection div:eq(0)").modal('show');
        });
    }else{
        $("#projectSelectionForm").empty();
        $(i2b2.PM.view.template.projectSelection.projects(projectData)).appendTo("#projectSelectionForm");
        $("#projectSelection div:eq(0)").modal('show');
    }
}

// ================================================================================================== //
i2b2.PM.doChangeDomain = function() {
    let selectedDomain = i2b2.PM.model.Domains[$('#logindomain').val()];
    // remove the submit attribute on the login button if configured
    if (selectedDomain.ignorePasswordMgrs === true) {
        $("#PM-login-modal input[name='loginpass']").attr('type', 'text');
        $("#PM-login-modal input[name='loginpass']").attr('autocomplete', 'off');
        $("#PM-login-modal input[name='loginusr']").attr('autocomplete', 'off');
    } else {
        $("#PM-login-modal input[name='loginpass']").attr('type', 'password');
        $("#PM-login-modal input[name='loginpass']").removeAttr('autocomplete', '');
        $("#PM-login-modal input[name='loginusr']").removeAttr('autocomplete', '');
    }

    let loginElements = $(".login-user, .login-password, .login-button");
    if (selectedDomain.saml !== undefined) {
        loginElements.hide();
        $(".sso-button").hide();
        Object.keys(selectedDomain.saml).forEach((service) => {
            $(".sso-button[data-service='"+service+"']").show();
        });
    } else {
        loginElements.show();
        $(".sso-button").hide();
    }
};
// ================================================================================================== //
i2b2.PM.view.modal.announcementDialog = {
    showAnnouncement: function(msg) {
        let pmAnnouncementMsgDialogModal = $("#pmAnnouncementMsgDialogModal");
        if (pmAnnouncementMsgDialogModal.length === 0) {
            $("body").append("<div id='pmAnnouncementMsgDialogModal'/>");
            pmAnnouncementMsgDialogModal = $("#pmAnnouncementMsgDialogModal");
        }
        pmAnnouncementMsgDialogModal.empty();

        let data = {
            "title": i2b2.PM.model.login_project + " Announcements",
            "msg": msg,
        };
        $(i2b2.PM.view.template.announcementMsgDialog(data)).appendTo(pmAnnouncementMsgDialogModal);
        $("#pmAnnouncementMsgDialogModal div:eq(0)").modal('show');
    },
    clickOK: function() {
        $("#pmAnnouncementMsgDialogModal").modal('hide');
        if (!i2b2.hive.isLoaded) {
            i2b2.PM._processLaunchFramework();
        }
    },
    clickCancel: function(){
        $("#pmAnnouncementMsgDialogModal").modal('hide');
        i2b2.PM.doLogout();
    }
};
// ================================================================================================== //
i2b2.PM.view.displayContextDialog = function(inputData){
    let contextDialogModal = $("#pmContextDialog");
    if (contextDialogModal.length === 0) {
        $("body").append("<div id='pmContextDialog'/>");
        contextDialogModal = $("#pmContextDialog");
    }
    contextDialogModal.empty();

    i2b2.PM.view.dialogCallbackWrapper = function(event) {
        if (inputData.confirmMsg) {
            inputData.onOk();
        }
        else {
            let newValue = $("#PMContextMenuInput").val();
            inputData.onOk(newValue);
        }
        $("#PMContextMenuDialog").modal('hide');
    }

    i2b2.PM.view.dialogKeyupCallbackWrapper = function(event) {
        if(event.keyCode === 13){
            $("#PMContextMenuDialog .context-menu-save").click();
        }
    }

    let data = {
        "title": inputData.title,
        "inputLabel": inputData.prompt,
        "placeHolder": inputData.placeHolder,
        "confirmMsg": inputData.confirmMsg,
        "onOk": " i2b2.PM.view.dialogCallbackWrapper(event)",
        "onKeyup": " i2b2.PM.view.dialogKeyupCallbackWrapper(event)",
        "inputValue" : inputData.inputValue,
        "hideCancel": inputData.hideCancel
    };

    if(typeof inputData.onCancel === 'function' ){
        data.onCancel = inputData.onCancel;
    }

    $(i2b2.PM.view.template.contextDialog(data)).appendTo(contextDialogModal);
    $("#PMContextMenuDialog").modal('show');
};
// ================================================================================================== //

i2b2.PM.view.changePassword = {
    show: function (successCallback, disableCancel) {
        let changePasswordModal = $("#changePasswordModal");
        if (changePasswordModal.length === 0) {
            $("body").append("<div id='changePasswordModal'></div");
            changePasswordModal = $("#changePasswordModal");
        }
        i2b2.PM.view.changePassword.onSuccess = successCallback;
        changePasswordModal.load('js-i2b2/cells/PM/assets/modalChangePassword.html', function(){
            if(disableCancel){
                $(".changePasswordModal .btn-cancel").hide();
            }
            $("#changePasswordModal div:eq(0)").modal('show');
        });
    },
    togglePassword: function(element) {
        let curType =  $(element).prev().prop("type");

        if(curType.toLowerCase() === "text" ){
            $(element).prev().prop("type", "password");
            $(element).find(".showPassword").hide();
            $(element).find(".hidePassword").show();
        }
        else{
            $(element).prev().prop("type", "text");
            $(element).find(".showPassword").show();
            $(element).find(".hidePassword").hide();
        }
    },
    run: function () {
        try {
            let curpass = $('#curpass').val();
            let newpass = $('#newpass').val();
            let retypepass = $('#retypepass').val();

            if(!newpass){
                $(".changePasswordModal .errorMsg").text("New password cannot be blank");
                $(".changePasswordModal .newpass").addClass("error");
            }
            else if (newpass !== retypepass) {
                $(".changePasswordModal .errorMsg").text("New password doesn't match the confirm password");
                $(".changePasswordModal .newpass").addClass("error");
            } else {
                i2b2.PM.changePassword(curpass, newpass, function(){
                    i2b2.PM.view.displayContextDialog({
                        title: "i2b2 Change Password",
                        confirmMsg: "Password successfully changed",
                        hideCancel: true,
                        onOk: function(){
                            $("#pmContextDialog div:eq(0)").modal('hide');
                            if(i2b2.PM.view.changePassword.onSuccess) {
                                i2b2.PM.view.changePassword.onSuccess();
                            }
                        }
                    });
                    $("#changePasswordModal div:eq(0)").modal('hide');
                });
            }
        } catch (e) {
        }
    }
};
// display the modal login form after the PM cell is fully loaded
// ================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
    if (cell.cellCode === "PM") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);
        i2b2.PM.doLoginDialog();

        cell.view.template.projectSelection = {};
        $.ajax("js-i2b2/cells/PM/templates/ProjectSelection.html", {
            success: (template) => {
                cell.view.template.projectSelection.projects = Handlebars.compile(template);
            },
            error: (error) => { console.error("Could not retrieve template: ProjectSelection.html"); }
        });

        $.ajax("js-i2b2/cells/PM/templates/ProjectSelectionDetail.html", {
            success: (template, status, req) => {
                Handlebars.registerPartial("ProjectSelectionDetail", req.responseText);
            },
            error: (error) => { console.error("Could not retrieve template: ProjectSelectionDetail.html"); }
        });

        $.ajax("js-i2b2/cells/PM/templates/AnnouncementMsg.html", {
            success: (template) => {
                cell.view.template.announcementMsgDialog = Handlebars.compile(template);
            },
            error: (error) => { console.error("Could not retrieve template: AnnouncementMsg.html"); }
        });

        $.ajax("js-i2b2/cells/PM/templates/PMContextMenuDialog.html", {
            success: (template) => {
                cell.view.template.contextDialog = Handlebars.compile(template);
            },
            error: (error) => { console.error("Could not retrieve template: PMContextMenuDialog.html"); }
        });
    }
});
