<<<<<<< HEAD
/**
 * Cross Browser Compatibility - Plugin
 *
 * for old & variant browser version Support!
 *
 * Created by zonebond on 2014/10/15.
 */
(function(win)
{
    /***************************************/
    /*******      detect browser     *******/
    /***************************************/

    var UNDEF = "undefined",

        doc = win.document,
        nav = win.navigator,

    ua = function()
    {
        var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
            u = nav.userAgent.toLowerCase(),
            p = nav.platform.toLowerCase(),
            windows = p ? /win/.test(p) : /win/.test(u),
            mac = p ? /mac/.test(p) : /mac/.test(u),
            webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
            ie = !+"\v1",
            d = null;

        return { w3:w3cdom, wk:webkit, ie:ie, win:windows, mac:mac};
    }();

    (function()
    {
        if(window.addEvent)
        {
            return;
        }

        var addEvent = function(type, handler)
        {
            return function(elem, type, handler)
            {
                if (elem.addEventListener)
                {
                    elem.addEventListener(type, handler, false);
                }
                else if (typeof elem.attachEvent == 'function')
                {
                    elem.attachEvent('on' + type, handler);
                }
                else
                {
                    elem['on' + type] = handler;
                }
            }(this, type, handler);
        };

        var delEvent = function(type, handler)
        {
            return function(elem, type, handler)
            {
                if(elem.removeEventListener)
                {
                    elem.removeEventListener(type, handler, false);
                }
                else if (typeof elem.detachEvent == 'function')
                {
                    elem.detachEvent('on' + type, handler);
                }
                else
                {
                    elem['on' + type] = null;
                }
            }(this, type, handler);
        }

        try
        {
            if(!EventTarget.prototype.addEvent)
            {
                EventTarget.prototype.addEvent = window.addEvent = addEvent;
                EventTarget.prototype.delEvent = window.delEvent = delEvent;
            }
        }
        catch (ex)
        {
            if(!Element.prototype.addEvent)
            {
                Element.prototype.addEvent =
                    window.addEvent =
                        document.addEvent = addEvent;

                Element.prototype.delEvent =
                    window.delEvent =
                        document.delEvent = delEvent;
            }
        }
    }).call(win);

    if(!HTMLIFrameElement.prototype.closeIt)
    {
        HTMLIFrameElement.prototype.closeIt = function()
        {
            try
            {
                this.contentWindow.document.body.style.opacity = 0;

                this.closeSubframes();

                this.src = "about:blank";
                this.contentWindow.document.write("");
                this.contentWindow.close();

                if(typeof CollectGarbage == "function")
                {
                    CollectGarbage();
                }

                this.parentNode.removeChild(this);
            }
            catch (ex)
            {
                if(console) console.error("CloseIt CG hack ::: " + ex);
            }
        };

        HTMLIFrameElement.prototype.closeSubframes = function()
        {
            try
            {
                var srcDocument = this.contentWindow.document,
                    iframes = srcDocument.getElementsByTagName('iframe'),
                    iframe;

                while(iframes.length > 0)
                {
                    iframe = iframes[0];

                    iframe.closeIt();

                    delete iframe;

                    iframes = srcDocument.getElementsByTagName('iframe');
                }
            }
            catch (ex)
            {
                if(console) console.error("CG hack ::: " + ex);
            }
        };

        HTMLIFrameElement.prototype.recast = function()
        {
            this.closeSubframes();

            var iframe = this.parentNode.ownerDocument.createElement('iframe'),
                src = this.src + "";
            iframe.id = 'innerIFrame';
            iframe.src = src;
            iframe.height = '200px';

            this.parentNode.appendChild(iframe);

            this.closeIt();
        };
    }

    if(win.frameElement)
    {
        var unload = function(event)
        {
            win.delEvent('beforeunload', unload);

            //console.log(win.location.href);

            try
            {
                //win.frameElement.closeSubframes();
            }
            catch (ex)
            {
                if(console) console.error("CG hack ::: " + ex);
            }
        };

        win.addEvent('beforeunload', unload);
    }

    var plugin = {};

    // ie8 hack
    if(ua.ie && /MSIE 8.0/.test(nav.appVersion))
    {
        /***************************************/
        /******* Functions & Method Hack *******/
        /***************************************/

        if(!Date.prototype.setISO8601)
        {
            Date.prototype.setISO8601 = function (string) {
                var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
                    "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
                    "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
                if(string)
                {
                    var d = string.match(new RegExp(regexp));
                    var offset = 0;
                    var date = new Date(d[1], 0, 1);

                    if (d[3]) {
                        date.setMonth(d[3] - 1);
                    }
                    if (d[5]) {
                        date.setDate(d[5]);
                    }
                    if (d[7]) {
                        date.setHours(d[7]);
                    }
                    if (d[8]) {
                        date.setMinutes(d[8]);
                    }
                    if (d[10]) {
                        date.setSeconds(d[10]);
                    }
                    if (d[12]) {
                        date.setMilliseconds(Number("0." + d[12]) * 1000);
                    }
                    if (d[14]) {
                        offset = (Number(d[16]) * 60) + Number(d[17]);
                        offset *= ((d[15] == '-') ? 1 : -1);
                    }
                    offset -= date.getTimezoneOffset();
                    var time = (Number(date) + (offset * 60 * 1000));
                    this.setTime(Number(time));
                }
                else
                {
                    return;
                }
            };


            Date.parse = function(timeStr)
            {
                var timestamp = new Date();
                timestamp.setISO8601(timeStr);
                return timestamp.getTime();
            };

            Date.now = function()
            {
                return new Date();
            }
        }

        if (!Object.keys)
        {
            Object.keys = (function() {
                'use strict';
                var hasOwnProperty = Object.prototype.hasOwnProperty,
                    hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                    dontEnums = [
                        'toString',
                        'toLocaleString',
                        'valueOf',
                        'hasOwnProperty',
                        'isPrototypeOf',
                        'propertyIsEnumerable',
                        'constructor'
                    ],
                    dontEnumsLength = dontEnums.length;

                return function(obj) {
                    if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                        throw new TypeError('Object.keys called on non-object');
                    }

                    var result = [], prop, i;

                    for (prop in obj) {
                        if (hasOwnProperty.call(obj, prop)) {
                            result.push(prop);
                        }
                    }

                    if (hasDontEnumBug) {
                        for (i = 0; i < dontEnumsLength; i++) {
                            if (hasOwnProperty.call(obj, dontEnums[i])) {
                                result.push(dontEnums[i]);
                            }
                        }
                    }
                    return result;
                };
            }());
        }

        // Compatibility IE8 Event.target and Event.currentTarget
        if(!Event.prototype.target)
        {
            Object.defineProperty(Event.prototype, "target", {
                get: function(){return this.srcElement;}
            });

            Object.defineProperty(Event.prototype, "currentTarget", {
                get: function(){return this.srcElement;}
            });

            Event.prototype.preventDefault =
                Event.prototype.stopPropagation =
                    Event.prototype.stopImmediatePropagation = function () {
                        this.returnValue = false;
                    };
        }


        // Implemented ECMA-262, Edition 5, 15.4.4.19
        // Reference: http://es5.github.com/#x15.4.4.19
        if (!Array.prototype.map)
        {
            Array.prototype.map = function(callback, thisArg)
            {

                var T, A, k;

                if (this == null)
                {
                    throw new TypeError(" this is null or not defined");
                }

                // 1. 将O赋值为调用map方法的数组.
                var O = Object(this);

                // 2.将len赋值为数组O的长度.
                var len = O.length >>> 0;

                // 4.如果callback不是函数,则抛出TypeError异常.
                if({}.toString.call(callback) != "[object Function]")
                {
                    throw new TypeError(callback + " is not a function");
                }

                // 5. 如果参数thisArg有值,则将T赋值为thisArg;否则T为undefined.
                if(thisArg)
                {
                    T = thisArg;
                }

                // 6. 创建新数组A,长度为原数组O长度len
                A = new Array(len);

                // 7. 将k赋值为0
                k = 0;

                // 8. 当 k < len 时,执行循环.
                while(k < len)
                {

                    var kValue, mappedValue;

                    //遍历O,k为原数组索引
                    if (k in O) {

                        //kValue为索引k对应的值.
                        kValue = O[ k ];

                        // 执行callback,this指向T,参数有三个.分别是kValue:值,k:索引,O:原数组.
                        mappedValue = callback.call(T, kValue, k, O);

                        // 返回值添加到新书组A中.
                        A[ k ] = mappedValue;
                    }
                    // k自增1
                    k++;
                }

                // 9. 返回新数组A
                return A;
            };
        }

        // 实现 ECMA-262, Edition 5, 15.4.4.19
        if (!Array.prototype.indexOf)
        {
            Array.prototype.indexOf = function (searchElement, fromIndex)
            {
                if(this === undefined || this === null)
                {
                    throw new TypeError( '"this" is null or not defined' );
                }

                var length = this.length >>> 0; // Hack to convert object.length to a UInt32

                fromIndex = +fromIndex || 0;

                if(Math.abs(fromIndex) === Infinity)
                {
                    fromIndex = 0;
                }

                if(fromIndex < 0)
                {
                    fromIndex += length;
                    if (fromIndex < 0) {
                        fromIndex = 0;
                    }
                }

                for(;fromIndex < length; fromIndex++)
                {
                    if(this[fromIndex] === searchElement)
                    {
                        return fromIndex;
                    }
                }

                return -1;
            };
        }

        // 实现 ECMA-262, Edition 5, 15.4.4.19
        if (!Array.prototype.filter)
        {
            Array.prototype.filter = function(fun /*, thisArg */)
            {
                "use strict";

                if (this === void 0 || this === null)
                    throw new TypeError();

                var t = Object(this);
                var len = t.length >>> 0;
                if (typeof fun !== "function")
                    throw new TypeError();

                var res = [];
                var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
                for (var i = 0; i < len; i++)
                {
                    if (i in t)
                    {
                        var val = t[i];

                        // NOTE: Technically this should Object.defineProperty at
                        //       the next index, as push can be affected by
                        //       properties on Object.prototype and Array.prototype.
                        //       But that method's new, and collisions should be
                        //       rare, so use the more-compatible alternative.
                        if (fun.call(thisArg, val, i, t))
                            res.push(val);
                    }
                }

                return res;
            };
        }

        if ( !Date.prototype.toISOString ) {
            ( function() {

                function pad(number) {
                    if ( number < 10 ) {
                        return '0' + number;
                    }
                    return number;
                }

                Date.prototype.toISOString = function() {
                    return this.getUTCFullYear() +
                        '-' + pad( this.getUTCMonth() + 1 ) +
                        '-' + pad( this.getUTCDate() ) +
                        'T' + pad( this.getUTCHours() ) +
                        ':' + pad( this.getUTCMinutes() ) +
                        ':' + pad( this.getUTCSeconds() ) +
                        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
                        'Z';
                };

            }() );
        }

        /***************************************/
        /****** CSS3 & some selector Hack ******/
        /***************************************/

        plugin.nth_child = function(children)
        {
            var len = children.length;

            for(var i = 0; i < len; i++)
            {
                var child = children[i];
                if(child.nodeType == 3)
                {
                    continue;
                }
                child.setAttribute('nth-child', i % 2 == 0 ? 'even' : 'odd');
            }
        };

        function form_row_nth(children)
        {
            var len = children.length;

            for(var i = 0; i < len; i++)
            {
                var child = children[i];

                plugin.nth_child(child.children);
            }
        }

        plugin.form_panels = function()
        {
            var form_panels = $(".form-panel"),
                len = form_panels.length;

            for(var i = 0; i < len; i++)
            {
                var f_panel = form_panels[i];
                form_row_nth($(f_panel).find('.form-row'));
            }
        };

        $(win.document.body).ready(function()
        {
            plugin.form_panels();
        });
    }

    win.cbc_plugin = plugin;

    if(!plugin.form_panels)
        plugin.form_panels = function (){};

})(window);

// avoid XSS inject
(function(W)
{
    $(function()
    {
        $.fn.oldFnVal = $.fn.val;
        $.fn.val = function()
        {
            if(this.length == 0) return this.oldFnVal.apply(this, arguments);

            var nodeName = this[0].nodeName, type = this.attr('type');

            if(!type && nodeName == 'INPUT')
            {
                type = "TEXT";
            }

            if(arguments.length == 0 && ((nodeName == 'INPUT' && type.toUpperCase() == 'TEXT') || (nodeName == 'TEXTAREA')))
            {
                var reg = /[<|>|"]/,
                    val = this.oldFnVal.call(this),
                    res = reg.test(val);
                if(res)
                {
                    val = val.replace(/</g, '&#60;');
                    val = val.replace(/>/g, '&#62;');
                    val = val.replace(/"/g, '&#34;');
                    val = val.replace(/'/g, '&#39;');
                }
                return val;
            }

            return this.oldFnVal.apply(this, arguments);
        };
    });
=======
/**
 * Cross Browser Compatibility - Plugin
 *
 * for old & variant browser version Support!
 *
 * Created by zonebond on 2014/10/15.
 */
(function(win)
{
    /***************************************/
    /*******      detect browser     *******/
    /***************************************/

    var UNDEF = "undefined",

        doc = win.document,
        nav = win.navigator,

    ua = function()
    {
        var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
            u = nav.userAgent.toLowerCase(),
            p = nav.platform.toLowerCase(),
            windows = p ? /win/.test(p) : /win/.test(u),
            mac = p ? /mac/.test(p) : /mac/.test(u),
            webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
            ie = !+"\v1",
            d = null;

        return { w3:w3cdom, wk:webkit, ie:ie, win:windows, mac:mac};
    }();


    var plugin = {};

    // ie8 hack
    if(ua.ie && /MSIE 8.0/.test(nav.appVersion))
    {
        /***************************************/
        /******* Functions & Method Hack *******/
        /***************************************/

        if (!Object.keys)
        {
            Object.keys = (function() {
                'use strict';
                var hasOwnProperty = Object.prototype.hasOwnProperty,
                    hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                    dontEnums = [
                        'toString',
                        'toLocaleString',
                        'valueOf',
                        'hasOwnProperty',
                        'isPrototypeOf',
                        'propertyIsEnumerable',
                        'constructor'
                    ],
                    dontEnumsLength = dontEnums.length;

                return function(obj) {
                    if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                        throw new TypeError('Object.keys called on non-object');
                    }

                    var result = [], prop, i;

                    for (prop in obj) {
                        if (hasOwnProperty.call(obj, prop)) {
                            result.push(prop);
                        }
                    }

                    if (hasDontEnumBug) {
                        for (i = 0; i < dontEnumsLength; i++) {
                            if (hasOwnProperty.call(obj, dontEnums[i])) {
                                result.push(dontEnums[i]);
                            }
                        }
                    }
                    return result;
                };
            }());
        }

        // Compatibility IE8 Event.target and Event.currentTarget
        if(!Event.prototype.target)
        {
            Object.defineProperty(Event.prototype, "target", {
                get: function(){return this.srcElement;}
            });

            Object.defineProperty(Event.prototype, "currentTarget", {
                get: function(){return this.srcElement;}
            });

            Event.prototype.preventDefault =
            Event.prototype.stopPropagation =
            Event.prototype.stopImmediatePropagation = function()
            {
                this.returnValue = false;
            };
        }


        // Implemented ECMA-262, Edition 5, 15.4.4.19
        // Reference: http://es5.github.com/#x15.4.4.19
        if (!Array.prototype.map)
        {
            Array.prototype.map = function(callback, thisArg)
            {

                var T, A, k;

                if (this == null)
                {
                    throw new TypeError(" this is null or not defined");
                }

                // 1. 将O赋值为调用map方法的数组.
                var O = Object(this);

                // 2.将len赋值为数组O的长度.
                var len = O.length >>> 0;

                // 4.如果callback不是函数,则抛出TypeError异常.
                if({}.toString.call(callback) != "[object Function]")
                {
                    throw new TypeError(callback + " is not a function");
                }

                // 5. 如果参数thisArg有值,则将T赋值为thisArg;否则T为undefined.
                if(thisArg)
                {
                    T = thisArg;
                }

                // 6. 创建新数组A,长度为原数组O长度len
                A = new Array(len);

                // 7. 将k赋值为0
                k = 0;

                // 8. 当 k < len 时,执行循环.
                while(k < len)
                {

                    var kValue, mappedValue;

                    //遍历O,k为原数组索引
                    if (k in O) {

                        //kValue为索引k对应的值.
                        kValue = O[ k ];

                        // 执行callback,this指向T,参数有三个.分别是kValue:值,k:索引,O:原数组.
                        mappedValue = callback.call(T, kValue, k, O);

                        // 返回值添加到新书组A中.
                        A[ k ] = mappedValue;
                    }
                    // k自增1
                    k++;
                }

                // 9. 返回新数组A
                return A;
            };
        }

        // 实现 ECMA-262, Edition 5, 15.4.4.19
        if (!Array.prototype.indexOf)
        {
            Array.prototype.indexOf = function (searchElement, fromIndex)
            {
                if(this === undefined || this === null)
                {
                    throw new TypeError( '"this" is null or not defined' );
                }

                var length = this.length >>> 0; // Hack to convert object.length to a UInt32

                fromIndex = +fromIndex || 0;

                if(Math.abs(fromIndex) === Infinity)
                {
                    fromIndex = 0;
                }

                if(fromIndex < 0)
                {
                    fromIndex += length;
                    if (fromIndex < 0) {
                        fromIndex = 0;
                    }
                }

                for(;fromIndex < length; fromIndex++)
                {
                    if(this[fromIndex] === searchElement)
                    {
                        return fromIndex;
                    }
                }

                return -1;
            };
        }

        // 实现 ECMA-262, Edition 5, 15.4.4.19
        if (!Array.prototype.filter)
        {
            Array.prototype.filter = function(fun /*, thisArg */)
            {
                "use strict";

                if (this === void 0 || this === null)
                    throw new TypeError();

                var t = Object(this);
                var len = t.length >>> 0;
                if (typeof fun !== "function")
                    throw new TypeError();

                var res = [];
                var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
                for (var i = 0; i < len; i++)
                {
                    if (i in t)
                    {
                        var val = t[i];

                        // NOTE: Technically this should Object.defineProperty at
                        //       the next index, as push can be affected by
                        //       properties on Object.prototype and Array.prototype.
                        //       But that method's new, and collisions should be
                        //       rare, so use the more-compatible alternative.
                        if (fun.call(thisArg, val, i, t))
                            res.push(val);
                    }
                }

                return res;
            };
        }

        /***************************************/
        /****** CSS3 & some selector Hack ******/
        /***************************************/

        plugin.nth_child = function(children)
        {
            var len = children.length;

            for(var i = 0; i < len; i++)
            {
                var child = children[i];
                if(child.nodeType == 3)
                {
                    continue;
                }
                child.setAttribute('nth-child', i % 2 == 0 ? 'even' : 'odd');
            }
        };

        function form_row_nth(children)
        {
            var len = children.length;

            for(var i = 0; i < len; i++)
            {
                var child = children[i];

                plugin.nth_child(child.children);
            }
        }

        plugin.form_panels = function()
        {
            var form_panels = $(".form-panel"),
                len = form_panels.length;

            for(var i = 0; i < len; i++)
            {
                var f_panel = form_panels[i];
                form_row_nth($(f_panel).find('.form-row'));
            }
        };

        $(win.document.body).ready(function()
        {
            plugin.form_panels();
        });
    }

    win.cbc_plugin = plugin;

    if(!plugin.form_panels)
        plugin.form_panels = function (){};

>>>>>>> origin/master
})(window);