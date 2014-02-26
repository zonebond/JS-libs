/**
 * Created by zonebond on 14-2-25.
 */
(function(win){

    function get_numbers(s, d, nums)
    {
        var array = [];
        for(var i = 0; i < nums; i++)
        {
            array.push(Math.random() * s - d);
        }
        return array;
    }

    var components = function()
    {
        this.option = [
            {
                name: 'tomcat',
                desc: 'tomcat 6.0'
            },
            {
                name: 'apache',
                desc: 'apache server'
            },
            {
                name: 'mysql',
                desc: 'mysql 5.5'
            },
            {
                name: 'sql server',
                desc: 'sqlserver 2005'
            },
            {
                name: 'oracle',
                desc: 'oracle'
            },
            {
                name: 'hadoop',
                desc: 'hadoop'
            },
            {
                name: 'redhat',
                desc: 'redhat'
            }
        ];
    };

    var spline = function()
    {
        this.option = {
            chart: {
                type: 'spline'
            },
            title: {
                text: '',
                align: 'left',
                style: {
                    margin: '10',
                    color: '#79797d',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            tooltip: {
                valueSuffix: ' m/s'
            },
            plotOptions: {
                spline: {
                    lineWidth: 4,
                    states: {
                        hover: {
                            lineWidth: 5
                        }
                    },
                    marker: {
                        enabled: false
                    },
                    pointInterval: 3600000, // one hour
                    pointStart: Date.UTC(2009, 9, 6, 0, 0, 0)
                }
            },
            series: [{
                data: get_numbers.call(null, 10, 0.1, 20),
                color: '#a4dfdf'
            }]
            ,
            navigation: {
                menuItemStyle: {
                    fontSize: '10px'
                }
            }
        }
        this.nums = function(nums)
        {
            this.option.series[0].data = get_numbers(10, 0.1, nums);
        }
    };

    win.data_zipper = function()
    {
        var type  = arguments[0],
            title = arguments[1],
            nums  = arguments[2];

        var opt;
        switch (type)
        {
            case 'spline':
                opt = new spline();
                opt.option.title.text = title;
                opt.nums(nums);
                break;

            case 'components':
                opt = new components();
                break;

            default :
                opt = {};
                opt.option = null;
                break;
        }
        return opt.option;
    }

})(window)