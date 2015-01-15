/**
 * Created by zonebond on 14-2-14.
 */

(function(win){

    /*************  sugar begin *************/

    if(!Function.prototype.method)
    {
        Function.prototype.method = function(name, func)
        {
            this.prototype[name] = func;
            return this;
        };

        Function.method('inherits', function (parent) {
            this.prototype = new parent();
            var d = {},
                p = this.prototype;
            this.prototype.constructor = parent;
            this.method('uber', function uber(name)
            {
                if (!(name in d)) {
                    d[name] = 0;
                }
                var f, r, t = d[name], v = parent.prototype;
                if (t) {
                    while (t) {
                        v = v.constructor.prototype;
                        t -= 1;
                    }
                    f = v[name];
                } else {
                    f = p[name];
                    if (f == this[name]) {
                        f = v[name];
                    }
                }
                d[name] += 1;
                r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
                d[name] -= 1;
                return r;
            });
            return this;
        });
    }

    /*************  sugar end *************/


    /*************  data source *************/

    if(win.DataSource)
    {
        return;
    }

    win.DataSourceEvent =
    {
        'ON_SYNC':"_on_sync_",
        'ON_CONTACT':"_on_contact_",
        'ON_RESULT':"_on_result_",
        'ON_FAULT':"_on_fault_"
    };


    //contructor
    function DataSource(options)
    {
        this.profile = options;

        this.handler = {};

        this.useTestData = options['useTestData'] || false;

        this.action = options['action'] || null;
        this.target = options['target'] || null;
        this.option = options['option'] || null;
        this.render = options['render'] || null;

        for(var type in DataSourceEvent)
        {
            var event = DataSourceEvent[type];
            this.on(event, options[event]);
        }

        this.init();

        return this;
    }

    DataSource.method('init', function()
    {
        if(typeof this.render == 'string')
        {
            this.render = factory[this.render];
        }
        this.render = this.render.newInstance();
        this.render.owner = this;

        this.option = this.option || this.render.init();
    });

    //listen data-source event
    DataSource.method('on', function(event, handler)
    {
        if(!event || event == "")
        {
            return;
        }

        this.handler[event] = handler;
    });

    DataSource.method('dispatch', function(event)
    {
        if(!event || event == "")
        {
            return;
        }

        if(this.handler[event])
        {
            this.handler[event].call(this, arguments[1]);
        }
    });

    //request action
    DataSource.method('sync', function()
    {
        var that = this;
        if(this.action && !this.useTestData)
        {
            $.ajax({
                url:this.action,
                dataType:'json',
                async: true,
                success:function(data)
                {
                    that.resultHandler.call(that, data);
                    that = null;
                },
                error:function(error)
                {
                    that.errorHandler.call(that, error);
                    that = null;
                }
            });
        }
        else
        {
            that.resultHandler.call(that, null);
            that = null;
        }
        return this;
    });

    // manipulate original
    DataSource.method('dataProvider', function(provider)
    {
        if(provider === undefined)
        {
            return;
        }

        this.resultHandler.call(this, provider);
    });

    //When the ajax request success calls
    DataSource.method('resultHandler', function(result)
    {
        var handler = this.handler[DataSourceEvent.ON_RESULT] || null;

        if(handler)
        {
            handler.call(null, result);
        }
        else
        {
            if(this.render)
            {
                this.dispatch(DataSourceEvent.ON_CONTACT);
                this.data = this.render.contact(result);
                this.dispatch(DataSourceEvent.ON_SYNC);
            }
        }
    });

    //When the ajax request error calls
    DataSource.method('errorHandler', function(error)
    {
        var handler = this.handler[DataSourceEvent.ON_FAULT] || null;
        if(handler)
        {
            handler.call(null, error);
        }
        else
        {
            throw new Error(error.statusText);
        }
    });

    win.DataSource = DataSource;

    //Config Adapters
    var adapters = {};

    var doc = win.document,
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        isBrowser = !!(typeof window !== 'undefined' && navigator && doc),
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ? /^complete$/ : /^(complete|loaded)$/;

    if(!win.doExe)
    {
        win.doExe = function(something, boss)
        {
            return eval("(function(){ \n" + something + "\n }).call(boss)");
        };
    }

    function dequeuing(queue, clear)
    {
        return {
            queue: queue,
            clear: clear,
            clean: function()
            {
                if(this.clear && isFunction(this.clear))
                {
                    this.clear.call(this);
                }
            },
            parallel: function(every)
            {
                if(!isFunction(every) || !this.queue)
                {
                    return;
                }

                var who = this;
                var len = who.queue.length;
                for(var i = 0; i < len; i++)
                {
                    every.call(who, who.queue[i]);
                }
            },
            sequence: function(every)
            {
                if(!isFunction(every) || !this.queue)
                {
                    return;
                }

                var who = this;
                while(who.queue.length)
                {
                    every.call(who, who.queue.shift());
                }

                who.clean();
            },
            next: function(every)
            {
                if(!isFunction(every) || !this.queue)
                {
                    return;
                }

                var who = this;
                if(who.queue.length)
                {
                    every.call(who, who.queue.shift());
                }
                else
                {
                    who.clean();
                }
            }
        };
    }

    var CacheCode = function()
    {
        if(!win.top.__CacheCode__)
        {
            win.top.__CacheCode__ = {};
        }

        var name = arguments[0],
            code = arguments[1];

        if(code == undefined)
        {
            return win.top.__CacheCode__[name];
        }
        else
        {
            win.top.__CacheCode__[name] = code;
        }
    };

    if(!win.render)
    {
        var factory = {},
            configs = {},
            ready_handler;

        factory.script = function(src)
        {
            return {
                attrs: arguments[1] || null,
                alive: function(callback)
                {
                    // instance script
                    var node = doc.createElement('script');
                    node.async = true;
                    node.type = "text/javascript";

                    // set attributes
                    var attrs = this.attrs;
                    if(attrs)
                    {
                        var len = attrs.length;
                        for (var i = 0; i < len; i++) {
                            var attr = attrs[i];
                            node.setAttribute(attr.name, attr.value);
                        }
                    }

                    node.callback = callback;
                    node.args = arguments[1];

                    // attachEvent
                    if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera)
                    {
                        node.attachEvent('onreadystatechange', this.hands);
                    }
                    else
                    {
                        node.addEventListener('load', this.hands, false);
                    }

                    node.src = src;
                    doc.getElementsByTagName('head')[0].appendChild(node);
                },
                hands: function(event)
                {
                    var target = event.currentTarget || event.srcElement;
                    if (event.type === 'load' || (readyRegExp.test(target.readyState)))
                    {
                        if(target.callback)
                        {
                            target.callback.call(target);
                        }
                    }
                }
            };
        };

        factory.httpLoader = function(href)
        {
            return {
                cache: arguments[1] == undefined ? true : arguments[1],
                href: href,
                alive: function(callback)
                {
                    this.callback = callback;

                    var local_cache = CacheCode(href);

                    if(local_cache)
                    {
                        this.response = local_cache;
                        return this.handle();
                    }

                    // get remote source
                    var loader, who = this;

                    if(win.XMLHttpRequest)
                    {
                        loader = new XMLHttpRequest();
                    }
                    else if(win.ActiveXObject)
                    {
                        try
                        {
                            loader = new ActiveXObject("Msxml2.XMLHTTP");
                        }
                        catch(ex)
                        {
                            try
                            {
                                loader = new ActiveXObject("Microsoft.XMLHTTP");
                            }
                            catch (ex) {}
                        }
                    }

                    if(loader)
                    {
                        this.loader = loader;

                        loader.onreadystatechange = function(evt)
                        {
                            if(loader.readyState == 4 && loader.status == 200)
                            {
                                var code = loader.responseText;

                                if(who.cache)
                                {
                                    CacheCode(who.href, code);
                                }

                                who.response = code;

                                loader = null;
                                code = null;
                                return who.handle();
                            }
                        };

                        loader.error = function(evt)
                        {
                            loader = null;
                            return null;
                        };

                        loader.open("POST", href, true);
                        loader.send();
                    }
                },
                handle: function()
                {
                    if(this.callback && isFunction(this.callback))
                    {
                        this.callback.call(this);
                    }
                }
            };
        };

        factory.task_pool = [];
        factory.trigger_tasks = function()
        {
            var tasks = factory.task_pool,
                index = 0;
            while(index < tasks.length)
            {
                if(tasks[index].process())
                {
                    tasks.splice(index, 1);
                    continue;
                }
                index++;
            }
        };

        factory.importing = function(task)
        {
            if(!task) return;

            factory.task_pool.push(task);

            if(task.queue.length == 0)
            {
                factory.trigger_tasks();
                return;
            }

            var nodes = [];
            var queue = task.queue;
            var num_queue = queue.length;
            for(var i = 0; i < num_queue; i++)
            {
                var render = queue[i];
                var node = factory.httpLoader(render.path);

                nodes.push(node);
            }

            dequeuing(nodes).parallel(function(node)
            {
                node.alive(function()
                {
                    try
                    {
                        doExe(this.response, win);
                    }
                    catch(ex){}

                    factory.trigger_tasks();
                });
            });

        };

        factory.config = function(conf)
        {
            var task = {conf: conf, queue: []};
            for(var name in conf)
            {
                var conf_obj = configs[name];

                if(conf_obj)
                {
                   continue;
                }

                conf_obj = {};
                conf_obj['name'] = name;
                conf_obj['path'] = factory.parse_path(conf[name]);

                configs[name] = conf_obj;

                task.queue.push(conf_obj);
            }

            var handler = arguments[1];
            if(handler)
            {
                task.handle = handler;
                task.process = function()
                {
                    if(!factory.list) return false;

                    var tot = 0, cou = 0;
                    for(var name in this.conf)
                    {
                        tot++;
                        if(!factory.validation(name))
                        {
                            continue;
                        }
                        cou++;
                    }

                    if(tot == cou && this.handle)
                    {
                        this.handle.call(null);
                        return true;
                    }

                    return false;
                };
                factory.importing(task);
            }
        };

        factory.validation = function(name)
        {
            if(!factory.list)
            {
                return false;
            }

            if(factory.list[name] || factory.list[name.replace(/_/g, '-')])
            {
                return true;
            }

            return false;
        };

        factory.parse_path = function(path)
        {
            if(!path || path == "" || !script)
            {
                return path;
            }

            var namespace = "renders:";

            return path.indexOf(namespace) == 0 ? script.uri.replace("data-source.js", "renderers/" + path.replace(namespace, "")) : path;
        };

        factory.def = function(name, define)
        {
            factory[name] = define;

            if(!factory.list)
            {
                factory.list = {};
            }

            factory.list[name] = define;

            if(isFunction(define))
            {
                if(!define.newInstance)
                {
                    define.newInstance = function()
                    {
                        return new define;
                    };
                }
            }
        };

        var data_source_path = "";
        var scripts = document.scripts;
        for(var i = 0; i < scripts.length; i++)
        {
            var script = scripts[i];
            if(script.uri.indexOf('data-source.js') != -1)
            {
                data_source_path = script.uri;
                break;
            }
        }

        if(data_source_path == "")
        {
            script = null;
        }

        factory.ready = function(handler)
        {
            if(!isFunction(handler))
            {
                return;
            }

            ready_handler = handler;

            var all_renders = [];
            for(var name in configs)
            {
                all_renders.push(configs[name]);
            }

            factory.importing({conf: configs, queue: all_renders, handle: handler, process: function()
            {
                if(!factory.list) return false;

                var tot = 0, cou = 0;
                for(var name in this.conf)
                {
                    tot++;
                    if(!factory.validation(name))
                    {
                        continue;
                    }
                    cou++;
                }

                if(tot == cou && this.handle)
                {
                    this.handle.call(null);
                    return true;
                }

                return false;
            }});
        };

        win.render = factory;
    }

    function isFunction( obj ) {
        return typeof obj == 'function';
    }

})(window);