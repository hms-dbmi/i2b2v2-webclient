/**
 * @projectDescription	PM helper functions and Misc code.
 * @inherits 	i2b2
 * @namespace	i2b2
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */

// helper functions in the object scope
// ================================================================================================== //
i2b2.h.getUser = function() { return i2b2.PM.model.login_username; };
i2b2.h.getFullname = function() { return i2b2.PM.model.login_fullname; };
i2b2.h.getPass = function() { return i2b2.PM.model.login_password; };
i2b2.h.getDomain = function () { return i2b2.PM.model.login_domain; };
i2b2.h.getProxy = function() { return i2b2.hive.cfg.urlProxy; };
i2b2.h.getProject = function() { return i2b2.PM.model.login_project; };
i2b2.h.isSHRINE = function() { return i2b2.PM.model.shrine_domain; };
i2b2.h.inDebugMode = function() { return i2b2.PM.model.login_debugging; };
i2b2.h.allowAnalysis = function() { return i2b2.PM.model.allow_analysis; };
i2b2.h.adminOnly = function() { return i2b2.PM.model.admin_only; };

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
    let ret = {};

    // add jQuery callback functions to the IdleTimer object
    $.extend(ret, $.Callbacks());

    let idle_secs = null;
    let logout_secs = null;
    let tmr_idle = null;
    let tmr_logout = null;

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

    function startTimer(millisec_idle, millisec_logout) {
        // idle seconds - how many seconds until "idle" event is fired
        // logout seconds - how many seconds after "idle" event is fired
        // before the "logout" event is fired

        // idle and logout should not be smaller than 30 seconds
        if (millisec_idle < 30000 || millisec_logout < 30000) return false;

        idle_secs = (i2b2.h.isNumber(millisec_idle) ? parseInt(millisec_idle) : Infinity);
        logout_secs = (i2b2.h.isNumber(millisec_logout) ? parseInt(millisec_logout)  : Infinity);

        if (tmr_idle !== undefined) {
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
            let sessionTimeoutModal = $('#sessionTimeoutModal');
            if(sessionTimeoutModal.length === 0) {
                sessionTimeoutModal = $(
                    '<div class="modal" id="sessionTimeoutModal">' +
                    '   <div class="modal-dialog modal-dialog-centered">' +
                    '       <div class="modal-content">' +
                    '           <div class="modal-header"><h5 class="modal-title">Session Timing Out</h5></div>' +
                    '           <div class="modal-body">' +
                    '               Your session will automatically time out in 5 minutes due to inactivity.  ' +
                    '               Please click "OK" to continue your session, or click Logout to log out.' +
                    '           </div>' +
                    '           <div class="modal-footer">' +
                    '               <button type="button" class="btn btn-secondary btn-sm session-extend" data-bs-dismiss="modal" aria-label="Close">Ok</button>' +
                    '               <button type="button" class="btn btn-primary btn-sm session-logout">Logout</button>' +
                    '           </div>' +
                '           </div>' +
                    '<  /div>' +
                    '</div>'
                );
                $("body").append(sessionTimeoutModal);
                $('#sessionTimeoutModal .session-logout').click(function () {
                    i2b2.PM.doLogout();
                });
                $('#sessionTimeoutModal .session-extend').click(function () {
                    i2b2.PM.model.IdleTimer.resetTimeout();
                    i2b2.PM.extendUserSession();
                    $('#sessionTimeoutModal').modal('hide');
                });
            }
            sessionTimeoutModal.modal('show');
            break;
        case "logout":
            i2b2.PM.doLogout();
            break;
    }
});

               
// TODO: Reimplement project selection
// TODO: Reimplement announcement modal on login
