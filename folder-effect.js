/**
 * Created by zonebond on 2014/07/18.
 */
(function(win)
{
    $(win.document.body).ready(function()
    {
        var folders = $('.folder'), len = folders.length;
        for(var i = 0; i < len; i++)
        {
            var folder = $(folders[i]);

            folder.trigger_item = $('' +
                '<div class="folder-handler-box">' +
                '<div class="folder-handler-mask"></div>' +
                '<button class="folder-handler btn skyform"><i class="icon-arrow-up"></i> '+ $i18n.loc('search.control.btn') +'</button>' +
                '' +
                '</div>');

            folder.append($("<div class='content-chrome'></div>"));
            folder.append(folder.trigger_item);

            folder.attr('alive', '');

            folder.contentHeight = function()
            {
                var th = $(folder.children()[0]).height();

                var children = folder.children(),
                    len = children.length - 2;
                for(var i = 0; i < len; i++)
                {
                    th = Math.max($(children[i]).height(), th);
                }

                return th + "px";
            }

            function on_click_handler(evt)
            {
                var target = folder;

                if(target.queue().length)
                {
                    target.stop();
                    target.clearQueue();
                }

                var to_properties = {};
                if(target.hasClass('open'))
                {
                    //to close
                    to_properties.width = '100%';
                    to_properties.height = '0px';

                    folder.trigger_item.find('i').attr('class', 'icon-arrow-down');
                }
                else
                {
                    //to open
                    to_properties.width = '100%';
                    to_properties.height = folder.contentHeight();

                    folder.trigger_item.find('i').attr('class', 'icon-arrow-up');
                }

                target.animate(to_properties, evt ? 300 : 0);
                target.toggleClass('open');
            }

            folder.trigger_item.click(on_click_handler);

            on_click_handler(null);
        }
    });
})(window);