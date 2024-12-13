/*样例数据*/
var exampleAttackTypeList = ['恶意流量','蜜罐情报','僵尸网络','应用层攻击','开源情报'];
var exampleTrafficTypeList = ['非流量','5G','卫星网络','SDN'];
var exampleTagsList = ['卫星网络','SDN网络','5G网络',
                       '恶意软件','DDoS','钓鱼','僵尸网络','APT','IOT'];//tags表示涉及的攻击技术
var exampleIOCsList = ['IP','端口','流特征','HASH','URL','payload'];//iocs表示沦陷指标
var clientDataTableInstance = null;
var clientDataSourceTableInstance = null;
var clientStixDataList = [{
    "cti_id": "cti_001",
    "cti_hash": "15cbac", 
    "cti_name": "测试情报",
    "cti_type": 1,
    "cti_traffic_type": 2,
    "open_source": 0,
    "creator_user_id": "user123",
    "tags": ["DDoS","卫星网络"],
    "iocs": ["IP","端口","流特征"],
    "stix_data": "{}",
    "statistic_info": "{}",
    "description": "测试情报描述",
    "data_size": 1024,
    "data_hash": "15cbac",
    "raw_data_ipfs_hash": "Qm...",
    "ipfs_hash": "Qm...", 
    "need": 100,
    "value": 1000,
    "compre_value": 1200,
}];
// 情报类型int到str名称的映射
const STIX_TYPE_NAME = {
    0: "其他",
    1: "恶意流量",
    2: "蜜罐情报",
    3: "僵尸网络",
    4: "应用层攻击",
    5: "开源情报"
};
//引入table
var layuiTable = null;
layui.use('table', function(){
    layuiTable = layui.table;    
    console.log('layuiTable is initialized');  
    //渲染表格
    renderClientDataTable([]);
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
                        var color = stixStatusColorMap[d.status];
                        if (color!=null){
                            div = `<a style="background-color: ${color};color: white;" class="ui small label">${d.status}</a>`;
                        }
                        return div;
                    }
                },
                {field: 'type', title: '类型', width: 100},
                {field: 'tags', title: 'Tags', width: 100},
                {field: 'iocs', title: 'IOCs', width: 100},
                {field: 'file_hash', title: '文件Hash', width: 100},
                {field: 'source_hash', title: '文件源', width: 100},
                {field: 'create_time', title: '创建日期', width: 120, sort: true},
                {field: 'onchain', title: '上链', width: 80},
                {fixed: 'right', width: 100, title: '操作', align: 'center', templet: function (d) {
                    return `<a data-file-hash="${d.file_hash}" data-source-hash="${d.source_hash}" onclick="showStixDetail(this)" class="ui basic small blue label">查看详情</a>`;
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

    }, 100000); //100秒查询一次(默认不自动触发更新)
}
//table Tab 切换
function switchDataTableTab(element){
    var tableToolTabList = $('.client-data-bottom-box .tools-box-tab-list');
    var tableToolTabListItems = tableToolTabList.find('a');
    var select_type = $(element).data('tab');
    //清除选中状态
    tableToolTabListItems.removeClass('blue');
    //设置选中状态
    $(element).addClass('blue');
    //刷新数据
    refreshDataTable(select_type);
}
//数据table刷新
function refreshDataTable(select_type){
    //查询当前任务列表是
    Object.values(taskFileHashMap).forEach(function(fileHash){
        console.log("query task fileHash:",fileHash);
        queryLocalStixData(fileHash,select_type);
    });
}
//过滤未完成的数据
function filterStixData(stixDataList){
    var stix_status_list = ['STIX','情报'];
    return stixDataList.filter(function(stixInfo){
        return stix_status_list.includes(getStixStatus(stixInfo));
    });
}
function queryLocalStixData(fileHash,type="all"){ 
    $.ajax({
        url: clientServerHost + '/data/get_local_stix_records',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({file_hash: fileHash}),
        success: function(response){
            console.log(response);
            if (response.code == 200){
                if (response.data!=null){
                    if (type=="all"){
                        processLocalStixDataToTableData(fileHash,response.data);
                    }else{
                        processLocalStixDataToTableData(fileHash,filterStixData(response.data,type));
                    }
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
//历史数据map(用于对比数据是否变化)
var historyStixDataMap = {};
//处理查询到的数据
function processLocalStixDataToTableData(sourceHash,stixDataList){
    //排序
    stixDataList.sort(function(a,b){
        //处理字符串时间
        var a_time = new Date(a.create_time).getTime();
        var b_time = new Date(b.create_time).getTime();
        return a_time - b_time;
    });
    //初始化
    if (historyStixDataMap[sourceHash]==null||historyStixDataMap[sourceHash]==undefined){
        historyStixDataMap[sourceHash] = [];
    }
    //对比json字符串
    if (compareJson(historyStixDataMap[sourceHash],stixDataList)){
        //数据有变化
        historyStixDataMap[sourceHash] = stixDataList;
    }else{
        //数据没有变化
        return;
    }
    var tableData = [];
    
    // stixDataList是一个对象,需要遍历其属性
    for (var i = 0; i < stixDataList.length; i++) {
        var stixInfo = stixDataList[i];
        var data = {
            id: i+1,
            status: getStixStatus(stixInfo),
            type: STIX_TYPE_NAME[stixInfo.stix_type]||STIX_TYPE_NAME[0],
            tags: stixInfo.stix_tags,
            iocs: stixInfo.stix_iocs,
            source_hash: stixInfo.source_file_hash,
            file_hash: stixInfo.stix_file_hash,
            create_time: stixInfo.create_time.split(' ')[0],
            onchain: stixInfo.onchain ? '是' : '否'
        };
        tableData.push(data);
    }
    //初始化
    if (taskDataTableMap[sourceHash]==null||taskDataTableMap[sourceHash]==undefined){
        taskDataTableMap[sourceHash] = [];
    }

    //更新taskDataTableMap
    taskDataTableMap[sourceHash] = tableData;
    //更新allTaskDataTable
    var newAllTaskDataTable = [];
    Object.values(taskDataTableMap).forEach(function(tableData){
        newAllTaskDataTable = newAllTaskDataTable.concat(tableData);
    });
    allTaskDataTable = newAllTaskDataTable;

    //更新表格数据
    renderClientDataTable(allTaskDataTable)
    //更新table UI
    updateClientDataTableUI(allTaskDataTable);
    //更新header面板UI
    if (taskStatusMap[sourceHash]==null||taskStatusMap[sourceHash]==undefined){
        //初始化面板
        taskStatusMap[sourceHash]={
            "total_data_num":tableData.length,
            "processed_data_num":0,
            "processing_data_num":0
        };
        updateHeaderPanelUI(sourceHash,null,null,null);
    }else{
        //更新面板
        var total_data_num = taskStatusMap[sourceHash]["total_data_num"];
        total_data_num+=tableData.length;
        updateHeaderPanelUI(sourceHash,total_data_num,null,null);
    }
    return tableData;
}
var stixStatusList = ["STIX", "情报",  "已上链"];
var stixStatusColorMap = {
    "STIX": "#9E9E9E", // 灰色
    "情报": "#64B5F6", // 中蓝色
    "已上链": "#2196F3" // 深蓝色
};
function getStixStatus(stixInfo){
    var status = stixStatusList[0];
    if (stixInfo.stix_file_hash==""){
        status = stixStatusList[0];
    }
    if (stixInfo.cti_file_path!=null&&stixInfo.cti_file_path!=""&&stixInfo.cti_file_path!=undefined){
        status = stixStatusList[1];
    }
    if (stixInfo.onchain==true){
        status = stixStatusList[2];
    }
    return status;
}
//查看详情
function showStixDetail(element){
    var fileHash = $(element).data('file-hash');
    var sourceHash = $(element).data('source-hash');
    console.log("fileHash:",fileHash);
    console.log("sourceHash:",sourceHash);
    openParentWindow(clientServerHost+'/data/get_stix_file_content/'+sourceHash+'/'+fileHash);
}

