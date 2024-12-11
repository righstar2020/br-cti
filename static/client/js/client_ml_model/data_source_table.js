/*样例数据*/
var exampleAttackTypeList = ['恶意流量','蜜罐情报','僵尸网络','应用层攻击','开源情报'];
var exampleTrafficTypeList = ['非流量','5G','卫星网络','SDN'];
var exampleTagsList = ['卫星网络','SDN网络','5G网络',
                       '恶意软件','DDoS','钓鱼','僵尸网络','APT','IOT'];//tags表示涉及的攻击技术
var exampleIOCsList = ['IP','端口','流特征','HASH','URL','payload'];//iocs表示沦陷指标
var exampleTrainDataSourceTypeList = ['数据集','文本'];
var clientDataSourceTableInstance = null;
var clientDataSourceDataList = [{
    "cti_id": "cti_001",
    "cti_hash": "15cbac", 
    "cti_name": "测试情报",
    "cti_type": 1,
    "cti_traffic_type": 2,
    "open_source": 0,
    "creator_user_id": "user123",
    "tags": ["DDoS","卫星网络"],
    "iocs": ["IP","端口","流特征"],
    "dataSource_data": "{}",
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
//是否显示table
function showDataSourceTable(show=true){
    console.log("showDataSourceTable:",show);
    if (show){
        $('#client-model-data-source-table-box').show();
    }else{
        $('#client-model-data-source-table-box').hide();
    }
}


//引入table
var layuiTable = null;
layui.use('table', function(){
    layuiTable = layui.table;    
    console.log('layuiTable is initialized');  
    // //渲染表格
    // renderClientDataSourceTable([]);
});

//更新UI
function updateClientDataSourceTableUI(clientTableData){
    if (clientTableData.length > 0){
        $('.client-model-data-source-table .data-source-text-box .tools-box-text-num').text(clientTableData.length);
    }
}

//渲染表格
function renderClientDataSourceTable(clientTableData){
    if (layuiTable != null){
        clientDataSourceTableInstance = layuiTable.render({
            elem: '#client-model-data-source-table',
            cols: [[ //标题栏
                {field: 'id', title: 'ID', width: 50},
                {field: 'status', title: '状态', width: 100,align: 'center', sort: true,templet: function (d) {
                        var div = `<a class="ui small label">未知</a>`;
                        var color = dataSourceStatusColorMap[d.status];
                        if (color!=null){
                            div = `<a style="background-color: ${color};color: white;" class="ui small label">${d.status}</a>`;
                        }
                        return div;
                    }
                },
                {field: 'type', title: '类型', width: 100},
                {field: 'tags', title: 'Tags', width: 100},
                {field: 'creator', title: '创建者', width: 100},
                {field: 'source_file_hash', title: 'Hash', width: 100},
                {field: 'file_size', title: '文件大小', width: 100},
                {field: 'ipfs_hash', title: 'IPFS地址', width: 100},
                {field: 'create_time', title: '创建日期', width: 120, sort: true},
                {field: 'onchain', title: '上链', width: 80},
                {fixed: 'right', width: 160, title: '操作', align: 'center', templet: function (d) {
                    var div = `<a data-ipfs-hash="${d.ipfs_hash}" data-source-hash="${d.source_file_hash}" onclick="selectTrainDataSource(this)" class="ui small custom-blue label">开始训练</a>`;
                    div+=`<a data-ipfs-hash="${d.ipfs_hash}" data-source-hash="${d.source_file_hash}" onclick="showDataSourceDetail(this)" class="ui small custom-blue label">查看文件</a>`;
                    return div;
                }}
            ]],
            data: clientTableData,
            page: true,
            limits: [15],
            limit: 15
        });

    }else{
        console.log('layuiTable is not initialized');
    }
}

//定时查询服务端数据
var queryTableDataClock = null;
//初始化
queryLocalDataSourceData();
setIntervalQueryClientDataSourceData()
function setIntervalQueryClientDataSourceData(){
    if (queryTableDataClock != null){
        clearInterval(queryTableDataClock);
    }
    queryTableDataClock = setInterval(function(){    
        queryLocalDataSourceData();

    }, 100000); //100秒查询一次(默认不自动触发更新)
}

//table Tab 切换
function switchDataSourceTableTab(element){
    var tableToolTabList = $('.client-model-data-source-table .data-source-tab-list');
    var tableToolTabListItems = tableToolTabList.find('a');
    var select_type = $(element).data('model-tab');
    //清除选中状态
    tableToolTabListItems.removeClass('custom-blue');
    //设置选中状态
    $(element).addClass('custom-blue');
    //刷新数据
    refreshDataTable(select_type);
}

//数据table刷新
function refreshDataTable(select_type){
    queryLocalDataSourceData(select_type);   
}

//过滤数据
function filterDataSourceData(dataSourceDataList,type="all"){
    if (type=="all"){
        return dataSourceDataList.upload_cti_infos.concat(dataSourceDataList.purchase_cti_infos);
    }
    return dataSourceDataList.purchase_cti_infos;
    
}

function queryLocalDataSourceData(type="all"){
    var walletId = localStorage.getItem('userWalletId');
    if (walletId==null){
        layer.msg('用户钱包ID不存在,请先登录钱包!',{'time':1000});
        return;
    }
    //数据查询中
    showDataSourceLoading(true);
    queryUserOwnedCTIData(walletId).then(function(data){
        console.log("User owned CTI data:", data);
        processLocalDataSourceDataToTableData(filterDataSourceData(data,type));
        //数据查询完成
        showDataSourceLoading(false);
    }).catch(function(error){
        console.error("Failed to query user owned CTI data:", error);
        //数据查询失败
        showDataSourceLoading(false);
    });
}

//历史数据map(用于对比数据是否变化)
var historyDataSourceDataList = {};

//处理查询到的数据
function processLocalDataSourceDataToTableData(dataSourceDataList){
    //排序
    dataSourceDataList.sort(function(a,b){
        //处理字符串时间
        var a_time = new Date(a.create_time).getTime();
        var b_time = new Date(b.create_time).getTime();
        return a_time - b_time;
    });
    //初始化
    if (historyDataSourceDataList==null||historyDataSourceDataList==undefined){
        historyDataSourceDataList = [];
    }
    //对比json字符串
    if (compareJson(historyDataSourceDataList,dataSourceDataList)){
        //数据有变化
        historyDataSourceDataList = dataSourceDataList;
    }else{
        //数据没有变化
        return;
    }
    var tableData = [];
    
    // dataSourceDataList是一个对象,需要遍历其属性
    for (var i = 0; i < dataSourceDataList.length; i++) {
        var dataSourceInfo = dataSourceDataList[i];
        var data = {
            id: i+1,
            status: getDataSourceStatus(dataSourceInfo),
            type: dataSourceInfo.cti_name,
            tags: dataSourceInfo.tags,
            creator: dataSourceInfo.creator_user_id,
            ipfs_hash: dataSourceInfo.data_source_ipfs_hash,
            source_file_hash: dataSourceInfo.data_source_hash,
            file_size: formatSize(dataSourceInfo.data_size), //string
            create_time: dataSourceInfo.create_time.split(' ')[0],
            onchain: dataSourceInfo.open_source ? '是' : '否'
        };
        tableData.push(data);
    }
    allTaskDataTable = tableData

    //更新表格数据
    renderClientDataSourceTable(allTaskDataTable)
    //更新table UI
    updateClientDataSourceTableUI(allTaskDataTable);
    return tableData;
}
var dataSourceStatusList = ["已上链", "已购买"];
var dataSourceStatusColorMap = {
    "已上链": "#05375d", // 深蓝
    "已购买": "#409bd3" // 中蓝
};

function getDataSourceStatus(dataSourceInfo){
    if (!dataSourceInfo) {
        return '';
    }
    var wallet_id = localStorage.getItem('userWalletId');
    var status = dataSourceStatusList[0];
    if (dataSourceInfo.creator_user_id!=wallet_id){
        status = dataSourceStatusList[1];
    }
    return status;
}

//查看详情
function showDataSourceDetail(element){
    var fileHash = $(element).data('file-hash');
    var sourceHash = $(element).data('source-hash');
    console.log("fileHash:",fileHash);
    console.log("sourceHash:",sourceHash);
}

//开始训练(选择数据源)
function selectTrainDataSource(element){
    var ipfsHash = $(element).data('ipfs-hash');
    var sourceFileHash = $(element).data('source-hash');
    console.log("sourceFileHash:",sourceFileHash);
    console.log("ipfsHash:",ipfsHash);
    downloadDatasetFromIPFS(sourceFileHash,ipfsHash).then(function(data){
        console.log("下载数据集响应:", data);
        if(data.file_info!=null) {
            const fileInfo = data.file_info;
            var fileId = createDownloadProgressUI(sourceFileHash,fileInfo.file_name,fileInfo.file_size);
            taskFileHashMap[fileId] = sourceFileHash;
            pollingDownloadProgress(fileId,sourceFileHash,ipfsHash);
        }
    }).catch(function(error){
        layer.msg('下载数据集失败!',{'time':1000});
    });
}
var IntervalIdMap = {};
//轮询下载进度
function pollingDownloadProgress(fileId,dataSourceHash,ipfsHash){
    if (IntervalIdMap[fileId]!=null){
        clearInterval(IntervalIdMap[fileId]);
    }
    IntervalIdMap[fileId] = setInterval(function(){
        getDownloadProgress(dataSourceHash,ipfsHash).then(function(data){
            console.log("获取下载进度响应:", data);
            updateDownloadProgressUI(fileId,dataSourceHash,data.progress);
        }).catch(function(error){
            console.error("获取下载进度失败:", error);
        });

    },1000);
}
//创建UI
function createDownloadProgressUI(dataSourceHash,fileName,fileSize){
    layer.msg('开始下载训练数据...',{'time':1000});
    var downloadFileInfo = {
        name: fileName,
        size: fileSize,
        hash: dataSourceHash
    }
    var fileId = addFileUploadItem(downloadFileInfo);
    return fileId;
}
//更新UI
function updateDownloadProgressUI(fileId,dataSourceHash,progress){
    if(progress >= 100){
        //下载完成,清除定时器
        clearInterval(IntervalIdMap[fileId]);
        //更新任务状态
        updateTaskFinishStepStatus(dataSourceHash,"0",true);
        //提示下载完成
        layer.msg('训练数据下载完成!',{'time':1000});
    }
    updateProgress(fileId, progress);
}
//数据查询中
function showDataSourceLoading(show=true){
    console.log("showDataSourceLoading:",show);
    if (show){
        $('#client-model-data-source-table').hide();
        $('.data-source-loading').show();
       $('[lay-id="client-model-data-source-table"]').hide();
    }else{
        $('.data-source-loading').hide();
        $('#client-model-data-source-table').show();
        $('[lay-id="client-model-data-source-table"]').show();
    }
}

//-----------------------------------------------窗口操作-----------------------------------------------
//查看详情
function showDataSourceDetail(element){
    var ipfsHash = $(element).data('ipfs-hash');
    console.log("ipfsHash:",ipfsHash);
    window.open(ipfsServerHost+'/ipfs/'+ipfsHash, '_blank');
}
