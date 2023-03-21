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
    userInfo.find(".versionNum").text(i2b2.ClientVersion);
    userInfo.find(".versionDate").text(i2b2.ClientVersionDate);
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
        // attach the onSubmit handler
        $("#PM-login-modal form").submit(function(event) {
            event.preventDefault();
            i2b2.PM.doLogin();
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

i2b2.PM.view.showProjectSelectionModal = function(){

    let projectSelModal = $("#projectSelection");

    if (projectSelModal.length === 0) {
        $("body").append("<div id='projectSelection'/>");
        projectSelModal = $("#projectSelection");
        projectSelModal.load('js-i2b2/cells/PM/assets/modalProjectSelection.html', function(){
            $(i2b2.PM.view.template.projectSelection({projects: i2b2.PM.model.projects})).appendTo("#projectSelectionForm");
            $("body #projectSelection button.i2b2-save").click(function () {
                let selectedI2B2Project =  $("#selectedI2B2Project");
                let ProjId = selectedI2B2Project.val();
                let ProjName = selectedI2B2Project.text();
                if (ProjId === 'admin_HY!5Axu&') {
                    $('crcQueryToolBox').hide();
                    i2b2.PM.model.login_project = ""; //i2b2.h.XPath(projs[0], 'attribute::id')[0].nodeValue;
                    i2b2.PM.model.admin_only = true;
                } else {
                    i2b2.PM.model.login_project = ProjId;
                    i2b2.PM.model.login_projectname = ProjName;
                }
                i2b2.PM._processLaunchFramework();
                $("#projectSelection div").eq(0).modal("hide");
            });
            $("#projectSelection div:eq(0)").modal('show');
        });
    }else{
        $(i2b2.PM.view.template.projectSelection({projects: i2b2.PM.model.projects})).appendTo("#projectSelectionForm");
        $("#projectSelection div:eq(0)").modal('show');
    }
}

// ================================================================================================== //
i2b2.PM.doChangeDomain = function() {
    let selectedDomain = i2b2.PM.model.Domains[$('#logindomain').val()];
    let loginElements = $(".login-user, .login-password, .login-button");
    if (selectedDomain.saml !== undefined) {
        loginElements.hide();
        selectedDomain.saml.forEach((service) => {
            $(".sso-button[data-service='"+service+"']").show();
        });
    } else {
        loginElements.show();
        $(".sso-button").hide();
    }
};

// display the modal login form after the PM cell is fully loaded
// ================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
    if (cell.cellCode === "PM") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);
        i2b2.PM.doLoginDialog();

        $.ajax("js-i2b2/cells/PM/templates/ProjectSelection.html", {
            success: (template) => {
                cell.view.template.projectSelection = Handlebars.compile(template);
            },
            error: (error) => { console.error("Could not retrieve template: ProjectSelection.html"); }
        });
    }
});
