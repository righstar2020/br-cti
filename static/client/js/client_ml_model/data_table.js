/*样例数据*/
// 模型标签示例
var exampleModelTags = ['卫星网络', 'SDN网络', '5G网络', '恶意软件', 'DDoS', '钓鱼', '僵尸网络', 'APT', 'IOT'];
// 模型训练框架示例
var exampleModelFrameworks = ['Scikit-learn', 'Pytorch', 'TensorFlow'];
// 模型算法示例
var exampleModelAlgorithms = ['XGBoost', 'LightGBM', 'CatBoost', 'RandomForest', 'SVM', 'KNN', 'DecisionTree', 'NaiveBayes', 'GradientBoosting', 'AdaBoost'];
// 模型特征示例
var exampleModelFeatures = [
    ['dst_ip', 'src_ip', 'dst_port', 'src_port', 'proto', 'duration', 'bytes', 'packets'],
    ['dst_ip', 'src_ip', 'dst_port', 'src_port', 'proto', 'duration', 'bytes', 'packets', 'http_host', 'http_method', 'http_uri', 'http_user_agent', 'http_referer', 'http_content_type', 'http_content_length', 'http_status', 'http_content_encoding', 'http_content_language', 'http_content_location', 'http_content_md5', 'http_content_sha1', 'http_content_sha256', 'http_content_sha512']
];
//模型数据源
var model_data_map = {1:'数据集', 2:'文本'}; // 1:数据集, 2:文本
//模型类型
var model_type_map = {0:'未知', 1:'分类模型', 2:'回归模型', 3:'聚类模型', 4:'NLP模型'}; // 1:分类模型, 2:回归模型, 3:聚类模型, 4:NLP模型

// 示例模型信息
var exampleModelInfo = {
    "model_id": "model_001",
    "model_hash": "15cbac", 
    "model_name": "流量分类模型",
    "creator_user_id": "user_001",
    "model_data_type": 1,
    "model_type": 1,
    "model_algorithm": "XGBoost",
    "model_train_framework": "Scikit-learn",
    "model_open_source": 1,
    "model_features": ["dst_ip", "src_ip", "dst_port", "src_port", "proto", "duration", "bytes", "packets"],
    "model_tags": ["恶意流量", "DDoS"],
    "model_description": "用于检测恶意网络流量的分类模型",
    "model_size": 1024,
    "model_data_size": 10240,
    "model_data_ipfs_hash": "Qm...",
    "model_ipfs_hash": "Qm...",
    "value": 100,
    "ref_cti_id": "cti_001", 
    "create_time": "2024-11-09"
}

// 添加状态颜色映射
var modelStatusColorMap = {
    "完成": "#285191",      // 蓝色
    "训练完成": "#87CEEB",    // 浅蓝
    "评估失败": "#6c757d",  // 蓝灰色
    "训练失败": "#6c757d"   // 蓝灰色
};
//是否显示table
function showModelDataTable(show=true){
    if (show){
        $('#client-model-data-table-box').show();
    }else{
        $('#client-model-data-table-box').hide();
    }
}
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
            elem: '#client-model-data-table',
            cols: [[ //标题栏
                {field: 'id', title: 'ID', width: 50},
                {field: 'status', title: '状态', width: 100, align: 'center', sort: true, templet: function (d) {
                    var div = `<a class="ui small label">未知</a>`;
                    var color = modelStatusColorMap[d.status];
                    if (color != null) {
                        div = `<a style="background-color: ${color};color: white;" class="ui small label">${d.status}</a>`;
                    }
                    return div;
                }},
                {field: 'request_id', title: '请求ID', width: 100},
                {field: 'create_time', title: '创建日期', width: 180, sort: true},
                {field: 'model_type', title: '模型类型', width: 100},
                {field: 'model_algorithm', title: '算法', width: 100}, 
                {field: 'model_framework', title: '框架', width: 100},
                {field: 'model_name', title: '模型名称', width: 100},
                {field: 'test_size', title: '测试集比例', width: 100},
                {field: 'training_time', title: '训练时间', width: 100},
                {field: 'model_hash', title: '模型Hash', width: 100},
                {field: 'source_hash', title: '文件源', width: 100},
                {field: 'feature_count', title: '特征数', width: 100},
                {field: 'rows_count', title: '样本数', width: 100},
                {field: 'model_size', title: '模型大小', width: 100},
                {field: 'onchain', title: '上链', width: 80},
                {fixed: 'right', width: 100, title: '操作', align: 'center', templet: function (d) {
                    return `<a data-model-hash="${d.model_hash}" data-source-hash="${d.source_hash}" onclick="showModelDetail(this)" class="ui basic small custom-blue label">查看详情</a>`;
                }}
            ]],
            data: clientTableData,
            page: true,
            limits: [15],
            limit: 15
        });
    } else {
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
            queryLocalModelRecords(fileHash);
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
    refreshModelRecordDataTable(select_type);
}
//数据table刷新
function refreshModelRecordDataTable(select_type){
    //查询当前任务列表是
    Object.values(taskFileHashMap).forEach(function(fileHash){
        queryLocalModelRecords(fileHash);
    });
}
function queryLocalModelRecords(fileHash){ 
   getModelRecordListByHash(fileHash).then(function(data){
        processLocalModelDataToTableData(fileHash,data);
   }).catch(function(error){
        layer.msg(error,{'time':1200});
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
    for (var i = 0; i < modelDataList.length; i++) {
        var modelInfo = modelDataList[i];
        var data = {
            id: i+1,
            status: modelInfo.status == 'train_failed' ? '训练失败' : 
                    modelInfo.status == 'train_success' ? '训练完成' :
                    modelInfo.status == 'evaluate_failed' ? '评估失败' : '完成',
            request_id: modelInfo.request_id || '无',
            model_type: model_type_map[modelInfo.model_info.model_type] || '无',
            model_algorithm: modelInfo.model_info.model_algorithm || '无',
            model_framework: modelInfo.model_info.model_framework || '无', 
            model_features: (modelInfo.model_info.features || []).join(',') || '无',
            model_name: modelInfo.model_info.model_name || '无',
            test_size: modelInfo.model_info.test_size || '无',
            training_time: modelInfo.model_info.training_time || '无',
            model_hash: modelInfo.model_info.model_hash || '无',
            source_hash: modelInfo.source_file_hash || '无',
            create_time: modelInfo.created_time || '无',
            onchain: modelInfo.onchain ? '是' : '否',
            request_id: modelInfo.request_id || '无',
            feature_count: modelInfo.model_info.feature_count || '无',
            rows_count: modelInfo.model_info.rows_count || '无',
            model_size: formatSize(modelInfo.model_info.model_size) || '无'
        };
        tableData.push(data);
    }
    //初始化
    if (taskDataTableMap[sourceHash]==null||taskDataTableMap[sourceHash]==undefined){
        taskDataTableMap[sourceHash] = [];
    }
    //反序
    tableData.reverse();
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
    var modelHash = $(element).data('model-hash');
    var sourceHash = $(element).data('source-hash');
    console.log("modelHash:",modelHash);
    console.log("sourceHash:",sourceHash);
    openParentWindow(clientServerHost+'/ml/get_model_file_content/'+sourceHash+'/'+modelHash);
}
