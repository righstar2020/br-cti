//----------------------------特征数量 list pie chart --------------------------------------
// 定义常见特征字段分组
var featureGroups = {
    'IP地址': ['source_ip', 'sourceIP', 'destination_ip', 'destinationIP', 'src_ip', 'dst_ip'],
    '端口': ['source_port', 'sport', 'src_port', 'destination_port', 'dst_port', 'dport', 'port_no'],
    '协议': ['protocol', 'Protocol', 'pro_no'],
    '流量特征': ['pktcount', 'packetCount', 'bytecount', 'byteCount', 'rx_bytes_ave', 'tx_bytes_ave'],
    'URL': ['url'],
    '攻击信息': ['actor_name', 'attack_technique', 'attack'],
    '标签': ['label', 'Class', 'class'],
    '行为': ['action'],
    '载荷': ['payload'],
    '时间': ['time']
};

// 初始化特征数量映射,随机生成1000-5000之间的数据
var featuresNumMap = {
    "source_ip": Math.floor(Math.random() * 4000) + 1000,
    "destination_ip": Math.floor(Math.random() * 4000) + 1000,
    "src_port": Math.floor(Math.random() * 4000) + 1000,
    "dst_port": Math.floor(Math.random() * 4000) + 1000,
    "protocol": Math.floor(Math.random() * 4000) + 1000,
    "pktcount": Math.floor(Math.random() * 4000) + 1000,
    "bytecount": Math.floor(Math.random() * 4000) + 1000,
    "rx_bytes_ave": Math.floor(Math.random() * 4000) + 1000,
    "tx_bytes_ave": Math.floor(Math.random() * 4000) + 1000,
    "url": Math.floor(Math.random() * 4000) + 1000,
    "actor_name": Math.floor(Math.random() * 4000) + 1000,
    "attack_technique": Math.floor(Math.random() * 4000) + 1000,
    "label": Math.floor(Math.random() * 4000) + 1000,
    "action": Math.floor(Math.random() * 4000) + 1000,
    "payload": Math.floor(Math.random() * 4000) + 1000,
    "time": Math.floor(Math.random() * 4000) + 1000
};

//计算每个分组的特征总数
function calculateFeatureNum(){
    var groupTotals = {};
    
    Object.entries(featureGroups).forEach(([groupName, fields]) => {
        // 计算该组所有字段的数量总和
        groupTotals[groupName] = fields.reduce((sum, field) => {
            return sum + (featuresNumMap[field] || 0);
        }, 0);
    });
    
    return groupTotals;
}

// 渲染特征类型统计图
function renderFeatureTypePieCharts() {
    var container = document.getElementById('featureTypeCharts');
    if(!container) return;
    
    container.innerHTML = '';
    
    // 添加flex布局容器样式
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'flex-start';
    container.style.gap = '4px';  // 添加间距
    
    //获取各个分组的特征总数
    const groupTotals = calculateFeatureNum();
    const colors = ["#a1d9e8", "#7ac6e5", "#52b3e1", "#2a9fd2", "#008ac3", "#006096"];
    
    Object.entries(groupTotals).forEach(([groupName, total], index) => {
        var chartDiv = document.createElement('div');
        // 设置固定宽度，考虑间距，确保每行5个
        chartDiv.style.width = 'calc(20% - 5px)';  // 20%宽度减去间距
        chartDiv.style.minHeight = '150px';
        container.appendChild(chartDiv);
        
        var chart = echarts.init(chartDiv);
        
        // 使用循环的索引来选择颜色
        const color = colors[index % colors.length];
        
        var option = {
            title: {
                text: groupName+'\n\n'+total,
                left: 'center',
                top: 'center',
                textStyle: {
                    fontSize: 10
                }
            },
            series: [{
                type: 'pie',
                radius: ['55%', '80%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'outside',
                    formatter: '{c}'
                },
                labelLine: {
                    show: true
                },
                data: [{
                    value: total,
                    name: groupName,
                    itemStyle: {
                        color: color
                    }
                }]
            }]
        };
        
        chart.setOption(option);
    });
}



//----------------------------特征数量 list pie chart end--------------------------------------

//----------------------------流量场景比例 pie chart --------------------------------------

// 数据
const trafficSceneData = [
    { name: '5G', value: 15000 },
    { name: 'SDN', value: 8000 },
    { name: '卫星网络', value: 3000 }
];
// 计算总和
const sceneTotal = trafficSceneData.reduce((sum, item) => sum + item.value, 0);
// 格式化函数
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 等待DOM加载完成后再初始化图表
document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('trafficSceneTypePieChart');
    container.style.height = '312px';
    container.style.paddingTop = '10px';
    if (container) {
        var sceneChart = echarts.init(container);
        // 配置项
        var sceneChartOption = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    const percent = ((params.value / sceneTotal) * 100).toFixed(1);
                    return `${params.seriesName} <br/>${params.name}: ${formatNumber(params.value)} (${percent}%)`;
                }
            },
            legend: {
                orient: 'vertical',
                right: 5,
                bottom: "10%"
            },
            series: [
                {
                    name: '流量场景',
                    type: 'pie',
                    radius: '50%',
                    data: trafficSceneData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        show: true,
                        top: '0',
                        formatter: function (params) {
                            const percent = ((params.value / sceneTotal) * 100).toFixed(1);
                            return `${params.name}: ${formatNumber(params.value)} (${percent}%)`;
                        }
                    },
                    itemStyle: {
                        color: function(params) {
                            const colors = ["#a1d9e8", "#7ac6e5", "#52b3e1"];
                            const index = params.dataIndex % colors.length;
                            return colors[index];
                        }
                    }
                }
            ]
        };

        // 使用刚指定的配置项和数据显示图表
        sceneChart.setOption(sceneChartOption);
    }
});

//----------------------------流量场景比例 pie end--------------------------------------

//----------------------------流量类型时序数据linechart --------------------------------------
// 生成一年的数据，单位为每小时
var generateHourlyDates = (start, count) => {
    let dates = [];
    let startDate = new Date(start);
    for (let i = 0; i < count; i++) {
        let date = new Date(startDate);
        date.setHours(startDate.getHours() + i);
        dates.push(date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0]);
    }
    return dates;
};

const start_date = '2024-01-01';
const hours_count = 365 * 24; // 一年的小时数

var hourlyDates = generateHourlyDates(start_date, hours_count);

// 生成随机数据
var generateRandomData = (count) => {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * 200));
    }
    return data;
};

var trafficHourData = {
    hourlyDates: hourlyDates,
    fiveG: generateRandomData(hours_count),
    sdn: generateRandomData(hours_count),
    satellite: generateRandomData(hours_count)
};

// 生成每天的数据
var generateDailyData = (hourlyData) => {
    const dailyData = [];
    for (let i = 0; i < hourlyData.length; i += 24) {
        dailyData.push(hourlyData.slice(i, i + 24).reduce((sum, value) => sum + value, 0));
    }
    return dailyData;
};

var trafficDailyData = {
    dailyDates: hourlyDates.filter((_, index) => index % 24 === 0).map(dateStr => dateStr.split(' ')[0]),
    fiveG: generateDailyData(trafficHourData.fiveG),
    sdn: generateDailyData(trafficHourData.sdn),
    satellite: generateDailyData(trafficHourData.satellite)
};

// 生成每月的数据
var generateMonthlyData = (dailyData) => {
    const monthlyData = [];
    for (let i = 0; i < dailyData.length; i += 30) {
        monthlyData.push(dailyData.slice(i, i + 30).reduce((sum, value) => sum + value, 0));
    }
    return monthlyData;
};

var trafficMonthData = {
    monthlyDates: trafficDailyData.dailyDates.filter((_, index) => index % 30 === 0),
    fiveG: generateMonthlyData(trafficDailyData.fiveG),
    sdn: generateMonthlyData(trafficDailyData.sdn),
    satellite: generateMonthlyData(trafficDailyData.satellite)
};

// 计算最近2天的数据(每时)
var recent2DaysData = {
    hourlyDates: hourlyDates.slice(-48),
    fiveG: trafficHourData.fiveG.slice(-48),
    sdn: trafficHourData.sdn.slice(-48),
    satellite: trafficHourData.satellite.slice(-48)
};

// 计算最近1个月的数据(每天)
var recent1MonthData = {
    dailyDates: trafficDailyData.dailyDates.slice(-30),
    fiveG: trafficDailyData.fiveG.slice(-30),
    sdn: trafficDailyData.sdn.slice(-30),
    satellite: trafficDailyData.satellite.slice(-30)
};

// 计算最近一年的数据(每月)
var recent1YearData = {
    monthlyDates: trafficMonthData.monthlyDates.slice(-12),
    fiveG: trafficMonthData.fiveG.slice(-12),
    sdn: trafficMonthData.sdn.slice(-12),
    satellite: trafficMonthData.satellite.slice(-12)
};

// 等待DOM加载完成后再初始化图表
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表实例
    var trafficTimelineChartElement = document.getElementById('trafficCtiTimelineChart');
    if (trafficTimelineChartElement) {
        var trafficTimelineChart = echarts.init(trafficTimelineChartElement);

        // 颜色数组
        const colors = ["#a1d9e8", "#7ac6e5", "#52b3e1"];

        // 配置项
        var trafficTimelineOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: ['5G', 'SDN', '卫星网络'],
                orient: 'vertical',
                right: 10,
                bottom: 50,
                icon: 'rect'
            },
            grid: {
                left: '4%',
                right: '10%',
                bottom: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: recent2DaysData.hourlyDates.map(dateStr => {
                    let date = new Date(dateStr);
                    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
                }),
                axisLabel: {
                    interval: 6,
                    rotate: 0
                }
            },
            yAxis: {
                type: 'value',
                name: '数量'
            },
            series: [
                {
                    name: '5G',
                    type: 'line',
                    data: recent2DaysData.fiveG,
                    areaStyle: {},
                    itemStyle: {
                        color: colors[0]
                    },
                    smooth: true
                },
                {
                    name: 'SDN',
                    type: 'line',
                    data: recent2DaysData.sdn,
                    areaStyle: {},
                    itemStyle: {
                        color: colors[1]
                    },
                    smooth: true
                },
                {
                    name: '卫星网络',
                    type: 'line',
                    data: recent2DaysData.satellite,
                    areaStyle: {},
                    itemStyle: {
                        color: colors[2]
                    },
                    smooth: true
                }
            ]
        };

        // 使用刚指定的配置项和数据显示图表
        trafficTimelineChart.setOption(trafficTimelineOption);

        //切换显示模式
        window.changeTimelineMode = function(mode) {
            var dateData = recent2DaysData.hourlyDates.map(dateStr => {
                let date = new Date(dateStr);
                return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
            });
            var trafficData_tmp = recent2DaysData;
            var interval = 6;
            
            if (mode === 'day') {
                dateData = recent1MonthData.dailyDates.map(dateStr => {
                    let date = new Date(dateStr);
                    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                });
                trafficData_tmp = recent1MonthData;
                interval = 4;
            }
            if (mode === 'month') {
                dateData = recent1YearData.monthlyDates.map(dateStr => {
                    let date = new Date(dateStr);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                });
                trafficData_tmp = recent1YearData;
                interval = 1;
            }
            
            trafficTimelineOption.xAxis.data = dateData;
            trafficTimelineOption.series.forEach(series => {
                series.data = series.name === '5G' ? trafficData_tmp.fiveG :
                             series.name === 'SDN' ? trafficData_tmp.sdn :
                             trafficData_tmp.satellite;
            });
            trafficTimelineOption.xAxis.axisLabel.interval = interval;
            trafficTimelineChart.setOption(trafficTimelineOption);
        };
    }
});