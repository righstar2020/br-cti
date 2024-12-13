var clientServerHost = localStorage.getItem("clientServerHost");
if (clientServerHost == null) {
	clientServerHost = "http://127.0.0.1:5000";
}
/*-------------------全局变量------------------------*/
var taskFileIds = []; //上传文件id列表
var taskFileHashMap = {}; //上传文件hash映射表
//任务完成状态映射表(key:source_file_hash)
var taskFinishStepStatusMap = {
    "bc566bc":{
        "0":false, //文件上传
        "1":false, //STIX转换
        "2":false, //CTI转换
        "3":false, //CTI上链
    }
}; 
//包含历史任务(key:source_file_hash)
var taskStatusMap = {
    "bc566bc":{
        "total_data_num":0,//历史所有数据
        "processing_data_num":0,//当前处理中数据
        "processed_data_num":0,//当前处理完成数据
    }
};
//头部面板数据
var clientHeaderPanelData = {
    onchainCtiDataNum:0, //链上所有的情报数据
    ownCtiDataNum:0, //拥有的数据(购买+上传 情报数据)
    ownOnchainCtiDataNum:0, //我上链情报数据
    localCtiDataNum:0, //本地情报数据(stix数据),包括历史的
    localProcessedCtiDataNum:0, //本地处理完成情报数据
    localProcessingCtiDataNum:0, //本地处理中情报数据
}
//dataTable映射表(key:文件hash)
var taskDataTableMap = {
    "bc566bc":[]
};
var allTaskDataTable = [];
/*-------------------面板UI更新------------------------*/
//upsertTaskStatusMap
function upsertTaskStatusMap(taskId,total_data_num,processed_data_num,processing_data_num){
    if (taskStatusMap[taskId]==null||taskStatusMap[taskId]==undefined){
        taskStatusMap[taskId] = {
            "total_data_num":total_data_num==null?0:total_data_num,
            "processed_data_num":processed_data_num==null?0:processed_data_num,
            "processing_data_num":processing_data_num==null?0:processing_data_num
        };
    }else{
        if(total_data_num != null){
            taskStatusMap[taskId]["total_data_num"] = total_data_num;
        }
        if(processed_data_num != null){
            taskStatusMap[taskId]["processed_data_num"] = processed_data_num;
        }
        if(processing_data_num != null){
            taskStatusMap[taskId]["processing_data_num"] = processing_data_num;
        }
    }
}
//更新header面板UI
function updateHeaderPanelUI(taskId,total_data_num,processed_data_num,processing_data_num){
    var total_local_cti_data_num = 0;
    var total_processing_task_num = 0;
    var total_processed_task_num = 0;
    if(taskId != null){
        if(total_data_num != null){
            taskStatusMap[taskId]["total_data_num"] = total_data_num;
        }
        if(processed_data_num != null){
            taskStatusMap[taskId]["processed_data_num"] = processed_data_num;
        }
        if(processing_data_num != null){
            taskStatusMap[taskId]["processing_data_num"] = processing_data_num;
        }
    }
    Object.values(taskStatusMap).forEach(function(task_status){
        if(task_status["total_data_num"] != null){
            total_local_cti_data_num += task_status["total_data_num"];
        }
        if(task_status["processing_data_num"] != null){
            total_processing_task_num += task_status["processing_data_num"];
        }
        if(task_status["processed_data_num"] != null){
            total_processed_task_num += task_status["processed_data_num"];
        }
        
    });
    clientHeaderPanelData.localCtiDataNum = total_local_cti_data_num;
    clientHeaderPanelData.localProcessedCtiDataNum = total_processed_task_num;
    clientHeaderPanelData.localProcessingCtiDataNum = total_processing_task_num;
    //更新用户本地任务面板数据
    updateUserLocalTaskStatisticsUI();
    //更新用户链上面板数据
    updateUserOnchainCtiStatisticsUI();
}
//更新用户本地任务面板数据
function updateUserLocalTaskStatisticsUI(){
    local_data_list_box = $(`.client-data-header-right-box`);
    //本地情报数据
    local_data_item_list = local_data_list_box.find('.cti-data-item');
    let item_num_list = $(local_data_list_box).find('.local-data-info-num');
    $(item_num_list[0]).text(formatNumString(clientHeaderPanelData.localCtiDataNum));
    $(item_num_list[1]).text(formatNumString(clientHeaderPanelData.localProcessedCtiDataNum));
    $(item_num_list[2]).text(formatNumString(clientHeaderPanelData.localProcessingCtiDataNum));
}
//启动时更新一次

//更新用户链上面板数据
updateUserOnchainCtiStatisticsUI()
function updateUserOnchainCtiStatisticsUI(){
    onchain_data_list_box = $(`.client-data-header-left-box`);
    //链上情报数据
    onchain_data_item_list = onchain_data_list_box.find('.cti-data-item');
    console.log(onchain_data_item_list);
    if(onchain_data_item_list.length > 0){
        getUserOnchainCtiStatistics().then(function(data){  
            clientHeaderPanelData.onchainCtiDataNum = data.totalCTICount;
            clientHeaderPanelData.ownCtiDataNum = data.userCTICount;
            clientHeaderPanelData.ownOnchainCtiDataNum = data.userUploadCount;
            $(onchain_data_item_list[0]).find('.data-item-num').text(formatNumString(clientHeaderPanelData.onchainCtiDataNum));
            $(onchain_data_item_list[1]).find('.data-item-num').text(formatNumString(clientHeaderPanelData.ownOnchainCtiDataNum));
            $(onchain_data_item_list[2]).find('.data-item-num').text(formatNumString(clientHeaderPanelData.ownCtiDataNum));
        });
    }
}
//获取用户链上CTI数据
function getUserOnchainCtiStatistics(){
    //获取用户ID
    return new Promise(function(resolve, reject){
        var walletId = localStorage.getItem("userWalletId");
        if(walletId == null||walletId == undefined){
            console.error("user wallet id is null");
            reject("user wallet id is null");
        }
        getUserCTIStatistics(walletId).then(function(data){
            console.log("user onchain cti data:",data);
            resolve(data);
        });
    });
}
/*-------------------面板UI更新 end------------------------*/
/*------------------step步骤函数------------------------*/
var currentStep = 0;
var stepStatusUpdateList=[1,1,1,1] //步骤是否有更新
var processStepTitleList = ["文件上传","STIX转换","CTI转换","数据上链"];
//上一步
function prevStep(){
    if(currentStep <= 0){
        return;
    }
    currentStep--;
    updateStep(currentStep);
}
//下一步
function nextStep(){
    if(currentStep >= processStepTitleList.length-1){
        return;
    }
        
    currentStep++;
    updateStep(currentStep);
}
//update step status
function updateStepStatus(step=0){
    for(var i=0;i<stepStatusUpdateList.length;i++){
        stepStatusUpdateList[i] = 1; //全部更新
    }
    stepStatusUpdateList[step] = 1;
   
}
var development_mode = true;
//激活下一步按钮
function updateNextStepButton(step) {
    // 检查当前步骤是否完成
    let currentTaskFinished = false; //development
    if(development_mode){
        currentTaskFinished = true;
    }
        
    Object.keys(taskFinishStepStatusMap).forEach(function(hash) {
        if(taskFinishStepStatusMap[hash][step] === true) {
            currentTaskFinished = true;
        }
    });
    
    // 更新下一步按钮状态
    const nextStepBtn = $('.next-step-btn');
    if(currentTaskFinished) {
        nextStepBtn.removeClass('disabled');
        nextStepBtn.addClass('active');
        nextStepBtn.addClass('blue');
    } else {
        nextStepBtn.addClass('disabled');
        nextStepBtn.removeClass('active');
        nextStepBtn.removeClass('blue');
    }
    //到达最后一步
    if(step >= processStepTitleList.length-1){
        nextStepBtn.text("完成");
    }else{
        nextStepBtn.text("下一步");
    }
}

//更新stepBar
function updateStep(step) {
    //隐藏所有step
    $(`.client-data-process-step-box`).removeClass('process-step-active');
    $(`.client-data-process-step-box`).hide();
    
    //显示当前step
    $(`.client-data-process-step-box[data-step="${step}"]`).show();
    $(`.client-data-process-step-box[data-step="${step}"]`).addClass('process-step-active');
    
    $(`.client-data-process-step-toolbar .client-data-process-step-title`).text(processStepTitleList[step]);
    if(step > 0){
        $(`.client-data-process-step-toolbar .client-data-process-step-prev i`).removeClass('bars icon');
        $(`.client-data-process-step-toolbar .client-data-process-step-prev i`).addClass('left arrow icon');
        
    }else{
         $(`.client-data-process-step-toolbar .client-data-process-step-prev i`).removeClass('left arrow icon');
         $(`.client-data-process-step-toolbar .client-data-process-step-prev i`).addClass('bars icon');
    }
    //判断所在步骤并初始化
    if(step == 1){
        //stix数据转换
        if(stepStatusUpdateList[step] == 1){
            initStepProcessStixData();
            stepStatusUpdateList[step] = 0;
        }
    }
    if(step == 2){
        //cti数据转换
        if(stepStatusUpdateList[step] == 1){
            initStepProcessCtiData();
            stepStatusUpdateList[step] = 0;
        }
    }
    if(step == 3){
        //cti数据上链
        if(stepStatusUpdateList[step] == 1){
            initStepCtiDataUpchain();
            stepStatusUpdateList[step] = 0;
        }
    }
    //更新下一步按钮状态
    updateNextStepButton(step.toString());
}
//任务状态更新
function updateTaskFinishStepStatus(taskFileHash,step="0",status=false){
    if(taskFinishStepStatusMap[taskFileHash] == null || taskFinishStepStatusMap[taskFileHash] == undefined){
        taskFinishStepStatusMap[taskFileHash] = {};
    }
    console.log("taskFinishStepStatusMap[taskFileHash]:",taskFinishStepStatusMap[taskFileHash]);
    taskFinishStepStatusMap[taskFileHash][step] = status;
    //更新下一步按钮状态
    updateNextStepButton(step);
}
/*------------------step步骤函数 end------------------------*/
/*------------------工具函数------------------------*/
function formatNumString(num){
    //超过1K用K表示
    if(num > 1000){
        return (num/1000).toFixed(0) + 'K';
    }
    //超过1M用M表示
    if(num > 1000000){
        return (num/1000000).toFixed(0) + 'M';
    }
    return num;
}

//截断文本
function truncateText(text, maxLength,endLength) {
    if (endLength == null) {
        endLength = 6;
    }
    if(text.length <= maxLength){
        return text;
    }
    if(maxLength>(text.length-endLength)){
        maxLength = text.length-endLength;
    }
    return text.length > maxLength ? text.substring(0, maxLength) + '...' + text.substring(text.length - endLength) : text;
}
function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 深度比较两个值
function deepCompare(oldValue, newValue) {
    // 处理基本类型比较
    if (oldValue === newValue) return false;
    if (typeof oldValue !== typeof newValue) return true;
    if (typeof oldValue !== 'object') return true;
    if (!oldValue || !newValue) return true;
    
    // 处理数组
    if (Array.isArray(oldValue)) {
        //先排序再比较
        if (!Array.isArray(newValue) || oldValue.length !== newValue.length) return true;
        return oldValue.some((val, index) => deepCompare(val, newValue[index]));
    }
    
    // 处理对象
    const oldKeys = Object.keys(oldValue);
    const newKeys = Object.keys(newValue);
    if (oldKeys.length !== newKeys.length) return true;
    
    return oldKeys.some(key => !newValue.hasOwnProperty(key) || deepCompare(oldValue[key], newValue[key]));
}

// 对比json对象
function compareJson(oldJson, newJson) {
    if (deepCompare(oldJson, newJson)) {
        console.log("检测到数据变化");
        console.log("oldJson:", oldJson);
        console.log("newJson:", newJson);
        return true;
    }
    return false;
}

/*------------------工具函数 end------------------------*/













