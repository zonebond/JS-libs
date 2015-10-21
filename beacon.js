/**
 * Created by zonebond on 14-6-26.
 */

(function(win)
{

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
    }).call();


    var beacon =
    {
        behost: function()
        {
            var res = false;

            var scripts = document.scripts, len = scripts.length;

            for(var i = 0; i < len; i++)
            {
                var script = scripts[i];
                if(script.src.indexOf('beacon.js') != -1)
                {
                    res = script.getAttribute('behost');
                    break;
                }
            }

            return res;
        },
        host:function()
        {
            return {
                clients: [],
                listeners: {},
                init: function()
                {
                    win.addEvent('befordunload', this.unload);
                    return this;
                },
                retrieve: function(stack, object)
                {
                    var event = arguments[2] || null;
                    stack = stack || [];

                    var len = stack.length;
                    for(var i = 0; i < len; i++)
                    {
                        if(event)
                        {
                            event.call(null, i, stack[i]);
                            continue;
                        }

                        if(stack[i] === object)
                        {
                            return stack[i];
                        }
                    }

                    return null;
                },
                invalidate: function(client)
                {
                    var len = this.clients.length;
                    for(var i = 0; i < len; i++)
                    {
                        if(client === this.clients[i])
                        {
                            delete this.clients[i];
                            this.clients[i] = null;
                            this.clients.splice(i, 1);

                            if(arguments[1] === false)
                            {
                                if(console) console.log("spread :: dirty_client :: death!");
                                continue;
                            }

                            client.dispose();

                            break;
                        }
                    }
                    client = null;
                    //console.log("host clients ::: "  + this.clients.length);
                },
                register: function(client)
                {
                    var item = this.retrieve(this.clients, client);

                    if(item)
                    {
                        return;
                    }

                    this.clients.push(client);

                    //console.log("host ::: " + this.clients.length);
                },
                spread: function(source, type, args)
                {
                    if(this != source)
                    {
                        this.fire.call(this, type, args);
                    }

                    var dirty_clients = [];

                    var len = this.clients.length;
                    for(var i = 0; i < len; i++)
                    {
                        var client = this.clients[i];
                        if(client == source)
                        {
                            continue;
                        }
                        try
                        {
                            client.fire.call(client, type, args);
                        }
                        catch (ex)
                        {
                            dirty_clients.push(client);
                            //if(console) console.log("spread :: dirty_client :: " + ex);
                        }
                    }

                    len = dirty_clients.length;
                    for(i = 0; i < len; i++)
                    {
                        this.invalidate(dirty_clients[i], false);
                    }
                },
                listen: function(type, answer)
                {
                    if(typeof type != 'string' || type == "" || typeof answer != 'function')
                    {
                        return;
                    }

                    this.listeners[type] = answer;
                },
                dispatch: function(type, args)
                {
                    if(typeof type != 'string' || type == "")
                    {
                        return;
                    }

                    this.spread.call(host, this, type, args);
                },
                fire: function(type, args)
                {
                    var answer = this.listeners[type];
                    if(answer)
                    {
                        answer.apply(this, args);
                    }
                },
                dispose: function(evt)
                {
                    for(var type in this.listeners)
                    {
                        this.listeners[type] = null;
                        delete this.listeners[type];
                    }

                    this.listeners = null; delete this.listeners;
                    win.beacon = null; delete win.beacon;
                },
                unload: function(event)
                {
                    win.delEvent('befordunload', this.unload);

                    var target = event.target || event.srcElement;

                    if(target != win) return;

                    //console.log('host: this');

                    this.dispose();
                }
            }.init();
        },
        client: function()
        {
            return {
                listeners: {},
                init: function()
                {
                    //console.log('client :: ');
                    this.register();

                    return this;
                },
                retrieve_host: function(pass)
                {
                    return win.top.beacon;

                    if(!pass)
                    {
                        return null;
                    }

                    if(pass.beacon && pass.beacon.proxy)
                    {
                        return pass.beacon;
                    }

                    if(pass.parent)
                    {
                        return this.retrieve_host(pass.parent);
                    }
                    else
                    {
                        return win.top.beacon;
                    }
                },
                register: function()
                {
                    var host = this.retrieve_host(win.parent);

                    if(host)
                    {
                        host.register(this);
                    }

                    win.addEvent('beforeunload', this.unload);
                },
                dispose: function()
                {
                    for(var type in this.listeners)
                    {
                        this.listeners[type] = null;
                        delete this.listeners[type];
                    }

                    this.listeners = null; delete this.listeners;
                    win.beacon = null; delete win.beacon;
                },
                fire: function(type, args)
                {
                    var answer = this.listeners[type];
                    if(answer)
                    {
                        answer.apply(this, args);
                    }
                },
                listen: function(type, answer)
                {
                    if(typeof type != 'string' || type == "" || typeof answer != 'function')
                    {
                        return;
                    }

                    this.listeners[type] = answer;
                },
                dispatch: function(type, args)
                {
                    if(typeof type != 'string' || type == "")
                    {
                        return;
                    }

                    if(win.top.beacon.spread)
                    {
                        win.top.beacon.spread(this, type, args);
                    }
                },
                unload: function(event)
                {
                    win.delEvent('befordunload', this.unload);

                    var target = event.target || event.srcElement;

                    if(target != win) return;

                    //console.log('client:: done');

                    win.top.beacon.invalidate(target.beacon);
                }
            }.init();
        },
        init: function()
        {
            if(win.beacon)
            {
                return;
            }

            win.beacon = (win == win.top) ? this.host() : this.client();
        }
    };

    beacon.init();

})(window);
