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
    renderClientDataTable([]);
    //使用mock数据
    //renderClientDataTable(clientMockStixDataList);
});
//更新UI
function updateClientDataTableUI(clientTableData){
    if (clientTableData.length > 0){
        $('.tools-box-text-num').text(clientTableData.length);
    }
}
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
        updateClientDataTableUI(clientTableData);


    }else{
        console.log('layuiTable is not initialized');
    }
}

//定时查询服务端数据
var queryTableDataClock = null;
setIntervalQueryClientStixData()
function setIntervalQueryClientStixData(){
    if (queryTableDataClock != null){
        clearInterval(queryTableDataClock);
    }
    queryTableDataClock = setInterval(function(){
        //查询当前任务列表是
        Object.values(taskFileHashMap).forEach(function(fileHash){
            console.log("query task fileHash:",fileHash);
            queryLocalStixData(fileHash);
        });

    }, 3000);
}

function queryLocalStixData(fileHash){ 
    $.ajax({
        url: clientServerHost + '/data/get_local_stix_records',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({file_hash: fileHash}),
        success: function(response){
            if (response.code == 0){
                if (response.data!=null){
                    processLocalStixDataToTableData(response.data);
                }
            }else{
                if (response.error!=null){
                    console.log("queryLocalStixData:",response.error);
                }
            }
        },
        error:function(response){
            console.log("queryLocalStixData error:",response);
        }
    });
}
var historyStixDataList = []; //用于对比前后数据差异
//对比json字符串
function compareJsonString(oldJson,newJson){
    var oldJsonString = JSON.stringify(oldJson);
    var newJsonString = JSON.stringify(newJson);
    if (oldJsonString != newJsonString){
        return true;
    }
    return false;
}
//处理查询到的数据
function processLocalStixDataToTableData(stixDataList){
    //对比json字符串
    if (compareJsonString(historyStixDataList,stixDataList)){
        return;
    }else{
        //更新历史数据
        historyStixDataList = stixDataList;
    }
    var tableData = []; 
    // stixDataList是一个对象,需要遍历其属性
    for (var i = 0; i < stixDataList.length; i++) {
        var stixInfo = stixDataList[i];
        var data = {
            id: i+1,
            status: stixInfo.onchain ? '完成' : '处理中',
            type: stixInfo.stix_type_name,
            tags: stixInfo.stix_tags.join(';'),
            iocs: stixInfo.stix_iocs.join(';'),
            source_hash: stixInfo.file_hash,
            create_time: stixInfo.create_time.split(' ')[0],
            onchain: stixInfo.onchain ? '是' : '否'
        };
        tableData.push(data);
    }
    // 更新表格数据
    if(clientDataTableInstance) {
        clientDataTableInstance.reload({
            data: tableData
        });
    }
    //更新UI
    updateClientDataTableUI(tableData);
    return tableData;
}
