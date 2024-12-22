//----------------------------IOC类型 pie --------------------------------------

// 数据
const iocData = [
    { name: 'IP', value: 12200 },
    { name: '端口', value: 800 },
    { name: 'Payload', value: 1500 },
    { name: 'URL', value: 2000 },
    { name: 'HASH', value: 5020 }
];
// 计算总和
const total = iocData.reduce((sum, item) => sum + item.value, 0);
// 格式化函数
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// 初始化图表实例
var typeChart = echarts.init(document.getElementById('typePieChart'));

// 配置项
var typeChartOption = {
    tooltip: {
        trigger: 'item',
        formatter: function (params) {
            const percent = ((params.value / total) * 100).toFixed(1);
            return `${params.seriesName} <br/>${params.name}: ${formatNumber(params.value)} (${percent}%)`;
        }
    },
    legend: {
        orient: 'vertical',
        right: 10,
        bottom: 20
    },
    series: [
        {
            name: 'IOC 类型',
            type: 'pie',
            radius: '50%',
            data: iocData,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            label: {
                show: true,
                formatter: function (params) {
                    const percent = ((params.value / total) * 100).toFixed(1);
                    return `${params.name}: ${formatNumber(params.value)} (${percent}%)`;
                }
            },
            itemStyle: {
                // 使用 visualMap 中的颜色渐变
                color: function(params) {
                    //const colors = ["#d2ecf1", "#b4deff", "#73c1ff", "#35a9ff", "#237bff", "#004bbc"];
                    const colors = ["#a1d9e8", "#7ac6e5", "#52b3e1", "#2a9fd2", "#008ac3", "#006096"];
                    const index = params.dataIndex % colors.length;
                    return colors[index];
                }
            }
        }
    ]
};

// 使用刚指定的配置项和数据显示图表
typeChart.setOption(typeChartOption);

//----------------------------IOC类型 pie end--------------------------------------

//----------------------------IOC数量时序数据linechart --------------------------------------


document.addEventListener("DOMContentLoaded", function() {  
    // 初始化图表实例
    var ctiTimelineChart = echarts.init(document.getElementById('ctiTimelineChart'));   
    // 处理数据合并的函数
    function mergeTimelineData(data, mode) {
        if (!data || !data.length) return data;

        let mergedData = [];
        // 根据不同模式设置合并间隔
        const interval = mode === 'day' ? 24 : mode === 'month' ? 30 : 1;
        
        for (let i = 0; i < data.length; i += interval) {
            let mergedItem = {
                time: data[i].time,
                malicious_traffic: 0,
                honeypot_info: 0, 
                botnet: 0,
                app_layer_attack: 0,
                open_source_info: 0,
                total: 0
            };
            
            // 合并区间内的数据
            for(let j = i; j < Math.min(i + interval, data.length); j++) {
                mergedItem.malicious_traffic += data[j].malicious_traffic;
                mergedItem.honeypot_info += data[j].honeypot_info;
                mergedItem.botnet += data[j].botnet;
                mergedItem.app_layer_attack += data[j].app_layer_attack;
                mergedItem.open_source_info += data[j].open_source_info;
                mergedItem.total += data[j].total;
            }
            mergedData.push(mergedItem);
        }

        return mergedData;
    }

    window.changeTimelineMode = function(mode) {
        // 合并数据
        let mergedData = mergeTimelineData(currentAttackTypeTimelineData, mode);
        console.log("mergedData:", mergedData);
        currentAttackTypeTimelineMode = mode;
        // 渲染图表
        renderAttackTypeTimelineChart(mergedData, mode);
    };
});



// 修改 renderIOCTypeDistributionChart 函数
function renderIOCTypeDistributionChart(data) {
    // 过滤掉 total
    const filteredData = data.filter(item => item.name !== 'total');
    
    // 计算新的总数
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);
    
    // 完整的配置项
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                const percent = ((params.value / total) * 100).toFixed(1);
                return ` ${params.name}<br/>${formatNumber(params.value)} (${percent}%)`;
            }
        },
        legend: {
            orient: 'vertical',
            right: 10,
            bottom: 20,
            data: filteredData.map(item => item.name)
        },
        series: [
            {
                name: 'IOC 类型',
                type: 'pie',
                radius: '50%',
                data: filteredData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    show: true,
                    formatter: function (params) {
                        const percent = ((params.value / total) * 100).toFixed(1);
                        return `${params.name}: ${formatNumber(params.value)}(${percent}%)`;
                    }
                },
                itemStyle: {
                    color: function(params) {
                        const colors = ["#a1d9e8", "#7ac6e5", "#52b3e1", "#2a9fd2", "#008ac3", "#006096"];
                        const index = params.dataIndex % colors.length;
                        return colors[index];
                    }
                }
            }
        ]
    };

    // 使用完整的配置项更新图表
    typeChart.setOption(option, true);
}
var currentAttackTypeTimelineMode = 'hour';
var currentAttackTypeTimelineData = {}; //保存攻击类型时序数据(小时)
function updateAttackTypeTimelineData(data){
    currentAttackTypeTimelineData = data;
}
// 修改 renderAttackTypeTimelineChart 函数
function renderAttackTypeTimelineChart(data,mode='hour') {
    if (mode == 'hour') {
        currentAttackTypeTimelineData = data; //只有小时数据才更新
    }
    if(mode != currentAttackTypeTimelineMode){
        return; //没有产生切换不需要重新渲染
    }
    // 颜色数组，调整对比度
    const colors = ["#a1d9e8", "#7ac6e5", "#52b3e1", "#2a9fd2", "#008ac3", "#006096"];
    // 完整的配置项
    const option = {
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
            data: ['恶意流量', '蜜罐信息', '僵尸网络', '应用层攻击', '开源信息', '总量'],
            orient: 'vertical',
            right: 10,
            bottom: 60
        },
        grid: {
            left: '3%',
            right: '12%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.map(item => {
                return item.time; // 使用完整的时间数据
            }),
            axisLabel: {
                formatter: function(value) {
                    console.log("value:",value)
                    console.log("mode:",mode)
                    let date = new Date(value);
                    switch(mode) {
                        case 'day':
                            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        case 'month':
                            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        default: // hour
                            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`; // 显示小时:分钟:秒
                    }
                },
                interval: mode === 'hour' ? 6 : (mode === 'day' ? 4 : 1)
            }
        },
        yAxis: {
            type: 'value',
            name: '数量'
        },
        series: [
            {
                name: '恶意流量',
                type: 'bar',
                stack: '总量',
                data: data.map(item => item.malicious_traffic),
                areaStyle: {},
                itemStyle: {
                    color: colors[0]
                }
            },
            {
                name: '蜜罐信息',
                type: 'bar',
                stack: '总量',
                data: data.map(item => item.honeypot_info),
                areaStyle: {},
                itemStyle: {
                    color: colors[1]
                }
            },
            {
                name: '僵尸网络',
                type: 'bar',
                stack: '总量',
                data: data.map(item => item.botnet),
                areaStyle: {},
                itemStyle: {
                    color: colors[2]
                }
            },
            {
                name: '应用层攻击',
                type: 'bar',
                stack: '总量',
                data: data.map(item => item.app_layer_attack),
                areaStyle: {},
                itemStyle: {
                    color: colors[3]
                }
            },
            {
                name: '开源信息',
                type: 'bar',
                stack: '总量',
                data: data.map(item => item.open_source_info),
                areaStyle: {},
                itemStyle: {
                    color: colors[4]
                }
            },
            {
                name: '总量',
                type: 'line',
                data: data.map(item => item.total),
                itemStyle: {
                    color: colors[5]
                },
                lineStyle: {
                    width: 2
                },
                symbol: 'none',
                z: 100
            }
        ]
    };
    var container = document.getElementById('ctiTimelineChart');
    if (!container) return;
    var ctiTimelineChart = echarts.init(container);
    // 使用完整的配置项更新图表
    ctiTimelineChart.setOption(option);
}