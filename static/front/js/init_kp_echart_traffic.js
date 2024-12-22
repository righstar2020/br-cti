//----------------------------1.特征数量 list pie chart --------------------------------------
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

//----------------------------2.流量场景比例 pie chart --------------------------------------

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
// 渲染流量场景比例图表
function renderTrafficSceneChart(data) {
    var container = document.getElementById('trafficSceneTypePieChart');
    if (!container) return;
    
    var sceneChart = echarts.init(container);
    
    // 计算总数
    const sceneTotal = data.reduce((sum, item) => sum + item.value, 0);
    
    const option = {
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
        series: [{
            name: '流量场景',
            type: 'pie',
            radius: '50%',
            data: data,
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
                    const percent = ((params.value / sceneTotal) * 100).toFixed(1);
                    return `${params.name}: ${formatNumber(params.value)} (${percent}%)`;
                }
            },
            itemStyle: {
                color: function(params) {
                    const colors = ["#a1d9e8", "#7ac6e5", "#52b3e1"];
                    return colors[params.dataIndex % colors.length];
                }
            }
        }]
    };

    sceneChart.setOption(option);
}
// 渲染流量场景比例图表
renderTrafficSceneChart(trafficSceneData);


//----------------------------流量场景比例 pie end--------------------------------------

//----------------------------3.流量类型时序数据linechart --------------------------------------



var currentTimelineMode = 'hour';
var currentTrafficTimelineData = {};
//更新时序
function updateTrafficTimelineData(data){
    currentTrafficTimelineData = data;
}
// 渲染流量类型时序数据图表
function renderTrafficTimelineChart(data,mode="hour") {
    if (mode == 'hour') {
        currentTrafficTimelineData = data; //只有小时数据才更新
    }     
    if(mode != currentTimelineMode){
        return; //没有产生切换不需要重新渲染
    }
    var container = document.getElementById('trafficCtiTimelineChart');
    if (!container) return;
    
    var timelineChart = echarts.init(container);
    const colors = ["#a1d9e8", "#7ac6e5", "#52b3e1", "#2a9fd2"];
    
    // 根据模式确定x轴标签格式和间隔
    let interval = 6;
    let labelFormatter = function(value) {
        let date = new Date(value);
        switch(mode) {
            case 'day':
                interval = 4;
                return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            case 'month':
                interval = 1;
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            default: // hour
                return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        }
    };

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
            data: ['5G', 'SDN', '卫星网络', '非流量'],
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
            data: data.dates,
            axisLabel: {
                formatter: labelFormatter,
                interval: interval,
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
                data: data.fiveG,
                areaStyle: {},
                itemStyle: { color: colors[0] },
                smooth: true
            },
            {
                name: 'SDN',
                type: 'line',
                data: data.sdn,
                areaStyle: {},
                itemStyle: { color: colors[1] },
                smooth: true
            },
            {
                name: '卫星网络',
                type: 'line',
                data: data.satellite,
                areaStyle: {},
                itemStyle: { color: colors[2] },
                smooth: true
            },
            {
                name: '非流量',
                type: 'line',
                data: data.non_traffic,
                areaStyle: {},
                itemStyle: { color: colors[3] },
                smooth: true
            }
        ]
    };

    timelineChart.setOption(option);
}



// 等待DOM加载完成后再初始化图表
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表实例
    var trafficTimelineChartElement = document.getElementById('trafficCtiTimelineChart');
    if (trafficTimelineChartElement) {
        var trafficTimelineChart = echarts.init(trafficTimelineChartElement);

        // 渲染流量类型时序数据图表
        renderTrafficTimelineChart(currentTrafficTimelineData);

        // 处理数据合并的函数
        function mergeTimelineData(data, mode) {
            if (!data || !data.dates) return data;

            let mergedData = {
                dates: [],
                fiveG: [],
                sdn: [], 
                satellite: [],
                non_traffic: []
            };

            // 根据不同模式设置合并间隔
            const interval = mode === 'day' ? 24 : mode === 'month' ? 30 : 1;
            
            for (let i = 0; i < data.dates.length; i += interval) {
                // 合并日期
                mergedData.dates.push(data.dates[i]);
                
                // 合并各类型数据
                const slice = (arr) => arr.slice(i, i + interval).reduce((sum, val) => sum + val, 0);
                mergedData.fiveG.push(slice(data.fiveG));
                mergedData.sdn.push(slice(data.sdn));
                mergedData.satellite.push(slice(data.satellite));
                mergedData.non_traffic.push(slice(data.non_traffic));
            }

            return mergedData;
        }

        //切换显示模式
        window.changeTimelineMode = function(mode) {
            // 合并数据
            let mergedData = mergeTimelineData(currentTrafficTimelineData, mode);
            console.log("mergedData:",mergedData)
            currentTimelineMode = mode;
            // 渲染图表
            renderTrafficTimelineChart(mergedData, mode);
        };
    }
});
