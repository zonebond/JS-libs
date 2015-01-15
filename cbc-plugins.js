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

})(window);