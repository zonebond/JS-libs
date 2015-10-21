/**
 * Created by zonebond on 15/8/6.
 */

/**
 *  cbc-plugin : addEvent
 */
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
})();


/**
 * iBeacon : Cross domain message channel
 */
(function(W)
{

    var iBeacon = function(token, domain)
    {
        this.token = token;
        this.domain = domain;
        this.__initial__();
    }, _iBeacon_ = iBeacon.prototype;
    iBeacon.KEYS = {
        HANDSHAKE: "--handshake--",
        HANDSHAKE_RESPONSE: "--handshake--response--",
        HANDSHAKE_HEARTBEAT: "--handshake--heartbeat--",
        HANDSHAKE_HEARTBEAT_RESPONSE: "--handshake--heartbeat--response--"
    };
    _iBeacon_.__initial__ = function()
    {
        var who = this;

        this.__watch_holder__ = function(event)
        {
            var stream = event.data;

            if(who.__checking__(stream))
            {
                var body = JSON.parse(stream.split(who.token)[1]);

                switch(body.action)
                {
                    case iBeacon.KEYS.HANDSHAKE:

                        // '可信源消息!'
                        who.owner = event.source;

                        who.__response__.call(who);

                        break;

                    case iBeacon.KEYS.HANDSHAKE_RESPONSE:

                        //if(typeof who.__handshake_callback__ == 'function')
                        //{
                        //    who.__handshake_callback__.call(who);
                        //}

                        break;

                    case iBeacon.KEYS.HANDSHAKE_HEARTBEAT:

                        // '可信源消息!'
                        who.owner = event.source;

                        who.__heartbeat_response__.call(who);

                        break;

                    case iBeacon.KEYS.HANDSHAKE_HEARTBEAT_RESPONSE:

                        who.__clear_heartbeat_thread__.call(who, true);

                        break;

                    default :

                        try
                        {
                            who.__onAction__.call(who, body);
                        }
                        catch(ex){ if(console) console.log(" iBeacon : Action Error :: " + ex);}

                        break;
                }
            }
        };


        if(typeof W.postMessage == 'object')
        {
            W.___iBeacon_holder___ = function(event)
            {
                who.__watch_holder__(event);
            }
        }
        else
        {
            if(W.addEventListener)
            {
                W.addEventListener('message', this.__watch_holder__, false);
            }
            else
            {
                W.attachEvent('onmessage', this.__watch_holder__);
            }
        }
    };
    _iBeacon_.__checking__ = function(stream)
    {
        var token = this.token;
        if(stream.length > token.length && stream.substr(0, token.length) == token)
        {
            return true;
        }

        return false;
    };
    _iBeacon_.handshake = function(target, callback)
    {
        this.owner = target;

        this.SYNC(callback)
    };
    _iBeacon_.SYNC = function(callback)
    {
        if(!this.owner)
            return;

        this.__SYNC_callback__ = callback;
        this.__heartbeat__(5);
    };
    _iBeacon_.__response__ = function()
    {
        this.post(iBeacon.KEYS.HANDSHAKE_RESPONSE);
    };
    _iBeacon_.listen = function(action, handle)
    {
        if(!this.__actions__)
            this.__actions__ = {};

        this.__actions__[action] = handle;
    };
    _iBeacon_.__onAction__ = function(body)
    {
        if(!this.__actions__)
            return;

        var handler = this.__actions__[body.action];
        if(handler)
        {
            handler.call(null, body.data)
        }
    };
    _iBeacon_.post = function(action, data)
    {
        if(!this.owner)
            return;

        var body = {action: action, data: data}, message = this.token + JSON.stringify(body);

        try
        {
            this.owner.postMessage(message, this.domain);
        }
        catch(ex)
        {
            try
            {
                // Same Domain Difference Window-Tab
                this.owner.window.___iBeacon_holder___({source: this.owner, data: message});
            }
            catch(ex)
            {
                this.log("Browser not support CrossDomain Message!");
            }
        }
    };
    _iBeacon_.__heartbeat__ = function(times, duration)
    {
        var who = this;
        who.post(iBeacon.KEYS.HANDSHAKE_HEARTBEAT);
        times--;
        if(times)
        {
            who.__HeartbeatThread__ = setTimeout(function()
            {
                who.__heartbeat__.call(who, times, duration);
            }, (duration = duration ? duration : 280));
        }
        else
        {
            who.__clear_heartbeat_thread__(false);
        }
    };
    _iBeacon_.__clear_heartbeat_thread__ = function(isResponse)
    {
        if(this.__HeartbeatThread__ != 0)
        {
            clearInterval(this.__HeartbeatThread__);
        }

        if(this.__SYNC_callback__)
        {
            this.__SYNC_callback__.call(null, isResponse);
        }
    };
    _iBeacon_.__heartbeat_response__ = function()
    {
        if(!this.owner || this.__HeartbeatThread__)
            return;

        this.post(iBeacon.KEYS.HANDSHAKE_HEARTBEAT_RESPONSE);
    };
    _iBeacon_.log = function(txt)
    {
        if (console)
            console.log(txt);
    };
    _iBeacon_.destroy = function()
    {
        if (this.owner)
            this.owner = null; delete this.owner;

        W.delEvent('message', this.__watch_holder__);
        delete this.__watch_holder__;
    };

    if(!W.iBeacon) W.iBeacon = iBeacon;

})(window);