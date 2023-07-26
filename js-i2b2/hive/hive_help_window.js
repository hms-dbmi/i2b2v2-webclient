/**
 * @projectDescription	i2b2 Webclient Help.
 * @inherits 	i2b2
 * @namespace	i2b2
 * @author		Thomas Naughton, Marc-Danie Nazare, Nick Benik
 * @version 	1
 **/

// instantiating the object
i2b2.hive.model.helpWindow = {};


// reference to the Help UI window
i2b2.hive.model.helpWindow = null;

i2b2.hive.helpWindow = {
    show: () => {
        if (i2b2.hive.model.helpWindow === null || i2b2.hive.model.helpWindow.closed) {
            try {
                // spawn new
                i2b2.hive.model.helpWindow = window.open('js-i2b2/hive/help-window/index.html', 'i2b2_help_window', 'toolbar=yes,menubar=yes,location=yes,resizable=yes,scrollbars=yes,height=490,width=750', false);
                i2b2.hive.model.helpWindow.focus();
            } catch(e) {
                alert('Could not display the Message Log.\n Please disable any popup blockers and try again.');
                return;
            }            
        }
        else{
            i2b2.hive.model.helpWindow.focus();
        }
    },
    close: () => {
        let helpUIWindow = i2b2.hive.model.helpWindow;
        if (helpUIWindow && !helpUIWindow.closed) helpUIWindow.close();
        i2b2.hive.model.helpWindow = null;
    }, 
};