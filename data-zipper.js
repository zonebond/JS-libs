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

    var metrices = function()
    {
        var time = new Date();
        this.option = {
            "tid": "XXX1-000X-0001",
            "metricid": "metrics_id",
            "metricname": "metrics_name",
            "unit":"",
            "period":"",
            "metriclist":[
                {
                    time: time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds(),
                    statistic: parseInt(Math.random() * 10)
                }]
        };
    }

    var warnings = function()
    {
        this.option = [
            {
                name: '系统问题',
                level: '警告',
                desc: '系统出问题啦！',
                code: '#00010'
            },
            {
                name: '系统问题',
                level: '警告',
                desc: '系统出问题啦！',
                code: '#00010'
            },
            {
                name: '系统问题',
                level: '警告',
                desc: '系统出问题啦！',
                code: '#00010'
            },
            {
                name: '系统问题',
                level: '警告',
                desc: '系统出问题啦！',
                code: '#00010'
            },
            {
                name: '系统问题',
                level: '警告',
                desc: '系统出问题啦！',
                code: '#00010'
            },
            {
                name: '系统问题',
                level: '警告',
                desc: '系统出问题啦！',
                code: '#00010'
            },
            {
                name: '系统问题',
                level: '警告',
                desc: '系统出问题啦！',
                code: '#00010'
            }
        ];
    };

    var components = function()
    {
        this.option = [
            {
                name: 'tomcat',
                type: 'Service',
                desc: 'Apache Tomcat Application Server',
                template: 'slave',
                cpu: '2',
                memory: '512',
                network: 'network'
            },
            {
                name: 'apache',
                type: 'Service',
                desc: 'Apache HTTPD WEB service.',
                template: 'slave',
                cpu: '2',
                memory: '1024',
                network: 'network2'
            },
            {
                name: 'mysql',
                type: 'Service',
                desc: 'MySQL open source database',
                template: 'paas',
                cpu: '2',
                memory: '512',
                network: 'network2'
            },
            {
                name: 'PHP',
                type: 'Service',
                desc: 'php running',
                template: '',
                cpu: '2',
                memory: '512',
                network: 'network1'
            },
            {
                name: 'Hadoop',
                type: 'Service',
                desc: 'SkyForm Bigdata platform management node(SFHM)',
                template: '',
                cpu: '1',
                memory: '1024',
                network: 'network1'
            },
            {
                name: 'LAMP',
                type: 'Service',
                desc: 'LAMP (Linux Apache MySQL PHP) suite',
                template: '',
                cpu: '1',
                memory: '512',
                network: 'network1'
            },
            {
                name: 'RedHat',
                type: 'Compute',
                desc: 'RedHat Enterprise Linux 6.0',
                template: '',
                cpu: '1',
                memory: '4096',
                network: ''
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

            case 'warnings':
                opt = new warnings();
                break;

            case 'metrics':
                opt = new metrices();
                break;

            default :
                opt = {};
                opt.option = null;
                break;
        }
        return opt.option;
    }

})(window)