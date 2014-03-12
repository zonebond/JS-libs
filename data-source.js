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
            this.method('uber', function uber(name) {
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
            this.render = render[this.render];
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

    if(!win.render)
    {
        var factory = {},
            configs = {},
            currentlyAddingScript,
            ready_handler;

        factory.import = function(name, uri)
        {
            var script = document.createElement( 'script' );
            script.setAttribute('data-require-id', name);
            script.src = uri;
            script.async = true;
            if (script.readyState)
            {
                script.onreadystatechange = loadedListener;
            }
            else
            {
                script.onload = loadedListener;
            }
            script.onerror = loadErrorLinstener;

            appendScript(script)

            function loadedListener()
            {

                var name = script.getAttribute("data-require-id");
                /**

                **/
            }

            function loadErrorLinstener()
            {
                var name = script.getAttribute("data-require-id");
                alert("Error : 【" + name + "】 load failure!");
            }

            function appendScript(script)
            {
                currentlyAddingScript = script;

                var doc = document;
                (doc.getElementsByTagName('head')[0] || doc.body).appendChild( script );

                currentlyAddingScript = null;
            }
        };

        factory.config = function(conf)
        {
            for(var name in conf)
            {
                var conf_obj = configs[name];

                if(!conf_obj)
                {
                    conf_obj = {};
                }
                conf_obj['path']   = conf[name];
                conf_obj['status'] = "_invalidate_";

                configs[name] = conf_obj;
            }
        };

        factory.def = function(name, define)
        {
            configs[name]['status'] = "_ready_";
            factory[name] = define;

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

            var total_count = 0;
            var ready_count = 0;
            for(var key in configs)
            {
                total_count++;
                if(configs[key]['status'] == "_ready_")
                {
                    ready_count++;
                }
            }

            if(total_count == ready_count && isFunction(ready_handler))
            {
                ready_handler.call(null);
            }
        };

        var data_source_path = "";
        var scripts = document.scripts;
        for(var i = 0; i < scripts.length; i++)
        {
            var script = scripts[i];
            if(script.src.indexOf('data-source.js') != -1)
            {
                data_source_path = script.src;
                break;
            }
        }


        factory.ready = function(handler)
        {
            if(!isFunction(handler))
            {
                return;
            }

            ready_handler = handler;

            for(var name in configs)
            {
                var conf = configs[name];
                if(conf['status'] == "_invalidate_")
                {
                    factory.import(name, configs[name].path);
                }
            }
        }

        factory.config({
            echart_line_renderer : script.src.replace("utils/data-source.js", "renderers/echart_line_renderer.js")
        });

        win.render = factory;
    }


    function isFunction( obj ) {
        return typeof obj == 'function';
    }

})(window);