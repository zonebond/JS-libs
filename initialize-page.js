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
    };

    window.normalize = function(action, params)
    {
        var param_strs = [];
        for(var key in params)
        {
            param_strs.push(key + "=" +params[key]);
        }
        action = action + "?" + encodeURI(param_strs.join("&"));

        return action;
    };

    window.openTab = function(action, params)
    {
        action = window.normalize(action, params);
        window.open(action);
    };

    window.browserLanguage = (function()
    {
        var lang = navigator.language ? navigator.language : navigator.browserLanguage;
        var part = lang.split('-')
        var iso$ = part[0].toLowerCase() + (part[1] ? "-" + part[1].toUpperCase() : "");
        return iso$;
    })();


    //measure tools
    var indicator;
    var measureText = function(text, style)
    {
        if(!indicator)
        {
            indicator = $("<span></span>");
            indicator.css('position', 'absolute');
            indicator.css('z-index', '-9999');
            indicator.css('white-space', 'nowrap');
            indicator.css('visibility', 'hidden');
            indicator.appendTo(window.document.body);
        }
        indicator.text(text);

        return indicator.width();
    };

    window.measureText = measureText;


    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

})();