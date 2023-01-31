/*
 * Gijgo JavaScript Library v1.9.13
 * http://gijgo.com/
 *
 * Copyright 2014, 2019 gijgo.com
 * Released under the MIT license
 */
var gj = {};

gj.widget = function () {
    var self = this;

    self.xhr = null;

    self.generateGUID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    self.mouseX = function (e) {
        if (e) {
            if (e.pageX) {
                return e.pageX;
            } else if (e.clientX) {
                return e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
            } else if (e.touches && e.touches.length) {
                return e.touches[0].pageX;
            } else if (e.changedTouches && e.changedTouches.length) {
                return e.changedTouches[0].pageX;
            } else if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length) {
                return e.originalEvent.touches[0].pageX;
            } else if (e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
                return e.originalEvent.touches[0].pageX;
            }
        }
        return null;
    };

    self.mouseY = function (e) {
        if (e) {
            if (e.pageY) {
                return e.pageY;
            } else if (e.clientY) {
                return e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
            } else if (e.touches && e.touches.length) {
                return e.touches[0].pageY;
            } else if (e.changedTouches && e.changedTouches.length) {
                return e.changedTouches[0].pageY;
            } else if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length) {
                return e.originalEvent.touches[0].pageY;
            } else if (e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
                return e.originalEvent.touches[0].pageY;
            }
        }
        return null;
    };
};

gj.widget.prototype.init = function (jsConfig, type) {
    var option, clientConfig, fullConfig;

    this.attr('data-type', type);
    clientConfig = $.extend(true, {}, this.getHTMLConfig() || {});
    $.extend(true, clientConfig, jsConfig || {});
    fullConfig = this.getConfig(clientConfig, type);
    this.attr('data-guid', fullConfig.guid);
    this.data(fullConfig);

    // Initialize events configured as options
    for (option in fullConfig) {
        if (gj[type].events.hasOwnProperty(option)) {
            this.on(option, fullConfig[option]);
            delete fullConfig[option];
        }
    }

    // Initialize all plugins
    for (plugin in gj[type].plugins) {
        if (gj[type].plugins.hasOwnProperty(plugin)) {
            gj[type].plugins[plugin].configure(this, fullConfig, clientConfig);
        }
    }

    return this;
};

gj.widget.prototype.getConfig = function (clientConfig, type) {
    var config, uiLibrary, iconsLibrary, plugin;

    config = $.extend(true, {}, gj[type].config.base);

    uiLibrary = clientConfig.hasOwnProperty('uiLibrary') ? clientConfig.uiLibrary : config.uiLibrary;
    if (gj[type].config[uiLibrary]) {
        $.extend(true, config, gj[type].config[uiLibrary]);
    }

    iconsLibrary = clientConfig.hasOwnProperty('iconsLibrary') ? clientConfig.iconsLibrary : config.iconsLibrary;
    if (gj[type].config[iconsLibrary]) {
        $.extend(true, config, gj[type].config[iconsLibrary]);
    }

    for (plugin in gj[type].plugins) {
        if (gj[type].plugins.hasOwnProperty(plugin)) {
            $.extend(true, config, gj[type].plugins[plugin].config.base);
            if (gj[type].plugins[plugin].config[uiLibrary]) {
                $.extend(true, config, gj[type].plugins[plugin].config[uiLibrary]);
            }
            if (gj[type].plugins[plugin].config[iconsLibrary]) {
                $.extend(true, config, gj[type].plugins[plugin].config[iconsLibrary]);
            }
        }
    }

    $.extend(true, config, clientConfig);

    if (!config.guid) {
        config.guid = this.generateGUID();
    }

    return config;
}

gj.widget.prototype.getHTMLConfig = function () {
    var result = this.data(),
        attrs = this[0].attributes;
    if (attrs['width']) {
        result.width = attrs['width'].value;
    }
    if (attrs['height']) {
        result.height = attrs['height'].value;
    }
    if (attrs['value']) {
        result.value = attrs['value'].value;
    }
    if (attrs['align']) {
        result.align = attrs['align'].value;
    }
    if (result && result.source) {
        result.dataSource = result.source;
        delete result.source;
    }
    return result;
};

gj.widget.prototype.createDoneHandler = function () {
    var $widget = this;
    return function (response) {
        if (typeof (response) === 'string' && JSON) {
            response = JSON.parse(response);
        }
        gj[$widget.data('type')].methods.render($widget, response);
    };
};

gj.widget.prototype.createErrorHandler = function () {
    var $widget = this;
    return function (response) {
        if (response && response.statusText && response.statusText !== 'abort') {
            alert(response.statusText);
        }
    };
};

gj.widget.prototype.reload = function (params) {
    var ajaxOptions, result, data = this.data(), type = this.data('type');
    if (data.dataSource === undefined) {
        gj[type].methods.useHtmlDataSource(this, data);
    }
    $.extend(data.params, params);
    if ($.isArray(data.dataSource)) {
        result = gj[type].methods.filter(this);
        gj[type].methods.render(this, result);
    } else if (typeof(data.dataSource) === 'string') {
        ajaxOptions = { url: data.dataSource, data: data.params };
        if (this.xhr) {
            this.xhr.abort();
        }
        this.xhr = $.ajax(ajaxOptions).done(this.createDoneHandler()).fail(this.createErrorHandler());
    } else if (typeof (data.dataSource) === 'object') {
        if (!data.dataSource.data) {
            data.dataSource.data = {};
        }
        $.extend(data.dataSource.data, data.params);
        ajaxOptions = $.extend(true, {}, data.dataSource); //clone dataSource object
        if (ajaxOptions.dataType === 'json' && typeof(ajaxOptions.data) === 'object') {
            ajaxOptions.data = JSON.stringify(ajaxOptions.data);
        }
        if (!ajaxOptions.success) {
            ajaxOptions.success = this.createDoneHandler();
        }
        if (!ajaxOptions.error) {
            ajaxOptions.error = this.createErrorHandler();
        }
        if (this.xhr) {
            this.xhr.abort();
        }
        this.xhr = $.ajax(ajaxOptions);
    }
    return this;
}

gj.documentManager = {
    events: {},

    subscribeForEvent: function (eventName, widgetId, callback) {
        if (!gj.documentManager.events[eventName] || gj.documentManager.events[eventName].length === 0) {
            gj.documentManager.events[eventName] = [{ widgetId: widgetId, callback: callback }];
            $(document).on(eventName, gj.documentManager.executeCallbacks);
        } else if (!gj.documentManager.events[eventName][widgetId]) {
            gj.documentManager.events[eventName].push({ widgetId: widgetId, callback: callback });
        } else {
            throw 'Event ' + eventName + ' for widget with guid="' + widgetId + '" is already attached.';
        }
    },

    executeCallbacks: function (e) {
        var callbacks = gj.documentManager.events[e.type];
        if (callbacks) {
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i].callback(e);
            }
        }
    },

    unsubscribeForEvent: function (eventName, widgetId) {
        var success = false,
            events = gj.documentManager.events[eventName];
        if (events) {
            for (var i = 0; i < events.length; i++) {
                if (events[i].widgetId === widgetId) {
                    events.splice(i, 1);
                    success = true;
                    if (events.length === 0) {
                        $(document).off(eventName);
                        delete gj.documentManager.events[eventName];
                    }
                }
            }
        }
        if (!success) {
            throw 'The "' + eventName + '" for widget with guid="' + widgetId + '" can\'t be removed.';
        }
    }
};

/**
  * @widget Core
  * @plugin Base
  */
gj.core = {
    messages: {
        'en-us': {
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthShortNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],            
            weekDaysMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            weekDaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            am: 'AM',
            pm: 'PM',
            ok: 'Ok',
            cancel: 'Cancel',
            titleFormat: 'mmmm yyyy'
        }
    },

    /** 
     * @method
     * @example String.1
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.parseDate('02/03/17', 'mm/dd/yy'));
     * </script>
     * @example String.2
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.parseDate('2017 2.3', 'yyyy m.d'));
     * </script>
     * @example String.dd.mmm.yyyy
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.parseDate('05 Feb 2017', 'dd mmm yyyy'));
     * </script>
     * @example String.dd.mmmm.yyyy
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.parseDate('05 February 2017', 'dd mmmm yyyy'));
     * </script>
     * @example String.HH:MM
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.parseDate('10:57', 'HH:MM'));
     * </script>
     * @example ASP.NET.JSON.Date
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.parseDate("\/Date(349653600000)\/"));
     * </script>
     * @example UNIX.Timestamp
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.parseDate(349653600000));
     * </script>
     */
    parseDate: function (value, format, locale) {
        var i, year = 0, month = 0, date = 1, hour = 0, minute = 0, dateParts, formatParts, result;

        if (value && typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                result = new Date(value);
            } else if (value.indexOf('/Date(') > -1) {
                result = new Date(parseInt(value.substr(6), 10));
            } else if (value) {
                formatParts = format.split(/[\s,-\.//\:]+/);
                // Split only by spaces
                dateParts = value.split(/[\s]+/);
                // Split by other chars if the split by spaces doesn't work
                if (dateParts.length != formatParts.length) {
                    dateParts = value.split(/[\s,-\.//\:]+/);
                }
                for (i = 0; i < formatParts.length; i++) {
                    if (['d', 'dd'].indexOf(formatParts[i]) > -1) {
                        date = parseInt(dateParts[i], 10);
                    } else if (['m', 'mm'].indexOf(formatParts[i]) > -1) {
                        month = parseInt(dateParts[i], 10) - 1;
                    } else if ('mmm' === formatParts[i]) {
                        month = gj.core.messages[locale || 'en-us'].monthShortNames.indexOf(dateParts[i]);
                    } else if ('mmmm' === formatParts[i]) {
                        month = gj.core.messages[locale || 'en-us'].monthNames.indexOf(dateParts[i]);
                    } else if (['yy', 'yyyy'].indexOf(formatParts[i]) > -1) {
                        year = parseInt(dateParts[i], 10);
                        if (formatParts[i] === 'yy') {
                            year += 2000;
                        }
                    } else if (['h', 'hh', 'H', 'HH'].indexOf(formatParts[i]) > -1) {
                        hour = parseInt(dateParts[i], 10);
                    } else if (['M', 'MM'].indexOf(formatParts[i]) > -1) {
                        minute = parseInt(dateParts[i], 10);
                    }
                }
                result = new Date(year, month, date, hour, minute);
            }
        } else if (typeof value === 'number') {
            result = new Date(value);
        } else if (value instanceof Date) {
            result = value;
        }

        return result;
    },

    /** 
     * @method
     * @example Sample.1
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.formatDate(new Date(2017, 1, 3), 'mm/dd/yy'));
     * </script>
     * @example Sample.2
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.formatDate(new Date(2017, 1, 3), 'yyyy m.d'));
     * </script>
     * @example Sample.dd.mmm.yyyy
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.formatDate(new Date(2017, 1, 3), 'dd mmm yyyy'));
     * </script>
     * @example Sample.dd.mmmm.yyyy
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.formatDate(new Date(2017, 1, 3), 'dd mmmm yyyy'));
     * </script>
     * @example Sample.5
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.formatDate(new Date(2017, 1, 3, 20, 43, 53), 'hh:MM:ss tt mm/dd/yyyy'));
     * </script>
     * @example Sample.6
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.formatDate(new Date(2017, 1, 3, 20, 43, 53), 'hh:MM TT'));
     * </script>
     * @example Short.WeekDay
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.formatDate(new Date(2017, 1, 3), 'ddd, mmm dd'));
     * </script>
     * @example Full.WeekDay
     * <div id="date"></div>
     * <script>
     *     $('#date').text(gj.core.formatDate(new Date(2017, 1, 3), 'dddd, mmm dd'));
     * </script>
     */
    formatDate: function (date, format, locale) {
        var result = '', separator, tmp,
            formatParts = format.split(/[\s,-\.//\:]+/),
            separators = format.split(/s+|M+|H+|h+|t+|T+|d+|m+|y+/);

        separators = separators.splice(1, separators.length - 2);

        for (i = 0; i < formatParts.length; i++) {
            separator = (separators[i] || '');
            switch (formatParts[i]) {
                case 's':
                    result += date.getSeconds() + separator;
                    break;
                case 'ss':
                    result += gj.core.pad(date.getSeconds()) + separator;
                    break;
                case 'M':
                    result += date.getMinutes() + separator;
                    break;
                case 'MM':
                    result += gj.core.pad(date.getMinutes()) + separator;
                    break;
                case 'H':
                    result += date.getHours() + separator;
                    break;
                case 'HH':
                    result += gj.core.pad(date.getHours()) + separator;
                    break;
                case 'h':
                    tmp = date.getHours() > 12 ? date.getHours() % 12 : date.getHours();
                    result += tmp + separator;
                    break;
                case 'hh':
                    tmp = date.getHours() > 12 ? date.getHours() % 12 : date.getHours();
                    result += gj.core.pad(tmp) + separator;
                    break;
                case 'tt':
                    result += (date.getHours() >= 12 ? 'pm' : 'am') + separator;
                    break;
                case 'TT':
                    result += (date.getHours() >= 12 ? 'PM' : 'AM') + separator;
                    break;
                case 'd':
                    result += date.getDate() + separator;
                    break;
                case 'dd':
                    result += gj.core.pad(date.getDate()) + separator;
                    break;
                case 'ddd':
                    result += gj.core.messages[locale || 'en-us'].weekDaysShort[date.getDay()] + separator;
                    break;
                case 'dddd':
                    result += gj.core.messages[locale || 'en-us'].weekDays[date.getDay()] + separator;
                    break;
                case 'm' :
                    result += (date.getMonth() + 1) + separator;
                    break;
                case 'mm':
                    result += gj.core.pad(date.getMonth() + 1) + separator;
                    break;
                case 'mmm':
                    result += gj.core.messages[locale || 'en-us'].monthShortNames[date.getMonth()] + separator;
                    break;
                case 'mmmm':
                    result += gj.core.messages[locale || 'en-us'].monthNames[date.getMonth()] + separator;
                    break;
                case 'yy' :
                    result += date.getFullYear().toString().substr(2) + separator;
                    break;
                case 'yyyy':
                    result += date.getFullYear() + separator;
                    break;
            }
        }

        return result;
    },

    pad: function (val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) {
            val = '0' + val;
        }
        return val;
    },

    center: function ($dialog) {
        var left = ($(window).width() / 2) - ($dialog.width() / 2),
            top = ($(window).height() / 2) - ($dialog.height() / 2);
        $dialog.css('position', 'absolute');
        $dialog.css('left', left > 0 ? left : 0);
        $dialog.css('top', top > 0 ? top : 0);
    },

    isIE: function () {
        return !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);
    },

    setChildPosition: function (mainEl, childEl) {
        var mainElRect = mainEl.getBoundingClientRect(),
            mainElHeight = gj.core.height(mainEl, true),
            childElHeight = gj.core.height(childEl, true),
            mainElWidth = gj.core.width(mainEl, true),
            childElWidth = gj.core.width(childEl, true),
            scrollY = window.scrollY || window.pageYOffset || 0,
            scrollX = window.scrollX || window.pageXOffset || 0;

        if ((mainElRect.top + mainElHeight + childElHeight) > window.innerHeight && mainElRect.top > childElHeight) {
            childEl.style.top = Math.round(mainElRect.top + scrollY - childElHeight - 3) + 'px';
        } else {
            childEl.style.top = Math.round(mainElRect.top + scrollY + mainElHeight + 3) + 'px';
        }

        if (mainElRect.left + childElWidth > document.body.clientWidth) {
            childEl.style.left = Math.round(mainElRect.left + scrollX + mainElWidth - childElWidth) + 'px';
        } else {
            childEl.style.left = Math.round(mainElRect.left + scrollX) + 'px';
        }
    },

    height: function (el, margin) {
        var result, style = window.getComputedStyle(el);

        if (style.boxSizing === 'border-box') { // border-box include padding and border within the height
            result = parseInt(style.height, 10);
            if (gj.core.isIE()) {
                result += parseInt(style.paddingTop || 0, 10) + parseInt(style.paddingBottom || 0, 10);
                result += parseInt(style.borderTopWidth || 0, 10) + parseInt(style.borderBottomWidth || 0, 10);
            }
        } else {
            result = parseInt(style.height, 10);
            result += parseInt(style.paddingTop || 0, 10) + parseInt(style.paddingBottom || 0, 10);
            result += parseInt(style.borderTopWidth || 0, 10) + parseInt(style.borderBottomWidth || 0, 10);
        }

        if (margin) {
            result += parseInt(style.marginTop || 0, 10) + parseInt(style.marginBottom || 0, 10);
        }

        return result;
    },

    width: function (el, margin) {
        var result, style = window.getComputedStyle(el);

        if (style.boxSizing === 'border-box') { // border-box include padding and border within the width
            result = parseInt(style.width, 10);
        } else {
            result = parseInt(style.width, 10);
            result += parseInt(style.paddingLeft || 0, 10) + parseInt(style.paddingRight || 0, 10);
            result += parseInt(style.borderLeftWidth || 0, 10) + parseInt(style.borderRightWidth || 0, 10);
        }

        if (margin) {
            result += parseInt(style.marginLeft || 0, 10) + parseInt(style.marginRight || 0, 10);
        }

        return result;
    },

    addClasses: function (el, classes) {
        var i, arr;
        if (classes) {
            arr = classes.split(' ');
            for (i = 0; i < arr.length; i++) {
                el.classList.add(arr[i]);
            }
        }
    },

    position: function (el) {
        var xScroll, yScroll, left = 0, top = 0,
            height = gj.core.height(el),
            width = gj.core.width(el);

        while (el) {
            if (el.tagName == "BODY") {
                xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                yScroll = el.scrollTop || document.documentElement.scrollTop;
                left += el.offsetLeft - xScroll; // + el.clientLeft);
                top += el.offsetTop - yScroll; // + el.clientTop);
            } else {
                left += el.offsetLeft - el.scrollLeft; // + el.clientLeft;
                top += el.offsetTop - el.scrollTop; // + el.clientTop;
            }

            el = el.offsetParent;
        }

        return { top: top, left: left, bottom: top + height, right: left + width };
    },

    setCaretAtEnd: function (elem) {
        var elemLen;
        if (elem) {
            elemLen = elem.value.length;
            if (document.selection) { // For IE Only
                elem.focus();
                var oSel = document.selection.createRange();
                oSel.moveStart('character', -elemLen);
                oSel.moveStart('character', elemLen);
                oSel.moveEnd('character', 0);
                oSel.select();
            } else if (elem.selectionStart || elem.selectionStart == '0') { // Firefox/Chrome                
                elem.selectionStart = elemLen;
                elem.selectionEnd = elemLen;
                elem.focus();
            }
        }
    },
    getScrollParent: function (node) {
        if (node == null) {
            return null;
        } else if (node.scrollHeight > node.clientHeight) {
            return node;
        } else {
            return gj.core.getScrollParent(node.parentNode);
        }
    }
};
gj.picker = {
    messages: {
        'en-us': {
        }
    }
};

gj.picker.methods = {

    initialize: function ($input, data, methods) {
        var $calendar, $rightIcon,
            $picker = methods.createPicker($input, data),
            $wrapper = $input.parent('div[role="wrapper"]');

        if (data.uiLibrary === 'bootstrap') {
            $rightIcon = $('<span class="input-group-addon">' + data.icons.rightIcon + '</span>');
        } else if (data.uiLibrary === 'bootstrap4') {
            $rightIcon = $('<span class="input-group-append"><button class="btn btn-outline-secondary border-left-0" type="button">' + data.icons.rightIcon + '</button></span>');
        } else {
            $rightIcon = $(data.icons.rightIcon);
        }
        $rightIcon.attr('role', 'right-icon');

        if ($wrapper.length === 0) {
            $wrapper = $('<div role="wrapper" />').addClass(data.style.wrapper); // The css class needs to be added before the wrapping, otherwise doesn't work.
            $input.wrap($wrapper);
        } else {
            $wrapper.addClass(data.style.wrapper);
        }
        $wrapper = $input.parent('div[role="wrapper"]');

        data.width && $wrapper.css('width', data.width);

        $input.val(data.value).addClass(data.style.input).attr('role', 'input');

        data.fontSize && $input.css('font-size', data.fontSize);

        if (data.uiLibrary === 'bootstrap' || data.uiLibrary === 'bootstrap4') {
            if (data.size === 'small') {
                $wrapper.addClass('input-group-sm');
                $input.addClass('form-control-sm');
            } else if (data.size === 'large') {
                $wrapper.addClass('input-group-lg');
                $input.addClass('form-control-lg');
            }
        } else {
            if (data.size === 'small') {
                $wrapper.addClass('small');
            } else if (data.size === 'large') {
                $wrapper.addClass('large');
            }
        }

        $rightIcon.on('click', function (e) {
            if ($picker.is(':visible')) {
                $input.close();
            } else {
                $input.open();
            }
        });
        $wrapper.append($rightIcon);

        if (data.footer !== true) {
            $input.on('blur', function () {
                $input.timeout = setTimeout(function () {
                    $input.close();
                }, 500);
            });
            $picker.mousedown(function () {
                clearTimeout($input.timeout);
                $input.focus();
                return false;
            });
            $picker.on('click', function () {
                clearTimeout($input.timeout);
                $input.focus();
            });
        }
    }
};


gj.picker.widget = function ($element, jsConfig) {
    var self = this,
        methods = gj.picker.methods;

    self.destroy = function () {
        return methods.destroy(this);
    };

    return $element;
};

gj.picker.widget.prototype = new gj.widget();
gj.picker.widget.constructor = gj.picker.widget;

gj.picker.widget.prototype.init = function (jsConfig, type, methods) {
    gj.widget.prototype.init.call(this, jsConfig, type);
    this.attr('data-' + type, 'true');
    gj.picker.methods.initialize(this, this.data(), gj[type].methods);
    return this;
};

gj.picker.widget.prototype.open = function (type) {
    var data = this.data(),
        $picker = $('body').find('[role="picker"][guid="' + this.attr('data-guid') + '"]');

    $picker.show();
    $picker.closest('div[role="modal"]').show();
    if (data.modal) {
        gj.core.center($picker);
    } else {
        gj.core.setChildPosition(this[0], $picker[0]);
        this.focus();
    }
    clearTimeout(this.timeout);

    gj[type].events.open(this);

    return this;
};

gj.picker.widget.prototype.close = function (type) {
    var $picker = $('body').find('[role="picker"][guid="' + this.attr('data-guid') + '"]');
    $picker.hide();
    $picker.closest('div[role="modal"]').hide();
    gj[type].events.close(this);
    return this;
};

gj.picker.widget.prototype.destroy = function (type) {
    var data = this.data(),
        $parent = this.parent(),
        $picker = $('body').find('[role="picker"][guid="' + this.attr('data-guid') + '"]');
    if (data) {
        this.off();
        if ($picker.parent('[role="modal"]').length > 0) {
            $picker.unwrap();
        }
        $picker.remove();
        this.removeData();
        this.removeAttr('data-type').removeAttr('data-guid').removeAttr('data-' + type);
        this.removeClass();
        $parent.children('[role="right-icon"]').remove();
        this.unwrap();
    }
    return this;
};
/* global window alert jQuery */
/** 
 * @widget Dialog 
 * @plugin Base
 */
gj.dialog = {
    plugins: {},
    messages: {}
};

gj.dialog.config = {
    base: {
        /** If set to true, the dialog will automatically open upon initialization.
         * If false, the dialog will stay hidden until the open() method is called.
         * @type boolean
         * @default true
         * @example True <!-- dialog.base, draggable -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         autoOpen: true
         *     });
         * </script>
         * @example False <!-- dialog.base, bootstrap -->
         * <div id="dialog" style="display: none">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <button onclick="dialog.open()" class="btn btn-default">Open Dialog</button>
         * <script>
         *     var dialog = $("#dialog").dialog({
         *         uiLibrary: 'bootstrap',
         *         autoOpen: false
         *     });
         * </script>
         */
        autoOpen: true,

        /** Specifies whether the dialog should have a close button in right part of dialog header.
         * @type boolean
         * @default true
         * @example True <!-- dialog.base, draggable -->
         * <div id="dialog">
         *     <div data-role="header"><h4 data-role="title">Dialog</h4></div>
         *     <div data-role="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         *     <div data-role="footer">
         *         <button onclick="dialog.close()" class="gj-button-md">Ok</button>
         *         <button onclick="dialog.close()" class="gj-button-md">Cancel</button>
         *     </div>
         * </div>
         * <script>
         *     var dialog = $("#dialog").dialog({
         *         closeButtonInHeader: true,
         *         height: 200
         *     });
         * </script>
         * @example False <!-- dialog.base, draggable -->
         * <div id="dialog">
         *     <div data-role="header"><h4 data-role="title">Dialog</h4></div>
         *     <div data-role="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         *     <div data-role="footer">
         *         <button onclick="dialog.close()" class="gj-button-md">Ok</button>
         *         <button onclick="dialog.close()" class="gj-button-md">Cancel</button>
         *     </div>
         * </div>
         * <script>
         *     var dialog = $("#dialog").dialog({
         *         closeButtonInHeader: false
         *     });
         * </script>
         */
        closeButtonInHeader: true,

        /** Specifies whether the dialog should close when it has focus and the user presses the escape (ESC) key.
         * @type boolean
         * @default true
         * @example True <!-- dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         closeOnEscape: true
         *     });
         * </script>
         * @example False <!-- dialog.base, draggable -->
         * <div id="dialog" style="display: none">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         closeOnEscape: false
         *     });
         * </script>
         */
        closeOnEscape: true,

        /** If set to true, the dialog will be draggable by the title bar.
         * @type boolean
         * @default true
         * @example True <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         draggable: true
         *     });
         * </script>
         * @example False <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         draggable: false
         *     });
         * </script>
         */
        draggable: true,

        /** The height of the dialog.
         * @additionalinfo Support string and number values. The number value sets the height in pixels.
         * The only supported string value is "auto" which will allow the dialog height to adjust based on its content.
         * @type (number|string)
         * @default "auto"
         * @example Short.Text <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         height: 200
         *     });
         * </script>
         * @example Long.Text.Material.Design <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus porttitor quam in magna vulputate, vitae laoreet odio ultrices. Phasellus at efficitur magna. Mauris purus dolor, egestas quis leo et, vulputate dictum mauris. Vivamus maximus lectus sollicitudin lorem blandit tempor. Maecenas eget posuere mi. Suspendisse id hendrerit nibh. Morbi eu odio euismod, venenatis ipsum in, egestas nunc. Mauris dignissim metus ac risus porta eleifend. Aliquam tempus libero orci, id placerat odio vehicula eu. Donec tincidunt justo dolor, sit amet tempus turpis varius sit amet. Suspendisse ut ex blandit, hendrerit enim tristique, iaculis ipsum. Vivamus venenatis dolor justo, eget scelerisque lacus dignissim quis. Duis imperdiet ex at aliquet cursus. Proin non ultricies leo. Fusce quam diam, laoreet quis fringilla vitae, viverra id magna. Nam laoreet sem in volutpat rhoncus.</div>
         * <script>
         *     $("#dialog").dialog({
         *         height: 350
         *     });
         * </script>
         * @example Long.Text.Bootstrap3 <!-- bootstrap, draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus porttitor quam in magna vulputate, vitae laoreet odio ultrices. Phasellus at efficitur magna. Mauris purus dolor, egestas quis leo et, vulputate dictum mauris. Vivamus maximus lectus sollicitudin lorem blandit tempor. Maecenas eget posuere mi. Suspendisse id hendrerit nibh. Morbi eu odio euismod, venenatis ipsum in, egestas nunc. Mauris dignissim metus ac risus porta eleifend. Aliquam tempus libero orci, id placerat odio vehicula eu. Donec tincidunt justo dolor, sit amet tempus turpis varius sit amet. Suspendisse ut ex blandit, hendrerit enim tristique, iaculis ipsum. Vivamus venenatis dolor justo, eget scelerisque lacus dignissim quis. Duis imperdiet ex at aliquet cursus. Proin non ultricies leo. Fusce quam diam, laoreet quis fringilla vitae, viverra id magna. Nam laoreet sem in volutpat rhoncus.</div>
         * <script>
         *     $("#dialog").dialog({
         *         height: 350,
         *         uiLibrary: 'bootstrap'
         *     });
         * </script>
         * @example Long.Text.Bootstrap4 <!-- bootstrap4, draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus porttitor quam in magna vulputate, vitae laoreet odio ultrices. Phasellus at efficitur magna. Mauris purus dolor, egestas quis leo et, vulputate dictum mauris. Vivamus maximus lectus sollicitudin lorem blandit tempor. Maecenas eget posuere mi. Suspendisse id hendrerit nibh. Morbi eu odio euismod, venenatis ipsum in, egestas nunc. Mauris dignissim metus ac risus porta eleifend. Aliquam tempus libero orci, id placerat odio vehicula eu. Donec tincidunt justo dolor, sit amet tempus turpis varius sit amet. Suspendisse ut ex blandit, hendrerit enim tristique, iaculis ipsum. Vivamus venenatis dolor justo, eget scelerisque lacus dignissim quis. Duis imperdiet ex at aliquet cursus. Proin non ultricies leo. Fusce quam diam, laoreet quis fringilla vitae, viverra id magna. Nam laoreet sem in volutpat rhoncus.</div>
         * <script>
         *     $("#dialog").dialog({
         *         height: 350,
         *         uiLibrary: 'bootstrap4'
         *     });
         * </script>
         */
        height: 'auto',

        /** The language that needs to be in use.
         * @type string
         * @default 'en-us'
         * @example French.Default <!-- draggable, dialog.base-->
         * <script src="../../dist/modular/dialog/js/messages/messages.fr-fr.js"></script>
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         resizable: true,
         *         locale: 'fr-fr'
         *     });
         * </script>
         * @example French.Custom <!-- draggable, dialog.base -->
         * <script src="../../dist/modular/dialog/js/messages/messages.fr-fr.js"></script>
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     gj.dialog.messages['fr-fr'].DefaultTitle = 'Titre de la boîte de dialogue';
         *     $("#dialog").dialog({
         *         resizable: true,
         *         locale: 'fr-fr',
         *         width: 700
         *     });
         * </script>
         */
        locale: 'en-us',

        /** The maximum height in pixels to which the dialog can be resized.
         * @type number
         * @default undefined
         * @example sample <!-- draggable, dialog.base -->
         * <div id="dialog">The maximum height of this dialog is set to 300 px. Try to resize it for testing.</div>
         * <script>
         *     $("#dialog").dialog({
         *         resizable: true,
         *         height: 200,
         *         maxHeight: 300
         *     });
         * </script>
         */
        maxHeight: undefined,

        /** The maximum width in pixels to which the dialog can be resized.
         * @type number
         * @default undefined
         * @example sample <!-- draggable, dialog.base -->
         * <div id="dialog">The maximum width of this dialog is set to 400 px. Try to resize it for testing.</div>
         * <script>
         *     $("#dialog").dialog({
         *         resizable: true,
         *         maxWidth: 400
         *     });
         * </script>
         */
        maxWidth: undefined,

        /** The minimum height in pixels to which the dialog can be resized.
         * @type number
         * @default undefined
         * @example sample <!-- draggable, dialog.base -->
         * <div id="dialog">The minimum height of this dialog is set to 200 px. Try to resize it for testing.</div>
         * <script>
         *     $("#dialog").dialog({
         *         resizable: true,
         *         height: 300,
         *         minHeight: 200
         *     });
         * </script>
         */
        minHeight: undefined,

        /** The minimum width in pixels to which the dialog can be resized.
         * @type number
         * @default undefined
         * @example sample <!-- draggable, dialog.base -->
         * <div id="dialog">The minimum width of this dialog is set to 200 px. Try to resize it for testing.</div>
         * <script>
         *     $("#dialog").dialog({
         *         resizable: true,
         *         minWidth: 200
         *     });
         * </script>
         */
        minWidth: undefined,

        /** If set to true, the dialog will have modal behavior.
         * Modal dialogs create an overlay below the dialog, but above other page elements and you can't interact with them.
         * @type boolean
         * @default false
         * @example True.Material.Design <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         modal: true
         *     });
         * </script>
         * @example True.Bootstrap.4 <!-- bootstrap4, draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         modal: true,
         *         uiLibrary: 'bootstrap4'
         *     });
         * </script>
         * @example False <!-- draggable, dialog.base, bootstrap -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         modal: false
         *     });
         * </script>
         */
        modal: false,

        /** If set to true, the dialog will be resizable.
         * @type boolean
         * @default false
         * @example True <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         resizable: true
         *     });
         * </script>
         * @example False <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         resizable: false
         *     });
         * </script>
         */
        resizable: false,

        /** If set to true, add vertical scroller to the dialog body.
         * @type Boolean
         * @default false
         * @example Bootstrap.3 <!-- bootstrap, draggable, dialog.base -->
         * <div id="dialog">
         *     <div data-role="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus porttitor quam in magna vulputate, vitae laoreet odio ultrices. Phasellus at efficitur magna. Mauris purus dolor, egestas quis leo et, vulputate dictum mauris. Vivamus maximus lectus sollicitudin lorem blandit tempor. Maecenas eget posuere mi. Suspendisse id hendrerit nibh. Morbi eu odio euismod, venenatis ipsum in, egestas nunc. Mauris dignissim metus ac risus porta eleifend. Aliquam tempus libero orci, id placerat odio vehicula eu. Donec tincidunt justo dolor, sit amet tempus turpis varius sit amet. Suspendisse ut ex blandit, hendrerit enim tristique, iaculis ipsum. Vivamus venenatis dolor justo, eget scelerisque lacus dignissim quis. Duis imperdiet ex at aliquet cursus. Proin non ultricies leo. Fusce quam diam, laoreet quis fringilla vitae, viverra id magna. Nam laoreet sem in volutpat rhoncus.</div>
         *     <div data-role="footer">
         *         <button class="btn btn-default" data-role="close">Cancel</button>
         *         <button class="btn btn-default" onclick="dialog.close()">OK</button>
         *     </div>
         * </div>
         * <script>
         *     var dialog = $("#dialog").dialog({
         *         scrollable: true,
         *         height: 300,
         *         uiLibrary: 'bootstrap'
         *     });
         * </script>
         * @example Bootstrap.4 <!-- bootstrap4, draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus porttitor quam in magna vulputate, vitae laoreet odio ultrices. Phasellus at efficitur magna. Mauris purus dolor, egestas quis leo et, vulputate dictum mauris. Vivamus maximus lectus sollicitudin lorem blandit tempor. Maecenas eget posuere mi. Suspendisse id hendrerit nibh. Morbi eu odio euismod, venenatis ipsum in, egestas nunc. Mauris dignissim metus ac risus porta eleifend. Aliquam tempus libero orci, id placerat odio vehicula eu. Donec tincidunt justo dolor, sit amet tempus turpis varius sit amet. Suspendisse ut ex blandit, hendrerit enim tristique, iaculis ipsum. Vivamus venenatis dolor justo, eget scelerisque lacus dignissim quis. Duis imperdiet ex at aliquet cursus. Proin non ultricies leo. Fusce quam diam, laoreet quis fringilla vitae, viverra id magna. Nam laoreet sem in volutpat rhoncus.</div>
         * <script>
         *     $("#dialog").dialog({
         *         scrollable: true,
         *         height: 300,
         *         uiLibrary: 'bootstrap'
         *     });
         * </script>
         * @example Material.Design <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus porttitor quam in magna vulputate, vitae laoreet odio ultrices. Phasellus at efficitur magna. Mauris purus dolor, egestas quis leo et, vulputate dictum mauris. Vivamus maximus lectus sollicitudin lorem blandit tempor. Maecenas eget posuere mi. Suspendisse id hendrerit nibh. Morbi eu odio euismod, venenatis ipsum in, egestas nunc. Mauris dignissim metus ac risus porta eleifend. Aliquam tempus libero orci, id placerat odio vehicula eu. Donec tincidunt justo dolor, sit amet tempus turpis varius sit amet. Suspendisse ut ex blandit, hendrerit enim tristique, iaculis ipsum. Vivamus venenatis dolor justo, eget scelerisque lacus dignissim quis. Duis imperdiet ex at aliquet cursus. Proin non ultricies leo. Fusce quam diam, laoreet quis fringilla vitae, viverra id magna. Nam laoreet sem in volutpat rhoncus.</div>
         * <script>
         *     $("#dialog").dialog({
         *         scrollable: true,
         *         height: 300,
         *         uiLibrary: 'materialdesign'
         *     });
         * </script>
         */
        scrollable: false,

        /** The title of the dialog. Can be also set through the title attribute of the html element.
         * @type String
         * @default "Dialog"
         * @example Js.Config <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         title: 'My Custom Title',
         *         width: 400
         *     });
         * </script>
         * @example Html.Config <!-- draggable, dialog.base -->
         * <div id="dialog" title="My Custom Title" width="400">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog();
         * </script>
         */
        title: undefined,

        /** The name of the UI library that is going to be in use. Currently we support Material Design and Bootstrap.
         * @additionalinfo The css file for bootstrap should be manually included if you use bootstrap.
         * @type string (bootstrap|materialdesign)
         * @default undefined
         * @example Bootstrap.3 <!-- draggable, dialog.base, bootstrap -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         uiLibrary: 'bootstrap'
         *     });
         * </script>
         * @example Bootstrap.4 <!-- draggable, dialog.base, bootstrap4 -->
         * <div id="dialog">
         *     <div data-role="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         *     <div data-role="footer">
         *         <button class="btn btn-default" data-role="close">Cancel</button>
         *         <button class="btn btn-default" onclick="dialog.close()">OK</button>
         *     </div>
         * </div>
         * <script>
         *     var dialog = $("#dialog").dialog({
         *         uiLibrary: 'bootstrap4'
         *     });
         * </script>
         * @example Material.Design <!-- draggable, dialog.base  -->
         * <div id="dialog">
         *   <div data-role="body">
         *     Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
         *     Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
         *   </div>
         *   <div data-role="footer">
         *     <button class="gj-button-md" onclick="dialog.close()">OK</button>
         *     <button class="gj-button-md" data-role="close">Cancel</button>
         *   </div>
         * </div>
         * <script>
         *     var dialog = $("#dialog").dialog({
         *         uiLibrary: 'materialdesign',
         *         resizable: true
         *     });
         * </script>
         */
        uiLibrary: undefined,

        /** The width of the dialog.
         * @type number
         * @default 300
         * @example Fixed.Width <!-- draggable, dialog.base -->
         * <div id="dialog">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</div>
         * <script>
         *     $("#dialog").dialog({
         *         width: 400
         *     });
         * </script>
         * @example Auto.Width <!-- draggable, dialog.base -->
         * <div id="dialog" title="Wikipedia">
         *   <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png" width="420"/>
         * </div>
         * <script>
         *     $("#dialog").dialog({
         *         width: 'auto'
         *     });
         * </script>
         */
        width: 300,

        style: {
            modal: 'gj-modal',
            content: 'gj-dialog-md',
            header: 'gj-dialog-md-header gj-unselectable',
            headerTitle: 'gj-dialog-md-title',
            headerCloseButton: 'gj-dialog-md-close',
            body: 'gj-dialog-md-body',
            footer: 'gj-dialog-footer gj-dialog-md-footer'
        }
    },

    bootstrap: {
        style: {
            modal: 'modal',
            content: 'modal-content gj-dialog-bootstrap',
            header: 'modal-header',
            headerTitle: 'modal-title',
            headerCloseButton: 'close',
            body: 'modal-body',
            footer: 'gj-dialog-footer modal-footer'
        }
    },

    bootstrap4: {
        style: {
            modal: 'modal',
            content: 'modal-content gj-dialog-bootstrap4',
            header: 'modal-header',
            headerTitle: 'modal-title',
            headerCloseButton: 'close',
            body: 'modal-body',
            footer: 'gj-dialog-footer modal-footer'
        }
    }
};



/* global window alert jQuery */
/** 
 * @widget Draggable 
 * @plugin Base
 */
gj.draggable = {
    plugins: {}
};

gj.draggable.config = {
    base: {
        /** If specified, restricts dragging from starting unless the mousedown occurs on the specified element.
         * Only elements that descend from the draggable element are permitted.
         * @type jquery element
         * @default undefined
         * @example sample <!-- draggable -->
         * <style>
         * .element { border: 1px solid #999; width: 300px; height: 200px; }
         * .handle { background-color: #DDD; cursor: move; width: 200px; margin: 5px auto 0px auto; text-align: center; padding: 5px; }
         * </style>
         * <div id="element" class="element">
         *   <div id="handle" class="handle">Handle for dragging</div>
         * </div>
         * <script>
         *     $('#element').draggable({
         *         handle: $('#handle')
         *     });
         * </script>
         */
        handle: undefined,

        /** If set to false, restricts dragging on vertical direction.
         * @type Boolean
         * @default true
         * @example sample <!-- draggable -->
         * <style>
         * .element { border: 1px solid #999; width: 300px; height: 200px; cursor: move; text-align: center; background-color: #DDD; }
         * </style>
         * <div id="element" class="element">
         *     drag me<br/>
         *     <i>(dragging on vertical direction is disabled)</i>
         * </div>
         * <script>
         *     $('#element').draggable({
         *         vertical: false
         *     });
         * </script>
         */
        vertical: true,

        /** If set to false, restricts dragging on horizontal direction.
         * @type Boolean
         * @default true
         * @example sample <!-- draggable -->
         * <style>
         * .element { border: 1px solid #999; width: 300px; height: 200px; cursor: move; text-align: center; background-color: #DDD; }
         * </style>
         * <div id="element" class="element">
         *     drag me<br/>
         *     <i>(dragging on horizontal direction is disabled)</i>
         * </div>
         * <script>
         *     $('#element').draggable({
         *         horizontal: false
         *     });
         * </script>
         */
        horizontal: true,

        /** Constrains dragging to within the bounds of the specified element.
         * @type Element
         * @default undefined
         * @example sample <!-- draggable -->
         * <style>
         * .container { border: 1px solid #999; width: 600px; height: 600px; }
         * .element { border: 1px solid #999; width: 300px; height: 200px; cursor: move; text-align: center; background-color: #DDD; }
         * </style>
         * <div id="container" class="container">
         *     <div id="element" class="element">drag me</div>
         * </div>
         * <script>
         *     $('#element').draggable({
         *         containment: document.getElementById('container')
         *     });
         * </script>
         */
        containment: undefined
    }
};

gj.draggable.methods = {
    init: function (jsConfig) {
        var $handleEl, data, $dragEl = this;

        gj.widget.prototype.init.call(this, jsConfig, 'draggable');
        data = this.data();
        $dragEl.attr('data-draggable', 'true');

        $handleEl = gj.draggable.methods.getHandleElement($dragEl);

        $handleEl.on('touchstart mousedown', function (e) {
            var position = gj.core.position($dragEl[0]);
            $dragEl[0].style.top = position.top + 'px';
            $dragEl[0].style.left = position.left + 'px';
            $dragEl[0].style.position = 'fixed';

            $dragEl.attr('draggable-dragging', true);
            $dragEl.removeAttr('draggable-x').removeAttr('draggable-y');
            gj.documentManager.subscribeForEvent('touchmove', $dragEl.data('guid'), gj.draggable.methods.createMoveHandler($dragEl, $handleEl, data));
            gj.documentManager.subscribeForEvent('mousemove', $dragEl.data('guid'), gj.draggable.methods.createMoveHandler($dragEl, $handleEl, data));
        });

        gj.documentManager.subscribeForEvent('mouseup', $dragEl.data('guid'), gj.draggable.methods.createUpHandler($dragEl));
        gj.documentManager.subscribeForEvent('touchend', $dragEl.data('guid'), gj.draggable.methods.createUpHandler($dragEl));
        gj.documentManager.subscribeForEvent('touchcancel', $dragEl.data('guid'), gj.draggable.methods.createUpHandler($dragEl));

        return $dragEl;
    },

    getHandleElement: function ($dragEl) {
        var $handle = $dragEl.data('handle');
        return ($handle && $handle.length) ? $handle : $dragEl;
    },

    createUpHandler: function ($dragEl) {
        return function (e) {
            if ($dragEl.attr('draggable-dragging') === 'true') {
                $dragEl.attr('draggable-dragging', false);
                gj.documentManager.unsubscribeForEvent('mousemove', $dragEl.data('guid'));
                gj.documentManager.unsubscribeForEvent('touchmove', $dragEl.data('guid'));
                gj.draggable.events.stop($dragEl, { x: $dragEl.mouseX(e), y: $dragEl.mouseY(e) });
            }
        };
    },

    createMoveHandler: function ($dragEl, $handleEl, data) {
        return function (e) {
            var mouseX, mouseY, offsetX, offsetY, prevX, prevY;
            if ($dragEl.attr('draggable-dragging') === 'true') {
                mouseX = Math.round($dragEl.mouseX(e));
                mouseY = Math.round($dragEl.mouseY(e));
                prevX = $dragEl.attr('draggable-x');
                prevY = $dragEl.attr('draggable-y');
                if (prevX && prevY) {
                    offsetX = data.horizontal ? mouseX - parseInt(prevX, 10) : 0;
                    offsetY = data.vertical ? mouseY - parseInt(prevY, 10) : 0;
                    gj.draggable.methods.move($dragEl[0], data, offsetX, offsetY, mouseX, mouseY);
                } else {
                    gj.draggable.events.start($dragEl, mouseX, mouseY);
                }
                $dragEl.attr('draggable-x', mouseX);
                $dragEl.attr('draggable-y', mouseY);
            }
        }
    },

    move: function (dragEl, data, offsetX, offsetY, mouseX, mouseY) {
        var contPosition, maxTop, maxLeft,
            position = gj.core.position(dragEl),
            newTop = position.top + offsetY,
            newLeft = position.left + offsetX;

        if (data.containment) {
            contPosition = gj.core.position(data.containment);
            maxTop = contPosition.top + gj.core.height(data.containment) - gj.core.height(dragEl);
            maxLeft = contPosition.left + gj.core.width(data.containment) - gj.core.width(dragEl);
            if (newTop > contPosition.top && newTop < maxTop) {
                if (contPosition.top >= mouseY || contPosition.bottom <= mouseY) {
                    newTop = position.top;
                }
            } else {
                if (newTop <= contPosition.top) {
                    newTop = contPosition.top + 1;
                } else {
                    newTop = maxTop - 1;
                }
            }
            if (newLeft > contPosition.left && newLeft < maxLeft) {
                if (contPosition.left >= mouseX || contPosition.right <= mouseX) {
                    newLeft = position.left;
                }
            } else {
                if (newLeft <= contPosition.left) {
                    newLeft = contPosition.left + 1;
                } else {
                    newLeft = maxLeft - 1;
                }
            }
        }

        if (false !== gj.draggable.events.drag($(dragEl), newLeft, newTop, mouseX, mouseY)) {
            dragEl.style.top = newTop + 'px';
            dragEl.style.left = newLeft + 'px';
        }
    },

    destroy: function ($dragEl) {
        if ($dragEl.attr('data-draggable') === 'true') {
            gj.documentManager.unsubscribeForEvent('mouseup', $dragEl.data('guid'));
            $dragEl.removeData();
            $dragEl.removeAttr('data-guid').removeAttr('data-type').removeAttr('data-draggable');
            $dragEl.removeAttr('draggable-x').removeAttr('draggable-y').removeAttr('draggable-dragging');
            $dragEl[0].style.top = '';
            $dragEl[0].style.left = '';
            $dragEl[0].style.position = '';
            $dragEl.off('drag').off('start').off('stop');
            gj.draggable.methods.getHandleElement($dragEl).off('mousedown');
        }
        return $dragEl;
    }
};

gj.draggable.events = {
    /**
     * Triggered while the mouse is moved during the dragging, immediately before the current move happens.
     *
     * @event drag
     * @param {object} e - event data
     * @param {object} newPosition - New position of the draggable element as { top, left } object.
     * @param {object} mousePosition - Current mouse position as { x, y } object.
     * @example sample <!-- draggable -->
     * <style>
     * .element { border: 1px solid #999; width: 300px; height: 200px; cursor: move; text-align: center; background-color: #DDD; }
     * </style>
     * <div id="element" class="element gj-unselectable">drag me</div>
     * <script>
     *     $('#element').draggable({
     *         drag: function (e, newPosition, mousePosition) {
     *             $('body').append('<div>The drag event is fired. New Element Position = { top:' + newPosition.top + ', left: ' + newPosition.left + '}.</div>');
     *         }
     *     });
     * </script>
     */
    drag: function ($dragEl, newLeft, newTop, mouseX, mouseY) {
        return $dragEl.triggerHandler('drag', [{ left: newLeft, top: newTop }, { x: mouseX, y: mouseY }]);
    },

    /**
     * Triggered when dragging starts.
     *
     * @event start
     * @param {object} e - event data
     * @param {object} mousePosition - Current mouse position as { x, y } object.
     * @example sample <!-- draggable -->
     * <style>
     * .element { border: 1px solid #999; width: 300px; height: 200px; cursor: move; text-align: center; background-color: #DDD; }
     * </style>
     * <div id="element" class="element gj-unselectable">
     *   drag me
     * </div>
     * <script>
     *     $('#element').draggable({
     *         start: function (e, mousePosition) {
     *             $('body').append('<div>The start event is fired. mousePosition { x:' + mousePosition.x + ', y: ' + mousePosition.y + '}.</div>');
     *         }
     *     });
     * </script>
     */
    start: function ($dragEl, mouseX, mouseY) {
        $dragEl.triggerHandler('start', [{ x: mouseX, y: mouseY }]);
    },

    /**
     * Triggered when dragging stops.
     *
     * @event stop
     * @param {object} e - event data
     * @param {object} mousePosition - Current mouse position as { x, y } object.
     * @example sample <!-- draggable -->
     * <style>
     * .element { border: 1px solid #999; width: 300px; height: 200px; cursor: move; text-align: center; background-color: #DDD; }
     * </style>
     * <div id="element" class="element gj-unselectable">
     *   drag me
     * </div>
     * <script>
     *     $('#element').draggable({
     *         stop: function (e, offset) {
     *             $('body').append('<div>The stop event is fired.</div>');
     *         }
     *     });
     * </script>
     */
    stop: function ($dragEl, mousePosition) {
        $dragEl.triggerHandler('stop', [mousePosition]);
    }
};

gj.draggable.widget = function ($element, jsConfig) {
    var self = this,
        methods = gj.draggable.methods;

    if (!$element.destroy) {
        /** Remove draggable functionality from the element.
         * @method
         * @return jquery element
         * @example sample <!-- draggable -->
         * <style>
         * .element { border: 1px solid #999; width: 300px; height: 200px; cursor: move; text-align: center; background-color: #DDD; }
         * </style>
         * <button onclick="dragEl.destroy()" class="gj-button-md">Destroy</button>
         * <div id="element" class="element">Drag Me</div>
         * <script>
         *     var dragEl = $('#element').draggable();
         * </script>
         */
        self.destroy = function () {
            return methods.destroy(this);
        };
    }

    $.extend($element, self);
    if ('true' !== $element.attr('data-draggable')) {
        methods.init.call($element, jsConfig);
    }

    return $element;
};

gj.draggable.widget.prototype = new gj.widget();
gj.draggable.widget.constructor = gj.draggable.widget;

(function ($) {
    $.fn.draggable = function (method) {
        var $widget;
        if (this && this.length) {
            if (typeof method === 'object' || !method) {
                return new gj.draggable.widget(this, method);
            } else {
                $widget = new gj.draggable.widget(this, null);
                if ($widget[method]) {
                    return $widget[method].apply(this, Array.prototype.slice.call(arguments, 1));
                } else {
                    throw 'Method ' + method + ' does not exist.';
                }
            }
        }
    };
})(jQuery);
/* global window alert jQuery */
/** 
 * @widget Droppable 
 * @plugin Base
 */
gj.droppable = {
    plugins: {}
};

gj.droppable.config = {
    /** If specified, the class will be added to the droppable while draggable is being hovered over the droppable.
     * @type string
     * @default undefined
     * @example sample <!-- droppable, draggable -->
     * <style>
     * .draggable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .droppable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .hover { background-color: #FF0000; }
     * </style>
     * <div id="droppable" class="droppable">Drop Here</div>
     * <div id="draggable" class="draggable">Drag Me</div>
     * <script>
     *     $('#draggable').draggable();
     *     $('#droppable').droppable({ hoverClass: 'hover' });
     * </script>
     */
    hoverClass: undefined
};

gj.droppable.methods = {
    init: function (jsConfig) {
        var $dropEl = this;

        gj.widget.prototype.init.call(this, jsConfig, 'droppable');
        $dropEl.attr('data-droppable', 'true');
        
        gj.documentManager.subscribeForEvent('mousedown', $dropEl.data('guid'), gj.droppable.methods.createMouseDownHandler($dropEl));
        gj.documentManager.subscribeForEvent('mousemove', $dropEl.data('guid'), gj.droppable.methods.createMouseMoveHandler($dropEl));
        gj.documentManager.subscribeForEvent('mouseup', $dropEl.data('guid'), gj.droppable.methods.createMouseUpHandler($dropEl));
        
        return $dropEl;
    },

    createMouseDownHandler: function ($dropEl) {
        return function (e) {
            $dropEl.isDragging = true;
        }
    },

    createMouseMoveHandler: function ($dropEl) {
        return function (e) {
            if ($dropEl.isDragging) {
                var hoverClass = $dropEl.data('hoverClass'),
                    mousePosition = {
                        x: $dropEl.mouseX(e),
                        y: $dropEl.mouseY(e)
                    },
                    newIsOver = gj.droppable.methods.isOver($dropEl, mousePosition);
                if (newIsOver != $dropEl.isOver) {
                    if (newIsOver) {
                        if (hoverClass) {
                            $dropEl.addClass(hoverClass);
                        }
                        gj.droppable.events.over($dropEl, mousePosition);
                    } else {
                        if (hoverClass) {
                            $dropEl.removeClass(hoverClass);
                        }
                        gj.droppable.events.out($dropEl);
                    }
                }
                $dropEl.isOver = newIsOver;
            }
        }
    },

    createMouseUpHandler: function ($dropEl) {
        return function (e) {
            var mousePosition = {
                left: $dropEl.mouseX(e),
                top: $dropEl.mouseY(e)
            };
            $dropEl.isDragging = false;
            if (gj.droppable.methods.isOver($dropEl, mousePosition)) {
                gj.droppable.events.drop($dropEl);
            }
        }
    },

    isOver: function ($dropEl, mousePosition) {
        var offsetTop = $dropEl.offset().top,
            offsetLeft = $dropEl.offset().left;
        return mousePosition.x > offsetLeft && mousePosition.x < (offsetLeft + $dropEl.outerWidth(true))
            && mousePosition.y > offsetTop && mousePosition.y < (offsetTop + $dropEl.outerHeight(true));
    },

    destroy: function ($dropEl) {
        if ($dropEl.attr('data-droppable') === 'true') {
            gj.documentManager.unsubscribeForEvent('mousedown', $dropEl.data('guid'));
            gj.documentManager.unsubscribeForEvent('mousemove', $dropEl.data('guid'));
            gj.documentManager.unsubscribeForEvent('mouseup', $dropEl.data('guid'));
            $dropEl.removeData();
            $dropEl.removeAttr('data-guid');
            $dropEl.removeAttr('data-droppable');
            $dropEl.off('drop').off('over').off('out');
        }
        return $dropEl;
    }
};

gj.droppable.events = {
    /** Triggered when a draggable element is dropped.
     * @event drop
     * @param {object} e - event data
     * @example sample <!-- droppable, draggable -->
     * <style>
     * .draggable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .droppable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .drop { background-color: #FF0000; }
     * </style>
     * <div id="droppable" class="droppable">Drop Here</div>
     * <div id="draggable" class="draggable">Drag Me</div>
     * <script>
     *     $('#draggable').draggable();
     *     $('#droppable').droppable({ drop: function() { $(this).addClass('drop') } });
     * </script>
     */
    drop: function ($dropEl, offsetX, offsetY) {
        $dropEl.trigger('drop', [{ top: offsetY, left: offsetX }]);
    },

    /** Triggered when a draggable element is dragged over the droppable.
     * @event over
     * @param {object} e - event data
     * @param {object} mousePosition - Current mouse position as { top, left } object.
     * @example sample <!-- droppable, draggable -->
     * <style>
     * .draggable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .droppable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .hover { background-color: #FF0000; }
     * </style>
     * <div id="droppable" class="droppable">Drop Here</div>
     * <div id="draggable" class="draggable">Drag Me</div>
     * <script>
     *     $('#draggable').draggable();
     *     $('#droppable').droppable({
     *         over: function() { 
     *             $(this).addClass('hover')
     *         },
     *         out: function() {
     *             $(this).removeClass('hover')
     *         }
     *     });
     * </script>
     */
    over: function ($dropEl, mousePosition) {
        $dropEl.trigger('over', [mousePosition]);
    },

    /** Triggered when a draggable element is dragged out of the droppable.
     * @event out
     * @param {object} e - event data
     * @example sample <!-- droppable, draggable -->
     * <style>
     * .draggable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .droppable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .hover { background-color: #FF0000; }
     * </style>
     * <div id="droppable" class="droppable">Drop Here</div>
     * <div id="draggable" class="draggable">Drag Me</div>
     * <script>
     *     $('#draggable').draggable();
     *     $('#droppable').droppable({
     *         over: function() { $(this).addClass('hover') },
     *         out: function() { $(this).removeClass('hover') }
     *     });
     * </script>
     */
    out: function ($dropEl) {
        $dropEl.trigger('out');
    }
};

gj.droppable.widget = function ($element, jsConfig) {
    var self = this,
        methods = gj.droppable.methods;

    self.isOver = false;
    self.isDragging = false;

    /** Removes the droppable functionality.
     * @method
     * @return jquery element
     * @example sample <!-- draggable, droppable -->
     * <button onclick="create()" class="gj-button-md">Create</button>
     * <button onclick="dropEl.destroy()" class="gj-button-md">Destroy</button>
     * <br/><br/>
     * <style>
     * .draggable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .droppable { border: 1px solid #999; width: 300px; height: 200px; text-align: center; }
     * .hover { background-color: #FF0000; }
     * </style>
     * <div id="droppable" class="droppable">Drop Here</div>
     * <div id="draggable" class="draggable">Drag Me</div>
     * <script>
     *     var dropEl;
     *     $('#draggable').draggable();
     *     function create() {
     *         dropEl = $('#droppable').droppable({
     *             hoverClass: 'hover'
     *         });
     *     }
     *     create();
     * </script>
     */
    self.destroy = function () {
        return methods.destroy(this);
    }

    self.isOver = function (mousePosition) {
        return methods.isOver(this, mousePosition);
    }

    $.extend($element, self);
    if ('true' !== $element.attr('data-droppable')) {
        methods.init.call($element, jsConfig);
    }

    return $element;
};

gj.droppable.widget.prototype = new gj.widget();
gj.droppable.widget.constructor = gj.droppable.widget;

(function ($) {
    $.fn.droppable = function (method) {
        var $widget;
        if (this && this.length) {
            if (typeof method === 'object' || !method) {
                return new gj.droppable.widget(this, method);
            } else {
                $widget = new gj.droppable.widget(this, null);
                if ($widget[method]) {
                    return $widget[method].apply(this, Array.prototype.slice.call(arguments, 1));
                } else {
                    throw 'Method ' + method + ' does not exist.';
                }
            }
        }
    };
})(jQuery);
/* global window alert jQuery gj */



/**
 * @widget Checkbox
 * @plugin Base
 */
gj.checkbox = {
    plugins: {}
};

gj.checkbox.config = {
    base: {
        /** The name of the UI library that is going to be in use. Currently we support only Material Design and Bootstrap.
         * @additionalinfo The css files for Bootstrap should be manually included to the page if you use bootstrap as uiLibrary.
         * @type string (materialdesign|bootstrap|bootstrap4)
         * @default 'materialdesign'
         * @example Material.Design <!-- checkbox  -->
         * <input type="checkbox" id="checkbox"/><br/><br/>
         * <button onclick="$chkb.state('checked')" class="gj-button-md">Checked</button>
         * <button onclick="$chkb.state('unchecked')" class="gj-button-md">Unchecked</button>
         * <button onclick="$chkb.state('indeterminate')" class="gj-button-md">Indeterminate</button>
         * <button onclick="$chkb.prop('disabled', false)" class="gj-button-md">Enable</button>
         * <button onclick="$chkb.prop('disabled', true)" class="gj-button-md">Disable</button>
         * <script>
         *     var $chkb = $('#checkbox').checkbox({
         *         uiLibrary: 'materialdesign'
         *     });
         * </script>
         * @example Bootstrap.3 <!-- bootstrap, checkbox -->
         * <div class="container-fluid" style="margin-top:10px">
         *     <input type="checkbox" id="checkbox"/><br/><br/>
         *     <button onclick="$chkb.state('checked')" class="btn btn-default">Checked</button>
         *     <button onclick="$chkb.state('unchecked')" class="btn btn-default">Unchecked</button>
         *     <button onclick="$chkb.state('indeterminate')" class="btn btn-default">Indeterminate</button>
         *     <button onclick="$chkb.prop('disabled', false)" class="btn btn-default">Enable</button>
         *     <button onclick="$chkb.prop('disabled', true)" class="btn btn-default">Disable</button>
         * </div>
         * <script>
         *     var $chkb = $('#checkbox').checkbox({
         *         uiLibrary: 'bootstrap'
         *     });
         * </script>
         * @example Bootstrap.4 <!-- bootstrap4, checkbox -->
         * <div class="container-fluid" style="margin-top:10px">
         *     <input type="checkbox" id="checkbox"/><br/><br/>
         *     <button onclick="$chkb.state('checked')" class="btn btn-default">Checked</button>
         *     <button onclick="$chkb.state('unchecked')" class="btn btn-default">Unchecked</button>
         *     <button onclick="$chkb.state('indeterminate')" class="btn btn-default">Indeterminate</button>
         *     <button onclick="$chkb.prop('disabled', false)" class="btn btn-default">Enable</button>
         *     <button onclick="$chkb.prop('disabled', true)" class="btn btn-default">Disable</button>
         * </div>
         * <script>
         *     var $chkb = $('#checkbox').checkbox({
         *         uiLibrary: 'bootstrap4'
         *     });
         * </script>
         */
        uiLibrary: 'materialdesign',

        /** The name of the icons library that is going to be in use. Currently we support Material Icons, Font Awesome and Glyphicons.
         * @additionalinfo If you use Bootstrap 3 as uiLibrary, then the iconsLibrary is set to Glyphicons by default.<br/>
         * If you use Material Design as uiLibrary, then the iconsLibrary is set to Material Icons by default.<br/>
         * The css files for Material Icons, Font Awesome or Glyphicons should be manually included to the page where the grid is in use.
         * @type (materialicons|fontawesome|glyphicons)
         * @default 'materialicons'
         * @example Bootstrap.4.FontAwesome <!-- bootstrap4, checkbox, fontawesome -->
         * <div class="container-fluid" style="margin-top:10px">
         *     <input type="checkbox" id="checkbox"/><br/><br/>
         *     <button onclick="$chkb.state('checked')" class="btn btn-default">Checked</button>
         *     <button onclick="$chkb.state('unchecked')" class="btn btn-default">Unchecked</button>
         *     <button onclick="$chkb.state('indeterminate')" class="btn btn-default">Indeterminate</button>
         *     <button onclick="$chkb.prop('disabled', false)" class="btn btn-default">Enable</button>
         *     <button onclick="$chkb.prop('disabled', true)" class="btn btn-default">Disable</button>
         * </div>
         * <script>
         *     var $chkb = $('#checkbox').checkbox({
         *         uiLibrary: 'bootstrap4',
         *         iconsLibrary: 'fontawesome'
         *     });
         * </script>
         */
        iconsLibrary: 'materialicons',

        style: {
            wrapperCssClass: 'gj-checkbox-md',
            spanCssClass: undefined
        }

    },

    bootstrap: {
        style: {
            wrapperCssClass: 'gj-checkbox-bootstrap'
        },
        iconsLibrary: 'glyphicons'
    },

    bootstrap4: {
        style: {
            wrapperCssClass: 'gj-checkbox-bootstrap gj-checkbox-bootstrap-4'
        },
        iconsLibrary: 'materialicons'
    },

    materialicons: {
        style: {
            iconsCssClass: 'gj-checkbox-material-icons',
            spanCssClass: 'gj-icon'
        }
    },

    glyphicons: {
        style: {
            iconsCssClass: 'gj-checkbox-glyphicons',
            spanCssClass: ''
        }
    },

    fontawesome: {
        style: {
            iconsCssClass: 'gj-checkbox-fontawesome',
            spanCssClass: 'fa'
        }
    }
};

gj.checkbox.methods = {
    init: function (jsConfig) {
        var $chkb = this;

        gj.widget.prototype.init.call(this, jsConfig, 'checkbox');
        $chkb.attr('data-checkbox', 'true');

        gj.checkbox.methods.initialize($chkb);

        return $chkb;
    },

    initialize: function ($chkb) {
        var data = $chkb.data(), $wrapper, $span;

        if (data.style.wrapperCssClass) {
            $wrapper = $('<label class="' + data.style.wrapperCssClass + ' ' + data.style.iconsCssClass + '"></label>');
            if ($chkb.attr('id')) {
                $wrapper.attr('for', $chkb.attr('id'));
            }
            $chkb.wrap($wrapper);
            $span = $('<span />');
            if (data.style.spanCssClass) {
                $span.addClass(data.style.spanCssClass);
            }
            $chkb.parent().append($span);
        }
    },

    state: function ($chkb, value) {
        if (value) {
            if ('checked' === value) {
                $chkb.prop('indeterminate', false);
                $chkb.prop('checked', true);
            } else if ('unchecked' === value) {
                $chkb.prop('indeterminate', false);
                $chkb.prop('checked', false);
            } else if ('indeterminate' === value) {
                $chkb.prop('checked', true);
                $chkb.prop('indeterminate', true);
            }
            gj.checkbox.events.change($chkb, value);
            return $chkb;
        } else {
            if ($chkb.prop('indeterminate')) {
                value = 'indeterminate';
            } else if ($chkb.prop('checked')) {
                value = 'checked';
            } else {
                value = 'unchecked';
            }
            return value;
        }
    },

    toggle: function ($chkb) {
        if ($chkb.state() == 'checked') {
            $chkb.state('unchecked');
        } else {
            $chkb.state('checked');
        }
        return $chkb;
    },

    destroy: function ($chkb) {
        if ($chkb.attr('data-checkbox') === 'true') {
            $chkb.removeData();
            $chkb.removeAttr('data-guid');
            $chkb.removeAttr('data-checkbox');
            $chkb.off();
            $chkb.next('span').remove();
            $chkb.unwrap();
        }
        return $chkb;
    }
};

gj.checkbox.events = {
    /**
     * Triggered when the state of the checkbox is changed
     *
     * @event change
     * @param {object} e - event data
     * @param {string} state - the data of the checkbox
     * @example sample <!-- checkbox -->
     * <input type="checkbox" id="checkbox"/>
     * <script>
     *     var chkb = $('#checkbox').checkbox({
     *         change: function (e) {
     *             alert('State: ' + chkb.state());
     *         }
     *     });
     * </script>
     */
    change: function ($chkb, state) {
        return $chkb.triggerHandler('change', [state]);
    }
};


gj.checkbox.widget = function ($element, jsConfig) {
    var self = this,
        methods = gj.checkbox.methods;

    /** Toogle the state of the checkbox.
     * @method
     * @fires change
     * @return checkbox as jquery object
     * @example sample <!-- checkbox -->
     * <button onclick="$chkb.toggle()" class="gj-button-md">toggle</button>
     * <hr/>
     * <input type="checkbox" id="checkbox"/>
     * <script>
     *     var $chkb = $('#checkbox').checkbox();
     * </script>
     */
    self.toggle = function () {
        return methods.toggle(this);
    };

    /** Return state or set state if you pass parameter.
     * @method
     * @fires change
     * @param {string} value - State of the checkbox. Accept only checked, unchecked or indeterminate as values.
     * @return checked|unchecked|indeterminate|checkbox as jquery object
     * @example sample <!-- checkbox -->
     * <button onclick="$chkb.state('checked')" class="gj-button-md">Set to checked</button>
     * <button onclick="$chkb.state('unchecked')" class="gj-button-md">Set to unchecked</button>
     * <button onclick="$chkb.state('indeterminate')" class="gj-button-md">Set to indeterminate</button>
     * <button onclick="alert($chkb.state())" class="gj-button-md">Get state</button>
     * <hr/>
     * <input type="checkbox" id="checkbox"/>
     * <script>
     *     var $chkb = $('#checkbox').checkbox();
     * </script>
     */
    self.state = function (value) {
        return methods.state(this, value);
    };

    /** Remove checkbox functionality from the element.
     * @method
     * @return checkbox as jquery object
     * @example sample <!-- checkbox -->
     * <button onclick="$chkb.destroy()" class="gj-button-md">Destroy</button>
     * <input type="checkbox" id="checkbox"/>
     * <script>
     *     var $chkb = $('#checkbox').checkbox();
     * </script>
     */
    self.destroy = function () {
        return methods.destroy(this);
    };

    $.extend($element, self);
    if ('true' !== $element.attr('data-checkbox')) {
        methods.init.call($element, jsConfig);
    }

    return $element;
};

gj.checkbox.widget.prototype = new gj.widget();
gj.checkbox.widget.constructor = gj.checkbox.widget;

(function ($) {
    $.fn.checkbox = function (method) {
        var $widget;
        if (this && this.length) {
            if (typeof method === 'object' || !method) {
                return new gj.checkbox.widget(this, method);
            } else {
                $widget = new gj.checkbox.widget(this, null);
                if ($widget[method]) {
                    return $widget[method].apply(this, Array.prototype.slice.call(arguments, 1));
                } else {
                    throw 'Method ' + method + ' does not exist.';
                }
            }
        }
    };
})(jQuery);
/* global window alert jQuery */


/**
  * @widget DatePicker
  * @plugin Base
  */
gj.datepicker = {
    plugins: {}
};

gj.datepicker.config = {
    base: {
        /** Whether to display dates in other months at the start or end of the current month.
         * @additionalinfo Set to true by default for Bootstrap.
         * @type Boolean
         * @default false
         * @example True <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    var datepicker = $('#datepicker').datepicker({ 
         *        showOtherMonths: true
         *    });
         * </script>
         * @example False <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *     $('#datepicker').datepicker({
         *         showOtherMonths: false
         *     });
         * </script>
         */
        showOtherMonths: false,

        /** Whether days in other months shown before or after the current month are selectable.
         * This only applies if the showOtherMonths option is set to true.
         * @type Boolean
         * @default true
         * @example True <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({
         *        showOtherMonths: true,
         *        selectOtherMonths: true
         *    });
         * </script>
         * @example False <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *     $('#datepicker').datepicker({ 
         *        showOtherMonths: true,
         *        selectOtherMonths: false
         *     });
         * </script>
         */
        selectOtherMonths: true,

        /** The width of the datepicker.
         * @type number
         * @default undefined
         * @example JS.Config <!-- datepicker -->
         * <input id="datepicker" />
         * <script>
         *    $('#datepicker').datepicker({ width: 312 });
         * </script>
         * @example HTML.Config <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker();
         * </script>
         */
        width: undefined,

        /** The minimum selectable date. When not set, there is no minimum.
         * @additionalinfo If the minDate is set by string, then the date in the string needs to follow the format specified by the 'format' configuration option.
         * @type Date|String|Function
         * @default undefined
         * @example Today <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    var today, datepicker;
         *    today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
         *    datepicker = $('#datepicker').datepicker({
         *        minDate: today
         *    });
         * </script>
         * @example Yesterday <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *     $('#datepicker').datepicker({
         *        minDate: function() {
         *            var date = new Date();
         *            date.setDate(date.getDate()-1);
         *            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
         *        }
         *     });
         * </script>
         * @example Bootstrap <!-- bootstrap, datepicker -->
         * <input id="datepicker" width="220" />
         * <script>
         *     $('#datepicker').datepicker({
         *        format: 'yyyy-mm-dd',
         *        value: '2017-12-15',
         *        minDate: '2017-12-12',
         *        uiLibrary: 'bootstrap'
         *     });
         * </script>
         * @example Bootstrap.4 <!-- bootstrap4, datepicker -->
         * <input id="datepicker" width="234" />
         * <script>
         *     $('#datepicker').datepicker({
         *        value: '12/15/2017',
         *        minDate: '12/12/2017',
         *        uiLibrary: 'bootstrap4'
         *     });
         * </script>
         */
        minDate: undefined,

        /** The maximum selectable date. When not set, there is no maximum
         * @type Date|String|Function
         * @default undefined
         * @example Today <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    var today, datepicker;
         *    today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
         *    datepicker = $('#datepicker').datepicker({
         *        maxDate: today
         *    });
         * </script>
         * @example Tomorrow <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *     $('#datepicker').datepicker({ 
         *        maxDate: function() {
         *            var date = new Date();
         *            date.setDate(date.getDate()+1);
         *            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
         *        }
         *     });
         * </script>
         */
        maxDate: undefined,

        /** Specifies the format, which is used to format the value of the DatePicker displayed in the input.
         * @additionalinfo <b>d</b> - Day of the month as digits; no leading zero for single-digit days.<br/>
         * <b>dd</b> - Day of the month as digits; leading zero for single-digit days.<br/>
         * <b>ddd</b> - Day of the week as a three-letter abbreviation.<br/>
         * <b>dddd</b> - Day of the week as its full name.<br/>
         * <b>m</b> - Month as digits; no leading zero for single-digit months.<br/>
         * <b>mm</b> - Month as digits; leading zero for single-digit months.<br/>
         * <b>mmm</b> - Month as a three-letter abbreviation.<br/>
         * <b>mmmm</b> - Month as its full name.<br/>
         * <b>yy</b> - Year as last two digits; leading zero for years less than 10.<br/>
         * <b>yyyy</b> - Year represented by four digits.<br/>
         * @type String
         * @default 'mm/dd/yyyy'
         * @example Sample <!-- datepicker -->
         * <input id="datepicker" value="2017-25-07" width="312" />
         * <script>
         *     $('#datepicker').datepicker({ format: 'yyyy-dd-mm' });
         * </script>
         * @example Short.Month.Format <!-- datepicker -->
         * <input id="datepicker" value="10 Oct 2017" width="312" />
         * <script>
         *     $('#datepicker').datepicker({ format: 'dd mmm yyyy' });
         * </script>
         * @example Long.Month.Format <!-- datepicker -->
         * <input id="datepicker" value="10 October 2017" width="312" />
         * <script>
         *     $('#datepicker').datepicker({ format: 'dd mmmm yyyy' });
         * </script>
         */
        format: 'mm/dd/yyyy',

        /** The name of the UI library that is going to be in use.
         * @additionalinfo The css file for bootstrap should be manually included if you use bootstrap.
         * @type (materialdesign|bootstrap|bootstrap4)
         * @default materialdesign
         * @example MaterialDesign <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    var datepicker = $('#datepicker').datepicker({ uiLibrary: 'materialdesign' });
         * </script>
         * @example Bootstrap.3 <!-- bootstrap, datepicker -->
         * <input id="datepicker" width="220" />
         * <script>
         *     $('#datepicker').datepicker({ uiLibrary: 'bootstrap' });
         * </script>
         * @example Bootstrap.4.Material.Icons <!-- bootstrap4, datepicker -->
         * <input id="datepicker" width="234" />
         * <script>
         *     $('#datepicker').datepicker({ uiLibrary: 'bootstrap4', iconsLibrary: 'materialicons' });
         * </script>
         * @example Bootstrap.4.FontAwesome <!-- fontawesome, bootstrap4, datepicker -->
         * <input id="datepicker" width="234" />
         * <script>
         *     $('#datepicker').datepicker({ uiLibrary: 'bootstrap4', iconsLibrary: 'fontawesome' });
         * </script>
         */
        uiLibrary: 'materialdesign',

        /** The name of the icons library that is going to be in use. Currently we support Material Icons, Font Awesome and Glyphicons.
         * @additionalinfo If you use Bootstrap 3 as uiLibrary, then the iconsLibrary is set to Glyphicons by default.<br/>
         * If you use Material Design as uiLibrary, then the iconsLibrary is set to Material Icons by default.<br/>
         * The css files for Material Icons, Font Awesome or Glyphicons should be manually included to the page where the grid is in use.
         * @type (materialicons|fontawesome|glyphicons)
         * @default 'materialicons'
         * @example Bootstrap.Font.Awesome <!-- bootstrap, fontawesome, datepicker -->
         * <input id="datepicker" width="220" />
         * <script>
         *     $('#datepicker').datepicker({
         *         uiLibrary: 'bootstrap',
         *         iconsLibrary: 'fontawesome'
         *     });
         * </script>
         * @example Bootstrap.4.Font.Awesome <!-- bootstrap4, fontawesome, datepicker -->
         * <input id="datepicker" width="234" />
         * <script>
         *     $('#datepicker').datepicker({
         *         uiLibrary: 'bootstrap4',
         *         iconsLibrary: 'fontawesome'
         *     });
         * </script>
         */
        iconsLibrary: 'materialicons',

        /** The initial datepicker value.
         * @type String
         * @default undefined
         * @example Javascript <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({
         *        value: '01/01/2018'
         *    });
         * </script>
         * @example HTML <!-- datepicker -->
         * <input id="datepicker" width="312" value="01/01/2018" />
         * <script>
         *     $('#datepicker').datepicker();
         * </script>
         */
        value: undefined,

        /** Day of the week start. 0 (Sunday) to 6 (Saturday)
         * @type Number
         * @default 0
         * @example Monday <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({
         *        weekStartDay: 1
         *    });
         * </script>
         * @example Saturday <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({
         *        weekStartDay: 6
         *    });
         * </script>
         */
        weekStartDay: 0,

        /** An array or function that will be used to determine which dates to be disabled for selection by the widget.
         * @type Array|Function
         * @default undefined
         * @example Array <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({
         *        value: '11/10/2017',
         *        disableDates: [new Date(2017,10,11), '11/12/2017']
         *    });
         * </script>
         * @example Function <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({
         *        value: '11/11/2017',
         *        disableDates:  function (date) {
         *            var disabled = [10,15,20,25];
         *            if (disabled.indexOf(date.getDate()) == -1 ) {
         *                return true;
         *            } else {
         *                return false;
         *            }
         *        }
         *    });
         * </script>
         */
        disableDates: undefined,

        /** An array that will be used to determine which days of week to be disabled for selection by the widget.
         * The array needs to contains only numbers where 0 is Sunday, 1 is Monday and etc.
         * @type Array
         * @default undefined
         * @example Saturday.Sunday <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({
         *        disableDaysOfWeek: [0, 6]
         *    });
         * </script>
         */
        disableDaysOfWeek: undefined,

        /** Whether to display week number in year on the left side of the calendar.
         * @type Boolean
         * @default false
         * @example Material.Design <!-- datepicker -->
         * <input id="datepicker" width="356" />
         * <script>
         *    $('#datepicker').datepicker({ calendarWeeks: true, modal: true, footer: true });
         * </script>
         * @example Bootstrap <!-- datepicker, bootstrap -->
         * <input id="datepicker" width="220" />
         * <script>
         *    $('#datepicker').datepicker({ calendarWeeks: true, uiLibrary: 'bootstrap' });
         * </script>
         * @example Bootstrap.4 <!-- bootstrap4, datepicker -->
         * <input id="datepicker" width="234" />
         * <script>
         *    $('#datepicker').datepicker({ calendarWeeks: true, uiLibrary: 'bootstrap4' });
         * </script>
         */
        calendarWeeks: false,

        /** Whether to enable keyboard navigation.
         * @type Boolean
         * @default true
         * @example Material.Design <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({
         *        keyboardNavigation: true
         *    });
         * </script>
         * @example Material.Design.Modal <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ keyboardNavigation: true, modal: true, header: true, footer: true });
         * </script>
         * @example Bootstrap.4 <!-- bootstrap4, datepicker -->
         * <input id="datepicker" width="234" />
         * <script>
         *    $('#datepicker').datepicker({
         *        uiLibrary: 'bootstrap4',
         *        keyboardNavigation: true,
         *        showOtherMonths: true
         *    });
         * </script>
         */
        keyboardNavigation: true,

        /** The language that needs to be in use.
         * @type string
         * @default 'en-us'
         * @example German <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'de-de',
         *        format: 'dd mmm yyyy'
         *    });
         * </script>
         * @example Bulgarian <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'bg-bg',
         *        format: 'dd mmm yyyy',
         *        weekStartDay: 1
         *    });
         * </script>
         * @example French <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'fr-fr',
         *        format: 'dd mmm yyyy'
         *    });
         * </script>
         * @example Brazil <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'pt-br',
         *        format: 'dd mmm yyyy'
         *    });
         * </script>
         * @example Russian <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'ru-ru',
         *        format: 'dd mmm yyyy'
         *    });
         * </script>
         * @example Spanish <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'es-es',
         *        format: 'dd/mm/yyyy'
         *    });
         * </script>
         * @example Italian <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'it-it',
         *        format: 'dd/mm/yyyy'
         *    });
         * </script>
         * @example Japanise <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'ja-jp',
         *        format: 'dd mmmm yyyy'
         *    });
         * </script>
         * @example Chinise_Simplified <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'zh-cn',
         *        format: 'dd mmmm yyyy'
         *    });
         * </script>
         * @example Chinise_Traditional <!-- datepicker -->
         * <input id="datepicker" width="276" />
         * <script>
         *    $('#datepicker').datepicker({
         *        locale: 'zh-tw',
         *        format: 'dd mmmm yyyy'
         *    });
         * </script>
         */
        locale: 'en-us',

        icons: {
            /** datepicker icon definition.
             * @alias icons.rightIcon
             * @type String
             * @default '<i class="gj-icon event" />'
             * @example Custom.Material.Icon <!-- materialicons, datepicker -->
             * <input id="datepicker" width="312" />
             * <script>
             *     $('#datepicker').datepicker({
             *         icons: { 
             *             rightIcon: '<i class="material-icons">date_range</i>'
             *         }
             *     });
             * </script>
             * @example Custom.Glyphicon.Icon <!-- bootstrap, datepicker -->
             * <input id="datepicker" width="220" />
             * <script>
             *     $('#datepicker').datepicker({
             *         uiLibrary: 'bootstrap',
             *         icons: {
             *             rightIcon: '<span class="glyphicon glyphicon-chevron-down"></span>'
             *         }
             *     });
             * </script>
             * @example Bootstrap.4 <!-- bootstrap4, materialicons, datepicker -->
             * <input id="datepicker" width="234" />
             * <script>
             *     $('#datepicker').datepicker({
             *         uiLibrary: 'bootstrap4',
             *         icons: {
             *             rightIcon: '<i class="material-icons">date_range</i>'
             *         }
             *     });
             * </script>
             */
            rightIcon: '<i class="gj-icon">event</i>',

            previousMonth: '<i class="gj-icon chevron-left"></i>',
            nextMonth: '<i class="gj-icon chevron-right"></i>'
        },

        fontSize: undefined,

        /** The size of the datepicker input.
         * @type 'small'|'default'|'large'
         * @default 'default'
         * @example Bootstrap.4 <!-- bootstrap4, datepicker -->
         * <p><label for="datepicker-small">Small Size:</label> <input id="datepicker-small" width="234" value="03/20/2018" /></p>
         * <p><label for="datepicker-default">Default Size:</label> <input id="datepicker-default" width="234" value="03/20/2018" /></p>
         * <p><label for="datepicker-large">Large Size:</label> <input id="datepicker-large" width="234" value="03/20/2018" /></p>
         * <script>
         *     $('#datepicker-small').datepicker({ uiLibrary: 'bootstrap4', size: 'small' });
         *     $('#datepicker-default').datepicker({ uiLibrary: 'bootstrap4', size: 'default' });
         *     $('#datepicker-large').datepicker({ uiLibrary: 'bootstrap4', size: 'large' });
         * </script>
         * @example Bootstrap.4.Font.Awesome <!-- bootstrap4, fontawesome, datepicker -->
         * <p><label for="datepicker-small">Small Size:</label> <input id="datepicker-small" width="234" value="03/20/2018" /></p>
         * <p><label for="datepicker-default">Default Size:</label> <input id="datepicker-default" width="234" value="03/20/2018" /></p>
         * <p><label for="datepicker-large">Large Size:</label> <input id="datepicker-large" width="234" value="03/20/2018" /></p>
         * <script>
         *     $('#datepicker-small').datepicker({ uiLibrary: 'bootstrap4', iconsLibrary: 'fontawesome', size: 'small' });
         *     $('#datepicker-default').datepicker({ uiLibrary: 'bootstrap4', iconsLibrary: 'fontawesome', size: 'default' });
         *     $('#datepicker-large').datepicker({ uiLibrary: 'bootstrap4', iconsLibrary: 'fontawesome', size: 'large' });
         * </script>
         * @example Bootstrap.3 <!-- bootstrap, datepicker -->
         * <p><label for="datepicker-small">Small Size:</label> <input id="datepicker-small" width="220" value="03/20/2018" /></p>
         * <p><label for="datepicker-default">Default Size:</label> <input id="datepicker-default" width="220" value="03/20/2018" /></p>
         * <p><label for="datepicker-large">Large Size:</label> <input id="datepicker-large" width="220" value="03/20/2018" /></p>
         * <script>
         *     $('#datepicker-small').datepicker({ uiLibrary: 'bootstrap', size: 'small' });
         *     $('#datepicker-default').datepicker({ uiLibrary: 'bootstrap', size: 'default' });
         *     $('#datepicker-large').datepicker({ uiLibrary: 'bootstrap', size: 'large' });
         * </script>
         * @example Material.Design <!-- datepicker -->
         * <p><label for="datepicker-small">Small Size:</label> <input id="datepicker-small" width="276" value="03/20/2018" /></p>
         * <p><label for="datepicker-default">Default Size:</label> <input id="datepicker-default" width="276" value="03/20/2018" /></p>
         * <p><label for="datepicker-large">Large Size:</label> <input id="datepicker-large" width="276" value="03/20/2018" /></p>
         * <script>
         *     $('#datepicker-small').datepicker({ size: 'small' });
         *     $('#datepicker-default').datepicker({ size: 'default' });
         *     $('#datepicker-large').datepicker({ size: 'large' });
         * </script>
         */
        size: 'default',

        /** If set to true, the datepicker will have modal behavior.
         * @type Boolean
         * @default false
         * @example Material.Design <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ modal: true });
         * </script>
         * @example Bootstrap <!-- bootstrap, datepicker -->
         * <input id="datepicker" width="220" />
         * <script>
         *    $('#datepicker').datepicker({ uiLibrary: 'bootstrap', modal: true, header: true, footer: true });
         * </script>
         * @example Bootstrap.4 <!-- bootstrap4, datepicker -->
         * <input id="datepicker" width="234" />
         * <script>
         *    $('#datepicker').datepicker({ uiLibrary: 'bootstrap4', modal: true, header: true, footer: true });
         * </script>
         */
        modal: false,

        /** If set to true, add header to the datepicker.
         * @type Boolean
         * @default false
         * @example True <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ header: true, modal: true, footer: true });
         * </script>
         * @example False <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ header: false });
         * </script>
         */
        header: false,

        /** If set to true, add footer with ok and cancel buttons to the datepicker.
         * @type Boolean
         * @default false
         * @example True <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ footer: true, modal: true, header: true });
         * </script>
         * @example False <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ footer: false });
         * </script>
         */
        footer: false,

        /** If set to true, show datepicker on input focus.
         * @type Boolean
         * @default true
         * @example True <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ showOnFocus: true, showRightIcon: false });
         * </script>
         * @example False <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ showOnFocus: false });
         * </script>
         */
        showOnFocus: true,

        /** If set to true, show datepicker icon on the right side of the input.
         * @type Boolean
         * @default true
         * @example False <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ showOnFocus: true, showRightIcon: false });
         * </script>
         * @example True <!-- datepicker -->
         * <input id="datepicker" width="312" />
         * <script>
         *    $('#datepicker').datepicker({ showRightIcon: true });
         * </script>
         */
        showRightIcon: true,

        style: {
            modal: 'gj-modal',
            wrapper: 'gj-datepicker gj-datepicker-md gj-unselectable',
            input: 'gj-textbox-md',
            calendar: 'gj-picker gj-picker-md datepicker gj-unselectable',
            footer: '',
            button: 'gj-button-md'
        }
    },

    bootstrap: {
        style: {
            wrapper: 'gj-datepicker gj-datepicker-bootstrap gj-unselectable input-group',
            input: 'form-control',
            calendar: 'gj-picker gj-picker-bootstrap datepicker gj-unselectable',
            footer: 'modal-footer',
            button: 'btn btn-default'
        },
        iconsLibrary: 'glyphicons',
        showOtherMonths: true
    },

    bootstrap4: {
        style: {
            wrapper: 'gj-datepicker gj-datepicker-bootstrap gj-unselectable input-group',
            input: 'form-control',
            calendar: 'gj-picker gj-picker-bootstrap datepicker gj-unselectable',
            footer: 'modal-footer',
            button: 'btn btn-default'
        },
        showOtherMonths: true
    },

    fontawesome: {
        icons: {
            rightIcon: '<i class="fa fa-calendar" aria-hidden="true"></i>',
            previousMonth: '<i class="fa fa-chevron-left" aria-hidden="true"></i>',
            nextMonth: '<i class="fa fa-chevron-right" aria-hidden="true"></i>'
        }
    },

    glyphicons: {
        icons: {
            rightIcon: '<span class="glyphicon glyphicon-calendar"></span>',
            previousMonth: '<span class="glyphicon glyphicon-chevron-left"></span>',
            nextMonth: '<span class="glyphicon glyphicon-chevron-right"></span>'
        }
    }
};

gj.datepicker.methods = {
    init: function (jsConfig) {
        gj.widget.prototype.init.call(this, jsConfig, 'datepicker');
        this.attr('data-datepicker', 'true');
        gj.datepicker.methods.initialize(this, this.data());
        return this;
    },

    initialize: function ($datepicker, data) {
        var $calendar, $rightIcon,
            $wrapper = $datepicker.parent('div[role="wrapper"]');

        if ($wrapper.length === 0) {
            $wrapper = $('<div role="wrapper" />').addClass(data.style.wrapper); // The css class needs to be added before the wrapping, otherwise doesn't work.
            $datepicker.wrap($wrapper);
        } else {
            $wrapper.addClass(data.style.wrapper);
        }
        $wrapper = $datepicker.parent('div[role="wrapper"]');

        data.width && $wrapper.css('width', data.width);

        $datepicker.val(data.value).addClass(data.style.input).attr('role', 'input');

        data.fontSize && $datepicker.css('font-size', data.fontSize);
        
        if (data.uiLibrary === 'bootstrap' || data.uiLibrary === 'bootstrap4') {
            if (data.size === 'small') {
                $wrapper.addClass('input-group-sm');
                $datepicker.addClass('form-control-sm');
            } else if (data.size === 'large') {
                $wrapper.addClass('input-group-lg');
                $datepicker.addClass('form-control-lg');
            }
        } else {
            if (data.size === 'small') {
                $wrapper.addClass('small');
            } else if (data.size === 'large') {
                $wrapper.addClass('large');
            }
        }

        // =========    === COMMENTED OUT BECAUSE OF SECURITY ISSUES ============
        // if (data.showRightIcon) {
        //     if (data.uiLibrary === 'bootstrap') {
        //         $rightIcon = $('<span class="input-group-addon">' + data.icons.rightIcon + '</span>');
        //     } else if (data.uiLibrary === 'bootstrap4') {
        //         $rightIcon = $('<span class="input-group-append"><button class="btn btn-outline-secondary border-left-0" type="button">' + data.icons.rightIcon + '</button></span>');
        //     } else {
        //         $rightIcon = $(data.icons.rightIcon);
        //     }
        //     $rightIcon.attr('role', 'right-icon');
        //     $rightIcon.on('click', function (e) {
        //         var $calendar = $('body').find('[role="calendar"][guid="' + $datepicker.attr('data-guid') + '"]');
        //         if ($calendar.is(':visible')) {
        //             gj.datepicker.methods.close($datepicker);
        //         } else {
        //             gj.datepicker.methods.open($datepicker, data);
        //         }
        //     });
        //     $wrapper.append($rightIcon);
        // }

        if (data.showOnFocus) {
            $datepicker.on('focus', function () {
                gj.datepicker.methods.open($datepicker, data);
            });
        }

        $calendar = gj.datepicker.methods.createCalendar($datepicker, data);

        if (data.footer !== true) {
            $datepicker.on('blur', function () {
                $datepicker.timeout = setTimeout(function () {
                    gj.datepicker.methods.close($datepicker);
                }, 500);
            });
            $calendar.mousedown(function () {
                clearTimeout($datepicker.timeout);
                document.activeElement !== $datepicker[0] && $datepicker.focus();
                return false;
            });
            $calendar.on('click', function () {
                clearTimeout($datepicker.timeout);
                document.activeElement !== $datepicker[0] && $datepicker.focus();
            });
        }

        if (data.keyboardNavigation) {
            $(document).on('keydown', gj.datepicker.methods.createKeyDownHandler($datepicker, $calendar, data));
        }
    },

    createCalendar: function ($datepicker, data) {
        var date, $body, $footer, $btnCancel, $btnOk,
            $calendar = $('<div role="calendar" type="month"/>').addClass(data.style.calendar).attr('guid', $datepicker.attr('data-guid'));
        
        data.fontSize && $calendar.css('font-size', data.fontSize);

        date = gj.core.parseDate(data.value, data.format, data.locale);
        if (!date || isNaN(date.getTime())) {
            date = new Date();
        } else {
            $datepicker.attr('day', date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate());
        }

        $calendar.attr('month', date.getMonth());
        $calendar.attr('year', date.getFullYear());

        gj.datepicker.methods.renderHeader($datepicker, $calendar, data, date);

        $body = $('<div role="body" />');
        $calendar.append($body);

        if (data.footer) {
            $footer = $('<div role="footer" class="' + data.style.footer + '" />');

            $btnCancel = $('<button class="' + data.style.button + '">' + gj.core.messages[data.locale].cancel + '</button>');
            $btnCancel.on('click', function () { $datepicker.close(); });
            $footer.append($btnCancel);

            $btnOk = $('<button class="' + data.style.button + '">' + gj.core.messages[data.locale].ok + '</button>');
            $btnOk.on('click', function () {
                var date, dayArr, dayStr = $calendar.attr('selectedDay');
                if (dayStr) {
                    dayArr = dayStr.split('-');
                    date = new Date(dayArr[0], dayArr[1], dayArr[2], $calendar.attr('hour') || 0, $calendar.attr('minute') || 0);
                    gj.datepicker.methods.change($datepicker, $calendar, data, date);
                } else {
                    $datepicker.close();
                }
            });
            $footer.append($btnOk);

            $calendar.append($footer);
        }

        $calendar.hide();
        $('body').append($calendar);

        if (data.modal) {
            $calendar.wrapAll('<div role="modal" class="' + data.style.modal + '"/>');
            gj.core.center($calendar);
        }

        return $calendar;
    },

    renderHeader: function ($datepicker, $calendar, data, date) {
        var $header, $date, $year;

        if (data.header) {
            $header = $('<div role="header" />');
            $year = $('<div role="year" />').on('click', function () {
                gj.datepicker.methods.renderDecade($datepicker, $calendar, data);
                $year.addClass('selected');
                $date.removeClass('selected');
            });
            $year.html(gj.core.formatDate(date, 'yyyy', data.locale));
            $header.append($year);
            $date = $('<div role="date" class="selected" />').on('click', function () {
                gj.datepicker.methods.renderMonth($datepicker, $calendar, data);
                $date.addClass('selected');
                $year.removeClass('selected');
            });
            $date.html(gj.core.formatDate(date, 'ddd, mmm dd', data.locale));
            $header.append($date);
            $calendar.append($header);
        }
    },

    updateHeader: function ($calendar, data, date) {
        $calendar.find('[role="header"] [role="year"]').removeClass('selected').html(gj.core.formatDate(date, 'yyyy', data.locale));
        $calendar.find('[role="header"] [role="date"]').addClass('selected').html(gj.core.formatDate(date, 'ddd, mmm dd', data.locale));
        $calendar.find('[role="header"] [role="hour"]').removeClass('selected').html(gj.core.formatDate(date, 'HH', data.locale));
        $calendar.find('[role="header"] [role="minute"]').removeClass('selected').html(gj.core.formatDate(date, 'MM', data.locale));
    },

    createNavigation: function ($datepicker, $body, $table, data) {
        var $row, $navigator, $thead = $('<thead/>');

        $navigator = $('<div role="navigator" />');
        $navigator.append($('<div>' + data.icons.previousMonth + '</div>').on('click', gj.datepicker.methods.prev($datepicker, data)));
        $navigator.append($('<div role="period"></div>').on('click', gj.datepicker.methods.changePeriod($datepicker, data)));
        $navigator.append($('<div>' + data.icons.nextMonth + '</div>').on('click', gj.datepicker.methods.next($datepicker, data)));
        $body.append($navigator);
        
        $row = $('<tr role="week-days" />');
        if (data.calendarWeeks) {
            $row.append('<th><div>&nbsp;</div></th>');
        }
        for (i = data.weekStartDay; i < gj.core.messages[data.locale].weekDaysMin.length; i++) {
            $row.append('<th><div>' + gj.core.messages[data.locale].weekDaysMin[i] + '</div></th>');
        }
        for (i = 0; i < data.weekStartDay; i++) {
            $row.append('<th><div>' + gj.core.messages[data.locale].weekDaysMin[i] + '</div></th>');
        }
        $thead.append($row);

        $table.append($thead);
    },

    renderMonth: function ($datepicker, $calendar, data) {
        var weekDay, selectedDay, day, month, year, daysInMonth, total, firstDayPosition, i, now, prevMonth, nextMonth, $cell, $day, date,
            $body = $calendar.children('[role="body"]'),
            $table = $('<table/>'),
            $tbody = $('<tbody/>'),
            period = gj.core.messages[data.locale].titleFormat;
        
        $body.off().empty();
        gj.datepicker.methods.createNavigation($datepicker, $body, $table, data);
        
        month = parseInt($calendar.attr('month'), 10);
        year = parseInt($calendar.attr('year'), 10);

        $calendar.attr('type', 'month');
        period = period.replace('mmmm', gj.core.messages[data.locale].monthNames[month]).replace('yyyy', year);
        $calendar.find('div[role="period"]').text(period);
        daysInMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
        if (year % 4 == 0 && year != 1900) {
            daysInMonth[1] = 29;
        }
        total = daysInMonth[month];

        firstDayPosition = (new Date(year, month, 1).getDay() + 7 - data.weekStartDay) % 7;

        weekDay = 0;
        $row = $('<tr />');
        prevMonth = gj.datepicker.methods.getPrevMonth(month, year);
        for (i = 1; i <= firstDayPosition; i++) {
            day = (daysInMonth[prevMonth.month] - firstDayPosition + i);
            date = new Date(prevMonth.year, prevMonth.month, day);
            if (data.calendarWeeks && i === 1) {
                $row.append('<td class="calendar-week"><div>' + gj.datepicker.methods.getWeekNumber(date) + '</div></td>');
            }
            $cell = $('<td class="other-month" />');
            if (data.showOtherMonths) {
                $day = $('<div>' + day + '</div>');
                $cell.append($day);
                if (data.selectOtherMonths && gj.datepicker.methods.isSelectable(data, date)) {
                    $cell.addClass('gj-cursor-pointer').attr('day', day).attr('month', prevMonth.month).attr('year', prevMonth.year);
                    $day.on('click', gj.datepicker.methods.dayClickHandler($datepicker, $calendar, data, date));
                    $day.on('mousedown', function (e) { e.stopPropagation() });
                } else {
                    $cell.addClass('disabled');
                }
            }
            $row.append($cell);
            weekDay++;
        }
        if (i > 1) {
            $tbody.append($row);
        }

        now = new Date();
        for (i = 1; i <= total; i++) {
            date = new Date(year, month, i);
            if (weekDay == 0) {
                $row = $('<tr>');
                if (data.calendarWeeks) {
                    $row.append('<td class="calendar-week"><div>' + gj.datepicker.methods.getWeekNumber(date) + '</div></td>');
                }
            }
            $cell = $('<td day="' + i + '" month="' + month + '" year="' + year + '" />');
            if (year === now.getFullYear() && month === now.getMonth() && i === now.getDate()) {
                $cell.addClass('today');
            } else {
                $cell.addClass('current-month');
            }
            $day = $('<div>' + i + '</div>');
            if (gj.datepicker.methods.isSelectable(data, date)) {
                $cell.addClass('gj-cursor-pointer');
                $day.on('click', gj.datepicker.methods.dayClickHandler($datepicker, $calendar, data, date));
                $day.on('mousedown', function (e) { e.stopPropagation() });
            } else {
                $cell.addClass('disabled');
            }
            $cell.append($day);
            $row.append($cell);
            weekDay++;
            if (weekDay == 7) {
                $tbody.append($row);
                weekDay = 0;
            }
        }

        nextMonth = gj.datepicker.methods.getNextMonth(month, year);
        for (i = 1; weekDay != 0; i++) {
            date = new Date(nextMonth.year, nextMonth.month, i);
            $cell = $('<td class="other-month" />');
            if (data.showOtherMonths) {
                $day = $('<div>' + i + '</div>');
                if (data.selectOtherMonths && gj.datepicker.methods.isSelectable(data, date)) {
                    $cell.addClass('gj-cursor-pointer').attr('day', i).attr('month', nextMonth.month).attr('year', nextMonth.year);
                    $day.on('click', gj.datepicker.methods.dayClickHandler($datepicker, $calendar, data, date));
                    $day.on('mousedown', function (e) { e.stopPropagation() });
                } else {
                    $cell.addClass('disabled');
                }
                $cell.append($day);
            }
            $row.append($cell);
            weekDay++;
            if (weekDay == 7) {
                $tbody.append($row);
                weekDay = 0;
            }
        }

        $table.append($tbody);
        $body.append($table);

        if ($calendar.attr('selectedDay')) {
            selectedDay = $calendar.attr('selectedDay').split('-');
            date = new Date(selectedDay[0], selectedDay[1], selectedDay[2], $calendar.attr('hour') || 0, $calendar.attr('minute') || 0);
            $calendar.find('tbody td[day="' + selectedDay[2] + '"][month="' + selectedDay[1] + '"]').addClass('selected');
            gj.datepicker.methods.updateHeader($calendar, data, date);
        }
    },

    renderYear: function ($datepicker, $calendar, data) {
        var year, i, m, $month,
            $table = $calendar.find('>[role="body"]>table'),
            $tbody = $table.children('tbody');
        
        $table.children('thead').hide();

        year = parseInt($calendar.attr('year'), 10);

        $calendar.attr('type', 'year');
        $calendar.find('div[role="period"]').text(year);

        $tbody.empty();

        for (i = 0; i < 3; i++) {
            $row = $('<tr />');
            for (m = (i * 4); m <= (i * 4) + 3; m++) {
                $month = $('<div>' + gj.core.messages[data.locale].monthShortNames[m] + '</div>');
                $month.on('click', gj.datepicker.methods.selectMonth($datepicker, $calendar, data, m));
                $cell = $('<td></td>').append($month);
                $row.append($cell);
            }
            $tbody.append($row);
        }
    },

    renderDecade: function ($datepicker, $calendar, data) {
        var year, decade, i, y, $year,
            $table = $calendar.find('>[role="body"]>table'),
            $tbody = $table.children('tbody');
        
        $table.children('thead').hide();

        year = parseInt($calendar.attr('year'), 10);
        decade = year - (year % 10);

        $calendar.attr('type', 'decade');
        $calendar.find('div[role="period"]').text(decade + ' - ' + (decade + 9));

        $tbody.empty();

        for (i = decade - 1; i <= decade + 10 ; i += 4) {
            $row = $('<tr />');
            for (y = i; y <= i + 3; y++) {
                $year = $('<div>' + y + '</div>');
                $year.on('click', gj.datepicker.methods.selectYear($datepicker, $calendar, data, y));
                $cell = $('<td></td>').append($year);
                $row.append($cell);
            }
            $tbody.append($row);
        }
    },

    renderCentury: function ($datepicker, $calendar, data) {
        var year, century, i, d, $decade,
            $table = $calendar.find('>[role="body"]>table'),
            $tbody = $table.children('tbody');
        
        $table.children('thead').hide();

        year = parseInt($calendar.attr('year'), 10);
        century = year - (year % 100);

        $calendar.attr('type', 'century');
        $calendar.find('div[role="period"]').text(century + ' - ' + (century + 99));

        $tbody.empty();

        for (i = (century - 10); i < century + 100; i += 40) {
            $row = $('<tr />');
            for (d = i; d <= i + 30; d += 10) {
                $decade = $('<div>' + d + '</div>');
                $decade.on('click', gj.datepicker.methods.selectDecade($datepicker, $calendar, data, d));
                $cell = $('<td></td>').append($decade);
                $row.append($cell);
            }
            $tbody.append($row);
        }
    },

    getWeekNumber: function (date) {
        var d = new Date(date.valueOf());
        d.setDate(d.getDate() + 6);
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    },

    getMinDate: function (data) {
        var minDate;
        if (data.minDate) {
            if (typeof (data.minDate) === 'string') {
                minDate = gj.core.parseDate(data.minDate, data.format, data.locale);
            } else if (typeof (data.minDate) === 'function') {
                minDate = data.minDate();
                if (typeof minDate === 'string') {
                    minDate = gj.core.parseDate(minDate, data.format, data.locale);
                }
            } else if (typeof data.minDate.getMonth === 'function') {
                minDate = data.minDate;
            }
        }
        return minDate;
    },

    getMaxDate: function (data) {
        var maxDate;
        if (data.maxDate) {
            if (typeof data.maxDate === 'string') {
                maxDate = gj.core.parseDate(data.maxDate, data.format, data.locale);
            } else if (typeof data.maxDate === 'function') {
                maxDate = data.maxDate();
                if (typeof maxDate === 'string') {
                    maxDate = gj.core.parseDate(maxDate, data.format, data.locale);
                }
            } else if (typeof data.maxDate.getMonth === 'function') {
                maxDate = data.maxDate;
            }
        }
        return maxDate;
    },

    isSelectable: function (data, date) {
        var result = true,
            minDate = gj.datepicker.methods.getMinDate(data),
            maxDate = gj.datepicker.methods.getMaxDate(data),
            i;

        if (minDate && date < minDate) {
            result = false;
        } else if (maxDate && date > maxDate) {
            result = false;
        }

        if (result) {
            if (data.disableDates) {
                if ($.isArray(data.disableDates)) {
                    for (i = 0; i < data.disableDates.length; i++) {
                        if (data.disableDates[i] instanceof Date && data.disableDates[i].getTime() === date.getTime()) {
                            result = false;
                        } else if (typeof data.disableDates[i] === 'string' && gj.core.parseDate(data.disableDates[i], data.format, data.locale).getTime() === date.getTime()) {
                            result = false;
                        }
                    }
                } else if (data.disableDates instanceof Function) {
                    result = data.disableDates(date);
                }
            }
            if ($.isArray(data.disableDaysOfWeek) && data.disableDaysOfWeek.indexOf(date.getDay()) > -1) {
                result = false;
            }
        }
        return result;
    },

    getPrevMonth: function (month, year) {
        date = new Date(year, month, 1);
        date.setMonth(date.getMonth() - 1);
        return { month: date.getMonth(), year: date.getFullYear() };
    },

    getNextMonth: function (month, year) {
        date = new Date(year, month, 1);
        date.setMonth(date.getMonth() + 1);
        return { month: date.getMonth(), year: date.getFullYear() };
    },

    prev: function ($datepicker, data) {
        return function () {
            var date, month, year, decade, century,
                $calendar = $('body').find('[role="calendar"][guid="' + $datepicker.attr('data-guid') + '"]');

            year = parseInt($calendar.attr('year'), 10);
            switch ($calendar.attr('type')) {
                case 'month':
                    month = parseInt($calendar.attr('month'), 10);
                    date = gj.datepicker.methods.getPrevMonth(month, year);
                    $calendar.attr('month', date.month);
                    $calendar.attr('year', date.year);
                    gj.datepicker.methods.renderMonth($datepicker, $calendar, data);
                    break;
                case 'year':
                    $calendar.attr('year', year - 1);
                    gj.datepicker.methods.renderYear($datepicker, $calendar, data);
                    break;
                case 'decade':
                    decade = year - (year % 10);
                    $calendar.attr('year', decade - 10);
                    gj.datepicker.methods.renderDecade($datepicker, $calendar, data);
                    break;
                case 'century':
                    century = year - (year % 100);
                    $calendar.attr('year', century - 100);
                    gj.datepicker.methods.renderCentury($datepicker, $calendar, data);
                    break;
            }
        }
    },

    next: function ($datepicker, data) {
        return function () {
            var date, month, year, decade, century,
                $calendar = $('body').find('[role="calendar"][guid="' + $datepicker.attr('data-guid') + '"]');

            year = parseInt($calendar.attr('year'), 10);
            switch ($calendar.attr('type')) {
                case 'month':
                    month = parseInt($calendar.attr('month'), 10);
                    date = gj.datepicker.methods.getNextMonth(month, year);
                    $calendar.attr('month', date.month);
                    $calendar.attr('year', date.year);
                    gj.datepicker.methods.renderMonth($datepicker, $calendar, data);
                    break;
                case 'year':
                    $calendar.attr('year', year + 1);
                    gj.datepicker.methods.renderYear($datepicker, $calendar, data);
                    break;
                case 'decade':
                    decade = year - (year % 10);
                    $calendar.attr('year', decade + 10);
                    gj.datepicker.methods.renderDecade($datepicker, $calendar, data);
                    break;
                case 'century':
                    century = year - (year % 100);
                    $calendar.attr('year', century + 100);
                    gj.datepicker.methods.renderCentury($datepicker, $calendar, data);
                    break;
            }
        }
    },

    changePeriod: function ($datepicker, data) {
        return function (e) {
            var $calendar = $('body').find('[role="calendar"][guid="' + $datepicker.attr('data-guid') + '"]');

            switch ($calendar.attr('type')) {
                case 'month':
                    gj.datepicker.methods.renderYear($datepicker, $calendar, data);
                    break;
                case 'year':
                    gj.datepicker.methods.renderDecade($datepicker, $calendar, data);
                    break;
                case 'decade':
                    gj.datepicker.methods.renderCentury($datepicker, $calendar, data);
                    break;
            }
        }
    },

    dayClickHandler: function ($datepicker, $calendar, data, date) {
        return function (e) {
            e && e.stopPropagation();
            gj.datepicker.methods.selectDay($datepicker, $calendar, data, date);
            if (data.footer !== true && data.autoClose !== false) {
                gj.datepicker.methods.change($datepicker, $calendar, data, date);
            }
            return $datepicker;
        };
    },

    change: function ($datepicker, $calendar, data, date) {
        var day = date.getDate(),
            month = date.getMonth(),
            year = date.getFullYear(),
            value = gj.core.formatDate(date, data.format, data.locale);
        $calendar.attr('month', month);
        $calendar.attr('year', year);
        $datepicker.val(value);
        gj.datepicker.events.change($datepicker);
        if (window.getComputedStyle($calendar[0]).display !== 'none') {
            gj.datepicker.methods.close($datepicker);
        }
    },

    selectDay: function ($datepicker, $calendar, data, date) {
        var day = date.getDate(),
            month = date.getMonth(),
            year = date.getFullYear();
        $calendar.attr('selectedDay', year + '-' + month + '-' + day);
        $calendar.find('tbody td').removeClass('selected');
        $calendar.find('tbody td[day="' + day + '"][month="' + month + '"]').addClass('selected');
        gj.datepicker.methods.updateHeader($calendar, data, date);
        gj.datepicker.events.select($datepicker, 'day');
    },

    selectMonth: function ($datepicker, $calendar, data, month) {
        return function (e) {
            $calendar.attr('month', month);
            gj.datepicker.methods.renderMonth($datepicker, $calendar, data);
            gj.datepicker.events.select($datepicker, 'month');
        };
    },

    selectYear: function ($datepicker, $calendar, data, year) {
        return function (e) {
            $calendar.attr('year', year);
            gj.datepicker.methods.renderYear($datepicker, $calendar, data);
            gj.datepicker.events.select($datepicker, 'year');
        };
    },

    selectDecade: function ($datepicker, $calendar, data, year) {
        return function (e) {
            $calendar.attr('year', year);
            gj.datepicker.methods.renderDecade($datepicker, $calendar, data);
            gj.datepicker.events.select($datepicker, 'decade');
        };
    },

    open: function ($datepicker, data) {
        var date, $calendar = $('body').find('[role="calendar"][guid="' + $datepicker.attr('data-guid') + '"]');

        if ($datepicker.val()) {
            $datepicker.value($datepicker.val());
        } else {
            date = new Date();
            $calendar.attr("month", date.getMonth());
            $calendar.attr("year", date.getFullYear());
        }

        switch ($calendar.attr('type')) {
            case 'month':
                gj.datepicker.methods.renderMonth($datepicker, $calendar, data);
                break;
            case 'year':
                gj.datepicker.methods.renderYear($datepicker, $calendar, data);
                break;
            case 'decade':
                gj.datepicker.methods.renderDecade($datepicker, $calendar, data);
                break;
            case 'century':
                gj.datepicker.methods.renderCentury($datepicker, $calendar, data);
                break;
        }

        $calendar.show();
        $calendar.closest('div[role="modal"]').show();
        if (data.modal) {
            gj.core.center($calendar);
        } else {
            gj.core.setChildPosition($datepicker[0], $calendar[0]);
            document.activeElement !== $datepicker[0] && $datepicker.focus();
        }
        clearTimeout($datepicker.timeout);
        gj.datepicker.events.open($datepicker);
    },

    close: function ($datepicker) {
        var $calendar = $('body').find('[role="calendar"][guid="' + $datepicker.attr('data-guid') + '"]');
        $calendar.hide();
        $calendar.closest('div[role="modal"]').hide();
        gj.datepicker.events.close($datepicker);
    },

    createKeyDownHandler: function ($datepicker, $calendar, data) {
        return function (e) {
            var month, year, day, index, $new, $active, e = e || window.event;

            if (window.getComputedStyle($calendar[0]).display !== 'none')
            {
                $active = gj.datepicker.methods.getActiveCell($calendar);
                if (e.keyCode == '38') { // up
                    index = $active.index();
                    $new = $active.closest('tr').prev('tr').find('td:eq(' + index + ')');
                    if (!$new.is('[day]')) {
                        gj.datepicker.methods.prev($datepicker, data)();
                        $new = $calendar.find('tbody tr').last().find('td:eq(' + index + ')');
                        if ($new.is(':empty')) {
                            $new = $calendar.find('tbody tr').last().prev().find('td:eq(' + index + ')');
                        }
                    }
                    if ($new.is('[day]')) {
                        $new.addClass('focused');
                        $active.removeClass('focused');
                    }
                } else if (e.keyCode == '40') { // down
                    index = $active.index();
                    $new = $active.closest('tr').next('tr').find('td:eq(' + index + ')');
                    if (!$new.is('[day]')) {
                        gj.datepicker.methods.next($datepicker, data)();
                        $new = $calendar.find('tbody tr').first().find('td:eq(' + index + ')');
                        if (!$new.is('[day]')) {
                            $new = $calendar.find('tbody tr:eq(1)').find('td:eq(' + index + ')');
                        }
                    }
                    if ($new.is('[day]')) {
                        $new.addClass('focused');
                        $active.removeClass('focused');
                    }
                } else if (e.keyCode == '37') { // left
                    $new = $active.prev('td[day]:not(.disabled)');
                    if ($new.length === 0) {
                        $new = $active.closest('tr').prev('tr').find('td[day]').last();
                    }
                    if ($new.length === 0) {
                        gj.datepicker.methods.prev($datepicker, data)();
                        $new = $calendar.find('tbody tr').last().find('td[day]').last();
                    }
                    if ($new.length > 0) {
                        $new.addClass('focused');
                        $active.removeClass('focused');
                    }
                } else if (e.keyCode == '39') { // right
                    $new = $active.next('[day]:not(.disabled)');
                    if ($new.length === 0) {
                        $new = $active.closest('tr').next('tr').find('td[day]').first();
                    }
                    if ($new.length === 0) {
                        gj.datepicker.methods.next($datepicker, data)();
                        $new = $calendar.find('tbody tr').first().find('td[day]').first();
                    }
                    if ($new.length > 0) {
                        $new.addClass('focused');
                        $active.removeClass('focused');
                    }
                } else if (e.keyCode == '13') { // enter
                    day = parseInt($active.attr('day'), 10);
                    month = parseInt($active.attr('month'), 10);
                    year = parseInt($active.attr('year'), 10);
                    gj.datepicker.methods.dayClickHandler($datepicker, $calendar, data, new Date(year, month, day))();
                } else if (e.keyCode == '27') { // esc
                    $datepicker.close();
                }
            }
        }
    },

    getActiveCell: function ($calendar) {
        var $cell = $calendar.find('td[day].focused');
        if ($cell.length === 0) {
            $cell = $calendar.find('td[day].selected');
            if ($cell.length === 0) {
                $cell = $calendar.find('td[day].today');
                if ($cell.length === 0) {
                    $cell = $calendar.find('td[day]:not(.disabled)').first();
                }
            }
        }
        return $cell;
    },

    value: function ($datepicker, value) {
        var $calendar, date, data = $datepicker.data();
        if (typeof (value) === "undefined") {
            return $datepicker.val();
        } else {
            date = gj.core.parseDate(value, data.format, data.locale);
            if (date && date.getTime()) {
                $calendar = $('body').find('[role="calendar"][guid="' + $datepicker.attr('data-guid') + '"]');
                gj.datepicker.methods.dayClickHandler($datepicker, $calendar, data, date)();
            } else {
                $datepicker.val('');
            }
            return $datepicker;
        }
    },

    destroy: function ($datepicker) {
        var data = $datepicker.data(),
            $parent = $datepicker.parent(),
            $picker = $('body').find('[role="calendar"][guid="' + $datepicker.attr('data-guid') + '"]');
        if (data) {
            $datepicker.off();
            if ($picker.parent('[role="modal"]').length > 0) {
                $picker.unwrap();
            }
            $picker.remove();
            $datepicker.removeData();
            $datepicker.removeAttr('data-type').removeAttr('data-guid').removeAttr('data-datepicker');
            $datepicker.removeClass();
            $parent.children('[role="right-icon"]').remove();
            $datepicker.unwrap();
        }
        return $datepicker;
    }
};

gj.datepicker.events = {
    /**
     * Triggered when the datepicker value is changed.
     *
     * @event change
     * @param {object} e - event data
     * @example sample <!-- datepicker -->
     * <input id="datepicker" width="312" />
     * <script>
     *     $('#datepicker').datepicker({
     *         change: function (e) {
     *             alert('Change is fired');
     *         }
     *     });
     * </script>
     */
    change: function ($datepicker) {
        return $datepicker.triggerHandler('change');
    },

    /**
     * Triggered when new value is selected inside the picker.
     *
     * @event select
     * @param {object} e - event data
     * @param {string} type - The type of the selection. The options are day, month, year or decade.
     * @example sample <!-- datepicker -->
     * <input id="datepicker" width="312" />
     * <p>Click on the month name in order to select another month.</p>
     * <script>
     *     $('#datepicker').datepicker({
     *         modal: true,
     *         header: true,
     *         footer: true,
     *         change: function (e) {
     *             alert('Change is fired');
     *         },
     *         select: function (e, type) {
     *             alert('Select from type of "' + type + '" is fired');
     *         }
     *     });
     * </script>
     */
    select: function ($datepicker, type) {
        return $datepicker.triggerHandler('select', [type]);
    },

    /**
     * Event fires when the calendar is opened.
     * @event open
     * @param {object} e - event data
     * @example sample <!-- datepicker -->
     * <input id="datepicker" width="312" />
     * <script>
     *     $('#datepicker').datepicker({
     *         modal: true,
     *         open: function (e) {
     *             alert('open is fired.');
     *         }
     *     });
     * </script>
     */
    open: function ($datepicker) {
        return $datepicker.triggerHandler('open');
    },

    /**
     * Event fires when the calendar is closed.
     * @event close
     * @param {object} e - event data
     * @example sample <!-- datepicker -->
     * <input id="datepicker" width="312" />
     * <script>
     *     $('#datepicker').datepicker({
     *         modal: true,
     *         close: function (e) {
     *             alert('Close is fired.');
     *         }
     *     });
     * </script>
     */
    close: function ($datepicker) {
        return $datepicker.triggerHandler('close');
    }
};

gj.datepicker.widget = function ($element, jsConfig) {
    var self = this,
        methods = gj.datepicker.methods;

    /** Gets or sets the value of the datepicker.
     * @method
     * @param {string} value - The value that needs to be selected.
     * @return string | datepicker object
     * @example Get <!-- datepicker -->
     * <button class="gj-button-md" onclick="alert($datepicker.value())">Get Value</button>
     * <hr/>
     * <input id="datepicker" width="312" />
     * <script>
     *     var $datepicker = $('#datepicker').datepicker();
     * </script>
     * @example Set <!-- datepicker -->
     * <button class="gj-button-md" onclick="$datepicker.value('08/01/2017')">Set Value</button>
     * <hr/>
     * <input id="datepicker" width="312" />
     * <script>
     *     var $datepicker = $('#datepicker').datepicker();
     * </script>
     */
    self.value = function (value) {
        return methods.value(this, value);
    };

    /** Remove datepicker functionality from the element.
     * @method
     * @return jquery element
     * @example sample <!-- datepicker -->
     * <button class="gj-button-md" onclick="datepicker.destroy()">Destroy</button>
     * <input id="datepicker" width="312" />
     * <script>
     *     var datepicker = $('#datepicker').datepicker();
     * </script>
     */
    self.destroy = function () {
        return methods.destroy(this);
    };

    /** Open the calendar.
     * @method
     * @return datepicker
     * @example Open.Close <!-- datepicker -->
     * <button class="gj-button-md" onclick="$datepicker.open()">Open</button>
     * <button class="gj-button-md" onclick="$datepicker.close()">Close</button>
     * <hr/>
     * <input id="datepicker" width="312" />
     * <script>
     *     var $datepicker = $('#datepicker').datepicker();
     * </script>
     */
    self.open = function () {
        return methods.open(this, this.data());
    };

    /** Close the calendar.
     * @method
     * @return datepicker
     * @example Open.Close <!-- datepicker -->
     * <button class="gj-button-md" onclick="$datepicker.open()">Open</button>
     * <button class="gj-button-md" onclick="$datepicker.close()">Close</button>
     * <hr/>
     * <input id="datepicker" width="312" />
     * <script>
     *     var $datepicker = $('#datepicker').datepicker();
     * </script>
     */
    self.close = function () {
        return methods.close(this);
    };

    $.extend($element, self);
    if ('true' !== $element.attr('data-datepicker')) {
        methods.init.call($element, jsConfig);
    }

    return $element;
};

gj.datepicker.widget.prototype = new gj.widget();
gj.datepicker.widget.constructor = gj.datepicker.widget;

(function ($) {
    $.fn.datepicker = function (method) {
        var $widget;
        if (this && this.length) {
            if (typeof method === 'object' || !method) {
                return new gj.datepicker.widget(this, method);
            } else {
                $widget = new gj.datepicker.widget(this, null);
                if ($widget[method]) {
                    return $widget[method].apply(this, Array.prototype.slice.call(arguments, 1));
                } else {
                    throw 'Method ' + method + ' does not exist.';
                }
            }
        }
    };
})(jQuery);
/* global window alert jQuery gj */
/**
  * @widget TimePicker
  * @plugin Base
  */
gj.timepicker = {
    plugins: {}
};

gj.timepicker.config = {
    base: {

        /** The width of the timepicker.
         * @type number
         * @default undefined
         * @example JS.Config <!-- timepicker -->
         * <input id="timepicker" width="312" />
         * <script>
         *    $('#timepicker').timepicker({ width: 280 });
         * </script>
         * @example HTML.Config <!-- timepicker -->
         * <input id="timepicker" width="312" />
         * <script>
         *    $('#timepicker').timepicker();
         * </script>
         */
        width: undefined,

        /** If set to true, the timepicker will have modal behavior.
         * @type Boolean
         * @default true
         * @example True <!-- timepicker -->
         * <input id="timepicker" width="280" />
         * <script>
         *    $('#timepicker').timepicker({ modal: true });
         * </script>
         * @example False <!-- timepicker -->
         * <input id="timepicker" width="280" />
         * <script>
         *    $('#timepicker').timepicker({ modal: false, header: false, footer: false });
         * </script>
         */
        modal: true,

        /** If set to true, add header to the timepicker.
         * @type Boolean
         * @default true
         * @example True <!-- timepicker -->
         * <input id="timepicker" width="280" />
         * <script>
         *    $('#timepicker').timepicker({ header: true });
         * </script>
         * @example False <!-- timepicker -->
         * <input id="timepicker" width="280" />
         * <script>
         *    $('#timepicker').timepicker({ header: false, mode: '24hr' });
         * </script>
         */
        header: true,

        /** If set to true, add footer with ok and cancel buttons to the timepicker.
         * @type Boolean
         * @default true
         * @example True <!-- timepicker -->
         * <input id="timepicker" width="280" />
         * <script>
         *    $('#timepicker').timepicker({ footer: true });
         * </script>
         * @example False <!-- timepicker -->
         * <input id="timepicker" width="280" />
         * <script>
         *    $('#timepicker').timepicker({ footer: false });
         * </script>
         */
        footer: true,

        /** Specifies the format, which is used to format the value of the timepicker displayed in the input.
         * @additionalinfo <b>M</b> - Minutes; no leading zero for single-digit minutes.<br/>
         * <b>MM</b> - Minutes; leading zero for single-digit minutes.<br/>
         * <b>H</b> - The hour, using a 24-hour clock from 0 to 23; no leading zero for single-digit hours.<br/>
         * <b>HH</b> - The hour, using a 24-hour clock from 0 to 23; leading zero for single-digit hours.<br/>
         * <b>h</b> - The hour, using a 12-hour clock from 1 to 12; no leading zero for single-digit hours.<br/>
         * <b>hh</b> - The hour, using a 12-hour clock from 1 to 12; leading zero for single-digit hours<br/>
         * <b>tt</b> - The AM/PM designator; lowercase.<br/>
         * <b>TT</b> - The AM/PM designator; upercase.<br/>
         * @type String
         * @default 'MM:HH'
         * @example Sample <!-- timepicker -->
         * <input id="timepicker" width="312" value="13.42" />
         * <script>
         *     var timepicker = $('#timepicker').timepicker({
         *         format: 'HH.MM'
         *     });
         * </script>
         */
        format: 'HH:MM',

        /** The name of the UI library that is going to be in use.
         * @additionalinfo The css file for bootstrap should be manually included if you use bootstrap.
         * @type (materialdesign|bootstrap|bootstrap4)
         * @default materialdesign
         * @example MaterialDesign <!-- timepicker -->
         * <input id="timepicker" width="312" />
         * <script>
         *    $('#timepicker').timepicker({ uiLibrary: 'materialdesign' });
         * </script>
         * @example Bootstrap.3 <!-- bootstrap, timepicker -->
         * <input id="timepicker" width="270" />
         * <script>
         *     $('#timepicker').timepicker({ uiLibrary: 'bootstrap', modal: false, footer: false });
         * </script>
         * @example Bootstrap.4 <!-- bootstrap4, timepicker -->
         * <input id="timepicker" width="276" />
         * <script>
         *     $('#timepicker').timepicker({ uiLibrary: 'bootstrap4' });
         * </script>
         */
        uiLibrary: 'materialdesign',

        /** The initial timepicker value.
         * @type String
         * @default undefined
         * @example Javascript <!-- timepicker -->
         * <input id="timepicker" width="312" />
         * <script>
         *    $('#timepicker').timepicker({
         *        value: '13:42'
         *    });
         * </script>
         * @example HTML <!-- timepicker -->
         * <input id="timepicker" width="312" value="13:42" />
         * <script>
         *     $('#timepicker').timepicker();
         * </script>
         */
        value: undefined,

        /** The timepicker mode. Tells the component to display the picker in ampm (12hr) format or 24hr format.
         * @type ampm|24hr
         * @default 'ampm'
         * @example ampm <!-- timepicker -->
         * <input id="timepicker" width="312" />
         * <script>
         *    $('#timepicker').timepicker({ mode: 'ampm' });
         * </script>
         * @example 24hr <!-- timepicker -->
         * <input id="timepicker" width="312" />
         * <script>
         *     $('#timepicker').timepicker({ mode: '24hr' });
         * </script>
         */
        mode: 'ampm',

        /** The language that needs to be in use.
         * @type string
         * @default 'en-us'
         * @example German <!-- timepicker -->
         * <input id="timepicker" width="276" />
         * <script>
         *    $('#timepicker').timepicker({
         *        locale: 'de-de'
         *    });
         * </script>
         * @example Bulgarian <!-- timepicker -->
         * <input id="timepicker" width="276" />
         * <script>
         *    $('#timepicker').timepicker({
         *        locale: 'bg-bg'
         *    });
         * </script>
         * @example French <!-- timepicker -->
         * <input id="timepicker" width="276" />
         * <script>
         *    $('#timepicker').timepicker({
         *        locale: 'fr-fr'
         *    });
         * </script>
         * @example Brazil <!-- timepicker -->
         * <input id="timepicker" width="276" />
         * <script>
         *    $('#timepicker').timepicker({
         *        locale: 'pt-br'
         *    });
         * </script>
         * @example Russian <!-- timepicker -->
         * <input id="timepicker" width="276" />
         * <script>
         *    $('#timepicker').timepicker({
         *        locale: 'ru-ru'
         *    });
         * </script>
         */
        locale: 'en-us',

        /** The size of the timepicker input.
         * @type 'small'|'default'|'large'
         * @default 'default'
         * @example Bootstrap.4 <!-- bootstrap4, timepicker -->
         * <p><label for="timepicker-small">Small Size:</label> <input id="timepicker-small" width="220" value="15:20" /></p>
         * <p><label for="timepicker-default">Default Size:</label> <input id="timepicker-default" width="220" value="15:20" /></p>
         * <p><label for="timepicker-large">Large Size:</label> <input id="timepicker-large" width="220" value="15:20" /></p>
         * <script>
         *     $('#timepicker-small').timepicker({ uiLibrary: 'bootstrap4', size: 'small' });
         *     $('#timepicker-default').timepicker({ uiLibrary: 'bootstrap4', size: 'default' });
         *     $('#timepicker-large').timepicker({ uiLibrary: 'bootstrap4', size: 'large' });
         * </script>
         * @example Bootstrap.3 <!-- bootstrap, timepicker -->
         * <p><label for="timepicker-small">Small Size:</label> <input id="timepicker-small" width="220" value="15:20" /></p>
         * <p><label for="timepicker-default">Default Size:</label> <input id="timepicker-default" width="220" value="15:20" /></p>
         * <p><label for="timepicker-large">Large Size:</label> <input id="timepicker-large" width="220" value="15:20" /></p>
         * <script>
         *     $('#timepicker-small').timepicker({ uiLibrary: 'bootstrap', size: 'small' });
         *     $('#timepicker-default').timepicker({ uiLibrary: 'bootstrap', size: 'default' });
         *     $('#timepicker-large').timepicker({ uiLibrary: 'bootstrap', size: 'large' });
         * </script>
         * @example Material.Design <!-- timepicker -->
         * <p><label for="timepicker-small">Small Size:</label> <input id="timepicker-small" width="220" value="15:20" /></p>
         * <p><label for="timepicker-default">Default Size:</label> <input id="timepicker-default" width="220" value="15:20" /></p>
         * <p><label for="timepicker-large">Large Size:</label> <input id="timepicker-large" width="220" value="15:20" /></p>
         * <script>
         *     $('#timepicker-small').timepicker({ size: 'small' });
         *     $('#timepicker-default').timepicker({ size: 'default' });
         *     $('#timepicker-large').timepicker({ size: 'large' });
         * </script>
         */
        size: 'default',

        icons: {
            rightIcon: '<i class="gj-icon clock" />'
        },

        style: {
            modal: 'gj-modal',
            wrapper: 'gj-timepicker gj-timepicker-md gj-unselectable',
            input: 'gj-textbox-md',
            clock: 'gj-picker gj-picker-md timepicker',
            footer: '',
            button: 'gj-button-md'
        }
    },

    bootstrap: {
        style: {
            wrapper: 'gj-timepicker gj-timepicker-bootstrap gj-unselectable input-group',
            input: 'form-control',
            clock: 'gj-picker gj-picker-bootstrap timepicker',
            footer: 'modal-footer',
            button: 'btn btn-default'
        },
        iconsLibrary: 'glyphicons'
    },

    bootstrap4: {
        style: {
            wrapper: 'gj-timepicker gj-timepicker-bootstrap gj-unselectable input-group',
            input: 'form-control border',
            clock: 'gj-picker gj-picker-bootstrap timepicker',
            footer: 'modal-footer',
            button: 'btn btn-default'
        }
    }
};

gj.timepicker.methods = {
    init: function (jsConfig) {
        gj.picker.widget.prototype.init.call(this, jsConfig, 'timepicker');
        return this;
    },

    initialize: function () {

    },

    initMouse: function ($body, $input, $picker, data) {
        $body.off();
        $body.on('mousedown', gj.timepicker.methods.mouseDownHandler($input, $picker));
        $body.on('mousemove', gj.timepicker.methods.mouseMoveHandler($input, $picker, data));
        $body.on('mouseup', gj.timepicker.methods.mouseUpHandler($input, $picker, data));
    },

    createPicker: function ($timepicker) {
        var date, data = $timepicker.data(),
            $clock = $('<div role="picker" />').addClass(data.style.clock).attr('guid', $timepicker.attr('data-guid')),
            $hour = $('<div role="hour" />'),
            $minute = $('<div role="minute" />'),
            $header = $('<div role="header" />'),
            $mode = $('<div role="mode" />'),
            $body = $('<div role="body" />'),
            $btnOk = $('<button class="' + data.style.button + '">' + gj.core.messages[data.locale].ok + '</button>'),
            $btnCancel = $('<button class="' + data.style.button + '">' + gj.core.messages[data.locale].cancel + '</button>'),
            $footer = $('<div role="footer" class="' + data.style.footer + '" />');

        date = gj.core.parseDate(data.value, data.format, data.locale);
        if (!date || isNaN(date.getTime())) {
            date = new Date();
        } else {
            $timepicker.attr('hours', date.getHours());
        }

        gj.timepicker.methods.initMouse($body, $timepicker, $clock, data);

        if (data.header) {
            $hour.on('click', function () {
                gj.timepicker.methods.renderHours($timepicker, $clock, data);
            });
            $minute.on('click', function () {
                gj.timepicker.methods.renderMinutes($timepicker, $clock, data);
            });
            $header.append($hour).append(':').append($minute);
            if (data.mode === 'ampm') {
                $mode.append($('<span role="am">' + gj.core.messages[data.locale].am + '</span>').on('click', function () {
                    var hour = gj.timepicker.methods.getHour($clock);
                    $clock.attr('mode', 'am');
                    $(this).addClass('selected');
                    $(this).parent().children('[role="pm"]').removeClass('selected');
                    if (hour >= 12) {
                        $clock.attr('hour', hour - 12);
                    }
                    if (!data.modal) {
                        clearTimeout($timepicker.timeout);
                        $timepicker.focus();
                    }
                }));
                $mode.append('<br />');
                $mode.append($('<span role="pm">' + gj.core.messages[data.locale].pm + '</span>').on('click', function () {
                    var hour = gj.timepicker.methods.getHour($clock);
                    $clock.attr('mode', 'pm');
                    $(this).addClass('selected');
                    $(this).parent().children('[role="am"]').removeClass('selected');
                    if (hour < 12) {
                        $clock.attr('hour', hour + 12);
                    }
                    if (!data.modal) {
                        clearTimeout($timepicker.timeout);
                        $timepicker.focus();
                    }
                }));
                $header.append($mode);
            }
            $clock.append($header);
        }
        
        $clock.append($body);

        if (data.footer) {
            $btnCancel.on('click', function () { $timepicker.close(); });
            $footer.append($btnCancel);
            $btnOk.on('click', gj.timepicker.methods.setTime($timepicker, $clock));
            $footer.append($btnOk);
            $clock.append($footer);
        }

        $clock.hide();

        $('body').append($clock);

        if (data.modal) {
            $clock.wrapAll('<div role="modal" class="' + data.style.modal + '"/>');
            gj.core.center($clock);
        }
        return $clock;
    },

    getHour: function ($clock) {
        return parseInt($clock.attr('hour'), 10) || 0;
    },

    getMinute: function ($clock) {
        return parseInt($clock.attr('minute'), 10) || 0;
    },

    setTime: function ($timepicker, $clock) {
        return function () {
            var hour = gj.timepicker.methods.getHour($clock),
                minute = gj.timepicker.methods.getMinute($clock),
                mode = $clock.attr('mode'),
                date = new Date(0, 0, 0, (hour === 12 && mode === 'am' ? 0 : hour), minute),
                data = $timepicker.data(),
                value = gj.core.formatDate(date, data.format, data.locale);
            $timepicker.value(value);
            $timepicker.close();
        }
    },

    getPointerValue: function (x, y, mode) {
        var value, radius, size = 256,
            angle = Math.atan2(size / 2 - x, size / 2 - y) / Math.PI * 180;

        if (angle < 0) {
            angle = 360 + angle;
        }

        switch (mode) {
            case 'ampm': {
                value = 12 - Math.round(angle * 12 / 360);
                return value === 0 ? 12 : value;
            }
            case '24hr': {
                radius = Math.sqrt(Math.pow(size / 2 - x, 2) + Math.pow(size / 2 - y, 2));
                value = 12 - Math.round(angle * 12 / 360);
                if (value === 0) {
                    value = 12;
                }
                if (radius < size / 2 - 32) {
                    value = value === 12 ? 0 : value + 12;
                }
                return value;
            }
            case 'minutes': {
                value = Math.round(60 - 60 * angle / 360);
                return value === 60 ? 0 : value;
            }
        }
    },

    updateArrow: function(e, $timepicker, $clock, data) {
        var rect, value,
            mouseX = $timepicker.mouseX(e),
            mouseY = $timepicker.mouseY(e),
            scrollY = window.scrollY || window.pageYOffset || 0,
            scrollX = window.scrollX || window.pageXOffset || 0;

        rect = e.target.getBoundingClientRect();
        if (data.dialMode == 'hours') {
            value = gj.timepicker.methods.getPointerValue(mouseX - scrollX - rect.left, mouseY - scrollY - rect.top, data.mode);
            $clock.attr('hour', data.mode === 'ampm' && $clock.attr('mode') === 'pm' && value < 12 ? value + 12 : value);
        } else if (data.dialMode == 'minutes') {
            value = gj.timepicker.methods.getPointerValue(mouseX - scrollX - rect.left, mouseY - scrollY - rect.top, 'minutes');
            $clock.attr('minute', value);
        }

        gj.timepicker.methods.update($timepicker, $clock, data);
    },

    update: function ($timepicker, $clock, data) {
        var hour, minute, $arrow, visualHour, $header, $numbers;

        // update the arrow
        hour = gj.timepicker.methods.getHour($clock);
        minute = gj.timepicker.methods.getMinute($clock);
        $arrow = $clock.find('[role="arrow"]');
        if (data.dialMode == 'hours' && (hour == 0 || hour > 12) && data.mode === '24hr') {
            $arrow.css('width', 'calc(50% - 52px)');
        } else {
            $arrow.css('width', 'calc(50% - 20px)');
        }

        if (data.dialMode == 'hours') {
            $arrow.css('transform', 'rotate(' + ((hour * 30) - 90).toString() + 'deg)');
        } else {
            $arrow.css('transform', 'rotate(' + ((minute * 6) - 90).toString() + 'deg)');
        }
        $arrow.show();

        // update the numbers
        visualHour = (data.mode === 'ampm' && hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour));
        $numbers = $clock.find('[role="body"] span');
        $numbers.removeClass('selected');
        $numbers.filter(function (e) {
            if (data.dialMode == 'hours') {
                return parseInt($(this).text(), 10) == visualHour;
            } else {
                return parseInt($(this).text(), 10) == minute;
            }
        }).addClass('selected');

        // update the header
        if (data.header) {
            $header = $clock.find('[role="header"]');
            $header.find('[role="hour"]').text(visualHour);
            $header.find('[role="minute"]').text(gj.core.pad(minute));
            if (data.mode === 'ampm') {
                if (hour >= 12) {
                    $header.find('[role="pm"]').addClass('selected');
                    $header.find('[role="am"]').removeClass('selected');
                } else {
                    $header.find('[role="am"]').addClass('selected');
                    $header.find('[role="pm"]').removeClass('selected');
                }
            }
        }
    },

    mouseDownHandler: function ($timepicker, $clock) {
        return function (e) {
            $timepicker.mouseMove = true;
        }
    },

    mouseMoveHandler: function ($timepicker, $clock, data) {
        return function (e) {
            if ($timepicker.mouseMove) {
                gj.timepicker.methods.updateArrow(e, $timepicker, $clock, data);
            }
        }
    },

    mouseUpHandler: function ($timepicker, $clock, data) {
        return function (e) {
            gj.timepicker.methods.updateArrow(e, $timepicker, $clock, data);
            $timepicker.mouseMove = false;
            if (!data.modal) {
                clearTimeout($timepicker.timeout);
                $timepicker.focus();
            }
            if (data.dialMode == 'hours') {
                setTimeout(function () {
                    gj.timepicker.events.select($timepicker, 'hour');
                    gj.timepicker.methods.renderMinutes($timepicker, $clock, data);
                }, 1000);
            } else if (data.dialMode == 'minutes') {
                if (data.footer !== true && data.autoClose !== false) {
                    gj.timepicker.methods.setTime($timepicker, $clock)();
                }
                gj.timepicker.events.select($timepicker, 'minute');
            }
        }
    },

    renderHours: function ($timepicker, $clock, data) {
        var $dial, $body = $clock.find('[role="body"]');

        clearTimeout($timepicker.timeout);
        $body.empty();
        $dial = $('<div role="dial"></div>');

        $dial.append('<div role="arrow" style="transform: rotate(-90deg); display: none;"><div class="arrow-begin"></div><div class="arrow-end"></div></div>');

        $dial.append('<span role="hour" style="transform: translate(54px, -93.5307px);">1</span>');
        $dial.append('<span role="hour" style="transform: translate(93.5307px, -54px);">2</span>');
        $dial.append('<span role="hour" style="transform: translate(108px, 0px);">3</span>');
        $dial.append('<span role="hour" style="transform: translate(93.5307px, 54px);">4</span>');
        $dial.append('<span role="hour" style="transform: translate(54px, 93.5307px);">5</span>');
        $dial.append('<span role="hour" style="transform: translate(6.61309e-15px, 108px);">6</span>');
        $dial.append('<span role="hour" style="transform: translate(-54px, 93.5307px);">7</span>');
        $dial.append('<span role="hour" style="transform: translate(-93.5307px, 54px);">8</span>');
        $dial.append('<span role="hour" style="transform: translate(-108px, 1.32262e-14px);">9</span>');
        $dial.append('<span role="hour" style="transform: translate(-93.5307px, -54px);">10</span>');
        $dial.append('<span role="hour" style="transform: translate(-54px, -93.5307px);">11</span>');
        $dial.append('<span role="hour" style="transform: translate(-1.98393e-14px, -108px);">12</span>');
        if (data.mode === '24hr') {
            $dial.append('<span role="hour" style="transform: translate(38px, -65.8179px);">13</span>');
            $dial.append('<span role="hour" style="transform: translate(65.8179px, -38px);">14</span>');
            $dial.append('<span role="hour" style="transform: translate(76px, 0px);">15</span>');
            $dial.append('<span role="hour" style="transform: translate(65.8179px, 38px);">16</span>');
            $dial.append('<span role="hour" style="transform: translate(38px, 65.8179px);">17</span>');
            $dial.append('<span role="hour" style="transform: translate(4.65366e-15px, 76px);">18</span>');
            $dial.append('<span role="hour" style="transform: translate(-38px, 65.8179px);">19</span>');
            $dial.append('<span role="hour" style="transform: translate(-65.8179px, 38px);">20</span>');
            $dial.append('<span role="hour" style="transform: translate(-76px, 9.30732e-15px);">21</span>');
            $dial.append('<span role="hour" style="transform: translate(-65.8179px, -38px);">22</span>');
            $dial.append('<span role="hour" style="transform: translate(-38px, -65.8179px);">23</span>');
            $dial.append('<span role="hour" style="transform: translate(-1.3961e-14px, -76px);">00</span>');
        }
        $body.append($dial);

        $clock.find('[role="header"] [role="hour"]').addClass('selected');
        $clock.find('[role="header"] [role="minute"]').removeClass('selected');

        data.dialMode = 'hours';

        gj.timepicker.methods.update($timepicker, $clock, data);
    },

    renderMinutes: function ($timepicker, $clock, data) {
        var $body = $clock.find('[role="body"]');

        clearTimeout($timepicker.timeout);
        $body.empty();
        $dial = $('<div role="dial"></div>');

        $dial.append('<div role="arrow" style="transform: rotate(-90deg); display: none;"><div class="arrow-begin"></div><div class="arrow-end"></div></div>');

        $dial.append('<span role="hour" style="transform: translate(54px, -93.5307px);">5</span>');
        $dial.append('<span role="hour" style="transform: translate(93.5307px, -54px);">10</span>');
        $dial.append('<span role="hour" style="transform: translate(108px, 0px);">15</span>');
        $dial.append('<span role="hour" style="transform: translate(93.5307px, 54px);">20</span>');
        $dial.append('<span role="hour" style="transform: translate(54px, 93.5307px);">25</span>');
        $dial.append('<span role="hour" style="transform: translate(6.61309e-15px, 108px);">30</span>');
        $dial.append('<span role="hour" style="transform: translate(-54px, 93.5307px);">35</span>');
        $dial.append('<span role="hour" style="transform: translate(-93.5307px, 54px);">40</span>');
        $dial.append('<span role="hour" style="transform: translate(-108px, 1.32262e-14px);">45</span>');
        $dial.append('<span role="hour" style="transform: translate(-93.5307px, -54px);">50</span>');
        $dial.append('<span role="hour" style="transform: translate(-54px, -93.5307px);">55</span>');
        $dial.append('<span role="hour" style="transform: translate(-1.98393e-14px, -108px);">00</span>');
        $body.append($dial);

        $clock.find('[role="header"] [role="hour"]').removeClass('selected');
        $clock.find('[role="header"] [role="minute"]').addClass('selected');
        
        data.dialMode = 'minutes';

        gj.timepicker.methods.update($timepicker, $clock, data);
    },

    open: function ($timepicker) {
        var time, hour, data = $timepicker.data(),
            $clock = $('body').find('[role="picker"][guid="' + $timepicker.attr('data-guid') + '"]');

        if ($timepicker.value()) {
            time = gj.core.parseDate($timepicker.value(), data.format, data.locale);
        } else {
            time = new Date();
        }
        hour = time.getHours();
        if (data.mode === 'ampm') {
            $clock.attr('mode', hour > 12 ? 'pm' : 'am');
        }
        $clock.attr('hour', hour);
        $clock.attr('minute', time.getMinutes());

        gj.timepicker.methods.renderHours($timepicker, $clock, data);

        gj.picker.widget.prototype.open.call($timepicker, 'timepicker');
        return $timepicker;
    },

    value: function ($timepicker, value) {
        var $clock, time, data = $timepicker.data();
        if (typeof (value) === "undefined") {
            return $timepicker.val();
        } else {
            $timepicker.val(value);
            gj.timepicker.events.change($timepicker);
            return $timepicker;
        }
    }
};

gj.timepicker.events = {
    /**
     * Triggered when the timepicker value is changed.
     *
     * @event change
     * @param {object} e - event data
     * @example sample <!-- timepicker -->
     * <input id="timepicker" width="312" />
     * <script>
     *     $('#timepicker').timepicker({
     *         change: function (e) {
     *             alert('Change is fired');
     *         }
     *     });
     * </script>
     */
    change: function ($timepicker) {
        return $timepicker.triggerHandler('change');
    },

    /**
     * Triggered when new value is selected inside the picker.
     *
     * @event select
     * @param {object} e - event data
     * @param {string} type - The type of the selection. The options are hour and minute.
     * @example sample <!-- datepicker -->
     * <input id="timepicker" width="312" />
     * <script>
     *     $('#timepicker').timepicker({
     *         modal: true,
     *         header: true,
     *         footer: true,
     *         change: function (e) {
     *             alert('Change is fired');
     *         },
     *         select: function (e, type) {
     *             alert('Select from type of "' + type + '" is fired');
     *         }
     *     });
     * </script>
     */
    select: function ($timepicker, type) {
        return $timepicker.triggerHandler('select', [type]);
    },

    /**
     * Event fires when the timepicker is opened.
     * @event open
     * @param {object} e - event data
     * @example sample <!-- timepicker -->
     * <input id="timepicker" width="312" />
     * <script>
     *     $('#timepicker').timepicker({
     *         open: function (e) {
     *             alert('open is fired.');
     *         }
     *     });
     * </script>
     */
    open: function ($timepicker) {
        return $timepicker.triggerHandler('open');
    },

    /**
     * Event fires when the timepicker is closed.
     * @event close
     * @param {object} e - event data
     * @example sample <!-- timepicker -->
     * <input id="timepicker" width="312" />
     * <script>
     *     $('#timepicker').timepicker({
     *         close: function (e) {
     *             alert('close is fired.');
     *         }
     *     });
     * </script>
     */
    close: function ($timepicker) {
        return $timepicker.triggerHandler('close');
    }
};

gj.timepicker.widget = function ($element, jsConfig) {
    var self = this,
        methods = gj.timepicker.methods;

    self.mouseMove = false;

    /** Gets or sets the value of the timepicker.
     * @method
     * @param {string} value - The value that needs to be selected.
     * @return string
     * @example Get <!-- timepicker -->
     * <button class="gj-button-md" onclick="alert($timepicker.value())">Get Value</button>
     * <hr/>
     * <input id="timepicker" width="312" />
     * <script>
     *     var $timepicker = $('#timepicker').timepicker();
     * </script>
     * @example Set <!-- timepicker -->
     * <button class="gj-button-md" onclick="$timepicker.value('11:00')">Set Value</button>
     * <hr/>
     * <input id="timepicker" width="312" />
     * <script>
     *     var $timepicker = $('#timepicker').timepicker();
     * </script>
     */
    self.value = function (value) {
        return methods.value(this, value);
    };

    /** Remove timepicker functionality from the element.
     * @method
     * @return jquery element
     * @example sample <!-- timepicker -->
     * <button class="gj-button-md" onclick="timepicker.destroy()">Destroy</button>
     * <input id="timepicker" width="312" />
     * <script>
     *     var timepicker = $('#timepicker').timepicker();
     * </script>
     */
    self.destroy = function () {
        return gj.picker.widget.prototype.destroy.call(this, 'timepicker');
    };

    /** Open the clock.
     * @method
     * @return timepicker
     * @example Open.Close <!-- timepicker -->
     * <button class="gj-button-md" onclick="$timepicker.open()">Open</button>
     * <button class="gj-button-md" onclick="$timepicker.close()">Close</button>
     * <hr/>
     * <input id="timepicker" width="312" />
     * <script>
     *     var $timepicker = $('#timepicker').timepicker({ modal: false, header: false, footer: false, mode: '24hr' });
     * </script>
     */
    self.open = function () {
        return gj.timepicker.methods.open(this);
    };

    /** Close the clock.
     * @method
     * @return timepicker
     * @example Open.Close <!-- timepicker -->
     * <button class="gj-button-md" onclick="$timepicker.open()">Open</button>
     * <button class="gj-button-md" onclick="$timepicker.close()">Close</button>
     * <hr/>
     * <input id="timepicker" width="312" />
     * <script>
     *     var $timepicker = $('#timepicker').timepicker({ modal: false, header: false, footer: false, mode: '24hr' });
     * </script>
     */
    self.close = function () {
        return gj.picker.widget.prototype.close.call(this, 'timepicker');
    };

    $.extend($element, self);
    if ('true' !== $element.attr('data-timepicker')) {
        methods.init.call($element, jsConfig);
    }

    return $element;
};

gj.timepicker.widget.prototype = new gj.picker.widget();
gj.timepicker.widget.constructor = gj.timepicker.widget;

(function ($) {
    $.fn.timepicker = function (method) {
        var $widget;
        if (this && this.length) {
            if (typeof method === 'object' || !method) {
                return new gj.timepicker.widget(this, method);
            } else {
                $widget = new gj.timepicker.widget(this, null);
                if ($widget[method]) {
                    return $widget[method].apply(this, Array.prototype.slice.call(arguments, 1));
                } else {
                    throw 'Method ' + method + ' does not exist.';
                }
            }
        }
    };
})(jQuery);
/* global window alert jQuery gj */
/**
  * @widget DateTimePicker
  * @plugin Base
  */
gj.datetimepicker = {
    plugins: {},
    messages: {
        'en-us': {
        }
    }
};

gj.datetimepicker.config = {
    base: {

        /** The datepicker configuration options. Valid only for datepicker specific configuration options.
         * @additionalinfo All configuration options that exists on the datetimepicker level are going to override the options at datepicker level.
         * @type object
         * @default undefined
         * @example Sample <!-- datetimepicker -->
         * <input id="datetimepicker" width="312" />
         * <script>
         *    $('#datetimepicker').datetimepicker({
         *        datepicker: { showOtherMonths: true, calendarWeeks: true }
         *    });
         * </script>
         */
        datepicker: gj.datepicker.config.base,

        timepicker: gj.timepicker.config.base,

        /** The name of the UI library that is going to be in use.
         * @additionalinfo The css file for bootstrap should be manually included if you use bootstrap.
         * @type (materialdesign|bootstrap|bootstrap4)
         * @default materialdesign
         * @example MaterialDesign <!-- datetimepicker -->
         * <input id="datetimepicker" width="312" />
         * <script>
         *    $('#datetimepicker').datetimepicker({ uiLibrary: 'materialdesign' });
         * </script>
         * @example MaterialDesign.Modal <!-- datetimepicker -->
         * <input id="datetimepicker" width="312" />
         * <script>
         *    $('#datetimepicker').datetimepicker({ uiLibrary: 'materialdesign', modal: true, footer: true });
         * </script>
         * @example Bootstrap.3 <!-- bootstrap, datetimepicker -->
         * <input id="datetimepicker" width="220" />
         * <script>
         *     $('#datetimepicker').datetimepicker({ uiLibrary: 'bootstrap' });
         * </script>
         * @example Bootstrap.4 <!-- bootstrap4, datetimepicker -->
         * <input id="datetimepicker" width="234" />
         * <script>
         *     $('#datetimepicker').datetimepicker({ uiLibrary: 'bootstrap4', modal: true, footer: true });
         * </script>
         */
        uiLibrary: 'materialdesign',

        /** The initial datetimepicker value.
         * @type number
         * @default undefined
         * @example Javascript <!-- datetimepicker -->
         * <input id="datetimepicker" width="300" />
         * <script>
         *    $('#datetimepicker').datetimepicker({ value: '22:10 03/27/2018' });
         * </script>
         * @example HTML <!-- datetimepicker -->
         * <input id="datetimepicker" width="300" value="22:10 03/27/2018" />
         * <script>
         *     $('#datetimepicker').datetimepicker();
         * </script>
         */
        value: undefined,

        /** Specifies the format, which is used to format the value of the DatePicker displayed in the input.
         * @additionalinfo <b>M</b> - Minutes; no leading zero for single-digit minutes.<br/>
         * <b>MM</b> - Minutes; leading zero for single-digit minutes.<br/>
         * <b>H</b> - The hour, using a 24-hour clock from 0 to 23; no leading zero for single-digit hours.<br/>
         * <b>HH</b> - The hour, using a 24-hour clock from 0 to 23; leading zero for single-digit hours.<br/>
         * <b>h</b> - The hour, using a 12-hour clock from 1 to 12; no leading zero for single-digit hours.<br/>
         * <b>hh</b> - The hour, using a 12-hour clock from 1 to 12; leading zero for single-digit hours<br/>
         * <b>tt</b> - The AM/PM designator; lowercase.<br/>
         * <b>TT</b> - The AM/PM designator; upercase.<br/>
         * <b>d</b> - Day of the month as digits; no leading zero for single-digit days.<br/>
         * <b>dd</b> - Day of the month as digits; leading zero for single-digit days.<br/>
         * <b>ddd</b> - Day of the week as a three-letter abbreviation.<br/>
         * <b>dddd</b> - Day of the week as its full name.<br/>
         * <b>m</b> - Month as digits; no leading zero for single-digit months.<br/>
         * <b>mm</b> - Month as digits; leading zero for single-digit months.<br/>
         * <b>mmm</b> - Month as a three-letter abbreviation.<br/>
         * <b>mmmm</b> - Month as its full name.<br/>
         * <b>yy</b> - Year as last two digits; leading zero for years less than 10.<br/>
         * <b>yyyy</b> - Year represented by four digits.<br/>
         * @type String
         * @default 'HH:MM mm/dd/yyyy'
         * @example Sample <!-- datetimepicker -->
         * <input id="input" value="05:50 2018-27-03" width="312" />
         * <script>
         *     $('#input').datetimepicker({ format: 'HH:MM yyyy-dd-mm' });
         * </script>
         * @example Long.Month.Format <!-- datetimepicker -->
         * <input id="input" value="10 October 2017 05:50" width="312" />
         * <script>
         *     $('#input').datetimepicker({ format: 'dd mmmm yyyy HH:MM' });
         * </script>
         */
        format: 'HH:MM mm/dd/yyyy',

        /** The width of the datetimepicker.
         * @type number
         * @default undefined
         * @example JS.Config <!-- datetimepicker -->
         * <input id="input" />
         * <script>
         *    $('#input').datetimepicker({ width: 312 });
         * </script>
         * @example HTML.Config <!-- datetimepicker -->
         * <input id="input" width="312" />
         * <script>
         *    $('#input').datetimepicker();
         * </script>
         */
        width: undefined,

        /** If set to true, the datetimepicker will have modal behavior.
         * @type Boolean
         * @default false
         * @example Material.Design <!-- datetimepicker -->
         * <input id="input" width="312" />
         * <script>
         *    $('#input').datetimepicker({ modal: true });
         * </script>
         * @example Bootstrap <!-- bootstrap, datetimepicker -->
         * <input id="input" width="220" />
         * <script>
         *    $('#input').datetimepicker({ uiLibrary: 'bootstrap', modal: true, footer: true });
         * </script>
         * @example Bootstrap.4 <!-- bootstrap4, datetimepicker -->
         * <input id="input" width="234" />
         * <script>
         *    $('#input').datetimepicker({ uiLibrary: 'bootstrap4', modal: true, footer: true });
         * </script>
         */
        modal: false,

        /** If set to true, add footer with ok and cancel buttons to the datetimepicker.
         * @type Boolean
         * @default false
         * @example True <!-- datetimepicker -->
         * <input id="input" width="312" />
         * <script>
         *    $('#input').datetimepicker({ footer: true, modal: true, header: true });
         * </script>
         * @example False <!-- datetimepicker -->
         * <input id="input" width="312" />
         * <script>
         *    $('#input').datetimepicker({ footer: false });
         * </script>
         */
        footer: false,

        /** The size of the datetimepicker input.
         * @type 'small'|'default'|'large'
         * @default 'default'
         * @example Bootstrap.4 <!-- bootstrap4, datetimepicker -->
         * <p><label for="small">Small Size:</label> <input id="small" width="234" value="10:20 03/20/2018" /></p>
         * <p><label for="default">Default Size:</label> <input id="default" width="234" value="10:20 03/20/2018" /></p>
         * <p><label for="large">Large Size:</label> <input id="large" width="234" value="10:20 03/20/2018" /></p>
         * <script>
         *     $('#small').datetimepicker({ uiLibrary: 'bootstrap4', size: 'small' });
         *     $('#default').datetimepicker({ uiLibrary: 'bootstrap4', size: 'default' });
         *     $('#large').datetimepicker({ uiLibrary: 'bootstrap4', size: 'large' });
         * </script>
         * @example Bootstrap.4.Font.Awesome <!-- bootstrap4, fontawesome, datetimepicker -->
         * <p><label for="small">Small Size:</label> <input id="small" width="234" value="10:20 03/20/2018" /></p>
         * <p><label for="default">Default Size:</label> <input id="default" width="234" value="10:20 03/20/2018" /></p>
         * <p><label for="large">Large Size:</label> <input id="large" width="234" value="10:20 03/20/2018" /></p>
         * <script>
         *     $('#small').datetimepicker({ uiLibrary: 'bootstrap4', iconsLibrary: 'fontawesome', size: 'small' });
         *     $('#default').datetimepicker({ uiLibrary: 'bootstrap4', iconsLibrary: 'fontawesome', size: 'default' });
         *     $('#large').datetimepicker({ uiLibrary: 'bootstrap4', iconsLibrary: 'fontawesome', size: 'large' });
         * </script>
         * @example Bootstrap.3 <!-- bootstrap, datetimepicker -->
         * <p><label for="small">Small Size:</label> <input id="small" width="220" value="10:20 03/20/2018" /></p>
         * <p><label for="default">Default Size:</label> <input id="default" width="220" value="10:20 03/20/2018" /></p>
         * <p><label for="large">Large Size:</label> <input id="large" width="220" value="10:20 03/20/2018" /></p>
         * <script>
         *     $('#small').datetimepicker({ uiLibrary: 'bootstrap', size: 'small' });
         *     $('#default').datetimepicker({ uiLibrary: 'bootstrap', size: 'default' });
         *     $('#large').datetimepicker({ uiLibrary: 'bootstrap', size: 'large' });
         * </script>
         * @example Material.Design <!-- datetimepicker -->
         * <p><label for="small">Small Size:</label> <input id="small" width="276" value="10:20 03/20/2018" /></p>
         * <p><label for="default">Default Size:</label> <input id="default" width="276" value="10:20 03/20/2018" /></p>
         * <p><label for="large">Large Size:</label> <input id="large" width="276" value="10:20 03/20/2018" /></p>
         * <script>
         *     $('#small').datetimepicker({ size: 'small' });
         *     $('#default').datetimepicker({ size: 'default' });
         *     $('#large').datetimepicker({ size: 'large' });
         * </script>
         */
        size: 'default',
        
        /** The language that needs to be in use.
         * @type string
         * @default 'en-us'
         * @example German <!-- datetimepicker -->
         * <input id="input" width="276" />
         * <script>
         *    $('#input').datetimepicker({
         *        locale: 'de-de',
         *        format: 'HH:MM dd mmm yyyy'
         *    });
         * </script>
         * @example Bulgarian <!-- datetimepicker -->
         * <input id="input" width="276" />
         * <script>
         *    $('#input').datetimepicker({
         *        locale: 'bg-bg',
         *        format: 'HH:MM dd mmm yyyy',
         *        datepicker: { weekStartDay: 1 }
         *    });
         * </script>
         */
        locale: 'en-us',

        icons: {},

        style: {
            calendar: 'gj-picker gj-picker-md datetimepicker gj-unselectable'
        }
    },

    bootstrap: {
        style: {
            calendar: 'gj-picker gj-picker-bootstrap datetimepicker gj-unselectable'
        },
        iconsLibrary: 'glyphicons'
    },

    bootstrap4: {
        style: {
            calendar: 'gj-picker gj-picker-bootstrap datetimepicker gj-unselectable'
        }
    }
};

gj.datetimepicker.methods = {
    init: function (jsConfig) {
        gj.widget.prototype.init.call(this, jsConfig, 'datetimepicker');
        this.attr('data-datetimepicker', 'true');
        gj.datetimepicker.methods.initialize(this);
        return this;
    },

    getConfig: function (clientConfig, type) {
        var config = gj.widget.prototype.getConfig.call(this, clientConfig, type);

        uiLibrary = clientConfig.hasOwnProperty('uiLibrary') ? clientConfig.uiLibrary : config.uiLibrary;
        if (gj.datepicker.config[uiLibrary]) {
            $.extend(true, config.datepicker, gj.datepicker.config[uiLibrary]);
        }
        if (gj.timepicker.config[uiLibrary]) {
            $.extend(true, config.timepicker, gj.timepicker.config[uiLibrary]);
        }

        iconsLibrary = clientConfig.hasOwnProperty('iconsLibrary') ? clientConfig.iconsLibrary : config.iconsLibrary;
        if (gj.datepicker.config[iconsLibrary]) {
            $.extend(true, config.datepicker, gj.datepicker.config[iconsLibrary]);
        }
        if (gj.timepicker.config[iconsLibrary]) {
            $.extend(true, config.timepicker, gj.timepicker.config[iconsLibrary]);
        }

        return config;
    },

    initialize: function ($datetimepicker) {
        var $picker, $header, $date, $time, date,
            $switch, $calendarMode, $clockMode,
            data = $datetimepicker.data();

        // Init datepicker
        data.datepicker.uiLibrary = data.uiLibrary;
        data.datepicker.iconsLibrary = data.iconsLibrary;
        data.datepicker.width = data.width;
        data.datepicker.format = data.format;
        data.datepicker.locale = data.locale;
        data.datepicker.modal = data.modal;
        data.datepicker.footer = data.footer;
        data.datepicker.style.calendar = data.style.calendar;
        data.datepicker.value = data.value;
        data.datepicker.size = data.size;
        data.datepicker.autoClose = false;
        gj.datepicker.methods.initialize($datetimepicker, data.datepicker);
        $datetimepicker.on('select', function (e, type) {
            var date, value;
            if (type === 'day') {
                gj.datetimepicker.methods.createShowHourHandler($datetimepicker, $picker, data)();
            } else if (type === 'minute') {
                if ($picker.attr('selectedDay') && data.footer !== true) {
                    selectedDay = $picker.attr('selectedDay').split('-');
                    date = new Date(selectedDay[0], selectedDay[1], selectedDay[2], $picker.attr('hour') || 0, $picker.attr('minute') || 0);
                    value = gj.core.formatDate(date, data.format, data.locale);
                    $datetimepicker.val(value);
                    gj.datetimepicker.events.change($datetimepicker);
                    gj.datetimepicker.methods.close($datetimepicker);
                }
            }
        });
        $datetimepicker.on('open', function () {
            var $header = $picker.children('[role="header"]');
            $header.find('[role="calendarMode"]').addClass("selected");
            $header.find('[role="clockMode"]').removeClass("selected");
        });

        $picker = $('body').find('[role="calendar"][guid="' + $datetimepicker.attr('data-guid') + '"]');
        date = data.value ? gj.core.parseDate(data.value, data.format, data.locale) : new Date();
        $picker.attr('hour', date.getHours());
        $picker.attr('minute', date.getMinutes());

        // Init timepicker
        data.timepicker.uiLibrary = data.uiLibrary;
        data.timepicker.iconsLibrary = data.iconsLibrary;
        data.timepicker.format = data.format;
        data.timepicker.locale = data.locale;
        data.timepicker.header = true;
        data.timepicker.footer = data.footer;
        data.timepicker.size = data.size;
        data.timepicker.mode = '24hr';
        data.timepicker.autoClose = false;

        // Init header        
        $header = $('<div role="header" />');
        $date = $('<div role="date" class="selected" />');
        $date.on('click', gj.datetimepicker.methods.createShowDateHandler($datetimepicker, $picker, data));
        $date.html(gj.core.formatDate(new Date(), 'ddd, mmm dd', data.locale));
        $header.append($date);

        $switch = $('<div role="switch"></div>');

        $calendarMode = $('<i class="gj-icon selected" role="calendarMode">event</i>');
        $calendarMode.on('click', gj.datetimepicker.methods.createShowDateHandler($datetimepicker, $picker, data));
        $switch.append($calendarMode);

        $time = $('<div role="time" />');
        $time.append($('<div role="hour" />').on('click', gj.datetimepicker.methods.createShowHourHandler($datetimepicker, $picker, data)).html(gj.core.formatDate(new Date(), 'HH', data.locale)));
        $time.append(':');
        $time.append($('<div role="minute" />').on('click', gj.datetimepicker.methods.createShowMinuteHandler($datetimepicker, $picker, data)).html(gj.core.formatDate(new Date(), 'MM', data.locale)));
        $switch.append($time);

        $clockMode = $('<i class="gj-icon" role="clockMode">clock</i>');
        $clockMode.on('click', gj.datetimepicker.methods.createShowHourHandler($datetimepicker, $picker, data));
        $switch.append($clockMode);
        $header.append($switch);

        $picker.prepend($header);
    },

    createShowDateHandler: function ($datetimepicker, $picker, data) {
        return function (e) {
            var $header = $picker.children('[role="header"]');
            $header.find('[role="calendarMode"]').addClass("selected");
            $header.find('[role="date"]').addClass("selected");
            $header.find('[role="clockMode"]').removeClass("selected");
            $header.find('[role="hour"]').removeClass("selected");
            $header.find('[role="minute"]').removeClass("selected");
            gj.datepicker.methods.renderMonth($datetimepicker, $picker, data.datepicker);
        };
    },

    createShowHourHandler: function ($datetimepicker, $picker, data) {
        return function () {
            var $header = $picker.children('[role="header"]');
            $header.find('[role="calendarMode"]').removeClass("selected");
            $header.find('[role="date"]').removeClass("selected");
            $header.find('[role="clockMode"]').addClass("selected");
            $header.find('[role="hour"]').addClass("selected");
            $header.find('[role="minute"]').removeClass("selected");

            gj.timepicker.methods.initMouse($picker.children('[role="body"]'), $datetimepicker, $picker, data.timepicker);
            gj.timepicker.methods.renderHours($datetimepicker, $picker, data.timepicker);
        };
    },

    createShowMinuteHandler: function ($datetimepicker, $picker, data) {
        return function () {
            var $header = $picker.children('[role="header"]');
            $header.find('[role="calendarMode"]').removeClass("selected");
            $header.find('[role="date"]').removeClass("selected");
            $header.find('[role="clockMode"]').addClass("selected");
            $header.find('[role="hour"]').removeClass("selected");
            $header.find('[role="minute"]').addClass("selected");
            gj.timepicker.methods.initMouse($picker.children('[role="body"]'), $datetimepicker, $picker, data.timepicker);
            gj.timepicker.methods.renderMinutes($datetimepicker, $picker, data.timepicker);
        };
    },

    close: function ($datetimepicker) {
        var $calendar = $('body').find('[role="calendar"][guid="' + $datetimepicker.attr('data-guid') + '"]');
        $calendar.hide();
        $calendar.closest('div[role="modal"]').hide();
        //gj.datepicker.events.close($datepicker);
    },

    value: function ($datetimepicker, value) {
        var $calendar, date, hour, data = $datetimepicker.data();
        if (typeof (value) === "undefined") {
            return $datetimepicker.val();
        } else {
            date = gj.core.parseDate(value, data.format, data.locale);
            if (date) {
                $calendar = $('body').find('[role="calendar"][guid="' + $datetimepicker.attr('data-guid') + '"]');
                gj.datepicker.methods.dayClickHandler($datetimepicker, $calendar, data, date)();
                // Set Time
                hour = date.getHours();
                if (data.mode === 'ampm') {
                    $calendar.attr('mode', hour > 12 ? 'pm' : 'am');
                }
                $calendar.attr('hour', hour);
                $calendar.attr('minute', date.getMinutes());
                $datetimepicker.val(value);
            } else {
                $datetimepicker.val('');
            }
            return $datetimepicker;
        }
    },

    destroy: function ($datetimepicker) {
        var data = $datetimepicker.data(),
            $parent = $datetimepicker.parent(),
            $picker = $('body').find('[role="calendar"][guid="' + $datetimepicker.attr('data-guid') + '"]');
        if (data) {
            $datetimepicker.off();
            if ($picker.parent('[role="modal"]').length > 0) {
                $picker.unwrap();
            }
            $picker.remove();
            $datetimepicker.removeData();
            $datetimepicker.removeAttr('data-type').removeAttr('data-guid').removeAttr('data-datetimepicker');
            $datetimepicker.removeClass();
            $parent.children('[role="right-icon"]').remove();
            $datetimepicker.unwrap();
        }
        return $datetimepicker;
    }
};

gj.datetimepicker.events = {
    /**
     * Fires when the datetimepicker value changes as a result of selecting a new value.
     *
     * @event change
     * @param {object} e - event data
     * @example sample <!-- datetimepicker -->
     * <input id="input" width="312" />
     * <script>
     *     $('#input').datetimepicker({
     *         footer: true,
     *         modal: true,
     *         change: function (e) {
     *             alert('Change is fired');
     *         }
     *     });
     * </script>
     */
    change: function ($datetimepicker) {
        return $datetimepicker.triggerHandler('change');
    }
};

gj.datetimepicker.widget = function ($element, jsConfig) {
    var self = this,
        methods = gj.datetimepicker.methods;

    self.mouseMove = false;

    /** Gets or sets the value of the datetimepicker.
     * @method
     * @param {string} value - The value that needs to be selected.
     * @return string
     * @example Get <!-- datetimepicker -->
     * <button class="gj-button-md" onclick="alert($datetimepicker.value())">Get Value</button>
     * <hr/>
     * <input id="datetimepicker" width="312" value="17:50 03/27/2018" />
     * <script>
     *     var $datetimepicker = $('#datetimepicker').datetimepicker();
     * </script>
     * @example Set <!-- datetimepicker -->
     * <button class="gj-button-md" onclick="$datetimepicker.value('13:40 08/01/2017')">Set Value</button>
     * <hr/>
     * <input id="datetimepicker" width="312" />
     * <script>
     *     var $datetimepicker = $('#datetimepicker').datetimepicker();
     * </script>
     */
    self.value = function (value) {
        return methods.value(this, value);
    };

    /** Open the calendar.
     * @method
     * @return datetimepicker
     * @example Open.Close <!-- datetimepicker -->
     * <button class="gj-button-md" onclick="$picker.open()">Open</button>
     * <button class="gj-button-md" onclick="$picker.close()">Close</button>
     * <hr/>
     * <input id="input" width="312" />
     * <script>
     *     var $picker = $('#input').datetimepicker();
     * </script>
     */
    self.open = function () {
        gj.datepicker.methods.open(this, this.data().datepicker);
    };

    /** Close the calendar.
     * @method
     * @return datetimepicker
     * @example Open.Close <!-- datetimepicker -->
     * <button class="gj-button-md" onclick="$picker.open()">Open</button>
     * <button class="gj-button-md" onclick="$picker.close()">Close</button>
     * <hr/>
     * <input id="input" width="312" />
     * <script>
     *     var $picker = $('#input').datetimepicker();
     * </script>
     */
    self.close = function () {
        gj.datepicker.methods.close(this);
    };

    /** Remove datetimepicker functionality from the element.
     * @method
     * @return jquery element
     * @example sample <!-- datetimepicker -->
     * <button class="gj-button-md" onclick="datetimepicker.destroy()">Destroy</button>
     * <input id="datetimepicker" width="312" />
     * <script>
     *     var datetimepicker = $('#datetimepicker').datetimepicker();
     * </script>
     */
    self.destroy = function () {
        return methods.destroy(this);
    };

    $.extend($element, self);
    if ('true' !== $element.attr('data-datetimepicker')) {
        methods.init.call($element, jsConfig);
    }

    return $element;
};

gj.datetimepicker.widget.prototype = new gj.widget();
gj.datetimepicker.widget.constructor = gj.datetimepicker.widget;

gj.datetimepicker.widget.prototype.getConfig = gj.datetimepicker.methods.getConfig;

(function ($) {
    $.fn.datetimepicker = function (method) {
        var $widget;
        if (this && this.length) {
            if (typeof method === 'object' || !method) {
                return new gj.datetimepicker.widget(this, method);
            } else {
                $widget = new gj.datetimepicker.widget(this, null);
                if ($widget[method]) {
                    return $widget[method].apply(this, Array.prototype.slice.call(arguments, 1));
                } else {
                    throw 'Method ' + method + ' does not exist.';
                }
            }
        }
    };
})(jQuery);
/* global window alert jQuery gj */
