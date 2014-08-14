/**
 * Created by zonebond on 14-6-26.
 */

(function()
{

    var host =
    {
        clients: [],
        listeners: {},
        init: function()
        {
            var that = this;
            window.onunload = function()
            {
                that.dispose();
            };

            return this;
        },
        retrieve: function(stack, object)
        {
            var eveny = arguments[2] || null;
            stack = stack || [];

            var len = stack.length;
            for(var i = 0; i < len; i++)
            {
                if(eveny)
                {
                    eveny.call(null, i, stack[i]);
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
                    this.clients.splice(i, 1);
                }
            }
        },
        register: function(client)
        {
            var item = this.retrieve(this.clients, client);

            if(item)
            {
                return;
            }

            this.clients.push(client);
        },
        spread: function(source, type, args)
        {
            if(this != source)
            {
                this.fire.call(this, type, args);
            }

            var len = this.clients.length;
            for(var i = 0; i < len; i++)
            {
                var client = this.clients[i];
                if(client == source)
                {
                    continue;
                }
                client.fire.call(client, type, args);
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
        dispose: function()
        {
            this.listeners = null;
        }
    };

    var client =
    {
        listeners: {},
        init: function()
        {
            this.register();
            return this;
        },
        host: function(instance)
        {
            if(!instance)
            {
                return this._host_;
            }
            this._host_ = instance;

            return this._host_;
        },
        retrieve_host: function(pass)
        {
            if(!pass)
            {
                return null;
            }

            if(pass.beacon && pass.beacon.clients)
			{
				return pass.beacon;
			}

			if(pass.parent)
			{
				return this.retrieve_host(pass.parent);
			}
			else
			{
				return window.top.beacon;
			}
        },
        register: function()
        {
            var instance = this.retrieve_host(window.parent);
            if(instance)
            {
                this.host(instance).register(this);
            }

            var that = this;
            window.onunload = function()
            {
                that.dispose();
            };
        },
        dispose: function()
        {
            this.host().invalidate(this);
            this.listeners = null;
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

            var host = this.host();

            if(host)
            {
                host.spread.call(host, this, type, args);
            }
        }
    };

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
        init: function()
        {
            if(window.beacon)
            {
                return;
            }

            if(this.behost() == 'true')
            {
                window.beacon = host.init();
            }
            else
            {
                window.beacon = window.top == window ? host.init() : client.init();
            }
        }
    };

    beacon.init();

})();