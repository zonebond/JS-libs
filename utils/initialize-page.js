/**
 * Created by zonebond on 14-2-26.
 */
(function()
{
    var href = location.href;
    var sear = decodeURI(location.search.substr(1));
    var maps = sear ? sear.split('&') : [];

    var parameters = {};
    for(var i = 0; i < maps.length; i++)
    {
        var key_val = maps[i].split('=');
        parameters[key_val[0]] = key_val[1];
    }

    window.getParameter = function(key)
    {
        return parameters[key];
    }

    window.openTab = function(action, params)
    {
        var param_strs = [];
        for(var key in params)
        {
            param_strs.push(key + "=" +params[key]);
        }
        action = action + "?" + encodeURI(param_strs.join("&"));

        window.open(action);
    };

})()