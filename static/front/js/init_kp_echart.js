// 数据
const iocData = [
    { name: 'IP', value: 12200 },
    { name: '端口', value: 800 },
    { name: 'HASH', value: 1500 },
    { name: 'URL', value: 2000 },
    { name: 'CVE', value: 5020 }
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