/*------------------Setp 2 MODEL数据转换------------------------*/
function initStepTrainModel(){
    updateTrainProcessDataListHtml();
}
function updateTrainProcessDataListHtml(){
    //从前一step获取数据填充本step的模板
    const uploadDataList = $(`.upload-data-list .upload-data-item`);
    const trainProcessDataList = $(`.train-process-data-list-box`);
    //遍历上传文件列表
    uploadDataList.each(function(index, item) {
        if($(item).attr('id') == 'upload-file-template'){
            return;
        }
        //如果是未完成的任务(不处理)
        var processId = $(item).attr('data-file-id');
        var taskFileHash = taskFileHashMap[processId];
        if (taskFileHash == null || taskFileHash == undefined) {
            return;
        }
        if(taskFinishStepStatusMap[taskFileHash]["0"]==undefined||taskFinishStepStatusMap[taskFileHash]["0"]==false){
            return;
        }
        //如果是已经存在的任务，则不处理
        if(trainProcessDataList.find(`[data-process-id="${processId}"]`).length > 0){
            return;
        }
        //克隆模板
        const trainProcessDataItem = document.getElementById("train-process-data-item-template").cloneNode(true);
        //移除模板的display:none样式
        trainProcessDataItem.style.display = 'block';
        //设置process id
        trainProcessDataItem.id = `train-process-data-${processId}`;
        trainProcessDataItem.setAttribute('data-process-id', processId);
        //设置form的process-id
        trainProcessDataItem.querySelector('.train-process-data-config-form').setAttribute('data-process-id', processId);
        //设置所有按钮的process-id
        trainProcessDataItem.querySelectorAll('.train-process-data-config-form .button').forEach(function(button){
            button.setAttribute('data-process-id', processId);
        });
        trainProcessDataItem.querySelector('.upload-data-item-tools button').setAttribute('data-process-id', processId);
        // 添加:更新训练监控div的id
        const monitorDiv = trainProcessDataItem.querySelector('.train-process-monitor');
        monitorDiv.id = `train-process-monitor-${processId}`;
        //设置文件名
        trainProcessDataItem.querySelector('.upload-data-item-name').innerText = $(item).find('.upload-data-item-name').text();
        //设置hash
        trainProcessDataItem.querySelector('.upload-data-item-hash').innerText = $(item).find('.upload-data-item-hash').text();
        //设置大小
        trainProcessDataItem.querySelector('.upload-data-item-size').innerText = $(item).find('.upload-data-item-size').text();
        //添加到目标元素，如果ID已存在则不添加
        if(document.getElementById(`train-process-data-${processId}`)){
            return;
        }
        trainProcessDataList.append(trainProcessDataItem);
        //初始化下拉框
        $(`#train-process-data-${processId} .ui.dropdown`).dropdown();
        //设置训练类型下拉框
        $(`#train-process-data-${processId} .ui.dropdown.train-type`).dropdown({
            values: [{
                name: '自动识别',
                value: 0,
                selected: true
            },{
                name: '分类模型',
                value: 1,
                selected: false
            },{
                name: '回归模型', 
                value: 2,
                selected: false
            },{
                name: '聚类模型',
                value: 3,
                selected: false
            },{
                name: 'NLP模型',
                value: 4,
                selected: false
            }]
        });
        //设置评估指标下拉框
        $(`#train-process-data-${processId} .ui.dropdown.model-metrics`).dropdown({
            values: [{
                name: '准确率',
                value: 'accuracy',
                selected: false
            },{
                name: '精确率',
                value: 'precision',
                selected: false
            },{
                name: '召回率',
                value: 'recall',
                selected: false
            }],
            multiple: true
        });
        //设置测试数据比例下拉框
        $(`#train-process-data-${processId} .ui.dropdown.test-ratio`).dropdown({
            values: [{
                name: '20%',
                value: '0.2',
                selected: true
            },{
                name: '30%',
                value: '0.3',
                selected: false
            },{
                name: '40%',
                value: '0.4',
                selected: false
            }]
        });
        //绑定form事件
        bindTrainProcessDataFormEvent(processId);
    });
}

//绑定form事件
function bindTrainProcessDataFormEvent(processId){
    const form = $(`.train-process-data-config-form[data-process-id="${processId}"]`);
    const trainTypeSelect = form.find('.ui.dropdown.train-type');
    const featureFieldInput = form.find('input[name="feature_field"]');
    const trainLabelSelect = form.find('select[name="train_label"]');
    const modelMetricsSelect = form.find('.ui.dropdown.model-metrics');
    const testRatioSelect = form.find('.ui.dropdown.test-ratio');

    // 训练类型下拉框
    trainTypeSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            trainTypeSelect.find('input[name="train_type"]').val(value);
        }
    });

    // 特征字段输入框变化事件
    featureFieldInput.on('change',function(){
        console.log("featureFieldInput:", featureFieldInput.val());
    });

    // 标签选择框变化事件  
    trainLabelSelect.on('change',function(){
        console.log("labelSelect:", trainLabelSelect.val());
    });

    // 评估指标下拉框
    modelMetricsSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            modelMetricsSelect.find('input[name="model_metrics"]').val(value);
        }
    });

    // 测试数据比例下拉框
    testRatioSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            testRatioSelect.find('input[name="test_ratio"]').val(value);
        }
    });
}

//更新MODEL feature列表
function updateModelFeatureList(processId,features_string){
    const form = $(`.train-process-data-config-form[data-process-id="${processId}"]`);
    const featureFieldInput = form.find('input[name="feature_field"]');
    const trainLabelSelect = form.find('select[name="train_label"]');

    //解析features_string
    const features_list = features_string.split(';');
    //清空原有选项
    trainLabelSelect.empty();
    //设置特征字段
    featureFieldInput.val(features_list);
    //添加无标签选项
    trainLabelSelect.append(new Option('无标签', 'empty_label'));
    //添加标签选项
    features_list.forEach(function(feature){
        trainLabelSelect.append(new Option(feature, feature));
    
    });
    
    //重新初始化下拉框
    trainLabelSelect.dropdown('refresh');
}

//从服务器获取流量特征字段
function queryFeatureField(button){
    var processId = $(button).attr('data-process-id');
    var file_hash = taskFileHashMap[processId];
    if (!file_hash) {
        layer.msg('文件哈希未定义',{'time':1200});
        return;
    }
    getFeatureField(file_hash).then(function(data){
        updateModelFeatureList(processId,data);
    }).catch(function(error){
        layer.msg(error,{'time':1200});
    });
}


var trainProcessingStatusMap = {}; //保存正在处理的任务状态

//开始训练模型
function startTrainProcessData(button){
    const processId = $(button).attr('data-process-id');
    const fileHash = taskFileHashMap[processId];
    if(processId == null){
        return;
    }
    //如果任务状态为处理中，则不进行处理
    if(trainProcessingStatusMap[processId] == 'processing'){
        return;
    }
    //如果处理完成,则不进行处理
    if(trainProcessingStatusMap[processId] == 'finish'){
        return;
    }
    //保存配置并开始训练
    startTrainProcessDataWithConfig(processId);
}
var modelTrainRequestIdMap = {};
//保存配置并开始训练
function startTrainProcessDataWithConfig(processId){
    const form = $(`.train-process-data-config-form[data-process-id="${processId}"]`);
    var trainProcessDataConfig = {
        "process_id": processId,
        "file_hash": taskFileHashMap[processId],
        "train_type": form.find('input[name="train_type"]').val(),
        "feature_field": form.find('input[name="feature_field"]').val(),
        "label_column": form.find('select[name="train_label"]').val(),
        "model_metrics": form.find('input[name="model_metrics"]').val(),
        "test_ratio": form.find('input[name="test_ratio"]').val()
    };
    
    //开始训练
    setTrainProcessProcessingItemUI(processId);
    createModelTrainTask(taskFileHashMap[processId],trainProcessDataConfig).then(function(data){
        console.log("创建模型训练任务响应:", data);
        const requestId = data.request_id;
        modelTrainRequestIdMap[processId] = requestId;
        const current_step = data.current_step;
        const total_step = data.total_step;
        if(current_step != null && total_step != null){
            $(`.train-process-data-item[data-process-id="${processId}"] .train-process-data-item-status`).
            text(`${current_step}/${total_step}`);
        }
        //轮询训练进度
        pollingTrainProcessProgress(processId);

    }).catch(function(error){
        setTrainProcessFailedItemUI(processId,error);
    });
}

//轮询训练进度
var processPollingIntervalMap = {};
function pollingTrainProcessProgress(processId){
    if(processPollingIntervalMap[processId]){
        clearInterval(processPollingIntervalMap[processId]);
    }
    processPollingIntervalMap[processId] = setInterval(function(){
        getTrainProcessProgress(processId);
    },1000);
}

//获取训练进度
function getTrainProcessProgress(processId){
    queryTrainProcessProgress(modelTrainRequestIdMap[processId]).then(function(data) {
        if(data == null){
            setTrainProcessFailedItemUI(processId,"获取训练进度失败");
            return;
        }
        const progress = data.progress;
        const current_step = data.current_step;
        const total_step = data.total_step;
        const stage = data.stage;
        const message = data.message;
        const error = data.error;
        
        // 添加: 根据stage更新监控显示
        updateMonitorByStage(processId, stage);
        
        layer.msg(message,{'time':1200});
        const progressBar = $(`.train-process-data-item[data-process-id="${processId}"] .train-process-data-item-progress`);
        if(progressBar && progress != null){
            progressBar.progress({
                percent: progress
            });
        }
        
        // 简化状态显示，只包含阶段和步骤信息
        if(current_step != null && total_step != null){
            const statusText = `(${current_step}/${total_step})`;
            $(`.train-process-data-item[data-process-id="${processId}"] .train-process-data-item-status`)
                .text(statusText);
            
            var processing_data_num = total_step - current_step;
            var processed_data_num = current_step;
            upsertTaskStatusMap(processId, null, processed_data_num, processing_data_num);
            updateHeaderPanelUI(processId, null, processed_data_num, processing_data_num);
        }
        
        // 处理完成状态
        if(progress == 100){
            $(`.train-process-data-item[data-process-id="${processId}"] .train-process-data-item-status`)
                .text(`训练完成 (${total_step}/${total_step})`);
            setTrainProcessFinishItemUI(processId);
            updateTaskFinishStepStatus(taskFileHashMap[processId], "2", true);
        }
        //处理错误
        if(error != null){
            setTrainProcessFailedItemUI(processId,error);
        }
    }).catch(function(error) {
        console.log(error);

        setTrainProcessFailedItemUI(processId,error);
    });
}

// 添加: 定义处理步骤常量
const PROCESS_STEPS = {
    DATA_CLEANING: 'Data Cleaning',
    FEATURE_ENGINEERING: 'Feature Engineering',
    LABEL_ENCODING: 'Label Encoding',
    TRAIN_TEST_SPLIT: 'Train/Test Split',
    MODEL_TRAINING: 'Model Training',
    MODEL_SAVING: 'Model Saving',
    MODEL_EVALUATION: 'Model Evaluation'
};

// 添加: 根据阶段更新监控显示的函数
function updateMonitorByStage(processId, stage) {
    switch(stage) {
        case PROCESS_STEPS.MODEL_TRAINING:
            showTrainMonitorStep(processId);
            break;
        case PROCESS_STEPS.MODEL_EVALUATION:
            showEvaluateMonitorStep(processId);
            break;
        default:
            console.warn(`当前阶段 ${stage} 无需显示监控界面`);
            break;
    }
}

// 添加: 隐藏所有监控的辅助函数
function hideAllMonitors(processId) {
    let monitorElem = document.getElementById(`train-process-monitor-${processId}`);
    if(monitorElem) {
        const trainStepElem = monitorElem.querySelector('.monitor-train-step');
        const evaluateStepElem = monitorElem.querySelector('.monitor-evaluate-step');
        
        if(trainStepElem) trainStepElem.style.display = 'none';
        if(evaluateStepElem) evaluateStepElem.style.display = 'none';
    }
}

//训练开始设置itemUI
function setTrainProcessStartItemUI(processId){
    const item = $(`.train-process-data-item[data-process-id="${processId}"]`);
    item.find('.train-process-data-item-start-btn').text('开始训练');
    item.find('.train-process-data-item-start-btn').on('click',function(){
        startTrainProcessData(this);
    });
}

//训练中设置itemUI
function setTrainProcessProcessingItemUI(processId){
    const item = $(`.train-process-data-item[data-process-id="${processId}"]`);
    trainProcessingStatusMap[processId] = 'processing';
    item.find('.train-process-data-item-start-btn').text('训练中');
    item.attr('data-finish','false');
    item.find('.train-process-data-config').hide();
    // 显示训练监控区域
    item.find('.train-process-monitor').show();
}

//训练失败设置itemUI
function setTrainProcessFailedItemUI(processId,error=""){
    const item = $(`.train-process-data-item[data-process-id="${processId}"]`);
    trainProcessingStatusMap[processId] = 'failed';
    item.attr('data-finish','false');
    item.find('.train-process-data-item-start-btn').text('重新训练');
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    item.find('.train-process-data-config').show();
    // 隐藏训练监控区域
    item.find('.train-process-monitor').hide();
    layer.msg(error,{'time':2000});
    item.find('.train-process-data-config').show();
}

//训练完成设置itemUI
function setTrainProcessFinishItemUI(processId){
    const item = $(`.train-process-data-item[data-process-id="${processId}"]`);
    trainProcessingStatusMap[processId] = 'finish';
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    item.attr('data-finish','true');
    item.find('.train-process-data-item-start-btn').text('下一步');
    item.find('.train-process-data-item-start-btn').on('click',function(){
        nextStep();
    });
    queryLocalModelData(taskFileHashMap[processId]);
}
/*------------------Setp 2 MODEL数据转换 end------------------------*/