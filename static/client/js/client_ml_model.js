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
        "1":false, //模型转换
        "2":false, //模型上链
    }
}; 
//包含历史任务(key:source_file_hash)
var taskStatusMap = {
    "bc566bc":{
        "total_model_num":0,//历史所有模型
        "processing_model_num":0,//当前处理中模型
        "processed_model_num":0,//当前处理完成模型
    }
};
//头部面板模型
var clientHeaderPanelData = {
    onchainModelDataNum:10000, //链上所有的情报模型
    ownModelDataNum:0, //拥有的模型(购买+上传 情报模型)
    ownOnchainModelDataNum:0, //我上链情报模型
    localModelDataNum:0, //本地情报模型(model模型),包括历史的
    localProcessedModelDataNum:0, //本地处理完成情报模型
    localProcessingModelDataNum:0, //本地处理中情报模型
}
//modelTable映射表(key:文件hash)
var taskDataTableMap = {
    "bc566bc":[]
};
var allTaskDataTable = [];
/*-------------------面板UI更新------------------------*/
//upsertTaskStatusMap
function upsertTaskStatusMap(taskId,total_model_num,processed_model_num,processing_model_num){
    if (taskStatusMap[taskId]==null||taskStatusMap[taskId]==undefined){
        taskStatusMap[taskId] = {
            "total_model_num":total_model_num==null?0:total_model_num,
            "processed_model_num":processed_model_num==null?0:processed_model_num,
            "processing_model_num":processing_model_num==null?0:processing_model_num
        };
    }else{
        if(total_model_num != null){
            taskStatusMap[taskId]["total_model_num"] = total_model_num;
        }
        if(processed_model_num != null){
            taskStatusMap[taskId]["processed_model_num"] = processed_model_num;
        }
        if(processing_model_num != null){
            taskStatusMap[taskId]["processing_model_num"] = processing_model_num;
        }
    }
}
//更新header面板UI
function updateHeaderPanelUI(taskId,total_model_num,processed_model_num,processing_model_num){
    var total_local_model_model_num = 0;
    var total_processing_task_num = 0;
    var total_processed_task_num = 0;
    if(taskId != null){
        if(total_model_num != null){
            taskStatusMap[taskId]["total_model_num"] = total_model_num;
        }
        if(processed_model_num != null){
            taskStatusMap[taskId]["processed_model_num"] = processed_model_num;
        }
        if(processing_model_num != null){
            taskStatusMap[taskId]["processing_model_num"] = processing_model_num;
        }
    }
    Object.values(taskStatusMap).forEach(function(task_status){
        if(task_status["total_model_num"] != null){
            total_local_model_model_num += task_status["total_model_num"];
        }
        if(task_status["processing_model_num"] != null){
            total_processing_task_num += task_status["processing_model_num"];
        }
        if(task_status["processed_model_num"] != null){
            total_processed_task_num += task_status["processed_model_num"];
        }
        
    });
    onchain_model_list_box = $(`.client-model-header-left-box`);
    local_model_list_box = $(`.client-model-header-right-box`);
    //链上情报模型
    onchain_model_item_list = onchain_model_list_box.find('.model-model-item');
    console.log(onchain_model_item_list);
    if(onchain_model_item_list.length > 0){
        $(onchain_model_item_list[0]).find('.model-item-num').text(formatNumString(clientHeaderPanelData.onchainModelDataNum));
        $(onchain_model_item_list[1]).find('.model-item-num').text(formatNumString(clientHeaderPanelData.ownModelDataNum));
        $(onchain_model_item_list[2]).find('.model-item-num').text(formatNumString(clientHeaderPanelData.ownOnchainModelDataNum));
    }
    //本地情报模型
    local_model_item_list = local_model_list_box.find('.model-model-item');
    console.log(local_model_item_list);
    let item_num_list = $(local_model_list_box).find('.local-model-info-num');
    $(item_num_list[0]).text(formatNumString(total_local_model_model_num));
    $(item_num_list[1]).text(formatNumString(total_processed_task_num));
    $(item_num_list[2]).text(formatNumString(total_processing_task_num));

}
/*-------------------面板UI更新 end------------------------*/
/*------------------step步骤函数------------------------*/
var currentStep = 1;
var stepInitStatusList=[0,0,0,0] //步骤UI初始化
var processStepTitleList = ["数据集上传","重新上传","模型训练","模型测试","模型上链"];
//上一步
function prevStep(){
    if(currentStep <= 1){
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
//更新stepBar
function updateStep(step){
    console.log("step:",step);
     //隐藏所有step
     $(`.client-model-process-step-box`).removeClass('process-step-active');
     $(`.client-model-process-step-box`).hide();
     //显示当前step
     console.log($(`.client-model-process-step-box[data-step="${step}"]`));
     $(`.client-model-process-step-box[data-step="${step}"]`).show();
     $(`.client-model-process-step-box[data-step="${step}"]`).addClass('process-step-active');
     $(`.client-model-process-step-toolbar .client-model-process-step-prev-title`).text(processStepTitleList[step-1]);
     if(step > 1){
        $(`.client-model-process-step-toolbar .client-model-process-step-prev i`).removeClass('bars icon');
        $(`.client-model-process-step-toolbar .client-model-process-step-prev i`).addClass('left arrow icon');
        
    }else{
         $(`.client-model-process-step-toolbar .client-model-process-step-prev i`).removeClass('left arrow icon');
         $(`.client-model-process-step-toolbar .client-model-process-step-prev i`).addClass('bars icon');
    }
    //判断所在步骤并初始化
    if(step == 2){
        //model模型转换
        if(stepInitStatusList[1] == 0){
            initStepTrainModel();
            stepInitStatusList[1] = 1;
        }
    }
    if(step == 3){
        //model模型转换，模型上链
        if(stepInitStatusList[2] == 0){
            initStepTestModel();
            stepInitStatusList[2] = 1;
        }
    }


}
//任务状态更新
function updateTaskFinishStepStatus(taskFileHash,step="0",status=false){
    if(taskFinishStepStatusMap[taskFileHash] == null || taskFinishStepStatusMap[taskFileHash] == undefined){
        taskFinishStepStatusMap[taskFileHash] = {};
    }
    console.log("step status update:",taskFileHash,step)
    taskFinishStepStatusMap[taskFileHash][step] = status;
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
        console.log("检测到模型变化");
        console.log("oldJson:", oldJson);
        console.log("newJson:", newJson);
        return true;
    }
    return false;
}



/*------------------工具函数 end------------------------*/














