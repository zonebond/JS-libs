/**
 * Created by zonebond on 2014/11/26.
 */

(function(win)
{
    var loading = function(will, fn)
    {

        var $node = this.find(".loading-mask");

        if($node.length == 0)
        {
            $node = this.find('.loading');
        }

        if(!$node.length)
        {
            var $dom = $("<div class='loading'></div>");
            $dom.click(function(evt)
            {
                evt.stopImmediatePropagation();
                evt.preventDefault();
            });

            var $parent = $node.parent(), css_position = $parent.css('position');
            if(css_position != "relative" && css_position != "absolute")
            {
                $parent.css('position', 'relative');
            }

            this.append($dom);

            $node = $dom;
        }

        var isDismissed = $node.hasClass('dismissed') ? true : false;

        if(typeof will == 'function')
        {
            fn = will;
            will = undefined;
        }
        will = will == undefined ? isDismissed : will;

        $node.toggleClass('dismissed', !will);

        if(will)
        {
            $node.show();
        }
        else
        {
            setTimeout(function(mask, fn)
            {
                mask.hide();
                setTimeout(function(todo)
                {
                    if(todo) todo.call(null);
                }, 200, fn);
            }, 800, $node, fn);
        }
    };

    win.$.fn.loading = loading;

    $(function()
    {
        if(win.$.fn.loading) return;

        if(win.lazy)
        {
            win.lazy.call();
        }
    });

})(window);