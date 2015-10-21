/**
 * Created by zonebond on 15/5/28.
 */

/**** sprite for loader resources ****/
(function(win)
{
    var Task = function(tasks, handle)
    {
        this.tasks = tasks;
        this.ready = [];
        this.handle = handle;
    }, _Task_ = Task.prototype;
    _Task_.isReady = function(history)
    {
        var tasks = this.tasks,
            index = 0;
        while(index < tasks.length)
        {
            if(history[tasks[index]] == 'ready')
            {
                this.ready.push(tasks.splice(index, 1)[0]);
                continue;
            }
            index++;
        }

        if(tasks.length == 0)
        {
            return true;
        }

        return false;
    };
    _Task_.dispose = function()
    {
        if(this.handle) this.handle.call();

        this.tasks = null; delete this.tasks;
        this.ready = null; delete this.ready;
        this.handle = null; delete this.handle;
    };

    //ajax task package
    var jetpack = function ()
    {
        this.history = {};
        this._queue_ = [];
    }, _jetpack_ = jetpack.prototype;
    _jetpack_.xhr = function(src, result, fault)
    {
        if(typeof src != 'string') return;

        var xhr;

        if(win.XMLHttpRequest)
        {
            xhr = new XMLHttpRequest();
        }
        else if(win.ActiveXObject)
        {
            try
            {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch(ex)
            {
                try
                {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch (ex) {}
            }
        }

        if(xhr)
        {
            xhr.src = src;
            xhr.handles = {
                result: result,
                fault: fault
            };
            xhr.dispose = function()
            {
                this.onreadystatechange = null;
                this.onerror = null;

                for(var handle in this.handles)
                {
                    delete this.handles[handle];
                }
                delete this.handles;
            };

            xhr.onreadystatechange = function(event)
            {
                if(this.readyState == 4 && this.status == 200)
                {
                    this.txt_stream = this.responseText;
                    if(this.cached)
                    {
                        CacheCode(this.cachedTag, this.txt_stream);
                    }

                    if(this.handles['result']) this.handles['result'].call(this, this.txt_stream);
                    this.dispose();
                }
            };

            xhr.onerror = function(event)
            {
                if(this.handles['fault']) this.handles['fault'].call(xhr);
                this.dispose();
            };
        }

        return {
            _xhr_: xhr,
            send: function(async, cached, cachedTag)
            {
                var xhr = this._xhr_;

                if (!xhr) return;

                if(typeof almost == 'function') xhr.handles.almost = almost;

                async = async == undefined ? true : async;

                xhr.cached = cached == undefined ? false : cached;
                xhr.cachedTag = cachedTag == undefined ? xhr.src : cachedTag;

                if(xhr.cached)
                {
                    xhr.txt_stream = CacheCode(xhr.cachedTag);
                    if(xhr.txt_stream)
                    {
                        if(xhr.handles['result']) xhr.handles['result'].call(xhr, xhr.txt_stream);
                        xhr.dispose();
                        return;
                    }
                }

                xhr.open("POST", xhr.src, async);
                xhr.send();
            }
        };
    };
    _jetpack_.__clearQueue__ = function(tag)
    {
        if(tag)
        {
            this.history[tag] = 'ready';
        }

        var queue = this._queue_,
            index = 0,
            task;
        while(index < queue.length)
        {
            task = queue[index];
            if(task.isReady(this.history))
            {
                queue.splice(index, 1);
                task.dispose();
                continue;
            }
            index++;
        }
    };
    _jetpack_.fetch = function(tasks, ready, cached)
    {
        // initialize parameters
        var _type_tasks_ = typeof tasks,
            _type_ready_ = typeof ready,

            tasks = tasks instanceof Array ? tasks : (_type_tasks_ == 'string' ? [tasks] : null);

        if(!tasks || _type_ready_ != 'function') return;

        this._queue_.push(new Task(tasks, ready));

        var jet = this, idx = 0, src;
        while(idx < tasks.length)
        {
            src = tasks[idx];

            if(jet.history[src])
            {
                jet.__clearQueue__();
            }
            else
            {
                jet.history[src] = 'loading';
                this.xhr(src, function(response)
                {
                    try
                    {
                        eval.call(win, response);
                    }catch(ex){ if(console) console.info(' jetpack :: error :: ' + ex.toString() ); }

                    jet.__clearQueue__(this.src);
                }).send(true, cached);
            }
            idx++;
        }
    };
    _jetpack_.load = function(tasks, ready)
    {
        this.fetch(tasks, ready, false);
    };
    win.jetpack = new jetpack();

})(window);

(function (W)
{

    if (typeof Object.create != 'function') {
        (function () {
            var F = function () {};
            Object.create = function (o) {
                if (arguments.length > 1) {
                    throw Error('Second argument not supported');
                }
                if (o === null) {
                    throw Error('Cannot set a null [[Prototype]]');
                }
                if (typeof o != 'object') {
                    throw TypeError('Argument must be an object');
                }
                F.prototype = o;
                return new F();
            };
        })();
    }
    if (!Function.prototype.inherit) {
        Function.prototype.inherit = function (superClass) {
            this.prototype = Object.create(superClass.prototype);
            return this.prototype;
        };
    }

    // Retrieve Package [bases]
    var namespace = W;

    // Define Interface IHandle
    var IHandle = function () {
    };
    IHandle.prototype.todo = function (event) {

    };
    IHandle.prototype.when = function (type, handler) {

    };
    namespace.IHandle = IHandle;


    // Define Class Event [The Event is not System Window Event of User's Manipulation, but event of Business]
    var _Event = function (type, cancelable) {
        this.type = type;
        this.cancelable = cancelable;
    };
    _Event.prototype.clone = function () {
        var clone = new _Event(this.type, this.cancelable);
        clone.trigger = this.trigger;
        return clone;
    };
    namespace.Event = _Event;


    // Define Class SampleEvent
    var SampleEvent = function (type, cancelable) {
        _Event.call(this, type, cancelable);
    }, _SampleEvent_ = SampleEvent.inherit(_Event);
    namespace.SampleEvent = SampleEvent;


    // Define Class Handle [implement IHandle]
    var Handle = function () {
        IHandle.call(this);
    }, _Handle_ = Handle.inherit(IHandle);
    _Handle_.todo = function (event) {
        if (this._handles_ == undefined || event instanceof _Event == false) {
            return;
        }

        event = event.clone();
        event.trigger = this;

        var handlers = this._handles_[event.type];

        if (handlers instanceof Array == false) {
            event = null;
            return;
        }

        var nums = handlers.length,
            handler;
        for (var i = 0; i < nums; i++) {
            handler = handlers[i];

            if (typeof handler != 'function') continue;

            handler.call(this, event);
        }

        event = null;
    };
    _Handle_.when = function (type, handler) {
        if (this._handles_ == undefined) {
            this._handles_ = {};
        }

        if (typeof handler != 'function') {
            return;
        }

        var handlers = this._handles_[type];
        if (handlers == undefined) {
            handlers = this._handles_[type] = [];
        }
        handlers.push(handler);
    };
    namespace.Handle = Handle;

    // Define Class Block
    var Block = function (node, Class) {
        Handle.call(this);
        this._node_ = node;
        this._Class_ = Class;
        if(typeof Class != 'function') return;
        Class.call(this);
    }, _Block_ = Block.inherit(Handle);
    _Block_.getNode = function () {
        return this._node_ ? this._node_ : null;
    };
    namespace.Block = Block;

    // Define Class Tile
    var View = function (node, Class) {
        Block.call(this, node, Class);
    }, _View_ = View.inherit(Block);
    View.EVENT_ON_INITIAL = "-event-on-initial-";
    View.EVENT_ON_CREATED = "-event-on-created-";
    View.EVENT_ON_REFRESH = "-event-on-refresh-";
    namespace.View = View;

})(window);

// ovo Construction
(function(W)
{
    var DEF = {};

    // View
    DEF.View = function(name, Class)
    {
        if(typeof name != 'string' || name.trim() == "" || typeof Class != 'function') return;

        if(DEF.View.__DEFINES__ == undefined) DEF.View.__DEFINES__ = {};

        DEF.View.__DEFINES__[name] = Class;

        W.View[name] = Class;

        // standby

        if(DEF.View.detected && DEF.View.__NODES__.length)
        {
            var items = DEF.View.__NODES__, index = 0, item;
            while(index < items.length)
            {
                item = items[index];
                if(item.name == name)
                {
                    if(item.node)
                    {
                        DEF.View.alive(Class, item.node);
                    }
                    items.splice(index, 1);
                    continue;
                }
                index++;
            }
        }
    };

    DEF.View.detectViewNodes = function(attr, baseNode)
    {
        if(DEF.View.__NODES__ == undefined) DEF.View.__NODES__ = [];

        baseNode = baseNode == undefined ? W.document.body : baseNode;

        var nodes = baseNode.querySelectorAll('['+attr+']'), nums = nodes.length;
        for(var i = 0; i < nums; i++)
        {
            var node = nodes[i],
                name = node.getAttribute(attr),
                defs = DEF.View.__DEFINES__,
                Class = defs ? defs[name] : null;

            if(Class)
            {
                DEF.View.alive(Class, node);
            }
            else
            {
                DEF.View.__NODES__.push({name: name, node: node});
            }
        }

        DEF.View.detected = true;
    };

    DEF.View._Views_ = {_size_: -1};
    DEF.View.getVID = function()
    {
        DEF.View._Views_._size_ += 1;
        return DEF.View._Views_._size_;
    };

    DEF.View.alive = function(Class, node)
    {
        var vvid = DEF.View.getVID();
        node.setAttribute('vvid', vvid);

        var view = new View(node, Class);

        DEF.View._Views_[vvid] = view;

        if(W.V == undefined)
        {
            W.V = function(selector)
            {
                var node = W.document.querySelectorAll(selector);
                if(!node.length) return null;

                return DEF.View._Views_[node[0].getAttribute('vvid')];
            };
        }
    };

    var onStandBy = function()
    {
        DEF.View.detectViewNodes('ovo-view');
    };

    if(W.standby != undefined)
    {
        standby(onStandBy);
    }
    else
    {
        var WhenContentLoaded = function(callback)
        {
            var WIN = window, DOC = window.document, UND = undefined, fn = function()
            {
                if(WhenContentLoaded.called)
                    return;
                WhenContentLoaded.called = true;
                callback.call();
            };

            WhenContentLoaded.called = false;

            if((DOC.readyState != UND && DOC.readyState == "complete") || (DOC.readyState == UND && (DOC.getElementsByTagName('body')[0] || DOC.body)))
            {
                fn();
            }

            if(!WhenContentLoaded.called)
            {
                if(DOC.addEventListener != UND)
                {
                    DOC.addEventListener("DOMContentLoaded", fn, false);
                }
                else
                {
                    DOC.attachEvent("onreadystatechange", function()
                    {
                        if (DOC.readyState == "complete")
                        {
                            DOC.detachEvent("onreadystatechange", arguments.callee);
                            fn();
                        }
                    });
                }

                //win loaded
                if (WIN.addEventListener != UND)
                {
                    WIN.addEventListener("load", fn, false);
                }
                else if (DOC.addEventListener != UND)
                {
                    DOC.addEventListener("load", fn, false);
                }
                else if (WIN.attachEvent != UND)
                {
                    WIN.attachEvent("onload", fn);
                }
                else if (WIN.onload == "function")
                {
                    var fnOld = WIN.onload;
                    WIN.onload = function()
                    {
                        fn();
                        //确保在其它目标(exp:onpageshow)事件之前触发
                        fnOld();
                    };
                }
                else
                {
                    WIN.onload = fn;
                }
            }

        };

        WhenContentLoaded(onStandBy)
    }


    // Operation
    DEF.Operation = function(name, Class)
    {
        if(typeof name != 'string' || name.trim() == "" || typeof Class != 'function') return;

        if(DEF.Operation.__DEFINES__ == undefined) DEF.Operation.__DEFINES__ = {};

        DEF.Operation.__DEFINES__[name] = Class;
    };

    // Modal
    DEF.Modal = function(name, Class)
    {
        if(typeof name != 'string' || name.trim() == "" || typeof Class != 'function') return;

        if(DEF.Modal.__DEFINES__ == undefined) DEF.Modal.__DEFINES__ = {};

        DEF.Modal.__DEFINES__[name] = Class;
    };

    // Attach to Window Scope
    W.DEF = DEF;
    W.Import = function(blocks, ready)
    {
        jetpack.fetch(blocks, ready == undefined ? function(){} : ready, true);
    };

})(window);