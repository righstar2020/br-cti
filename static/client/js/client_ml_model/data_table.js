/*样例数据*/
var exampleTrafficTypeList = ['卫星网络','SDN网络','5G网络','恶意软件','DDoS','钓鱼','僵尸网络','APT','IOT'];
var exampleMLTypeList = ['XGBoost','LightGBM','CatBoost','RandomForest','SVM','KNN','DecisionTree','NaiveBayes','GradientBoosting','AdaBoost'];
var exampleTrafficFeaturesList = ['dst_ip,src_ip,dst_port,src_port,proto,duration,bytes,packets','dst_ip,src_ip,dst_port,src_port,proto,duration,bytes,packets,http_host,http_method,http_uri,http_user_agent,http_referer,http_content_type,http_content_length,http_status,http_content_encoding,http_content_language,http_content_location,http_content_md5,http_content_sha1,http_content_sha256,http_content_sha512'];
var exampleTrafficModelInfo = {
    "id": 1,
    "status": "训练中",
    "traffic_type": "恶意流量",
    "features": "dst_ip,src_ip,dst_port,src_port,proto,duration,bytes,packets",
    "ml_type": "XGBoost",
    "model_hash": "15cbac",
    "source_hash": "15cbac",
    "create_time": "2024-11-09",
    "onchain": "是"
}
/*mock数据*/
function mockClientModelDataList(dataNum = 100){
    var clientMockModelDataList = [];
    //默认随机生成100条数据
    for (var i = 0; i < dataNum; i++) {
        var data = {
            id: i + 1,
            status: '完成',
            traffic_type: exampleTrafficTypeList[Math.floor(Math.random() * exampleTrafficTypeList.length)],
            features: exampleTrafficFeaturesList[Math.floor(Math.random() * exampleTrafficFeaturesList.length)],
            ml_type: exampleMLTypeList[Math.floor(Math.random() * exampleMLTypeList.length)],
            model_hash: Math.random().toString(36).substring(2, 15),
            source_hash: Math.random().toString(36).substring(2, 15),
            create_time: new Date().toLocaleDateString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '-'),
            onchain: '否'
        }
        clientMockModelDataList.push(data);
    }
    return clientMockModelDataList;
}
var clientMockModelDataList = mockClientModelDataList();



//引入table
var layuiTable = null;
layui.use('table', function(){
    layuiTable = layui.table;    
    console.log('layuiTable is initialized');  
    //渲染表格
    renderClientDataTable([]);
    //使用mock数据
    renderClientDataTable(clientMockModelDataList);
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
            elem: '#client-model-table',
            cols: [[ //标题栏
                {field: 'id', title: 'ID', width: 50},
                {field: 'status', title: '状态', width: 100,align: 'center', sort: true,templet: function (d) {
                        var div = `<a class="ui small label">未知</a>`;
                        if (d.status == '训练中') {
                            div = `<a class="ui small label">训练中</a>`;
                        }
                        if (d.status == '完成') {
                            div = `<a style="background-color: #285191;color: white;" class="ui small custom-blue label">已完成</a>`;
                        }
                        return div;
                    }
                },
                {field: 'traffic_type', title: '类型', width: 100},
                {field: 'features', title: '特征', width: 100},
                {field: 'ml_type', title: '模型框架', width: 100},
                {field: 'model_hash', title: '模型Hash', width: 100},
                {field: 'source_hash', title: '文件源', width: 100},
                {field: 'create_time', title: '创建日期', width: 120, sort: true},
                {field: 'onchain', title: '上链', width: 80},
                {fixed: 'right', width: 100, title: '操作', align: 'center', templet: function (d) {
                    return `<a data-file-hash="${d.file_hash}" data-source-hash="${d.source_hash}" onclick="showModelDetail(this)" class="ui basic small custom-blue label">查看详情</a>`;
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
setIntervalQueryClientModelData()
function setIntervalQueryClientModelData(){
    if (queryTableDataClock != null){
        clearInterval(queryTableDataClock);
    }
    queryTableDataClock = setInterval(function(){
        //查询当前任务列表是
        Object.values(taskFileHashMap).forEach(function(fileHash){
            console.log("query task fileHash:",fileHash);
            queryLocalModelData(fileHash);
        });

    }, 100000); //100秒查询一次(默认不自动触发更新)
}
//table Tab 切换
function switchDataTableTab(element){
    var tableToolTabList = $('.client-model-bottom-box .tools-box-tab-list');
    var tableToolTabListItems = tableToolTabList.find('a');
    var select_type = $(element).data('tab');
    //清除选中状态
    tableToolTabListItems.removeClass('custom-blue');
    //设置选中状态
    $(element).addClass('custom-blue');
    //刷新数据
    refreshDataTable(select_type);
}
//数据table刷新
function refreshDataTable(select_type){
    //查询当前任务列表是
    Object.values(taskFileHashMap).forEach(function(fileHash){
        console.log("query task fileHash:",fileHash);
        queryLocalModelData(fileHash);
    });
}
function queryLocalModelData(fileHash){ 
    $.ajax({
        url: clientServerHost + '/data/get_local_model_records',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({file_hash: fileHash}),
        success: function(response){
            console.log(response);
            if (response.code == 200){
                if (response.data!=null){
                    processLocalModelDataToTableData(fileHash,response.data);
                }
            }else{
                if (response.error!=null){
                    console.log("queryLocalModelData:",response.error);
                }
            }
        },
        error:function(response){
            console.log("queryLocalModelData error:",response);
        }
    });
}
//历史数据map(用于对比数据是否变化)
var historyModelDataMap = {};
//处理查询到的数据
function processLocalModelDataToTableData(sourceHash,modelDataList){
    //排序
    modelDataList.sort(function(a,b){
        //处理字符串时间
        var a_time = new Date(a.create_time).getTime();
        var b_time = new Date(b.create_time).getTime();
        return a_time - b_time;
    });
    //初始化
    if (historyModelDataMap[sourceHash]==null||historyModelDataMap[sourceHash]==undefined){
        historyModelDataMap[sourceHash] = [];
    }
    //对比json字符串
    if (compareJson(historyModelDataMap[sourceHash],modelDataList)){
        //数据有变化
        historyModelDataMap[sourceHash] = modelDataList;
    }else{
        //数据没有变化
        return;
    }
    var tableData = []; 
    // modelDataList是一个对象,需要遍历其属性
    for (var i = 0; i < modelDataList.length; i++) {
        var modelInfo = modelDataList[i];
        var data = {
            id: i+1,
            status: modelInfo.model_file_hash=="" ? '处理中' : '完成',
            type: modelInfo.model_type_name,
            tags: modelInfo.model_tags,
            iocs: modelInfo.model_iocs,
            source_hash: modelInfo.source_file_hash,
            file_hash: modelInfo.model_file_hash,
            create_time: modelInfo.create_time.split(' ')[0],
            onchain: modelInfo.onchain ? '是' : '否'
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

    // 更新表格数据
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

//查看详情
function showModelDetail(element){
    var fileHash = $(element).data('file-hash');
    var sourceHash = $(element).data('source-hash');
    console.log("fileHash:",fileHash);
    console.log("sourceHash:",sourceHash);
    openParentWindow(clientServerHost+'/data/get_model_file_content/'+sourceHash+'/'+fileHash);
}

