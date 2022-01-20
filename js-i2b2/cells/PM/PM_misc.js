/**
 * @projectDescription	PM helper functions and Misc code.
 * @inherits 	i2b2
 * @namespace	i2b2
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: cells > PM > misc');
console.time('execute time');


// helper functions in the object scope
// ================================================================================================== //
i2b2.h.getUser = function() { return i2b2.PM.model.login_username; }
i2b2.h.getFullname = function() { return i2b2.PM.model.login_fullname; }
i2b2.h.getPass = function() { return i2b2.PM.model.login_password; }
i2b2.h.getDomain = function () { return i2b2.PM.model.login_domain; }
i2b2.h.getProxy = function() { return i2b2.hive.cfg.urlProxy; }
i2b2.h.getProject = function() { return i2b2.PM.model.login_project; }
i2b2.h.isSHRINE = function() { return i2b2.PM.model.shrine_domain; }
i2b2.h.inDebugMode = function() { return i2b2.PM.model.login_debugging; }
i2b2.h.allowAnalysis = function() { return i2b2.PM.model.allow_analysis; }
i2b2.h.adminOnly = function() { return i2b2.PM.model.admin_only; }

i2b2.PM.model.login_username = '';
i2b2.PM.model.login_fullname = '';
i2b2.PM.model.login_password = '';
i2b2.PM.model.login_projectname = '';
i2b2.PM.model.login_domain = '';
i2b2.PM.model.shrine_domain = false;
i2b2.PM.model.admin_only = false;
i2b2.PM.model.Domains = i2b2.hive.cfg.lstDomains;
i2b2.PM.model.reLogin = false;

i2b2.PM.model.IdleTimer = (function() {
    var ret = {}

    // add jQuery callback functions to the IdleTimer object
    $.extend(ret, $.Callbacks());

    var idle_secs = null;
    var logout_secs = null;
    var tmr_idle = null;
    var tmr_logout = null;

    function fireIdle() {
        ret.fire("idle");
    }

    function fireLogout() {
        ret.fire("logout");
    }

    function resetTimer() {
        if (tmr_idle !== null) {
            clearTimeout(tmr_idle);
        }
        if (tmr_logout !== null) {
            clearTimeout(tmr_logout);
        }
        if (idle_secs !== null && logout_secs !== null) {
            tmr_idle = setTimeout(fireIdle, idle_secs);
            tmr_logout = setTimeout(fireLogout, idle_secs + logout_secs);
        }
    }

    function startTimer(sec_idle, sec_logout) {
        // idle seconds - how many seconds until "idle" event is fired
        // logout seconds - how many seconds after "idle" event is fired
        //      before the "logout" event is fired

        // idle and logout should not be smaller than 30 seconds
        if (idle_secs < 30000 || logout_secs < 30000) return false;

        idle_secs = (i2b2.h.isNumber(sec_idle) ? parseInt(sec_idle) * 1000 : Infinity);
        logout_secs = (i2b2.h.isNumber(sec_idle) ? parseInt(sec_idle) * 1000 : Infinity);

        if (!i2b2.h.isUndefined(tmr_idle)) {
            resetTimer();
        } else {
            // UX events that will reset the timeout
            window.addEventListener('scroll', resetTimer);
            window.addEventListener('keydown', resetTimer);
            window.addEventListener('mousedown', resetTimer);
            window.addEventListener('mousemove', resetTimer);
        }
    }

    // expose the private functions on returned object
    ret.start = startTimer;
    ret.resetTimeout = resetTimer;

    return ret;
})();



// attach actions to the logout timer
i2b2.PM.model.IdleTimer.add(function(eventName){
    switch(eventName) {
        case "idle":
            //if (!i2b2.PM.model.IdleTimer.dialogTimeout) {
            i2b2.PM.model.reLogin = true;
            //	i2b2.h.LoadingMask.show();
            //	i2b2.PM.doLoginDialog();
            /*
             var r=confirm("Your session will automatically time out in 5 minutes due to inactivity.  Please click \"OK\" to continue your session, or click cancel to log out.");
             if (r==true)
             {
             i2b2.PM.model.IdleTimer.stop();
             i2b2.PM.udlogin.inputPass.value = i2b2.PM.model.login_password.substring(i2b2.PM.model.login_password.indexOf(">")+1,i2b2.PM.model.login_password.lastIndexOf("<") );
             i2b2.h.LoadingMask.show();
             i2b2.PM.doLogin();
             }
             else
             {
             i2b2.PM.doLogout();
             }
             */
            var handleCancel = function() {
                i2b2.PM.doLogout();
            };
            var loopBackSubmit = function() {
                i2b2.PM.model.IdleTimer.stop();
                i2b2.PM.udlogin.inputPass.value = i2b2.PM.model.login_password.substring(i2b2.PM.model.login_password.indexOf(">")+1,i2b2.PM.model.login_password.lastIndexOf("<") );
                i2b2.h.LoadingMask.show();
                i2b2.PM.doLogin();
                i2b2.PM.model.dialogTimeout.hide();
                i2b2.h.LoadingMask.hide();
            };
            i2b2.PM.model.dialogTimeout = new YAHOO.widget.SimpleDialog("dialogTimeout", {
                width: "400px",
                fixedcenter: true,
                constraintoviewport: true,
                modal: true,
                zindex: 700,
                buttons: [{
                    text: "OK",
                    handler: loopBackSubmit,
                    isDefault: true
                }, {
                    text: "Logout",
                    handler: handleCancel
                }]
            });
            $('dialogTimeout').show()
            i2b2.PM.model.dialogTimeout.render(document.body);
            i2b2.PM.model.dialogTimeout.show();
            //var idleTimer = YAHOO.util.IdleTimer;
            //	i2b2.PM.model.WarnTimer.start(10000);
            break;
        case "logout":
            break;
    }
});

               

// login screen
// ================================================================================================== //
i2b2.PM.model.html = {};

// project selection screen
i2b2.PM.model.html.projDialog = '<div id="i2b2_projects_modal_dialog" style="display:block;">\n'+
    '	<div class="hd" style="background:#6677AA;">Choose a Project</div>\n'+
    '	<div class="bd">\n'+
    '	<form onsubmit="i2b2.PM.selectProject(); return false;" style="margin: 0pt; padding: 0pt;" name="projectsForm">\n'+
    '		<div style="text-align:right">\n'+
    '			<div style="float:left; padding-top:3px"><B>Project:</B></div>\n'+
    '			<div style="float:left; margin-left:5px"><select id="loginProjs" name="projects" onchange="i2b2.PM.view.modal.projectDialog.renderDetails()"><option value="">Loading...</option></select></div>\n'+
    '			<input type="button" value="     Go     " onclick="i2b2.PM.view.modal.projectDialog.loadProject()"/>\n'+
    '		</div>\n'+
    '		<div id="projectAttribs">\n'+
    '			<div>\n'+
    '				<div style="float:left; width:120px; background:#DDF; padding-left:4px; border-bottom:1px solid #bbb">test</div>\n'+
    '				<div style="float:right; padding-left:6px; width:248px; border-bottom:1px solid #ddd">this tis the test description</div>\n'+
    '			</div>\n'+
    '			<div>\n'+
    '				<div style="float:left; width:120px; background:#DDF; padding-left:4px; border-bottom:1px solid #bbb">test</div>\n'+
    '				<div style="float:right; padding-left:6px; width:248px; border-bottom:1px solid #ddd">this tis the test description</div>\n'+
    '			</div>\n'+
    '			<div style="clear:both; display:none"></div>\n'+
    '		</div>\n'+
    '		<div id="projDetailRec-CLONE" style="display:none">\n'+
    '			<div class="name" >test</div>\n'+
    '			<div class="value">this tis the test description</div>\n'+
    '		</div>\n'+
    '	</form>\n'+
    '	</div>\n'+
    '</div>\n';




    i2b2.PM.model.html.announceDialog = '<div id="i2b2_announcement_modal_dialog" style="display:block;">\n'+
    '	<div class="hd" style="background:#6677AA;">Project Announcements</div>\n'+
    '	<div class="bd">\n'+
    '	<form onsubmit="i2b2.PM.selectProject(); return false;" style="margin: 0pt; padding: 0pt;" name="projectsForm">\n'+
    '		<div style="text-align:right">\n'+
    '			<div style="float:left; padding-top:3px"><B>Project:</B></div>\n'+
    '			<div style="float:left; margin-left:5px"><select id="loginProjs" name="projects" onchange="i2b2.PM.view.modal.projectDialog.renderDetails()"><option value="">Loading...</option></select></div>\n'+
    '			<input type="button" value="     Go     " onclick="i2b2.PM.view.modal.projectDialog.loadProject()"/>\n'+
    '		</div>\n'+
    '		<div id="projectAttribs">\n'+
    '			<div>\n'+
    '				<div style="float:left; width:120px; background:#DDF; padding-left:4px; border-bottom:1px solid #bbb">test</div>\n'+
    '				<div style="float:right; padding-left:6px; width:248px; border-bottom:1px solid #ddd">this tis the test description</div>\n'+
    '			</div>\n'+
    '			<div>\n'+
    '				<div style="float:left; width:120px; background:#DDF; padding-left:4px; border-bottom:1px solid #bbb">test</div>\n'+
    '				<div style="float:right; padding-left:6px; width:248px; border-bottom:1px solid #ddd">this tis the test description</div>\n'+
    '			</div>\n'+
    '			<div style="clear:both; display:none"></div>\n'+
    '		</div>\n'+
    '		<div id="projDetailRec-CLONE" style="display:none">\n'+
    '			<div class="name" >test</div>\n'+
    '			<div class="value">this tis the test description</div>\n'+
    '		</div>\n'+
    '	</form>\n'+
    '	</div>\n'+
    '</div>\n';



console.timeEnd('execute time');
console.groupEnd();