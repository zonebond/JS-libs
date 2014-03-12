/**
 * Created by zonebond on 14-2-26.
 */
(function(win)
{
    function isFunction( obj ) {
        return typeof obj == 'function';
    }

    function datagrid(selector)
    {
        this.init({selector: selector});
    }

    datagrid.prototype.on = function(type, handler)
    {
        if(!this.event_map)
        {
            this.event_map = {};
        }
        this.event_map[type] = handler;
    }

    datagrid.prototype.dispatchEvent = function()
    {
        if(!this.event_map)
        {
            return;
        }

        var type = arguments[0];
        var data = arguments[1];

        var event = this.event_map[type];
        if(isFunction(event))
        {
            event.call(null, data);
        }
    }

    datagrid.prototype.init = function(options)
    {
        this.selector = options['selector'];
    };

    datagrid.prototype.built = function()
    {
        var $table = $(this.selector);
        var $thead = $table.find("th");
        if($table.find("thead").length == 0)
        {
            $thead.remove();
            var $insert = $("<thead></thead>");
            $thead.appendTo($insert);
            $insert.appendTo($table);
        }
        var $tbody = $table.find("tbody");
        if($(this.selector + " tbody").length == 0)
        {
            $tbody = $("<tbody></tbody>");
            $tbody.appendTo($table);
        }

        var $trows = $("<tr></tr>");
        var $tdate = $("<td></td>");

        var comps = this.dataProvdier;
        if(!comps || comps.length == 0)
        {
            comps = [];
            return;
        }

        this.fields = [];

        var len = comps.length;
        for(var row_index = 0; row_index < len; row_index++)
        {
            var item = comps[row_index];
            var $row = $trows.clone();
            for(var col_index = 0; col_index < $thead.length; col_index++)
            {
                var $th = $($thead[col_index]);
                var field;

                if(!this.fields[col_index])
                {
                    field = $th.attr('data-field');
                    this.fields[col_index] = field;
                }
                else
                {
                    field = this.fields[col_index];
                }

                var color = $th.attr('color') || 'black';
                var value = item[field];
                var tdata = $tdate.clone();

                if(field == "name")
                {
                    $("<a >" + value + "</a>").css('color', color).appendTo(tdata);
                }
                else
                {
                    tdata.html(value || "").css('color', color);
                }
                tdata.appendTo($row);
            }
            $row.appendTo($tbody);
        }

        this.configEvent(this, $tbody);
    };

    datagrid.prototype.configEvent = function(prototype, dom)
    {
        dom.bind('click', function(event)
        {
            var $target = $(event.target);
            if($target && $target.length != 0)
            {
                var td = $target.parent('tr').length == 0 ? $target.parents('td') : $target;
                var parent_tr = td.parents('tr');
                var parent_tbody = parent_tr.parents('tbody');

                var itemData =
                {
                    $cell: td,
                    col_index: parent_tr.children().index(td),
                    row_index: parent_tbody.children().index(parent_tr)
                };
                itemData.field = prototype.fields[itemData.col_index];
                itemData.item  = prototype.dataProvdier[itemData.row_index];

                prototype.dispatchEvent('item-click', itemData);
            }
        });
    }

    //attach to
    win._datagrid = {
        init: function()
        {
            var selector = arguments[0];
            var provider = arguments[1];
            var dg = new datagrid(selector);
            if(provider)
            {
                dg.dataProvdier = provider;
                dg.built();
            }
            return dg;
        }
    };

})(window)
