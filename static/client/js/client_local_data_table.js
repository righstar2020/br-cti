
/*样例数据*/
var exampleAttackTypeList = ['恶意流量','恶意软件','钓鱼地址','僵尸网络','应用层攻击','开源情报'];
var exampleTagsList = ['卫星网络','SDN网络','5G网络',
                       '恶意软件','DDoS','钓鱼','僵尸网络','APT','IOT'];//tags表示涉及的攻击技术
var exampleIOCsList = ['IP','端口','流特征','HASH','URL','CVE'];//iocs表示沦陷指标
var clientDataTableInstance = null;
var clientStixDataList = [{
    "id": 1,
    "status": "处理中",//完成 or 处理中
    "type": "恶意流量",
    "tags": "DDoS;卫星网络;",
    "iocs": "IP;端口;流特征;",
    "source_hash": "15cbac",
    "create_time": "2024-11-09",
    "onchain": "是"
}];
/*mock数据*/
function mockClientStixDataList(dataNum = 100){
    var clientMockStixDataList = [];
    //默认随机生成100条数据
    for (var i = 0; i < dataNum; i++) {
        var data = {
            id: i + 1,
            status: Math.random() < 0.5 ? '处理中' : '完成',
            type: exampleAttackTypeList[Math.floor(Math.random() * exampleAttackTypeList.length)],
            tags: exampleTagsList[Math.floor(Math.random() * exampleTagsList.length)],
            iocs: exampleIOCsList[Math.floor(Math.random() * exampleIOCsList.length)],
            source_hash: Math.random().toString(36).substring(2, 15),
            create_time: new Date().toLocaleDateString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '-'),
            onchain: '是'
        }
        clientMockStixDataList.push(data);
    }
    return clientMockStixDataList;
}
var clientMockStixDataList = mockClientStixDataList();



//引入table
var layuiTable = null;
layui.use('table', function(){
    layuiTable = layui.table;    
    console.log('layuiTable is initialized');  
    //渲染表格
    renderClientDataTable(clientMockStixDataList);
});

//渲染表格
function renderClientDataTable(clientTableData){
    if (layuiTable != null){
        clientDataTableInstance = layuiTable.render({
            elem: '#client-data-table',
            cols: [[ //标题栏
                {field: 'id', title: 'ID', width: 50},
                {field: 'status', title: '状态', width: 100,align: 'center', sort: true,templet: function (d) {
                        var div = `<a class="ui small label">未知</a>`;
                        if (d.status == '处理中') {
                            div = `<a class="ui small label">处理中</a>`;
                        }
                        if (d.status == '完成') {
                            div = `<a style="background-color: #285191;color: white;" class="ui small blue label">已完成</a>`;
                        }
                        return div;
                    }
                },
                {field: 'type', title: '类型', width: 100},
                {field: 'tags', title: 'Tags', width: 100},
                {field: 'iocs', title: 'IOCs', width: 100},
                {field: 'source_hash', title: '文件源', width: 100},
                {field: 'create_time', title: '创建日期', width: 120, sort: true},
                {field: 'onchain', title: '上链', width: 80},
                {fixed: 'right', width: 100, title: '操作', align: 'center', templet: function (d) {
                    return `<a class="ui basic small blue label">查看详情</a>`;
                }}
            ]],
            data: clientTableData,
            //skin: 'line', // 表格风格
            //even: true,
            page: true, // 是否显示分页
            limits: [15],
            limit: 15 // 每页默认显示的数量
        });
        


    }else{
        console.log('layuiTable is not initialized');
    }
}

