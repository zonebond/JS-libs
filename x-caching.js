/**
 * Created by zonebond on 15/7/28.
 */
(function(W)
{
    /**
     *  function plugin inherit
     */
    if (!Function.prototype.inherit) {
        Function.prototype.inherit = function (superClass) {
            this.prototype = Object.create(superClass.prototype);
            return this.prototype;
        };
    }


    /**
     * Abstract Object Caching-Provider
     * */
    var CachingProvider = function(type)
    {
        this.type = type;
        this.isAvailable = false;
    }, _CachingProvider_Proto_ = CachingProvider.prototype;
    _CachingProvider_Proto_.length = function(){};
    _CachingProvider_Proto_.item = function(key, value){};
    _CachingProvider_Proto_.removeItem = function(key){};
    _CachingProvider_Proto_.clear = function(){};


    /**
     * Cookie-Provider : Caching-Provider
     * */
    var CookieProvider = function(){
        CachingProvider.call(this, "Cookie-Provider");
    }, _CookieProvider_ = CookieProvider.inherit(CachingProvider);


    /**
     * Storage-Provider : Caching-Provider
     * */
    var StorageProvider = function(type, storage)
    {
        CachingProvider.call(this, type);
        this.storage = storage;
        this.isAvailable = this.storage ? true : false;

    }, _StorageProvider_ = StorageProvider.inherit(CachingProvider);
    _StorageProvider_.item = function(key, value)
    {
        if(!this.isAvailable || typeof key != 'string') return;

        if(value != undefined)
        {
            this.storage.setItem(key, value);
        }
        else
        {
            return this.storage.getItem(key)
        }
    };


    /**
     * SessionStorage-Provider : Caching-Provider
     * */
    var SessionStorageProvider = function()
    {
        StorageProvider.call(this, "SessionStorage-Provider", W.sessionStorage);
    },_SessionStorageProvider_ = SessionStorageProvider.inherit(StorageProvider);


    /**
     * LocalStorage-Provider : Caching-Provider
     * */
    var LocalStorageProvider = function()
    {
        StorageProvider.call(this, "LocalStorage-Provider", W.localStorage);
    }, _LocalStorageProvider_ = LocalStorageProvider.inherit(StorageProvider);


    /**
     * X-Caching
     * */
    var XCaching = function(owner)
    {
        this.owner = owner;
        this.initial();
    }, _XCaching_Proto_ = XCaching.prototype;
    _XCaching_Proto_.initial = function()
    {
        this.providers = {};
    };
    _XCaching_Proto_.getCookieProvider = function()
    {
        if(!this.providers.cookie)
            this.providers.cookie = new CookieProvider();

        return this.providers.cookie;
    };
    _XCaching_Proto_.getSessionStorageProvider = function()
    {
        if(!this.providers.sessionStorage)
            this.providers.sessionStorage = new SessionStorageProvider();
        return this.providers.sessionStorage;
    };
    _XCaching_Proto_.getLocalStorageProvider = function()
    {
        if(!this.providers.localStorage)
            this.providers.localStorage = new LocalStorageProvider();

        return this.providers.localStorage;
    };
    _XCaching_Proto_.__getAvailableProvider__ = function()
    {
        if(this.getSessionStorageProvider().isAvailable)
            return this.getSessionStorageProvider();

        if(this.getLocalStorageProvider().isAvailable)
            return this.getLocalStorageProvider();

        return null;

        if(this.getCookieProvider().isAvailable)
            return this.getCookieProvider();
    };
    _XCaching_Proto_.item = function(key, value, expire)
    {
        if(typeof key != 'string') return;

        var provider = this.__getAvailableProvider__();

        if(!provider) return;

        if(value)
        {
            provider.item(key, value);
        }
        else
        {
            return provider.item(key)
        }
    };
    _XCaching_Proto_.destroy = function()
    {
        if(W.sessionStorage)
            W.sessionStorage.clear();

        if(W.localStorage)
            W.localStorage.clear();
    };

    if(!W.xCaching) W.xCaching = new XCaching(W);


    /**
     * Intent
     * */
    var Intent = function(destination)
    {
        this.destination = destination;
        this.__initial__();
    }, _Intent_ = Intent.prototype;
    Intent.SEqual = "*@*@*"; Intent.SDivis = "*~~~*"; Intent.RegExp = /\?/g;
    _Intent_.__initial__ = function()
    {
        if(!W.localStorage) return;

        this.storage = W.sessionStorage;

        if(!this.destination)
        {
            if(!Intent.RegExp.test(W.location.href)) return;

            var search = W.location.href.split('?')[1],
                params = search.split('&'),
                intent = null;
            for(var i = 0; i < params.length; i++)
            {
                if(params[i].indexOf('intent') != -1)
                {
                    intent = params[i];
                    break;
                }
            }

            if(intent == null) return;
            this.expNo = intent.split('=')[1];

            this.__takeExtra__();
        }
        else
        {
            this.expNo = (new Date()).getMilliseconds() + "" + parseInt(Math.random() * 10000);

            if(Intent.RegExp.test(this.destination))
            {
                this.__express__ = this.destination + "&intent=" + this.expNo;
            }
            else
            {
                this.__express__ = this.destination + "?intent=" + this.expNo;
            }
        }
    };
    _Intent_.__takeExtra__ = function()
    {
        if(!this.storage) return;

        var putExtraItemsTxt = this.storage.getItem(this.expNo);
        this.storage.removeItem(this.expNo);

        if(!putExtraItemsTxt || putExtraItemsTxt.trim() == "" )
        {
            this.putExtraItems = null;
        }
        else
        {
            this.putExtraItems = this.__stringToMap__(putExtraItemsTxt, Intent.SEqual, Intent.SDivis)
        }
    };
    _Intent_.__mapToString__ = function(map, eq, sp)
    {
        var set = [], str = "";
        for(var key in map)
        {
            var val = map[key];
            if(typeof val != 'string') continue;
            set.push(key + eq + map[key]);
        }
        return set.join(sp);
    };
    _Intent_.__stringToMap__ = function(txt, eq, sp)
    {
        var map = {};
        var set = txt.split(sp);
        for(var i = 0; i < set.length; i++)
        {
            var t = set[i];
            if(t == null || t.trim() == '' || t.indexOf(eq) == -1) continue;
            var tt = t.split(eq);
            map[tt[0]] = tt[1];
        }
        return map;
    };
    _Intent_.putExtra = function(key, value)
    {
        if (typeof key != 'string' || typeof value != 'string' || !this.storage) return;

        if(!this.putExtraItems) this.putExtraItems = {};

        this.putExtraItems[key] = value;
    };
    _Intent_.getExtra = function(key)
    {
        if (typeof key != 'string' || this.expNo == undefined || this.putExtraItems == null) return;

        return this.putExtraItems[key];
    };
    _Intent_.start = function()
    {
        if(!this.storage) return;

        var items = this.putExtraItems;
        if(!items || !this.expNo) return;

        this.storage.setItem(this.expNo, this.__mapToString__(items, Intent.SEqual, Intent.SDivis));

        W.location = this.__express__;
    };

    if(!W.Intent) W.Intent = Intent;


})(window);