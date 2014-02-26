/**
 * Created by zonebond on 14-2-26.
 */
(function(win)
{
    function datagrid(selector)
    {
        this.init({selector: selector});
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

        var len = comps.length;
        for(var row_index = 0; row_index < len; row_index++)
        {
            var item = comps[row_index];
            var $row = $trows.clone();
            for(var col_index = 0; col_index < $thead.length; col_index++)
            {
                var field = $($thead[col_index]).attr('data-field');
                var value = item[field];
                var tdata = $tdate.clone();
                if(field == "name")
                {
                    tdata.html("<a href='javascript: alert(\"" + value + "\");'>" + value + "</a>");
                }
                else
                {
                    tdata.text(value || "XXXXX");
                }
                tdata.appendTo($row);
            }
            $row.appendTo($tbody);
        }
    };


    //attach to
    win._datagrid = {
        init: function(selector)
        {
            return new datagrid(selector);
        }
    };

})(window)
