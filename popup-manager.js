/**
 * Created by zonebond on 15/4/29.
 */

(function(win)
{
    /*\
     |*|
     |*|  IE-specific polyfill which enables the passage of arbitrary arguments to the
     |*|  callback functions of javascript timers (HTML5 standard syntax).
     |*|
     |*|  https://developer.mozilla.org/en-US/docs/DOM/window.setInterval
     |*|
     |*|  Syntax:
     |*|  var timeoutID = window.setTimeout(func, delay, [param1, param2, ...]);
     |*|  var timeoutID = window.setTimeout(code, delay);
     |*|  var intervalID = window.setInterval(func, delay[, param1, param2, ...]);
     |*|  var intervalID = window.setInterval(code, delay);
     |*|
     \*/
    if (document.all && !window.setTimeout.isPolyfill)
    {
        var __nativeST__ = window.setTimeout;
        window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */)
        {
            var aArgs = Array.prototype.slice.call(arguments, 2);
            return __nativeST__(vCallback instanceof Function ? function ()
            {
                vCallback.apply(null, aArgs);
            } : vCallback, nDelay);
        };
        window.setTimeout.isPolyfill = true;
    }
    if (document.all && !window.setInterval.isPolyfill)
    {
        var __nativeSI__ = window.setInterval;
        window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */)
        {
            var aArgs = Array.prototype.slice.call(arguments, 2);
            return __nativeSI__(vCallback instanceof Function ? function ()
            {
                vCallback.apply(null, aArgs);
            } : vCallback, nDelay);
        };
        window.setInterval.isPolyfill = true;
    }

    // PopupManager
    var PopupManager = function ()
    {
        var action = this.action =
        {
            POPUP: "-PopupManager-Popup-",
            CLEAR: "-PopupManager-Popup-"
        };

        // top window attach an listener
        if (win == win.top && arguments[0] == true) {
            var message_handler = function (event)
            {
                var orgEvent = event.originalEvent ? event.originalEvent : event;
                var dom_src = orgEvent.source;
                var eventData = message._toObject(orgEvent.data);
                var modal = crossHelper();

                switch (eventData.type) {
                    case action.POPUP:
                    case 'openModal':

                        //PopupManager.popup();
                        modal.show.apply(null, [dom_src].concat(eventData.data));

                        break;
                    case action.CLEAR:
                    case 'closeModal':

                        break;
                    case 'alert-modal':
                        modal.alert.apply(null, [dom_src].concat(eventData.data));
                }
            }, isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';

            var crossHelper = function ()
            {
                var modal = {
                    cast: function (source)
                    {
                        var frame = document.createElement('iframe');

                        var stylesheets = [
                            "overflow: hidden;",
                            "background-color: transparent;",
                            "opacity: 1"
                        ];

                        frame.src = source;
                        frame.setAttribute("style", stylesheets.join(" "));
                        frame.setAttribute("width", "100%");
                        frame.setAttribute("height", "100%");
                        frame.setAttribute("scrolling", "no");
                        frame.setAttribute("frameborder", "0");
                        frame.setAttribute("allowTransparency", "true");

                        return frame;
                    },
                    show: function (dom, src, opt)
                    {
                        modal.trigger = dom;
                        modal.isAlert = arguments[3];

                        var uri = modal.isAlert ? src : modal.parseURI(dom.location.href, src);
                        var chrome = modal.cast(uri);
                        modal.chrome = chrome;

                        chrome.beforeReady = function()
                        {
                            //The chain of relationship between trigger and target
                            if(!chrome.contentWindow.owner)
                            {
                                chrome.contentWindow.owner = modal.trigger;
                            }
                        };

                        chrome.onreadystatechange = chrome.onload = function(event)
                        {
                            chrome.onreadystatechange = chrome.onload = null;

                            modal.loaded.call(null);
                        };


                        modal.iPopup = {
                            content: modal.chrome, onclosed: function ()
                            {
                                modal.chrome = null;
                            }
                        };
                        window.PopupManager.popup(modal.iPopup, top.document.body, true, true, true);
                    },
                    hide: function ()
                    {
                        var chrome = modal.chrome.contentWindow;
                        var trigger = modal.trigger;
                        if (trigger && chrome && modal.isAlert && chrome.Alert) {
                            trigger.Alert.fireCloser(chrome.Alert.selected());
                        }

                        window.PopupManager.clear(modal.iPopup);
                    },
                    loaded: function ()
                    {
                        var window_self = modal.chrome.contentWindow;
                        var window_body = window_self.document.body;

                        var trigger = window_self.owner;

                        var stylesheets = [
                            "overflow: hidden;",
                            "background-color: transparent;"
                        ];
                        window_body.setAttribute("style", stylesheets.join(" "));

                        setTimeout(function ()
                        {
                            if (window_self.ready) {
                                window_self.ready(function ()
                                {
                                    if (trigger && window_self && modal.isAlert && window_self.Alert) {
                                        window_self.Alert.cool(trigger.Alert);
                                    }

                                    var $query = window_self.$;
                                    var $modal = $query($query(".modal")[0]);
                                    if ($modal.length) {
                                        $modal.on('hidden', null, null, function ()
                                        {
                                            setTimeout(function ()
                                            {
                                                modal.hide();
                                            }, 200);
                                        });

                                        $modal.modal();
                                    }
                                    else {
                                        var $dialog = $query($query("[dialog]")[0]);
                                        window.PopupManager.popup({content: $dialog}, window)
                                    }
                                });
                            }
                        }, 50);
                    },
                    parseURI: function (host_uri, abs_uri)
                    {
                        if(abs_uri.indexOf('http://') != -1)
                        {
                            return abs_uri;
                        }

                        var host_parts = host_uri.split("/");

                        var pro_syntax = abs_uri.split("../");

                        host_parts.splice(host_parts.length - pro_syntax.length, pro_syntax.length);

                        return host_parts.join("/") + "/" + abs_uri;
                    }
                };
                return modal;
            };

            $(win).on('message', message_handler);
        }
    }, methods = PopupManager.prototype;
    methods.playground = function (isModal)
    {
        return $('<div class="modal-mask-ground"><div class="background"></div></div>');
    };
    methods.popup = function (iPopup, parent)
    {
        var that = this,
            $parent = parent ? $(parent) : $(document.body),
            isModal = arguments[2] != undefined ? arguments[2] : true,
            backCCL = arguments[3] != undefined ? arguments[3] : true,
            transBG = arguments[4] != undefined ? arguments[4] : false,
            $ground = that.playground(isModal),
            $backBG = $($ground.find('.background')[0]),
            content = $(iPopup.content),
            $dialog;

        if (isModal) {
            if (backCCL) {
                $backBG.click(function (event)
                {
                    if ($(event.target)[0] == $(this)[0]) {
                        that.clear(iPopup);
                    }
                });
            }

            if (transBG) {
                $backBG.attr('style', 'background: transparent');
            }

            if (!content.hasClass('dialog')) content.addClass('dialog');

            $dialog = $ground.append(iPopup.content);
        }
        else {
            $dialog = $(iPopup.content);
        }

        iPopup.$ground = $dialog;

        try {
            if ($parent.css('position') == 'static') $parent.css('position', 'relative');

            $parent.append($dialog);
        }
        catch (ex) {
        }

        $dialog.focus();

        setTimeout(function ($dialog, popup)
        {
            if (typeof popup['onshowing'] == 'function') popup['onshowing'].call(popup);

            $dialog.addClass("show");

            if (typeof popup['onshown'] == 'function') popup['onshown'].call(popup);

        }, 120, $dialog, iPopup);
    };
    methods.clear = function (iPopup)
    {
        setTimeout(function (iPopup)
        {
            var $ground = iPopup.$ground;

            if (typeof iPopup['onclean'] == 'function') iPopup['onclean'].call(iPopup);

            $ground.removeClass("show");
            setTimeout(function ()
            {
                $ground.empty();
                $ground.remove();

                if (typeof iPopup['onclosed'] == 'function') iPopup['onclosed'].call(iPopup);

            }, 300);
        }, 100, iPopup);
    };
    methods.crossPopup = function (action, option)
    {
        message.postMessage({type: action, data: option});
    };
    // attach to window
    if (!win.PopupManager) win.PopupManager = new PopupManager(true);


    // iPopup
    var Popup = function (content, parent, isModal, backCCL)
    {
        this.content = content;
        this.parent = parent;
        this.isModal = isModal != undefined ? isModal : true;
        this.backCCL = backCCL != undefined ? backCCL : true;
    };
    Popup.prototype = new PopupManager();
    Popup.prototype.show = function ()
    {
        this.popup(this, this.parent, this.isModal, this.backCCL);
    };
    Popup.prototype.hide = function ()
    {
        this.clear(this);
    };
    // attach to window
    if (!win.Popup) win.Popup = Popup;


    // Alert
    var Alert = function ()
    {
        var html = document.all[0],
            dom_lang = html ? html.lang : null,
            cur_lang = dom_lang ? dom_lang : (navigator.language ? navigator.language : navigator.browserLanguage),
            EN_US = cur_lang.toLowerCase().indexOf('en') != -1 ? true : false;

        // compatibility old API
        this.okLabel = EN_US ? "OK" : "确定";
        this.yesLabel = EN_US ? "Yes" : "是";
        this.noLabel = EN_US ? "No" : "否";
        this.cancelLabel = EN_US ? "Cancel" : "取消";

        this.buttons = {
            OK: EN_US ? "OK" : "确定",
            YES: EN_US ? "Yes" : "是",
            NO: EN_US ? "No" : "否",
            CANCEL: EN_US ? "Cancel" : "取消"
        };
    };
    Alert.prototype = new PopupManager();
    Alert.prototype.cast = function (options)
    {
        var dialog = $('<div class="alert-modal dialog" popup-effect="scale-out">' +
                '<div class="alert-modal head"></div>' +
                '<div class="alert-modal body"></div>' +
                '<div class="alert-modal foot"></div></div>'),
            head = $(dialog.find(".alert-modal.head")[0]),
            body = $(dialog.find(".alert-modal.body")[0]),
            foot = $(dialog.find(".alert-modal.foot")[0]);

        head.html(options['head']);
        body.html(options['body']);

        var btns = options['btns'] ? options['btns'] : [this.buttons.OK],
            nums = btns.length,
            size = 1 / nums * 100,
            temp;
        for (var i = 0; i < nums; i++) {
            temp = $('<div btn></div>');
            temp.append($('<span></span>').text(btns[i]));
            temp.css("width", size + "%");

            if (nums != 1 && i != nums - 1) {
                temp.addClass("r");
            }

            temp.one('click', function (event)
            {
                event.stopImmediatePropagation();
                dialog.trigger('cc-alert', [$(this).text()]);
            });

            foot.append(temp);
        }

        return dialog;
    };
    Alert.prototype.show = function (message)
    {
        var title = arguments[1],
            buttons = arguments[2] instanceof Array == true ? arguments[2] : [this.buttons.OK];

        this.closer = arguments[3];

        var $dialog = this.cast({head: title, body: message, btns: buttons}),
            ipopup = {content: $dialog, owner: win},
            that = this;

        $dialog.on('cc-alert', function (event, res)
        {
            ipopup.onclean = function ()
            {
                ipopup.owner.Alert.ghost(res);
            };
            that.clear(ipopup);
        });

        this.popup(ipopup, this.parent == undefined ? top.document.body : this.parent);
    };
    Alert.prototype.ghost = function (selected)
    {
        if (this.closer) {
            this.closer.call(null, {selected: selected});
        }
    };
    // attach to window
    if (!win.Alert) win.Alert = new Alert();


    // notification
    var Notice = function ()
    {
        this.TYPES =
        {
            INFO: 'info',
            SUCCESS: 'success',
            WARN: 'warning',
            DANGER: 'danger'
        };
    };
    Notice.prototype = new Alert();
    Notice.prototype.initial = function ()
    {
        if (this.initialize) return;

        this.initialize = true;

        var $topQ = window.top.$,
            $body = $topQ(window.top.document.body);
        var $group = $topQ('.notice-group');
        if (!$group.length) {
            $group = $topQ('<div class="notice-group"><div class="scroll-view"></div></div>');
            $body.append($group);
        }
        this.$group = $group;
        this.$scrollView = $group.find('.scroll-view').css('max-height', $body.height());
    };
    Notice.prototype.cast = function (opts)
    {
        var $dialog = $('' +
            '<div class="notice ' + opts['type'] + '">' +
            '<span class="title">' + opts['title'] + '</span>' +
            '<div class="content">' + opts['content'] + '</div>' +
            '</div>');

        $dialog.click(function (event)
        {
            event.stopImmediatePropagation();
        });

        return $dialog;
    };
    Notice.prototype.show = function (content, title, type, duration)
    {
        this.initial();

        var $dialog = this.cast({title: title, content: content, type: type}),
            that = this,
            ipopup = {
                content: $dialog,
                onshown: function ()
                {
                    this.content.addClass('popup-shown');
                }
            },
            duration = isNaN(duration) || duration == undefined ? 1000 * 5 : duration;

        this.$group.toggleClass('alive', true);

        that.popup(ipopup, this.$scrollView, false);

        setTimeout(function (scope, ipopup)
        {
            ipopup.content.addClass('closing');
            setTimeout(function ()
            {
                scope.clear(ipopup);

                setTimeout(function ($scrollView)
                {
                    if ($scrollView.html() == "") {
                        $group.toggleClass('alive', false);
                    }
                }, 100, that.$scrollView);

            }, 600);

        }, duration, that, ipopup);

    };
    Notice.prototype.info = function (content, title, duration)
    {
        this.show(content, title, this.TYPES.INFO, duration);
    };
    Notice.prototype.success = function (content, title, duration)
    {
        this.show(content, title, this.TYPES.SUCCESS, duration);
    };
    Notice.prototype.warn = function (content, title, duration)
    {
        this.show(content, title, this.TYPES.WARN, duration);
    };
    Notice.prototype.danger = function (content, title, duration)
    {
        this.show(content, title, this.TYPES.DANGER, duration);
    };
    // attach to window
    if (!win.Notice) win.Notice = new Notice();


    // jQuery - Plugin
    if($)
    {
        $(function()
        {
            if($.fn.dropping) return;

            $.fn.dropping = function(drop)
            {
                var last = window.__last_drop_box__,
                    who = this, dom = who[0];

                if(last && last != this[0])
                {
                    $(last).dropping(false);
                }

                if(!dom.__mouse_sandbox_holder__)
                {
                    dom.__mouse_sandbox_holder__ = true;

                    var hover = function(evt)
                        {
                            if(dom.__leave_action_delay__)
                            {
                                clearTimeout(dom.__leave_action_delay__);
                            }
                        },
                        leave = function(evt)
                        {
                            dom.__leave_action_delay__ = setTimeout(function(){

                                dom.__toggle_mouse_holder__(false);
                                who.toggleClass('dropped', false);
                                $(who.find('.drop-box')[0]).toggleClass('dropped', false);

                            }, 1200);
                        };

                    dom.__toggle_mouse_holder__ = function(flag)
                    {
                        flag = flag == undefined ? (dom.__mouse_holder_flag__ ? true : false) : flag;

                        if (flag === dom.__mouse_holder_flag__)
                            return;

                        who.off('hover', null, hover);
                        who.off('mouseleave', null, leave);

                        if(flag)
                        {
                            who.on('hover', null, hover);
                            who.on('mouseleave', null, leave);
                        }
                        else
                        {
                            if(dom.__leave_action_delay__)
                            {
                                clearTimeout(dom.__leave_action_delay__);
                            }
                        }

                        dom.__mouse_holder_flag__ = flag;
                    };
                }

                if(drop == undefined)
                {
                    drop = !who.hasClass('dropped');
                }

                if(who.hasClass('dropped') != drop)
                {
                    who.toggleClass('dropped');
                    $(who.find('.drop-box')[0]).toggleClass('dropped', drop);

                    window.__last_drop_box__ = dom;

                    $(window.document.body).off('click');

                    if(drop)
                    {
                        dom.__toggle_mouse_holder__(true);

                        $(window.document.body).on('click', function(evt)
                        {
                            var element = evt.target;
                            if(element == window.__last_drop_box__ || $(window.__last_drop_box__).find(element).length)
                            {
                                return;
                            }

                            $(window.document.body).off('click');
                            if(window.__last_drop_box__)
                            {
                                $(window.__last_drop_box__).dropping(false);
                                window.__last_drop_box__ = null;
                            }
                        });
                    }
                    else
                    {
                        dom.__toggle_mouse_holder__(false);
                    }
                }
            };
        });
    }

})(window);